import 'dotenv/config';

const required = (name: string) => {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
};

export const config = {
  port: Number(process.env.PORT ?? 10000),
  mongoUri: required('MONGODB_URI'),
  geminiKey: required('GEMINI_API_KEY'),
  geminiModel: process.env.GEMINI_MODEL?.trim() || 'gemini-3.8-flash',
  clientOrigin: process.env.CLIENT_ORIGIN?.trim() || 'http://localhost:5173',
  sessionSecret: required('SESSION_SECRET'),
  production: process.env.NODE_ENV === 'production',
};
