# AI MYSTERY ROOM

## Product Requirements & Technical Specification

**Document:** `SPEC.md`
**Project:** AI Mystery Room
**Purpose:** Single Source of Truth for Spec-Driven Development
**Primary Developer:** Codex
**Specification Version:** 1.0.0
**Status:** Initial Implementation Specification

---

# 1. PROJECT OVERVIEW

## 1.1 Product Description

AI Mystery Room is an AI-powered interactive detective game in which users create their own mystery investigations from short stories or scenarios.

The user provides a scenario describing a fictional incident. The backend uses Google's Gemini AI to transform the scenario into a complete, logically consistent investigation.

The generated investigation includes:

* A fictional crime or mysterious incident.
* A set of suspects.
* Character profiles and possible motives.
* Evidence such as WhatsApp-style messages, photographs, CCTV footage descriptions, timelines, and witness statements.
* Clues, contradictions, and misleading but logically explainable information.
* One predetermined culprit.
* A final accusation mechanism.
* An investigation result explaining whether the user's accusation was correct.

The user investigates the case by reviewing the available evidence, taking notes, connecting clues, and selecting the person they believe is responsible.

The system evaluates the accusation against the culprit established when the mystery was generated.

## 1.2 Core Product Principle

**Every mystery must be solvable through evidence.**

The application must not generate arbitrary clues and then choose a culprit based on the user's final accusation.

Instead, the backend must establish the culprit, construct the underlying story, and generate evidence consistent with that story before the investigation begins.

The culprit must remain fixed throughout the investigation.

## 1.3 Product Goals

1. Allow users to generate mysteries from their own scenarios.
2. Create immersive, fictional detective investigations using AI.
3. Provide multiple types of evidence.
4. Ensure that evidence supports a logically defensible solution.
5. Make the investigation interactive and engaging.
6. Evaluate accusations consistently.
7. Provide explanations that help users understand the solution.
8. Deliver a responsive, polished website.
9. Keep the AI integration secure and server-side.
10. Support future expansion without requiring a complete architectural rewrite.

## 1.4 Non-Goals for Version 1

The following features are outside the initial implementation scope:

* Real-world criminal investigations.
* Real police database integrations.
* Real WhatsApp account integrations.
* Real CCTV camera integrations.
* Uploading real evidence for forensic analysis.
* Multiplayer investigations.
* Real-time multiplayer chat.
* User-created public case marketplaces.
* Social leaderboards.
* Subscription billing.
* Voice-controlled investigations.
* AI-generated live video evidence.
* Mandatory user registration or paid accounts.

These features must not be implemented unless explicitly requested in a later specification update.

---

# 2. TARGET USERS

## 2.1 Primary Users

People who enjoy:

* Detective games.
* Mystery-solving challenges.
* Crime fiction.
* Interactive storytelling.
* Puzzle-solving.
* AI-generated games.

## 2.2 User Experience Requirements

The website must be understandable to someone visiting it for the first time.

A user must be able to:

1. Open the website.
2. Understand what the application does.
3. Enter a mystery scenario.
4. Generate an investigation.
5. Review suspects and evidence.
6. Form a hypothesis.
7. Accuse a suspect.
8. See the result and explanation.

The main game flow must not require technical knowledge.

---

# 3. TECHNOLOGY STACK

## 3.1 Frontend

* React
* Vite
* TypeScript
* HTML5
* CSS3
* Responsive design
* Fetch API or the existing API client

Use the existing frontend framework and project structure wherever practical.

Do not introduce a second frontend framework.

If the project already uses a styling library or component system, reuse it rather than introducing an unnecessary alternative.

## 3.2 Backend

* Node.js
* Express.js
* TypeScript
* REST API
* MongoDB
* Mongoose
* Gemini API integration

The backend is responsible for:

* Input validation.
* Mystery generation.
* AI response validation.
* Evidence generation and persistence.
* Investigation state management.
* Accusation evaluation.
* Access control.
* Error handling.
* Database operations.

## 3.3 Database

MongoDB is the primary database.

Mongoose is used to define schemas, validate persisted data, and manage database operations.

## 3.4 AI Provider

Google Gemini.

The Gemini API must be called from the backend only.

The API key must never be included in frontend source code, browser storage, public configuration, or client-side network requests.

Use the official Gemini SDK compatible with the installed project dependencies.

## 3.5 Deployment

The application may use separate frontend and backend services.

Existing deployment context:

* Frontend: `https://ai-mystery-1-gl72.onrender.com`
* Backend: `https://ai-mystery-828e.onrender.com`
* GitHub repository: `Pammi19/AI_Mystery`

These URLs describe the existing deployment and are not permanent application constants.

The frontend API base URL must be configurable through environment variables.

---

# 4. CORE USER JOURNEY

## Step 1: Landing Page

The user opens the homepage.

The page explains the game and provides a prominent action:

**Create Your Mystery**

The page may also display previously created investigations if they can be retrieved securely.

## Step 2: Scenario Creation

The user enters a fictional scenario.

Example:

"Three friends attended a private birthday party. The birthday gift disappeared between 8 PM and 9 PM. Everyone claims they were in a different room. One person is lying."

The user clicks:

**Generate Investigation**

The frontend validates the input and sends a request to the backend.

The UI displays a loading state while the case is generated.

The user must not be allowed to create multiple accidental duplicate cases by repeatedly clicking the button.

## Step 3: AI Investigation Generation

The backend:

1. Validates the scenario.
2. Generates a structured investigation using Gemini.
3. Validates the generated response.
4. Checks the case's internal consistency.
5. Stores the case in MongoDB.
6. Returns the public investigation data.

The case must have a unique ID.

The investigation becomes available only after the required data has been generated, validated, and persisted successfully.

## Step 4: Investigation Dashboard

The user enters the generated case.

The dashboard displays:

* Case title.
* Case description.
* Incident details.
* Suspect list.
* Evidence categories.
* Investigation timeline.
* Investigation notes.
* Progress indicator.
* Accusation action.

The dashboard must not reveal the culprit before the user submits an accusation.

## Step 5: Evidence Investigation

The user opens individual evidence items.

Evidence may include:

* WhatsApp-style conversations.
* Photographic evidence.
* CCTV recordings or fictional CCTV transcripts.
* Witness statements.
* Access logs.
* Timelines.
* Digital records.
* Physical evidence.
* Conflicting alibis.

Each item must contain enough contextual information for the user to interpret it.

Evidence must be associated with the relevant characters, locations, and times.

## Step 6: Investigation Notes

The user can create, view, update, and delete private notes.

Example:

"Suspect B claims to have left at 8:30 PM, but the CCTV record places them near the study at 8:42 PM."

Notes help the user organize their investigation.

Notes must not change the underlying case or influence the culprit.

## Step 7: Final Accusation

The user selects one suspect and submits an accusation.

The backend checks the selected suspect against the case's predetermined culprit.

The accusation must be evaluated against the stored case solution, not against a newly generated AI answer.

The result is persisted so refreshing the page does not erase the completed investigation.

## Step 8: Results

The result screen displays:

* Correct or incorrect accusation.
* Actual culprit.
* Explanation of the culprit's motive.
* Reconstructed incident timeline.
* Important clues.
* Explanation of misleading evidence.
* How the evidence supports the conclusion.

The solution must become available only after the accusation has been submitted.

---

# 5. FUNCTIONAL REQUIREMENTS

## FR-01: Create a Mystery

The application must allow the user to submit a scenario.

### Input

* Scenario text.
* Optional mystery difficulty.
* Optional preferred mystery category.

### Initial difficulty levels

* Easy.
* Medium.
* Hard.

### Initial categories

* Theft.
* Missing object.
* Suspicious incident.
* Murder mystery.
* Digital mystery.
* General mystery.

These categories describe fictional game content.

The user may leave category and difficulty unspecified.

### Validation

* Scenario text is required.
* Minimum scenario length: 30 characters.
* Maximum scenario length: 2,000 characters.
* Leading and trailing whitespace must be removed.
* Invalid input must be rejected before calling Gemini.

These limits are application defaults and may be adjusted through a later specification revision.

### Acceptance Criteria

* Valid scenarios can be submitted.
* Invalid scenarios display understandable error messages.
* The API does not call Gemini for invalid requests.
* The interface displays loading, success, and failure states.
* A successfully created case receives a persistent ID.

## FR-02: Generate a Structured Investigation

Gemini must generate a structured case rather than an unstructured narrative.

Each case must include:

1. Case metadata.
2. Incident description.
3. Suspects.
4. Culprit.
5. Motive.
6. Opportunity.
7. Timeline.
8. Evidence.
9. Clue relationships.
10. Solution explanation.
11. Difficulty classification.

The generated investigation must be validated before publication.

If the AI output is invalid, the backend may attempt a limited retry.

If generation still fails, the API must return an appropriate error rather than saving an incomplete case.

## FR-03: Suspect Profiles

Each suspect must include:

* Unique suspect ID.
* Display name.
* Fictional age, if relevant.
* Relationship to the incident.
* Short biography.
* Known motive or potential motive.
* Stated alibi.
* Relevant personality traits.
* Optional fictional portrait.

The suspect list must contain between 3 and 5 suspects.

At least one suspect must be the culprit.

All suspect IDs must be unique within a case.

The culprit must be a member of the case's suspect list.

Suspects must have sufficiently distinct identities and plausible reasons to be investigated.

## FR-04: Evidence Generation

Every case must contain at least 8 and at most 15 evidence items.

The initial evidence generation should aim for approximately 10 items.

Each evidence item must include:

* Unique evidence ID.
* Evidence type.
* Title.
* Description.
* Creation or discovery timestamp.
* Related suspect IDs.
* Location, where relevant.
* Evidence content.
* Investigation significance.
* Clue classification.

### Supported evidence types

**1. Chat Messages**

Fictional WhatsApp-style conversations containing:

* Participants.
* Timestamps.
* Message text.
* Message sequence.

These are simulated chat records, not actual WhatsApp data.

**2. Images**

Fictional photographic evidence.

If image generation is unavailable, the system may display an illustrative placeholder and a detailed image description.

The interface must never pretend that a placeholder is an authentic generated photograph.

**3. CCTV**

Fictional security-camera evidence containing:

* Camera location.
* Recording time.
* Relevant observations.
* Optional clip or thumbnail.
* Transcript or event summary.

If actual video generation is not configured, CCTV evidence must be presented as a recording description, transcript, or clearly labeled simulated footage.

**4. Witness Statements**

Statements made by fictional witnesses.

**5. Digital Records**

Fictional call logs, device access records, system logs, or other digital clues.

**6. Physical Evidence**

Fictional objects, fingerprints, documents, or other physical clues.

**7. Timeline Records**

Events that help reconstruct the incident.

### Clue classifications

* Critical clue.
* Supporting clue.
* Red herring.

A red herring must be explainable and must not make the case impossible to solve.

The classification is internal game metadata and must not be exposed before the solution is unlocked.

## FR-05: Evidence Consistency

The investigation must be logically solvable.

Before publication, the backend must verify:

1. The culprit exists in the suspect list.
2. The culprit has a plausible motive.
3. The culprit had a plausible opportunity.
4. The timeline is chronologically consistent.
5. Evidence timestamps agree with the timeline.
6. Critical clues support the intended solution.
7. Evidence does not directly contradict established facts without an explanation.
8. Red herrings can be explained.
9. The solution references evidence that actually exists.
10. The public case does not reveal the culprit.

At least two independent clues should support the intended conclusion.

The final solution must identify the relevant evidence IDs.

If consistency checks fail, the backend may request a limited correction from Gemini.

If correction fails, the case must not be published as a playable investigation.

## FR-06: Evidence Viewer

The user must be able to open evidence items independently.

The evidence viewer must:

* Display the evidence title and type.
* Display its content.
* Show timestamps when applicable.
* Identify related characters.
* Allow the user to return to the investigation dashboard.
* Distinguish text, image, and video evidence appropriately.

The evidence viewer must not expose internal generation prompts, hidden clue classifications, or the answer key.

## FR-07: Investigation Notes

Users must be able to manage notes associated with a case.

Supported actions:

* Create a note.
* List notes.
* Edit a note.
* Delete a note.

Notes must be associated with the correct case and investigation session.

The system must enforce note ownership through the session or authentication mechanism used by the application.

## FR-08: Final Accusation

The accusation screen must display the available suspects.

The user must select exactly one suspect.

The backend must validate that:

* The case exists.
* The case is playable.
* The selected suspect belongs to that case.
* The investigation has not already been completed.

The backend must compare the accusation against the stored culprit ID.

The first valid accusation completes the case.

For Version 1, an incorrect accusation is still a completed investigation.

Repeated requests must not change the original result.

## FR-09: Solution Reveal

After the accusation, the backend may return the answer key.

The solution must contain:

* Culprit ID.
* Culprit name.
* Motive.
* Opportunity.
* Method of committing the fictional act.
* Chronological reconstruction.
* Critical evidence references.
* Explanation of supporting clues.
* Explanation of red herrings.
* Final reasoning.

The solution must be consistent with the generated case.

The frontend must display the solution only after successful accusation submission.

## FR-10: Persistence

Cases must persist in MongoDB.

Refreshing the browser must not erase a generated investigation.

The case must be retrievable using its ID.

Investigation notes and accusation results must also persist.

If a request fails, the UI must not display an unsaved investigation as successfully created.

---

# 6. AI GENERATION DESIGN

## 6.1 AI Responsibilities

Gemini is responsible for generating fictional narrative content and structured investigation data.

It may generate:

* Storylines.
* Character descriptions.
* Suspect profiles.
* Evidence content.
* Timelines.
* Motives.
* Clue relationships.
* Final solutions.
* Explanations.

Gemini is not responsible for authoritatively evaluating the final accusation.

The backend performs the final comparison using the stored culprit ID.

## 6.2 Generation Pipeline

Use the following pipeline:

Scenario Input
|
v
Input Validation
|
v
Gemini Case Generation
|
v
Structured Output Parsing
|
v
Schema Validation
|
v
Consistency Validation
|
v
Optional Limited Correction
|
v
Persistence in MongoDB
|
v
Return Public Case Data

The case must not be published until all required validation steps succeed.

## 6.3 Gemini Output Format

Gemini must return structured JSON.

Use a schema similar to the following:

{
"title": "The Missing Sapphire",
"category": "theft",
"difficulty": "medium",
"incident": {
"description": "A sapphire disappeared during a private gathering.",
"location": "The fictional Ashford residence",
"date": "2026-10-28T00:00:00.000Z",
"discoveredAt": "2026-10-28T21:00:00.000Z"
},
"suspects": [
{
"id": "suspect_1",
"name": "Alex Morgan",
"relationship": "Event organizer",
"biography": "A fictional character.",
"motive": "Possible financial pressure",
"alibi": "Claims to have been in the kitchen"
}
],
"culpritId": "suspect_1",
"timeline": [
{
"time": "2026-10-28T20:10:00.000Z",
"event": "The gathering begins",
"relatedSuspectIds": ["suspect_1"]
}
],
"evidence": [
{
"id": "evidence_1",
"type": "chat",
"title": "A Suspicious Message",
"description": "A fictional conversation.",
"timestamp": "2026-10-28T20:15:00.000Z",
"relatedSuspectIds": ["suspect_1"],
"content": {
"participants": ["Alex Morgan", "Jamie Lee"],
"messages": [
{
"sender": "Alex Morgan",
"timestamp": "2026-10-28T20:15:00.000Z",
"text": "Did anyone check the study?"
}
]
},
"clueClassification": "supporting"
}
],
"solution": {
"motive": "A fictional motive.",
"opportunity": "The suspect had access to the relevant location.",
"method": "A fictional explanation of the incident.",
"timelineSummary": "A chronological reconstruction.",
"criticalEvidenceIds": ["evidence_1"],
"explanation": "An evidence-based explanation of the solution.",
"redHerringExplanations": []
}
}

This JSON is illustrative, not a complete playable case.

The production schema must support the complete requirements described in this document.

The backend must generate or assign persistent database IDs as appropriate. It must not trust AI-generated IDs to be globally unique.

## 6.4 Output Validation

The backend must validate:

* JSON syntax.
* Required fields.
* Field types.
* Enum values.
* Suspect count.
* Evidence count.
* Unique identifiers.
* Culprit membership.
* Evidence references.
* Timestamp validity.
* Solution references.
* Maximum content lengths.

Do not rely on prompt instructions alone to enforce correctness.

Use runtime schema validation compatible with the existing codebase.

Reject or repair malformed responses before persistence.

## 6.5 Retry Strategy

Generation retries must be limited.

Recommended behavior:

* One initial generation attempt.
* At most one corrective attempt for invalid structured output or consistency failures.

Avoid infinite retry loops.

Return an appropriate error if the case cannot be generated.

Do not expose raw Gemini errors or API credentials to the frontend.

## 6.6 Cost and Rate Limiting

Implement server-side safeguards.

* Limit scenario length.
* Limit evidence count.
* Limit AI retries.
* Apply per-session or per-user request limits.
* Reject duplicate submissions where appropriate.
* Avoid generating the same case repeatedly because of accidental frontend retries.
* Set request timeouts.
* Handle provider rate limits gracefully.

Do not implement an unbounded AI generation loop.

---

# 7. APPLICATION ARCHITECTURE

## 7.1 High-Level Architecture

React Frontend
|
| HTTPS REST Requests
v
Express Backend
|
+---- Input Validation
|
+---- Mystery Generation Service
|          |
|          v
|      Gemini API
|
+---- Case Validation Service
|
+---- Investigation Service
|
+---- Accusation Service
|
v
MongoDB

The browser must never connect directly to MongoDB or Gemini.

## 7.2 Backend Responsibilities

The backend must be organized into maintainable modules.

Recommended separation:

* Routes: HTTP endpoints.
* Controllers: request and response handling.
* Services: application logic.
* Models: Mongoose schemas.
* Validators: request and generated-data validation.
* Middleware: authentication, session verification, rate limiting, and error handling.
* Configuration: environment variables and provider settings.
* Utilities: shared helpers.

Adapt these modules to the existing project structure rather than duplicating existing functionality.

## 7.3 Frontend Responsibilities

The frontend must handle:

* User input.
* Form validation.
* Navigation.
* Investigation dashboard.
* Evidence display.
* Notes interface.
* Accusation interface.
* Result presentation.
* Loading and error states.

The frontend must not independently decide who the culprit is.

---

# 8. DATABASE SPECIFICATION

Use MongoDB and Mongoose.

The following describes the required logical data model. Existing schemas may be adapted if they already satisfy these requirements.

## 8.1 Mystery Model

Collection: `mysteries`

Required fields:

* `_id`: MongoDB ObjectId.
* `title`: string.
* `scenario`: string.
* `category`: enum.
* `difficulty`: enum.
* `incident`: structured object.
* `suspects`: array of suspect objects.
* `timeline`: array of timeline events.
* `evidence`: array of evidence objects.
* `solution`: private solution object.
* `status`: generation or play status.
* `createdAt`: date.
* `updatedAt`: date.

Suggested status values:

* `generating`
* `ready`
* `failed`

Only `ready` cases may be played.

Failed generation attempts must not create publicly accessible playable cases.

The solution must remain private until the investigation is completed.

## 8.2 Investigation Model

Collection: `investigations`

Required fields:

* `_id`: MongoDB ObjectId.
* `mysteryId`: reference to Mystery.
* `ownerId` or `sessionId`: investigation owner.
* `status`: `in_progress` or `completed`.
* `accusedSuspectId`: nullable suspect ID.
* `isCorrect`: nullable boolean.
* `startedAt`: date.
* `completedAt`: nullable date.
* `createdAt`: date.
* `updatedAt`: date.

The application must use the actual ownership mechanism implemented by the project.

If guest access is supported, an investigation must be bound to a securely managed session.

An untrusted client-provided session identifier alone must not authorize access to another user's private investigation.

## 8.3 Investigation Notes Model

Collection: `investigationnotes`

Required fields:

* `_id`: MongoDB ObjectId.
* `investigationId`: reference to Investigation.
* `content`: string.
* `createdAt`: date.
* `updatedAt`: date.

Notes must be accessible only to the authorized owner of the associated investigation.

## 8.4 Data Integrity

The application must enforce:

* Valid mystery references.
* Valid investigation references.
* Valid suspect IDs.
* Valid evidence IDs.
* Consistent investigation ownership.
* Valid investigation status transitions.
* Single final accusation per investigation.

Use MongoDB indexes where appropriate.

At minimum, index fields commonly used to retrieve mysteries and investigations.

---

# 9. REST API SPECIFICATION

All API routes must use the prefix:

`/api/v1`

Use a consistent response format.

## 9.1 Success Response

{
"success": true,
"data": {}
}

## 9.2 Error Response

{
"success": false,
"error": {
"code": "VALIDATION_ERROR",
"message": "The scenario is invalid."
}
}

Never return secrets, internal stack traces, database credentials, or hidden solution data in ordinary error responses.

## 9.3 Create Mystery

**Endpoint**

`POST /api/v1/mysteries`

**Request**

{
"scenario": "A valuable necklace disappears during a family dinner.",
"difficulty": "medium",
"category": "theft"
}

**Success**

HTTP `201 Created`

{
"success": true,
"data": {
"id": "MYSTERY_ID",
"title": "The Missing Necklace",
"status": "ready"
}
}

The actual response must include only fields appropriate for the caller.

The response must not expose the culprit ID, private solution, internal prompts, or hidden clue classifications.

## 9.4 List Mysteries

**Endpoint**

`GET /api/v1/mysteries`

Return only mysteries the caller is authorized to access.

If public or anonymous listing is implemented, define the access rules explicitly.

Support pagination if the number of cases may grow.

## 9.5 Get Mystery

**Endpoint**

`GET /api/v1/mysteries/:id`

Return the public case information for an authorized investigation.

Do not return the private solution while the investigation is in progress.

## 9.6 Start or Retrieve Investigation

**Endpoint**

`POST /api/v1/mysteries/:id/investigations`

Create or retrieve the caller's investigation for the case.

Return:

* Investigation ID.
* Mystery ID.
* Investigation status.
* Start time.
* Relevant public case information.

Repeated requests must not create unintended duplicate investigations.

## 9.7 Retrieve Investigation

**Endpoint**

`GET /api/v1/investigations/:id`

Return the investigation state and the public case data authorized for the caller.

Return the solution only if the investigation has been completed.

## 9.8 Evidence Review

**Endpoint**

`GET /api/v1/mysteries/:id/evidence/:evidenceId`

Return the requested evidence item.

Validate the mystery ID, evidence ID, and investigation access.

Do not expose hidden clue classifications or private solution data.

## 9.9 Create Note

**Endpoint**

`POST /api/v1/investigations/:id/notes`

Request:

{
"content": "The suspect's alibi conflicts with the timeline."
}

Return the created note.

## 9.10 List Notes

**Endpoint**

`GET /api/v1/investigations/:id/notes`

Return notes belonging to the authorized investigation.

## 9.11 Update Note

**Endpoint**

`PATCH /api/v1/investigations/:id/notes/:noteId`

Request:

{
"content": "Updated observation."
}

Only the authorized owner may update the note.

## 9.12 Delete Note

**Endpoint**

`DELETE /api/v1/investigations/:id/notes/:noteId`

Delete only the specified note after validating ownership.

## 9.13 Submit Accusation

**Endpoint**

`POST /api/v1/investigations/:id/accusation`

Request:

{
"suspectId": "suspect_2"
}

The backend must:

1. Validate the investigation.
2. Verify ownership.
3. Confirm the investigation is in progress.
4. Confirm the suspect belongs to the mystery.
5. Compare the suspect ID with the stored culprit ID.
6. Persist the accusation.
7. Mark the investigation completed.
8. Return the result and unlocked solution.

The accusation and completion state must be persisted consistently.

The operation must be idempotent in the sense that retries cannot replace the original accusation or change the result.

If an investigation is already completed, return its existing result or a documented conflict response.

## 9.14 Health Check

**Endpoint**

`GET /api/v1/health`

Return a basic service status.

Do not expose secrets or sensitive infrastructure details.

---

# 10. FRONTEND PAGE SPECIFICATION

## 10.1 Homepage

Purpose: Explain the product and start a new investigation.

Required components:

* Brand name: AI Mystery Room.
* Navigation.
* Hero section.
* Short product description.
* Scenario creation call to action.
* How-it-works section.
* Example evidence preview.
* Footer.

Primary button:

**Create Your Mystery**

The homepage must clearly communicate that the investigations are fictional and AI-generated.

## 10.2 Create Mystery Page

Required components:

* Scenario textarea.
* Character counter.
* Difficulty selector.
* Category selector.
* Generate button.
* Validation messages.
* Loading indicator.
* Error feedback.

The page must prevent accidental duplicate submissions.

## 10.3 Investigation Dashboard

Required sections:

**Case Header**

* Title.
* Description.
* Category.
* Difficulty.
* Status.

**Suspect Board**

* Suspect cards.
* Character details.
* Alibi information.
* Motives or potential motives.

**Evidence Room**

* Evidence cards.
* Evidence type labels.
* Search or filtering when appropriate.

**Timeline**

* Chronological events.
* Relevant evidence references.

**Investigation Notes**

* Notes list.
* Add note.
* Edit note.
* Delete note.

**Final Accusation**

* Prominent action.
* Confirmation step.
* Warning that the accusation will end the investigation.

## 10.4 Evidence Detail Page or Modal

Display:

* Evidence title.
* Evidence type.
* Evidence content.
* Related suspects.
* Timestamp.
* Location.
* Return action.

Evidence must be legible on desktop and mobile.

## 10.5 Accusation Screen

Display all suspects as selectable options.

Requirements:

* Exactly one suspect can be selected.
* Submission requires confirmation.
* The user is warned that the investigation will be completed.
* Duplicate submissions are prevented.
* Errors are displayed clearly.

## 10.6 Result Page

Display:

* Correct or incorrect result.
* Culprit identity.
* Explanation of motive.
* Reconstruction of events.
* Critical clues.
* Red-herring explanations.
* Return-to-home or start-another-case action.

The solution must not appear before the backend confirms the accusation has been completed.

## 10.7 Responsive Layout

The application must support:

* Desktop.
* Laptop.
* Tablet.
* Mobile.

On smaller screens:

* Navigation must remain usable.
* Evidence cards must stack appropriately.
* Text must remain readable.
* Dialogs must fit the viewport.
* Buttons must be accessible.
* Horizontal scrolling must not be required for ordinary content.

---

# 11. UI/UX DESIGN DIRECTION

## 11.1 Visual Theme

The interface should feel like a modern detective investigation room.

Recommended design direction:

* Dark charcoal background.
* Muted gray surfaces.
* Warm amber or gold accents.
* Subtle red accents for danger or warnings.
* Clear typography.
* Restrained shadows.
* Evidence-board-inspired layouts.
* Cards resembling investigation files.
* Clear visual hierarchy.

Avoid excessive visual effects that make evidence difficult to read.

## 11.2 Visual Components

Create reusable components for:

* Navigation bar.
* Buttons.
* Input fields.
* Scenario editor.
* Suspect cards.
* Evidence cards.
* Evidence viewer.
* Timeline.
* Notes panel.
* Status badges.
* Loading states.
* Error messages.
* Confirmation dialogs.
* Result panels.

## 11.3 Interaction Design

All interactive elements must have visible states:

* Default.
* Hover.
* Focus.
* Active.
* Disabled.
* Loading.
* Error, where applicable.

The interface must not depend exclusively on color to communicate status.

## 11.4 Accessibility

Implement:

* Semantic HTML.
* Keyboard navigation.
* Visible focus indicators.
* Labels for form inputs.
* Appropriate contrast.
* Accessible dialog behavior.
* Alternative text for meaningful images.
* Clear error messages.

---

# 12. SECURITY REQUIREMENTS

## 12.1 API Key Protection

The Gemini API key must exist only in backend environment configuration.

Example:

`GEMINI_API_KEY=your_secret_key`

Never commit the real key to Git.

Never expose it through frontend environment variables that are embedded in the browser bundle.

## 12.2 Input Validation

Validate all request parameters and bodies.

Do not trust:

* Scenario input.
* Case IDs.
* Investigation IDs.
* Evidence IDs.
* Suspect IDs.
* Note IDs.
* Session identifiers.
* AI-generated content.

## 12.3 Database Security

Use Mongoose validation.

Avoid unsafe dynamic queries.

Prevent unauthorized access to records belonging to other users.

Do not accept arbitrary MongoDB query objects from clients.

## 12.4 AI Output Security

Treat Gemini output as untrusted data.

* Parse and validate generated JSON.
* Escape user-generated and AI-generated text when rendering HTML.
* Do not execute generated code.
* Do not render arbitrary generated HTML.
* Validate image and media URLs.
* Prevent generated content from altering system configuration.
* Keep private solution fields out of public responses.

## 12.5 Session Security

If anonymous users are supported, use a secure session mechanism.

For cookie-based sessions:

* Use HTTP-only cookies.
* Use appropriate SameSite settings.
* Enable Secure cookies in production.
* Configure CORS correctly.
* Protect state-changing operations against cross-site request forgery where required.
* Do not rely on an editable browser identifier as proof of ownership.

## 12.6 Rate Limiting

Protect AI generation and mutation endpoints against abuse.

Apply stricter limits to endpoints that incur Gemini API costs.

Return HTTP `429 Too Many Requests` when a caller exceeds configured limits.

## 12.7 Fictional Content

All generated investigations must be presented as fictional entertainment.

The system must not claim that simulated messages, CCTV records, photographs, or digital logs are authentic evidence from real people.

Real personal information must not be invented or exposed as factual investigative information.

---

# 13. ENVIRONMENT VARIABLES

Use environment variables for deployment-specific configuration.

Example backend configuration:

`NODE_ENV=production`

`PORT=10000`

`MONGODB_URI=your_mongodb_connection_string`

`GEMINI_API_KEY=your_gemini_api_key`

`CLIENT_ORIGIN=https://your-frontend-domain.example`

`SESSION_SECRET=your_long_random_session_secret`

`GEMINI_MODEL=your_supported_gemini_model`

These are configuration examples, not real credentials.

The selected Gemini model must be available to the configured API key and compatible with the integration.

Do not hard-code production URLs or secrets in application logic.

The backend must fail safely and report a configuration error if required environment variables are missing.

The frontend should use a configurable API base URL, for example:

`VITE_API_BASE_URL=https://your-backend-domain.example/api/v1`

If the frontend and backend are served through the same origin or a configured reverse proxy, a relative API base URL may be used instead.

Use one clearly defined configuration strategy.

Do not mix relative and absolute API URLs unpredictably.

---

# 14. ERROR HANDLING

The backend must use consistent error responses.

Recommended error codes:

| Code                      | Meaning                                         |
| ------------------------- | ----------------------------------------------- |
| `VALIDATION_ERROR`        | Invalid request data                            |
| `MYSTERY_NOT_FOUND`       | Mystery does not exist or is inaccessible       |
| `INVESTIGATION_NOT_FOUND` | Investigation does not exist or is inaccessible |
| `EVIDENCE_NOT_FOUND`      | Evidence does not exist                         |
| `NOTE_NOT_FOUND`          | Note does not exist                             |
| `CASE_NOT_READY`          | Mystery generation is incomplete                |
| `ALREADY_COMPLETED`       | Investigation is already completed              |
| `INVALID_SUSPECT`         | Suspect does not belong to the case             |
| `AI_GENERATION_FAILED`    | Mystery generation failed                       |
| `AI_OUTPUT_INVALID`       | Generated data failed validation                |
| `DATABASE_ERROR`          | Database operation failed                       |
| `RATE_LIMIT_EXCEEDED`     | Request limit exceeded                          |
| `INTERNAL_SERVER_ERROR`   | Unexpected server failure                       |

The frontend must display understandable messages.

Technical stack traces must remain in server logs, not ordinary API responses.

The backend must log enough information to diagnose failures without logging API keys, session secrets, or unnecessary private content.

---

# 15. TESTING REQUIREMENTS

## 15.1 Unit Tests

Test:

* Scenario validation.
* Difficulty and category validation.
* AI output validation.
* Suspect ID uniqueness.
* Evidence reference validation.
* Culprit membership.
* Timeline validation.
* Accusation comparison.
* Investigation state transitions.
* Ownership checks.

## 15.2 API Integration Tests

Test:

* Mystery creation.
* Mystery retrieval.
* Investigation creation.
* Investigation retrieval.
* Evidence retrieval.
* Note creation.
* Note updating.
* Note deletion.
* Valid accusation.
* Invalid accusation.
* Repeated accusation.
* Unauthorized access.
* Invalid IDs.
* Database failure handling.
* Gemini failure handling.

Tests should mock Gemini where practical to avoid unnecessary API costs.

## 15.3 Frontend Tests

Test:

* Scenario form validation.
* Loading states.
* API errors.
* Suspect selection.
* Evidence viewer.
* Note management.
* Accusation confirmation.
* Correct result rendering.
* Incorrect result rendering.
* Responsive navigation.

## 15.4 End-to-End Test

A complete test must perform the following:

1. Open the homepage.
2. Enter a valid fictional scenario.
3. Generate a mystery.
4. Retrieve the generated case.
5. Verify the suspects are displayed.
6. Open multiple evidence items.
7. Create a note.
8. Refresh the browser.
9. Confirm the investigation persists.
10. Submit an accusation.
11. Verify the result.
12. Verify the solution is unlocked.
13. Refresh again.
14. Confirm the completed investigation and result persist.

At least one test must verify that the culprit is not exposed through ordinary public API responses before accusation.

---

# 16. ACCEPTANCE CRITERIA

The project is considered complete for Version 1 when all the following are true.

### Mystery Generation

* [ ] A user can enter a scenario.
* [ ] Invalid scenarios are rejected.
* [ ] Gemini generates structured investigation data.
* [ ] Generated data passes validation.
* [ ] The case is saved in MongoDB.
* [ ] A case ID is returned.
* [ ] Generation failures are handled correctly.

### Investigation

* [ ] The user can open a case.
* [ ] The user can see all suspects.
* [ ] The user can inspect all available evidence.
* [ ] Evidence types are rendered correctly.
* [ ] The user can navigate the timeline.
* [ ] The user can create and manage notes.
* [ ] Case data persists across refreshes.

### Accusation

* [ ] The user can select a suspect.
* [ ] Invalid suspect IDs are rejected.
* [ ] The accusation is checked against the stored culprit ID.
* [ ] The result is persisted.
* [ ] Repeated submissions cannot change the original accusation.
* [ ] The correct solution is unlocked after completion.

### AI Quality

* [ ] The culprit belongs to the suspect list.
* [ ] At least two independent clues support the solution.
* [ ] The timeline is consistent.
* [ ] Evidence references are valid.
* [ ] Red herrings have explanations.
* [ ] The solution references actual evidence.

### Security

* [ ] Gemini credentials remain server-side.
* [ ] Private solution data is not exposed before completion.
* [ ] Investigation ownership is enforced.
* [ ] Notes cannot be accessed by unauthorized users.
* [ ] Input validation is implemented.
* [ ] AI-generated data is validated before use.
* [ ] AI endpoints have appropriate rate limits.

### User Interface

* [ ] The homepage explains the product.
* [ ] The creation page works.
* [ ] The investigation dashboard works.
* [ ] The evidence viewer works.
* [ ] The accusation flow works.
* [ ] The result page works.
* [ ] Loading and error states are present.
* [ ] The interface is responsive.

### Deployment

* [ ] Frontend can communicate with the backend.
* [ ] CORS is configured for the actual frontend origin.
* [ ] Environment variables are configured correctly.
* [ ] MongoDB is reachable from the backend.
* [ ] The Gemini API integration works.
* [ ] Production builds succeed.
* [ ] The health endpoint works.

---

# 17. IMPLEMENTATION RULES FOR CODEX

These rules are mandatory when implementing the specification.

## Rule 1: Treat This File as the Source of Truth

`SPEC.md` defines the expected product behavior.

Do not silently change product requirements, API behavior, or security rules.

If a requirement cannot be implemented as written, explain the conflict before changing it.

## Rule 2: Inspect Before Modifying

Before writing code:

1. Inspect the repository structure.
2. Read the existing package files.
3. Inspect the frontend routes and components.
4. Inspect the backend routes, controllers, services, and models.
5. Inspect the current API client.
6. Inspect existing MongoDB schemas.
7. Inspect the Gemini integration, if present.
8. Inspect environment-variable handling.
9. Inspect the existing deployment configuration.
10. Identify which requirements are already implemented.

Do not recreate working modules unnecessarily.

## Rule 3: Preserve Existing Project Structure

The existing repository uses a React/Vite frontend and a Node/Express TypeScript backend.

Preserve this architecture unless an actual technical limitation requires a change.

Do not migrate to Next.js, Python, Firebase, or another stack without explicit approval.

## Rule 4: Keep Frontend and Backend Responsibilities Separate

The frontend must not contain:

* Gemini API keys.
* MongoDB credentials.
* Private solution logic.
* Authoritative accusation logic.

The backend must remain the authority for case data, investigation ownership, and accusation results.

## Rule 5: Follow the API Contract

All frontend API calls must follow the documented API structure.

If existing routes differ, identify the discrepancy and implement a consistent migration.

Update the frontend and backend together.

Do not silently introduce competing endpoint conventions.

## Rule 6: Make Small, Verifiable Changes

Implement the application in logical phases.

After each phase:

* Run relevant tests.
* Check TypeScript compilation.
* Check the production build.
* Review changed files.
* Fix regressions before proceeding.

Do not replace the entire project with a new implementation without justification.

## Rule 7: Never Fake Successful Operations

Do not display a case as successfully generated unless it has been validated and saved.

Do not display notes as permanently saved unless the backend confirms the operation.

Do not show a successful accusation result until the backend confirms it.

Do not use hard-coded fake API responses in production.

Mock data may be used in automated tests or clearly identified development previews.

## Rule 8: Protect the Solution

The culprit ID and answer key must remain private until the accusation is submitted.

Do not rely on hiding an HTML element or frontend variable.

Enforce this requirement in the backend response layer.

## Rule 9: Use Real Environment Configuration

Do not hard-code deployment URLs, credentials, or provider keys into business logic.

Use environment variables and document required configuration.

Do not overwrite working production environment variables without checking their purpose.

## Rule 10: Report Completion Accurately

At the end of each implementation phase, report:

* Features completed.
* Files changed.
* Tests executed.
* Build status.
* Known issues.
* Required environment variables.
* Manual verification steps.

Never claim a feature is tested or deployed unless that action was actually performed.

---

# 18. IMPLEMENTATION PHASES

Codex should work through these phases in order.

## Phase 1: Repository Audit

* Inspect existing code.
* Compare current functionality with this specification.
* Identify missing functionality.
* Identify broken API integrations.
* Document the implementation plan.

Deliverable: Repository audit and gap list.

## Phase 2: Backend Foundation

* Validate environment configuration.
* Confirm MongoDB connection.
* Establish consistent API errors.
* Implement or repair the mystery model.
* Implement investigation persistence.
* Implement notes persistence.
* Establish ownership and session handling.

Deliverable: Stable backend foundation.

## Phase 3: Gemini Integration

* Implement structured generation.
* Validate AI output.
* Validate clue consistency.
* Implement bounded retries.
* Prevent publication of invalid cases.
* Ensure the answer key is private.

Deliverable: Reliable mystery generation service.

## Phase 4: Investigation APIs

* Create mystery endpoint.
* Mystery retrieval endpoints.
* Investigation creation and retrieval.
* Evidence retrieval.
* Notes CRUD.
* Accusation endpoint.
* Health endpoint.

Deliverable: Tested REST API.

## Phase 5: Frontend Experience

* Homepage.
* Scenario creation.
* Investigation dashboard.
* Suspect cards.
* Evidence viewer.
* Timeline.
* Notes interface.
* Accusation interface.
* Result screen.

Deliverable: Complete playable frontend.

## Phase 6: Integration

* Connect frontend to backend.
* Resolve API base URL configuration.
* Verify CORS.
* Verify session handling.
* Test persistent investigation state.
* Verify private solution handling.

Deliverable: Working full-stack application.

## Phase 7: Testing and Hardening

* Run unit tests.
* Run API tests.
* Run frontend tests.
* Perform end-to-end testing.
* Test invalid requests.
* Test provider failures.
* Test unauthorized access.
* Test repeated accusations.
* Test production builds.

Deliverable: Verified Version 1 implementation.

## Phase 8: Deployment Verification

* Verify frontend deployment.
* Verify backend deployment.
* Verify environment variables.
* Verify MongoDB connectivity.
* Verify Gemini connectivity.
* Verify health checks.
* Complete a real end-to-end mystery investigation.

Deliverable: Verified production deployment.

---

# 19. DEFINITION OF DONE

A feature is complete only when:

1. Its frontend behavior is implemented where applicable.
2. Its backend behavior is implemented where applicable.
3. Its data is validated.
4. Its persistence behavior is correct.
5. Its access controls are enforced.
6. Its loading and error states are handled.
7. Its relevant tests pass.
8. Its production build succeeds.
9. It does not violate this specification.
10. Its implementation status is reported accurately.

The application is complete when a user can create, investigate, and solve an AI-generated mystery from beginning to end without manually modifying the database or calling backend APIs outside the website.

---

# 20. FINAL PRODUCT PRINCIPLE

AI Mystery Room must deliver a complete detective experience, not merely generate a story.

The AI creates the fictional world, suspects, evidence, and explanation.

The backend preserves the investigation's integrity.

The frontend makes the investigation understandable and engaging.

The user solves the case through evidence and submits a final accusation.

**The final answer must be determined by the stored case solution, and every successful investigation must produce a persistent, explainable result.**

This specification governs the initial Version 1 implementation. Any future product or technical changes must be reflected in an updated version of `SPEC.md`.
