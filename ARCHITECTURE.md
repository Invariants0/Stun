# Stun Architecture

## System Overview

**Stun** is a spatial AI thinking environment where Google Gemini AI directly navigates and transforms an infinite canvas based on natural language commands. Instead of responding in chat, AI executes structured UI actions—moving nodes, creating connections, grouping content, and reorganizing layouts in real-time.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           USER BROWSER                                  │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  Next.js Frontend (TypeScript + React)                           │   │
│  │  ├─ Hybrid Canvas Layer (TLDraw + Excalidraw + React Flow)       │   │
│  │  ├─ Voice Command Interface                                      │   │
│  │  ├─ Zustand State Management (autosave to localStorage)          │   │
│  │  └─ API Client (axios + Firebase ID tokens)                      │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                               ↕ HTTP/REST                                │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                 ┌───────────────┴───────────────┐
                 │                               │
        ┌────────▼─────────┐          ┌──────────▼─────────┐
        │  Google Cloud    │          │   Google Gemini    │
        │  Console / OAuth │          │   AI Engine        │
        │                  │          │  (gemini-2.5-flash)│
        └────────┬─────────┘          └──────────┬─────────┘
                 │                               │
        ┌────────▼──────────────────────────────▼────────────────┐
        │                   BACKEND (Cloud Run)                   │
        │  Express.js Server (Node.js + TypeScript)              │
        │                                                         │
        │  ┌──────────────────────────────────────────────────┐  │
        │  │  API Routes                                       │  │
        │  │  ├─ POST /api/plan (Gemini coordination)         │  │
        │  │  ├─ GET/POST /api/boards (CRUD)                  │  │
        │  │  ├─ POST /auth/* (Firebase OAuth)                │  │
        │  │  └─ GET /health (health check)                   │  │
        │  └──────────────────────────────────────────────────┘  │
        │                                                         │
        │  ┌──────────────────────────────────────────────────┐  │
        │  │  Services Layer                                   │  │
        │  │  ├─ Gemini Service (AI orchestration + planning) │  │
        │  │  ├─ Board Service (CRUD persistence)             │  │
        │  │  ├─ Orchestrator (intent parsing + context)      │  │
        │  │  ├─ Presence Service (real-time collaboration)   │  │
        │  │  └─ Auth Middleware (Firebase token validation)  │  │
        │  └──────────────────────────────────────────────────┘  │
        │                                                         │
        │  ┌──────────────────────────────────────────────────┐  │
        │  │  Google Cloud Integration                         │  │
        │  │  ├─ Firestore (database + real-time listeners)   │  │
        │  │  ├─ Secret Manager (API keys)                    │  │
        │  │  ├─ Firebase Auth (JWT token verification)       │  │
        │  │  └─ Cloud Logging (structured logs)              │  │
        │  └──────────────────────────────────────────────────┘  │
        └────────┬───────────────────────────────┬─────────────┘
                 │                               │
                 │                      ┌────────▼─────────┐
                 │                      │  Google Gemini   │
                 │                      │  Generative API  │
                 │                      │ (AI reasoning)   │
                 │                      └──────────────────┘
                 │
        ┌────────▼─────────────────────────────────┐
        │      GOOGLE CLOUD FIRESTORE              │
        │  ├─ boards (user canvas documents)       │
        │  ├─ board_presence (real-time users)     │
        │  └─ Security Rules (user-scoped access)  │
        └─────────────────────────────────────────┘
```

---

## AI Command-to-Action Flow (The Core Loop)

```
1. User speaks or types command
   ↓
2. Frontend captures canvas screenshot (html2canvas)
   ↓
3. Frontend sends screenshot + command to /api/plan
   ↓
4. Backend receives request (auth middleware validates Firebase JWT)
   ↓
5. Intent Parser identifies command type (move, create, group, zoom, etc.)
   ↓
6. Orchestrator builds spatial context (node positions, viewport, edges)
   ↓
7. Gemini Service calls Google Gemini 2.5 Flash with:
     - Current canvas screenshot (visual context)
     - Structured node data (logical context)
     - Command instructions
   ↓
8. Gemini returns JSON action plan (validated against Zod schema)
   ↓
9. Backend validates & sanitizes actions (prevent out-of-bounds placement)
   ↓
10. Backend persists updated board state to Firestore
    ↓
11. Frontend receives action list via HTTP response
    ↓
12. ActionExecutor queue processes actions sequentially:
     - Move: animate node to new position
     - Create: spawn new node
     - Connect: create edge between nodes
     - Group: organize nodes spatially
     ↓
13. Canvas updates in real-time
    ↓
14. Zustand auto-saves to localStorage + Firestore (debounced 3s)
```

---

## Key Components

### Frontend (Next.js 14)

**Canvas Architecture** — 3 synchronized layers:
- **Layer 1 (TLDraw)**: Infinite workspace pan/zoom/camera system
- **Layer 2 (Excalidraw)**: Visual drawing tools (shapes, text, connectors)
- **Layer 3 (React Flow)**: AI-readable knowledge graph (nodes, edges, logic)

**State Management** — Zustand stores:
- `boardStore`: canvas state, nodes, edges, elements
- `uiStore`: command panel open/close state
- `authStore`: user profile and auth tokens

**Communication**:
- Voice input via Web Speech API
- Screenshot capture via html2canvas
- API calls with Firebase ID tokens in Authorization header

### Backend (Express.js)

**Middleware Stack**:
```
Request → CORS → Auth Validation → Rate Limit → Route Handler → Error Handling → Response
```

**Services**:

| Service | Purpose | Example Usage |
|---------|---------|---------------|
| `geminiService` | Orchestrates Gemini API calls | `POST /api/plan` → calls `planActions()` |
| `boardService` | CRUD operations on Firestore | Create, read, update, delete boards |
| `orchestrationService` | Intent parsing + spatial context | Analyzes command + builds node layout summary |
| `presenceService` | Real-time collaboration tracking | Updates user presence, lists active users |
| `boardAccessService` | Permission checks | Validates user can edit board |

**Authentication Flow**:
```
Frontend (Google OAuth) → Get Firebase ID token → 
  Send token in Authorization header → 
  Backend validates token with Firebase Admin SDK → 
  Attach user ID to request context → 
  Execute action scoped to that user
```

### Google Cloud Services

#### **Google Gemini 2.5 Flash**
- **Model**: `gemini-2.5-flash` (high-speed, multimodal reasoning)
- **Input**: Canvas screenshot (PNG base64) + node JSON + command text
- **Output**: Structured JSON action plan (validated with Zod)
- **Why this model**: Fast inference (100-500ms), excellent spatial reasoning, handles images + text

#### **Firestore (NoSQL Database)**
- **Collections**:
  - `boards`: Canvas state documents (nodes, edges, elements, metadata)
  - `board_presence`: Real-time user presence tracking
- **Usage**: Persistent storage, real-time listeners for collaboration
- **Security**: Firestore rules enforce `ownerId == auth.uid` for read/write

#### **Cloud Run (Compute)**
- **Backend Service**: Express.js deployed as container
- **Frontend Service**: Next.js static + API routes deployed as container
- **Scaling**: Auto-scale 2-100 instances based on traffic
- **Deployed Region**: `us-central1`

#### **Secret Manager**
- Stores sensitive values: Gemini API key, Firebase service account, OAuth secrets
- Automatically injected into Cloud Run environment at startup

#### **Artifact Registry**
- Docker container image storage
- Terraform timestamps unique image tags → triggers new Cloud Run revisions

---

## Data Models

### Board Document (Firestore)
```typescript
{
  id: string;                    // Document ID
  ownerId: string;               // Firebase user ID
  nodes: ReactFlowNode[];        // Graph nodes
  edges: ReactFlowEdge[];        // Graph edges
  elements: ExcalidrawElement[]; // Drawing elements
  files: Record<string, unknown>;// Media attachments
  visibility: "edit" | "view";   // Sharing level
  collaborators: string[];       // User IDs
  activeUsers: number;           // Real-time count
  lastActivity: ISO timestamp;   // Last modification
  createdAt: ISO timestamp;
  updatedAt: ISO timestamp;
}
```

### Action Plan (Gemini Output)
```typescript
{
  actions: Array<
    | { type: "move"; nodeId: string; to: { x: number; y: number } }
    | { type: "create"; label: string; position: { x: number; y: number } }
    | { type: "connect"; source: string; target: string }
    | { type: "delete"; nodeId: string }
    | { type: "group"; nodeIds: string[] }
    | { type: "zoom"; level: number }
  >
}
```

---

## Integration Points

### 1. Frontend → Backend (HTTP REST)
```
Endpoint       Method  Requires Auth   Purpose
─────────────────────────────────────────────────
/api/plan      POST    ✓              Send command + screenshot to Gemini
/api/boards    GET     ✓              List user's boards
/api/boards    POST    ✓              Create board
/api/boards/:id GET    ✓              Fetch board
/api/boards/:id PATCH  ✓              Update board state
/api/boards/:id DELETE ✓              Delete board
/auth/signin   POST    ✗              Exchange OAuth code for token
/health        GET     ✗              Service health check
```

### 2. Backend → Gemini
```typescript
// GoogleGenAI SDK call
const result = await genAI.models.generateContent({
  model: "gemini-2.5-flash",
  contents: [
    {
      role: "user",
      parts: [
        { text: "User command + spatial context" },
        { inlineData: { data: base64Image, mimeType: "image/png" } }
      ]
    }
  ]
});
```

### 3. Backend → Firestore
```typescript
// Firebase Admin SDK
const db = getFirestore();
const doc = await db.collection("boards").doc(boardId).get();
await db.collection("boards").doc(boardId).update({...});
```

### 4. Frontend → Firestore (via Backend)
- Real-time listeners watch `board_presence` for active user updates
- Board state syncs via REST API + localStorage autosave

---

## Security Architecture

### Authentication
- **Provider**: Google OAuth 2.0 + Firebase Authentication
- **Token**: Firebase ID JWT (1-hour expiry, auto-renewal)
- **Validation**: Firebase Admin SDK server-side verification

### Authorization
- **Firestore Rules**: Only owner/collaborators can read/write boards
- **Backend Middleware**: Every request validates user ID matches document owner
- **CORS**: Frontend domain whitelist

### Data Protection
- **Secrets**: API keys stored in Secret Manager (not in code/env files)
- **HTTPS**: Cloud Run endpoints use automatic TLS
- **httpOnly Cookies**: Firebase session tokens (XSS-resistant)

---

## Deployment Architecture

### Infrastructure as Code (Terraform)
```
infra/modules/
├─ cloudrun/      → Backend & Frontend services
├─ firestore/     → Database + indexes
├─ iam/           → Service accounts & roles
├─ secrets/       → Secret Manager integration
└─ artifact-registry/ → Container registry
```

### Deployment Pipeline
```
1. Developer pushes code → GitHub
2. GitHub Actions workflow triggers
3. Build & push Docker images to Artifact Registry
4. Terraform updates Cloud Run services with new images
5. Cloud Run automatically deploys new revisions
   (old revisions kept for instant rollback)
```

---

## Performance Characteristics

| Operation | Latency | Bottleneck |
|-----------|---------|-----------|
| Canvas interaction | <16ms | Rendering |
| Screenshot capture | 100-300ms | html2canvas |
| Gemini API call | 200-800ms | LLM inference |
| Firestore write | 50-200ms | Network I/O |
| Full AI command cycle | 500-1500ms | Gemini latency |

**Optimizations**:
- Debounced autosave (3s) prevents excessive writes
- Optimistic UI updates before Firestore confirmation
- Presence data cached locally (5s TTL)
- Canvas layer synchronization uses requestAnimationFrame

---

## Extensibility Points

### Adding New AI Actions
1. Define action type in `types/action.ts`
2. Add validation schema to `validators/action.validator.ts`
3. Implement executor in `lib/action-executor.ts`
4. Update Gemini prompt in `prompts/planner.prompt.ts`

### Adding New Canvas Elements
1. Create React component in `components/nodes/`
2. Register in hybrid renderer
3. Update Firestore schema (add to `elements` array)
4. Test with Gemini vision understanding

### Adding Real-Time Collaboration
1. Add WebSocket server (currently HTTP polling via presence service)
2. Implement Firestore real-time listeners on client
3. Sync canvas mutations across connected clients

---

## Architecture Decisions & Rationale

| Decision | Rationale |
|----------|-----------|
| **Hybrid Canvas (3 layers)** | Separates concerns: infinite workspace (TLDraw), visual UX (Excalidraw), AI logic (React Flow) |
| **Gemini 2.5 Flash** | Fastest inference, multimodal (image + text), excellent spatial reasoning for canvas |
| **Firestore (NoSQL)** | Real-time listeners for collaboration, flexible schema for canvas state, auto-scaling |
| **Cloud Run** | Serverless, auto-scales, no infrastructure management, integrates with Secret Manager |
| **Google GenAI SDK** | Official, lightweight, no authentication overhead (API key-based) |
| **Zustand + localStorage** | Lightweight state, instant persistence, works offline, autosaves every 3s |
| **Zod validation** | Type-safe runtime validation of Gemini responses (prevents hallucinations from causing crashes) |

---

## Known Limitations

1. **Firestore 1MB document limit** — Very large boards (1000+ nodes) may fail to serialize
2. **Gemini context window** — Very complex boards may exceed token limit
3. **Real-time collaboration** — Currently polling (not WebSocket streaming)
4. **Mobile support** — Canvas UX not optimized for touch/small screens
5. **Offline mode** — Limited to localStorage; no conflict resolution when syncing

---

## Future Enhancements

- [ ] Gemini Live API for real-time voice + AI bidirectional streaming
- [ ] WebSocket sync for sub-second collaboration updates
- [ ] Embedded embeddings for semantic search across board content
- [ ] Multi-board hierarchies and navigation
- [ ] Custom AI models fine-tuned on spatial reasoning
- [ ] Video/PDF node types
- [ ] Boardless infinite workspace with AI-powered content organization

---

**Diagram Status**: `architecture.excalidraw` in `/docs` contains detailed visual architecture (open in Excalidraw.com)
