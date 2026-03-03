# Stun

Stun is a multimodal spatial AI workspace where actions happen on an infinite canvas instead of a chat window.

## Monorepo Layout

- `web/` – Next.js frontend (React Flow canvas, voice controls, board UI)
- `backend/` – Express + TypeScript API (auth, boards, AI planner)
- `infra/` – Cloud Run deployment files
- `docs/` – PRD and IDEA source docs

## Quick Start

### 1) Frontend

```bash
cd web
npm install
npm run dev
```

App runs on `http://localhost:3000`.

### 2) Backend

```bash
cd backend
npm install
npm run dev
```

API runs on `http://localhost:8080`.

## Implemented Scaffold

The scaffold matches the PRD structure, including:

- Frontend board route `web/app/board/[id]/page.tsx`
- Canvas components, node renderers, voice orb, hooks, Zustand store, and API libs
- Backend routes: `/health`, `/auth/me`, `/boards`, `/ai/plan`
- Services, validators, prompts, middleware, and cloud config placeholders
- Cloud Run deployment stubs in `infra/`

## Next Implementation Steps

- Connect Firebase Auth token verification in `backend/src/middleware/auth.middleware.ts`
- Replace in-memory board storage with Firestore in `backend/src/services/board.service.ts`
- Wire Vertex/Gemini planning in `backend/src/services/gemini.service.ts`
- Implement full action execution in `web/lib/action-executor.ts`
