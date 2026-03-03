# Stun – Product Requirements Document (PRD)

---

# 1. Product Overview

**Product Name:** Stun
**Category:** UI Navigator – Multimodal Spatial AI Agent
**Hackathon:** Gemini Live Agent Challenge

Stun is an infinite multimodal canvas where AI visually understands, reorganizes, and navigates knowledge directly within the workspace. Instead of responding inside chat boxes, AI executes structured UI actions such as moving, connecting, highlighting, and transforming content spatially.

---

# 2. Problem Statement

Modern knowledge workflows are fragmented across:

* Tabs
* Documents
* Whiteboards
* Videos
* Notes
* Chat-based AI systems

Current AI systems operate in isolated text interfaces.
Whiteboards are static.
Automation tools lack contextual awareness.

There is no unified system where:

* AI visually interprets the workspace
* Knowledge is spatially organized
* Interaction is multimodal
* AI directly executes UI-level actions

---

# 3. Vision

Stun transforms AI from a conversational assistant into a spatial UI navigator.

AI does not reply with text blocks.
AI reshapes the workspace itself.

Every insight becomes a node.
Every relationship becomes a connection.
Every command results in visible transformation.

---

# 4. Scope Definition (Hackathon MVP)

## 4.1 Must-Have Features

* Infinite canvas (pan & zoom)
* Text and image voice , nodes
* Node connections
* Voice command input (press-to-speak)
* Screenshot-based multimodal reasoning
* Structured JSON action execution
* Firebase Authentication
* Firestore board persistence
* Cloud Run backend deployment
* Vertex AI integration

## 4.2 Nice-to-Have

* Mind-map transformation mode
* Roadmap transformation layout
* Highlight animations
* AI-generated summary nodes
* Media upload support
* Real-time collaboration

## 4.3 Out of Scope

* Mobile-first optimization
* OS-level automation
* Advanced semantic embedding clustering
* Plugin marketplace

---

# 5. Detailed Tech Stack

## 5.1 Frontend Stack

| Category           | Technology           |
| ------------------ | -------------------- |
| Framework          | Next.js (App Router) |
| Language           | TypeScript           |
| Canvas Engine      | React Flow           |
| State Management   | Zustand              |
| Voice Input        | Web Speech API       |
| Screenshot Capture | html2canvas          |
| Styling            | SCss        |
| HTTP Client        | Axios                |
| Auth Client        | Firebase SDK         |

---

## 5.2 Backend Stack (Google Cloud Hosted)

| Category         | Technology       |
| ---------------- | ---------------- |
| Runtime          | Node.js          |
| Framework        | Express          |
| AI SDK           | Google GenAI SDK |
| AI Platform      | Vertex AI        |
| Validation       | Zod              |
| Deployment       | Cloud Run        |
| Containerization | Docker           |
| Logging          | Cloud Logging    |

---

## 5.3 Data Layer

| Component      | Technology               |
| -------------- | ------------------------ |
| Database       | Firestore                |
| Media Storage  | Cloud Storage |
| Authentication | Firebase Authentication  |
| Access Control | Firestore Security Rules |

---

# 6. System Architecture

## 6.1 High-Level Flow

User
↓
Next.js Frontend (React Flow Canvas)
↓ (Authenticated HTTPS + JWT)
Cloud Run Backend (Express)
↓
Vertex AI (Gemini Multimodal Model)
↓
Firestore / Cloud Storage
↓
Frontend Executes Structured Action Plan

---

## 6.2 Interaction Flow

1. User issues voice command.
2. Frontend captures canvas screenshot.
3. Node metadata collected from state.
4. Request sent to backend with JWT.
5. Backend verifies authentication.
6. Backend calls Gemini (multimodal input).
7. Gemini returns structured JSON action plan.
8. Backend validates action safety.
9. Frontend executes spatial transformations.

---

# 7. Detailed Project Structure

```
Stun/
│
├── web/                             # Next.js Frontend
│   ├── app/
│   │   └── board/[id]/page.tsx
│   │
│   ├── components/
│   │   ├── canvas/
│   │   │   ├── CanvasRoot.tsx
│   │   │   ├── NodeRenderer.tsx
│   │   │   ├── EdgeRenderer.tsx
│   │   │   └── CameraController.tsx
│   │   │
│   │   ├── nodes/
│   │   │   ├── TextNode.tsx
│   │   │   └── ImageNode.tsx
│   │   │
│   │   ├── voice/
│   │   │   └── VoiceOrb.tsx
│   │   │
│   │   └── layout/
│   │       ├── TopBar.tsx
│   │       └── SidePanel.tsx
│   │
│   ├── hooks/
│   │   ├── useBoard.ts
│   │   ├── useVoice.ts
│   │   └── useScreenshot.ts
│   │
│   ├── store/
│   │   └── board.store.ts
│   │
│   └── lib/
│       ├── api.ts
│       ├── firebase.ts
│       └── action-executor.ts
│
├── backend/
│   ├── src/
│   │   ├── index.ts
│   │   │
│   │   ├── routes/
│   │   │   ├── ai.route.ts
│   │   │   ├── board.route.ts
│   │   │   ├── auth.route.ts
│   │   │   └── health.route.ts
│   │   │
│   │   ├── services/
│   │   │   ├── gemini.service.ts
│   │   │   └── board.service.ts
│   │   │
│   │   ├── prompts/
│   │   │   └── planner.prompt.ts
│   │   │
│   │   ├── middleware/
│   │   │   └── auth.middleware.ts
│   │   │
│   │   ├── validators/
│   │   │   └── action.validator.ts
│   │   │
│   │   └── config/
│   │       ├── vertex.ts
│   │       └── firestore.ts
│   │
│   ├── Dockerfile
│   └── package.json
│
├── infra/
│   ├── deploy.sh
│   └── cloud-run.yaml
│
└── PRD.md
```

---

# 8. API Endpoints

---

## 8.1 Authentication

### GET `/auth/me`

Returns authenticated user information.
Auth: Required

---

## 8.2 Health Check

### GET `/health`

Returns service health status.
Auth: Not Required

---

## 8.3 Boards

### POST `/boards`

Creates new board.
Auth: Required
Service: Firestore

### GET `/boards/:id`

Retrieves board data.
Auth: Required
Security: Owner validation

### PUT `/boards/:id`

Updates board state.
Auth: Required
Service: Firestore

---

## 8.4 AI Planner

### POST `/ai/plan`

Generates structured spatial action plan.

Auth: Required
External Service: Vertex AI

### Request

```json
{
  "boardId": "board123",
  "command": "Turn this into a roadmap",
  "screenshot": "base64",
  "nodes": []
}
```

### Response

```json
{
  "actions": [
    {
      "type": "move",
      "nodeId": "node-1",
      "to": { "x": 400, "y": 200 }
    }
  ]
}
```

Allowed action types:

* move
* connect
* highlight
* zoom
* group

---

# 9. Security Model

* Firebase Authentication (JWT)
* JWT verification middleware
* Firestore ownership validation
* Strict action type whitelist
* Node existence validation
* Coordinate boundary checks
* Service account isolation for Vertex AI

---

# 10. Non-Functional Requirements

* AI response under 5 seconds
* Safe JSON validation before execution
* Cloud-native deployment
* Secure middleware enforcement
* Stable real-time demo performance

---

# 11. Google Cloud Services Used

* Cloud Run (Backend Hosting)
* Vertex AI (Gemini Multimodal Model)
* Firestore (Persistence)
* Cloud Storage (Optional Media)
* IAM (Service Accounts)

---

# 12. Hackathon Compliance Checklist

✔ Uses Gemini Model
✔ Uses Google GenAI SDK
✔ Uses Vertex AI
✔ Hosted on Cloud Run
✔ Uses at least one Google Cloud service
✔ Multimodal screenshot interpretation
✔ Structured executable UI output
✔ Deployment proof provided

---

# 13. Future Roadmap

* Real-time collaboration
* Semantic clustering
* Continuous live observation mode
* Plugin architecture
* Education-focused templates
* Accessibility enhancements

---

# Final Statement

Stun redefines human–AI interaction by transforming AI from a text-based assistant into a spatial navigator that reshapes knowledge directly inside an infinite canvas.

AI does not respond.

AI navigates.
