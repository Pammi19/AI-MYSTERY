import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import { GoogleGenAI } from '@google/genai';
import { rateLimit } from 'express-rate-limit';
import { z, ZodError } from 'zod';
import { config } from './config.js';
import { Investigation, InvestigationNote, Mystery } from './models.js';

const app = express();
const api = express.Router();
// Render terminates TLS and forwards requests through its proxy.
app.set('trust proxy', 1);
type OwnedRequest = Request & { ownerId?: string };
const error = (code: string, message: string, status = 400) => Object.assign(new Error(message), { code, status });
const sign = (id: string) => crypto.createHmac('sha256', config.sessionSecret).update(id).digest('hex');
const cookieName = config.production ? '__Host-mystery_session' : 'mystery_session';
app.use(helmet());
app.use(cors({ origin: config.clientOrigin, credentials: true }));
app.use(express.json({ limit: '32kb' }));
app.use(cookieParser());
app.use((req: OwnedRequest, res, next) => {
  const raw = req.cookies?.[cookieName] as string | undefined;
  const [id, signature] = raw?.split('.') ?? [];
  if (id && signature && /^[a-f0-9]{64}$/.test(id) && /^[a-f0-9]{64}$/.test(signature) && crypto.timingSafeEqual(Buffer.from(sign(id)), Buffer.from(signature))) req.ownerId = id;
  if (!req.ownerId && req.method === 'GET' && req.path === '/api/v1/health') return next();
  if (!req.ownerId) {
    const id = crypto.randomBytes(32).toString('hex');
    req.ownerId = id;
    res.cookie(cookieName, `${id}.${sign(id)}`, { httpOnly: true, secure: config.production, sameSite: 'strict', maxAge: 365 * 24 * 60 * 60 * 1000, path: '/' });
  }
  next();
});
const owner = (req: OwnedRequest) => req.ownerId!;
const param = (req: Request, key: string) => String(req.params[key] ?? '');
const success = (res: Response, data: unknown, status = 200) => res.status(status).json({ success: true, data });
const generationLimit = rateLimit({ windowMs: 60 * 60 * 1000, limit: 5, standardHeaders: true, legacyHeaders: false, message: { success: false, error: { code: 'RATE_LIMIT_EXCEEDED', message: 'You have reached the case generation limit. Please try again later.' } } });

const scenarioSchema = z.object({ scenario: z.string().trim().min(30).max(2000), difficulty: z.enum(['easy','medium','hard']).default('medium'), category: z.enum(['theft','missing_object','suspicious_incident','murder_mystery','digital_mystery','general_mystery']).default('general_mystery') });
const generatedSchema = z.object({ title: z.string().min(3).max(120), category: z.string().max(50), difficulty: z.string().max(20), incident: z.object({ description: z.string().min(10).max(2000), location: z.string().min(1).max(200), date: z.string(), discoveredAt: z.string() }), suspects: z.array(z.object({ id: z.string().min(1).max(40), name: z.string().min(1).max(100), age: z.number().int().min(1).max(120).optional(), relationship: z.string().min(1).max(200), biography: z.string().min(1).max(1200), motive: z.string().min(1).max(600), alibi: z.string().min(1).max(600), traits: z.array(z.string().max(80)).max(8).optional(), portrait: z.string().max(500).optional() })).min(3).max(5), culpritId: z.string().min(1).max(40), timeline: z.array(z.object({ time: z.string(), event: z.string().min(1).max(800), relatedSuspectIds: z.array(z.string()).default([]), evidenceIds: z.array(z.string()).default([]) })).min(4).max(30), evidence: z.array(z.object({ id: z.string().min(1).max(40), type: z.enum(['chat','image','cctv','witness','digital','physical','timeline']), title: z.string().min(1).max(150), description: z.string().min(1).max(1200), timestamp: z.string(), relatedSuspectIds: z.array(z.string()).default([]), location: z.string().max(200).optional(), content: z.unknown(), significance: z.string().min(1).max(800), clueClassification: z.enum(['critical','supporting','red_herring']) })).min(8).max(15), solution: z.object({ motive: z.string().min(1).max(1200), opportunity: z.string().min(1).max(1200), method: z.string().min(1).max(1600), timelineSummary: z.string().min(1).max(2000), criticalEvidenceIds: z.array(z.string()).min(2).max(15), explanation: z.string().min(1).max(3000), redHerringExplanations: z.array(z.object({ evidenceId: z.string(), explanation: z.string().min(1).max(1000) })).max(15) }) });

function validateCase(input: z.infer<typeof generatedSchema>) {
  const suspectIds = input.suspects.map(s => s.id);
  const evidenceIds = input.evidence.map(e => e.id);
  const dates = [...input.timeline.map(e => e.time), ...input.evidence.map(e => e.timestamp), input.incident.date, input.incident.discoveredAt];
  if (new Set(suspectIds).size !== suspectIds.length || !suspectIds.includes(input.culpritId)) throw error('AI_OUTPUT_INVALID', 'Generated suspects or culprit are inconsistent.', 502);
  if (new Set(evidenceIds).size !== evidenceIds.length) throw error('AI_OUTPUT_INVALID', 'Generated evidence identifiers are not unique.', 502);
  if (dates.some(d => Number.isNaN(Date.parse(d)))) throw error('AI_OUTPUT_INVALID', 'Generated dates are invalid.', 502);
  if (input.timeline.some((event, index) => index > 0 && Date.parse(event.time) < Date.parse(input.timeline[index - 1]!.time))) throw error('AI_OUTPUT_INVALID', 'The generated timeline is not chronological.', 502);
  const start = Date.parse(input.incident.date);
  const end = Date.parse(input.incident.discoveredAt);
  if (end < start || dates.some(value => Date.parse(value) < start || Date.parse(value) > end)) throw error('AI_OUTPUT_INVALID', 'The case timeline and evidence fall outside the incident window.', 502);
  if (input.evidence.some(e => e.relatedSuspectIds.some(id => !suspectIds.includes(id))) || input.timeline.some(t => t.relatedSuspectIds.some(id => !suspectIds.includes(id)))) throw error('AI_OUTPUT_INVALID', 'Evidence refers to a missing suspect.', 502);
  if (input.timeline.some(t => t.evidenceIds.some(id => !evidenceIds.includes(id)))) throw error('AI_OUTPUT_INVALID', 'The timeline refers to missing evidence.', 502);
  if (input.solution.criticalEvidenceIds.some(id => !evidenceIds.includes(id)) || input.solution.redHerringExplanations.some(x => !evidenceIds.includes(x.evidenceId))) throw error('AI_OUTPUT_INVALID', 'The solution refers to missing evidence.', 502);
  if (input.solution.criticalEvidenceIds.some(id => !input.evidence.some(e => e.id === id && e.clueClassification === 'critical'))) throw error('AI_OUTPUT_INVALID', 'The critical solution clues are not marked as critical evidence.', 502);
  if (input.evidence.some(e => e.clueClassification === 'red_herring' && !input.solution.redHerringExplanations.some(r => r.evidenceId === e.id))) throw error('AI_OUTPUT_INVALID', 'A red herring has no explanation.', 502);
  if (input.suspects.some(s => !s.motive.trim() || !s.alibi.trim())) throw error('AI_OUTPUT_INVALID', 'A suspect is missing a motive or alibi.', 502);
  if (input.evidence.some(e => JSON.stringify(e.content).length > 8000)) throw error('AI_OUTPUT_INVALID', 'An evidence record exceeds the supported size.', 502);
  const critical = input.evidence.filter(e => e.clueClassification === 'critical');
  if (critical.length < 2 || input.solution.criticalEvidenceIds.length < 2) throw error('AI_OUTPUT_INVALID', 'The case needs at least two independent critical clues.', 502);
  return input;
}

async function generateCase(scenario: string, category: string, difficulty: string) {
  const model = new GoogleGenAI({ apiKey: config.geminiKey });
  const prompt = `Create an entirely fictional, logically solvable detective game from the scenario below. Return ONLY JSON matching this shape: {title,category,difficulty,incident:{description,location,date,discoveredAt},suspects:[{id,name,age?,relationship,biography,motive,alibi,traits?}],culpritId,timeline:[{time,event,relatedSuspectIds,evidenceIds}],evidence:[{id,type,title,description,timestamp,relatedSuspectIds,location?,content,significance,clueClassification}],solution:{motive,opportunity,method,timelineSummary,criticalEvidenceIds,explanation,redHerringExplanations:[{evidenceId,explanation}]}}. Generate 3-5 distinctive suspects and 8-12 evidence items of varied types from chat,image,cctv,witness,digital,physical,timeline. Use ISO timestamps from one fictional date. IDs must be unique, evidence IDs evidence_1 etc. Make a fixed culprit with plausible motive/opportunity. At least two independent critical clues must logically identify culprit. Explain every red herring. All clues and timeline must agree. Timeline items MUST be ordered earliest to latest. image evidence must describe an illustration and say it is simulated, never claim an authentic photo. CCTV is simulated. Output content suitable for rendering as JSON/text, not HTML. Category=${category}; difficulty=${difficulty}. Scenario: ${scenario}`;

  let correction = '';
  for (let attempt = 1; attempt <= 2; attempt++) {
    let result;
    for (let requestAttempt = 1; ; requestAttempt++) {
      try {
        result = await model.models.generateContent({ model: config.geminiModel, contents: `${prompt}${correction}`, config: { responseMimeType: 'application/json', maxOutputTokens: 12000 } });
        break;
      } catch (e) {
        const failure = e as { status?: number; code?: number | string; message?: string };
        const isTemporaryUnavailable = failure.status === 503 || failure.code === 503 || failure.code === 'UNAVAILABLE' || /\bUNAVAILABLE\b|currently experiencing high demand/i.test(failure.message ?? '');
        if (!isTemporaryUnavailable || requestAttempt >= 3) throw e;
        const delayMs = requestAttempt * 1500;
        console.warn(`Gemini is temporarily unavailable; retrying in ${delayMs}ms (attempt ${requestAttempt + 1}/3).`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
    const text = result.text?.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
    if (!text) {
      correction = '\nYour previous response was empty. Return the complete case as valid JSON.';
      console.warn(`Gemini returned an empty response (attempt ${attempt}).`);
      continue;
    }

    let parsed: unknown;
    try { parsed = JSON.parse(text); }
    catch {
      correction = '\nYour previous response was not valid JSON. Return the complete case as valid JSON without markdown fences.';
      console.warn(`Gemini returned malformed JSON (attempt ${attempt}).`);
      continue;
    }

    // Sorting the timeline is safe: its timestamps define the intended order.
    if (parsed && typeof parsed === 'object' && Array.isArray((parsed as any).timeline)) {
      const timeline = (parsed as any).timeline;
      if (timeline.every((entry: any) => entry && typeof entry.time === 'string' && !Number.isNaN(Date.parse(entry.time)))) {
        timeline.sort((a: any, b: any) => Date.parse(a.time) - Date.parse(b.time));
      }
    }

    const shape = generatedSchema.safeParse(parsed);
    if (!shape.success) {
      const issues = shape.error.issues.slice(0, 8).map(issue => `${issue.path.join('.') || 'case'}: ${issue.message}`).join('; ');
      correction = `\nYour previous case failed these requirements: ${issues}. Correct them and return the complete JSON case.`;
      console.warn(`Gemini case failed schema validation (attempt ${attempt}): ${issues}`);
      continue;
    }

    try { return validateCase(shape.data); }
    catch (e) {
      const message = e instanceof Error ? e.message : 'The case was inconsistent.';
      correction = `\nYour previous case failed this consistency check: ${message} Correct the issue and return the complete JSON case.`;
      console.warn(`Gemini case failed consistency validation (attempt ${attempt}): ${message}`);
    }
  }

  throw error('AI_OUTPUT_INVALID', 'The generated case did not meet the investigation requirements after a retry. Please try again.', 502);
}

api.get('/health', (_req, res) => success(res, { status: 'ok' }));
api.post('/mysteries', generationLimit, async (req: OwnedRequest, res, next) => {
  try {
    const input = scenarioSchema.parse(req.body);
    const data = await generateCase(input.scenario, input.category, input.difficulty);
    const doc: any = await Mystery.create({ ...data, scenario: input.scenario, ownerId: owner(req), status: 'ready' });
    success(res, { id: String(doc._id), title: doc.title, status: doc.status }, 201);
  } catch (e) { next(e); }
});
api.get('/mysteries', async (req: OwnedRequest, res, next) => {
  try { const docs: any[] = await Mystery.find({ ownerId: owner(req), status: 'ready' }).select('title category difficulty createdAt').sort({ createdAt: -1 }).limit(50).lean(); success(res, docs.map((x: any) => ({ id: String(x._id), title: x.title, category: x.category, difficulty: x.difficulty, createdAt: x.createdAt }))); } catch (e) { next(e); }
});
async function getMystery(req: OwnedRequest, mysteryId: string): Promise<any> {
  if (!mongoose.isValidObjectId(mysteryId)) throw error('MYSTERY_NOT_FOUND', 'Mystery not found.', 404);
  const doc: any = await Mystery.findOne({ _id: mysteryId, ownerId: owner(req), status: 'ready' }).select('+culpritId').lean();
  if (!doc) throw error('MYSTERY_NOT_FOUND', 'Mystery not found.', 404);
  return doc;
}
const publicMystery = (m: any) => ({ id: String(m._id), title: m.title, scenario: m.scenario, category: m.category, difficulty: m.difficulty, incident: m.incident, suspects: m.suspects, timeline: m.timeline, evidence: m.evidence.map(({ clueClassification, significance, ...e }: any) => e), status: m.status, createdAt: m.createdAt });
api.get('/mysteries/:id', async (req: OwnedRequest, res, next) => { try { const m = await getMystery(req, param(req, 'id')); const investigation: any = await Investigation.findOne({ mysteryId: m._id, ownerId: owner(req) }).lean(); if (!investigation) throw error('INVESTIGATION_NOT_FOUND', 'Start an investigation before viewing this case.', 404); success(res, publicMystery(m)); } catch (e) { next(e); } });
api.post('/mysteries/:id/investigations', async (req: OwnedRequest, res, next) => {
  try {
    const m = await getMystery(req, param(req, 'id'));
    const inv: any = await Investigation.findOneAndUpdate({ mysteryId: m._id, ownerId: owner(req) }, { $setOnInsert: { mysteryId: m._id, ownerId: owner(req) } }, { upsert: true, new: true, setDefaultsOnInsert: true });
    success(res, { id: String(inv._id), mysteryId: String(m._id), status: inv.status, startedAt: inv.startedAt, mystery: publicMystery(m) }, 201);
  } catch (e) { next(e); }
});
async function ownedInvestigation(req: OwnedRequest, id: string): Promise<any> {
  if (!mongoose.isValidObjectId(id)) throw error('INVESTIGATION_NOT_FOUND', 'Investigation not found.', 404);
  const inv: any = await Investigation.findOne({ _id: id, ownerId: owner(req) }).lean();
  if (!inv) throw error('INVESTIGATION_NOT_FOUND', 'Investigation not found.', 404);
  return inv;
}
async function resultPayload(inv: any, m: any) {
  return { id: String(inv._id), mysteryId: String(inv.mysteryId), status: inv.status, accusedSuspectId: inv.accusedSuspectId, isCorrect: inv.isCorrect, startedAt: inv.startedAt, completedAt: inv.completedAt, mystery: publicMystery(m), ...(inv.status === 'completed' ? { solution: { culpritId: m.culpritId, culpritName: m.suspects.find((s: any) => s.id === m.culpritId)?.name, ...m.solution } } : {}) };
}
api.get('/investigations/:id', async (req: OwnedRequest, res, next) => { try { const inv = await ownedInvestigation(req, param(req, 'id')); const m = await getMystery(req, String(inv.mysteryId)); success(res, await resultPayload(inv, m)); } catch (e) { next(e); } });
api.get('/mysteries/:id/evidence/:evidenceId', async (req: OwnedRequest, res, next) => { try { const m = await getMystery(req, param(req, 'id')); const inv = await Investigation.findOne({ mysteryId: m._id, ownerId: owner(req) }); if (!inv) throw error('INVESTIGATION_NOT_FOUND', 'Investigation not found.', 404); const evidence = m.evidence.find((e: any) => e.id === param(req, 'evidenceId')); if (!evidence) throw error('EVIDENCE_NOT_FOUND', 'Evidence not found.', 404); const { clueClassification, significance, ...publicEvidence } = evidence.toObject(); success(res, publicEvidence); } catch (e) { next(e); } });
api.get('/investigations/:id/notes', async (req: OwnedRequest, res, next) => { try { const inv = await ownedInvestigation(req, param(req, 'id')); const notes = await InvestigationNote.find({ investigationId: inv._id }).sort({ createdAt: -1 }).lean(); success(res, notes.map((n: any) => ({ id: String(n._id), content: n.content, createdAt: n.createdAt, updatedAt: n.updatedAt }))); } catch (e) { next(e); } });
api.post('/investigations/:id/notes', async (req: OwnedRequest, res, next) => { try { const inv = await ownedInvestigation(req, param(req, 'id')); const content = z.string().trim().min(1).max(2000).parse(req.body?.content); const n = await InvestigationNote.create({ investigationId: inv._id, content }); success(res, { id: String(n._id), content: n.content, createdAt: n.createdAt, updatedAt: n.updatedAt }, 201); } catch (e) { next(e); } });
api.patch('/investigations/:id/notes/:noteId', async (req: OwnedRequest, res, next) => { try { const inv = await ownedInvestigation(req, param(req, 'id')); const noteId = param(req, 'noteId'); if (!mongoose.isValidObjectId(noteId)) throw error('NOTE_NOT_FOUND', 'Note not found.', 404); const content = z.string().trim().min(1).max(2000).parse(req.body?.content); const n: any = await InvestigationNote.findOneAndUpdate({ _id: noteId, investigationId: inv._id }, { content }, { new: true, runValidators: true }).lean(); if (!n) throw error('NOTE_NOT_FOUND', 'Note not found.', 404); success(res, { id: String(n._id), content: n.content, createdAt: n.createdAt, updatedAt: n.updatedAt }); } catch (e) { next(e); } });
api.delete('/investigations/:id/notes/:noteId', async (req: OwnedRequest, res, next) => { try { const inv = await ownedInvestigation(req, param(req, 'id')); const noteId = param(req, 'noteId'); if (!mongoose.isValidObjectId(noteId)) throw error('NOTE_NOT_FOUND', 'Note not found.', 404); const n: any = await InvestigationNote.findOneAndDelete({ _id: noteId, investigationId: inv._id }); if (!n) throw error('NOTE_NOT_FOUND', 'Note not found.', 404); success(res, { id: String(n._id) }); } catch (e) { next(e); } });
api.post('/investigations/:id/accusation', async (req: OwnedRequest, res, next) => {
  try {
    const inv = await ownedInvestigation(req, param(req, 'id'));
    const suspectId = z.string().min(1).parse(req.body?.suspectId);
    const m = await getMystery(req, String(inv.mysteryId));
    if (!m.suspects.some((s: any) => s.id === suspectId)) throw error('INVALID_SUSPECT', 'Choose a suspect from this case.', 400);
    if (inv.status === 'completed') return success(res, await resultPayload(inv, m));
    const isCorrect = suspectId === m.culpritId;
    const updated = await Investigation.findOneAndUpdate({ _id: inv._id, ownerId: owner(req), status: 'in_progress' }, { $set: { accusedSuspectId: suspectId, isCorrect, status: 'completed', completedAt: new Date() } }, { new: true }).lean();
    const finalInv = updated ?? await ownedInvestigation(req, String(inv._id));
    success(res, await resultPayload(finalInv, m));
  } catch (e) { next(e); }
});

app.use('/api/v1', api);
app.use('/api/v1', (_req, res) => res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'That API endpoint was not found.' } }));
const frontendDist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../frontend/dist');
if (existsSync(frontendDist)) {
  app.use(express.static(frontendDist, { index: false, maxAge: config.production ? '1h' : 0 }));
  app.get('*', (_req, res, next) => res.sendFile(path.join(frontendDist, 'index.html'), err => err && next(err)));
}
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof ZodError) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: err.issues.map(x => x.message).join(' ') } });
  const status = err.status ?? (err.name === 'ValidationError' ? 400 : 500);
  const code = err.code ?? (status === 500 ? 'INTERNAL_SERVER_ERROR' : 'VALIDATION_ERROR');
  if (status >= 500) console.error(err.message);
  res.status(status).json({ success: false, error: { code, message: status >= 500 ? 'Something went wrong. Please try again.' : err.message } });
});

try {
  await mongoose.connect(config.mongoUri);
  app.listen(config.port, '0.0.0.0', () => console.log(`AI Mystery Room listening on ${config.port}`));
} catch (err) { console.error('Failed to connect to MongoDB:', err); process.exit(1); }
