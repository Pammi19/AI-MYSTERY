# AI Mystery Room

A fictional detective game built with React, Vite, TypeScript, Express, MongoDB, and Gemini. The backend owns case generation, persistence, guest investigation access, and accusation results. The browser never receives the Gemini key or the answer key before a case is completed.

## Local development

Requirements: Node.js 22 or 24, npm, MongoDB, and a Gemini API key.

1. Copy `backend/.env.example` to `backend/.env` and set `MONGODB_URI`, `GEMINI_API_KEY`, and a long random `SESSION_SECRET`.
2. Copy `frontend/.env.example` to `frontend/.env` if the API is not at its local default.
3. From the repository root, run `npm install`, then `npm run dev`.
4. Open the Vite URL shown in the terminal (normally `http://localhost:5173`). The API listens on port `10000` by default.

`npm run build` compiles the backend and creates the frontend production bundle. `npm start` runs the compiled app and serves the UI and API from one origin.

## Deploy to Render

This repository includes a Render Blueprint at `render.yaml`. It creates one Node web service that builds both workspaces, serves the React app and `/api/v1` from the same origin, and checks `/api/v1/health`.

1. Push this repository to GitHub.
2. In Render, choose **New > Blueprint** and connect the repository containing `render.yaml`.
3. During Blueprint setup, provide `MONGODB_URI` for a MongoDB Atlas database and `GEMINI_API_KEY` for Gemini. Render generates `SESSION_SECRET` automatically.
4. Deploy the Blueprint. Open the service URL after its health check passes.

The Blueprint uses Render's free web service plan. Free web services spin down after 15 minutes without traffic and the next request can take about a minute to start. MongoDB remains hosted separately. For Atlas network access, add the outbound CIDR ranges shown under the Render service's **Connect > Outbound** tab to Atlas **Security > Network Access**. If the first deploy fails while connecting to Atlas, add these ranges and redeploy. Avoid opening Atlas to `0.0.0.0/0`. If you add a custom domain, the app remains same-origin and needs no API URL change.

The service created by this Blueprint is named `ai-mystery-room-fs` to keep it separate from older Render services. Secrets declared with `sync: false` are prompted during initial Blueprint creation; for a later Blueprint sync, set or update them in the service's Environment page.

## Backend configuration

| Variable | Purpose |
| --- | --- |
| `NODE_ENV` | Set to `production` for secure host-only cookies |
| `PORT` | API port (default `10000`) |
| `MONGODB_URI` | MongoDB connection string |
| `GEMINI_API_KEY` | Server-side Gemini credential |
| `GEMINI_MODEL` | Gemini model (default `gemini-3.8-flash`) |
| `CLIENT_ORIGIN` | Exact frontend origin allowed by CORS |
| `SESSION_SECRET` | Long random secret used to sign anonymous owner cookies |

The anonymous owner cookie is HTTP-only, signed, and `SameSite=Strict`. Losing or clearing it loses access to that browser's private cases. There is no account recovery in Version 1.

Generation is limited to five cases per hour per IP. Cases are rejected if required schema, references, chronology, or clue checks fail. A simulated image or CCTV exhibit is labelled in the evidence viewer.

## API

The REST API is rooted at `/api/v1`. It supports health checks, case creation/list/retrieval, investigation start/retrieval, evidence retrieval, notes CRUD, and one-time accusation submission. Responses use `{ "success": true, "data": ... }` or `{ "success": false, "error": ... }`.
