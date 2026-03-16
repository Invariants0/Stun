# STUN - COMPREHENSIVE ARCHITECTURE OVERVIEW

**Project:** Stun (Spatial AI Thinking Environment)  
**Vision:** Replace text-based AI chat with direct visual canvas manipulation  
**Core Concept:** Users issue voice/text commands → AI navigates and transforms the canvas directly

---

## SYSTEM ARCHITECTURE AT A GLANCE

```
┌─────────────────────────────────────────────────────────────────┐
│             USER INTERACTION (Voice/Text Commands)              │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTPS + JWT
┌────────────────────────▼────────────────────────────────────────┐
│  NEXT.JS FRONTEND (React 18 + TypeScript) - Port 3000           │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  HYBRID CANVAS: 3 Synchronized Layers                   │   │
│  │  • TLDraw      → Infinite workspace (pan/zoom)         │   │
│  │  • Excalidraw  → Visual UI (shapes, drawings)          │   │
│  │  • React Flow  → Knowledge graph (structured nodes)    │   │
│  └──────────────────────────────────────────────────────────┘   │
│  State: Zustand | Auth: Firebase OAuth + httpOnly Cookies      │
└────────────────────────┬────────────────────────────────────────┘
                         │ REST API + Gemini Screenshot
┌────────────────────────▼────────────────────────────────────────┐
│  EXPRESS.JS BACKEND (Node.js) - Port 8080                      │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  AI Orchestration Pipeline                              │   │
│  │  • Intent Parser  → Parse user command                  │   │
│  │  • Context Builder → Spatial context from canvas        │   │
│  │  • Gemini Service → AI reasoning & action generation    │   │
│  │  • Action Validator → JSON response validation          │   │
│  │  • Sanitizer → Safe position bounds enforcement         │   │
│  └──────────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────────┘
                         │ Gemini 2.0 Flash
┌────────────────────────▼────────────────────────────────────────┐
│  GOOGLE VERTEX AI (Gemini API)                                  │
│  Input: Screenshot + Node context + Command + Spatial summary  │
│  Output: Structured JSON action plan                           │
└────────────────────────┬────────────────────────────────────────┘
                         │ JSON Actions
┌────────────────────────▼────────────────────────────────────────┐
│  FRONTEND ACTION EXECUTOR                                       │
│  Sequential/Parallel execution of move/connect/zoom/etc        │
└────────────────────────┬────────────────────────────────────────┘
                         │ Autosave (3s debounce)
┌────────────────────────▼────────────────────────────────────────┐
│  FIRESTORE DATABASE                                             │
│  Collections: /boards, /presence, /users (single source truth) │
└─────────────────────────────────────────────────────────────────┘
```

---

# 1. FRONTEND ARCHITECTURE

## 1.1 Technology Stack

- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **State Management:** Zustand (board.store)
- **Canvas Layers:** TLDraw (workspace) + Excalidraw (visuals) + React Flow (graph)
- **Authentication:** Firebase OAuth + httpOnly cookies
- **API Client:** Axios with JWT injection
- **Port:** 3000 (dev)

## 1.2 Project Structure

```
web/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Landing page
│   ├── board/[id]/page.tsx       # Main canvas editor
│   ├── boards/page.tsx           # Board listing
│   └── api/auth/                 # BFF auth endpoints
├── components/
│   ├── canvas/                   # Canvas wrappers & synchronization
│   ├── nodes/                    # React Flow node renderers
│   └── ui/                       # UI components
├── hooks/
│   ├── useAuth.ts                # Auth state management
│   ├── useBoard.ts               # Hybrid canvas state
│   ├── usePlanAndExecute.ts      # AI planning & execution
│   ├── useScreenshot.ts          # Canvas screenshot capture
│   └── useVoice.ts               # Voice command input
├── lib/
│   ├── auth.ts                   # Firebase auth helpers
│   ├── api-client.ts             # Axios HTTP client with JWT
│   ├── action-executor.ts        # AI action execution engine
│   ├── canvas-mapping.ts         # Element ↔ Node ID mapping
│   ├── camera-sync.ts            # Viewport synchronization
│   └── firebase.ts               # Firebase client config
├── store/
│   ├── board.store.ts            # Zustand: hybrid canvas + autosave
│   ├── toast.store.ts            # Toast notifications
│   └── ui.store.ts               # UI state (modals, sidebar)
└── types/
    ├── api.types.ts              # API request/response types
    ├── canvas.types.ts           # Hybrid canvas architecture types
    └── auth.types.ts             # Authentication types
```

## 1.3 Hybrid Canvas Architecture (3 Synchronized Layers)

### Layer 0: TLDraw (Workspace Engine)
- Infinite canvas with spatial pan/zoom
- Camera state management
- Provides coordinate system and viewport control

### Layer 1: Excalidraw (Visual UI)
- Drawing tools, shapes, text elements
- User interaction layer
- Persistent visual elements
- Mapped to React Flow nodes via `ElementNodeMapping`

### Layer 2: React Flow (Knowledge Graph)
- Structured node-edge graph
- AI-readable representation of knowledge
- Event handlers for connections and deletions
- Source of truth for AI reasoning

### Synchronization Mechanism

```typescript
Canvas Mapping Service:
ExcalidrawElement ID ↔ React Flow Node ID (ElementNodeMapping)
         ↓
Camera Sync Service:
TLDraw Camera ↔ React Flow Viewport ↔ Excalidraw Transform
         ↓
Board Store (Zustand) — SINGLE SOURCE OF TRUTH:
HybridCanvasState {
  excalidraw: { elements, files, appState }
  reactflow: { nodes, edges }
  tldraw: { camera, selectedShapeIds }
  mappings: ElementNodeMapping[]
}
```

## 1.4 State Management (Zustand)

**Board Store (`board.store.ts`):**

```typescript
interface BoardState {
  boards: Record<string, HybridCanvasState>
  activeBoardId: string | null
  
  autosaveEnabled: boolean
  isSaving: boolean
  lastSaved: number | null
  autosaveTimeoutId: NodeJS.Timeout | null
  
  // Canvas updates
  setReactFlowData(boardId, nodes, edges)
  setExcalidrawElements(boardId, elements)
  setTldrawEditor(boardId, editor)
  addMapping(boardId, mapping)
  
  // Autosave (3s debounce)
  triggerAutosave(boardId)
  hydrateBoard(boardId, data)
}
```

**Autosave Flow:**
1. User action modifies canvas (move, connect, etc.)
2. `triggerAutosave()` cancels previous timer, starts new 3s debounce
3. After 3 seconds of inactivity: serialize state → `PUT /boards/{id}`
4. Backend persists to Firestore

## 1.5 Authentication Flow

### Three-Layer Token Storage

| Storage | XSS Safe | Persistence | Usage |
|---------|----------|-------------|-------|
| httpOnly Cookie | ✅ Yes | Until expiry | Auto-included in HTTP headers |
| In-Memory (_tokenMemory) | ✅ Yes | Lost on refresh | fetch() Authorization header |
| LocalStorage (authUser) | ⚠️ No | Until clear | Fast UI rendering on reload |

### Sign-In Flow

```
1. User clicks "Sign in with Google"
   ↓
2. Firebase.signInWithPopup()
   ↓
3. Google OAuth + Custom token creation
   ↓
4. POST /api/auth/set-token (Next.js BFF)
   ↓
5. Next.js sets httpOnly cookie + returns user profile
   ↓
6. localStorage stores user profile (displayName, email, photoURL)
   ↓
7. Redirect to /boards
```

### Session Rehydration (Page Refresh)

```
useAuth hook runs
  ↓
getStoredUser() from localStorage (fast path)
  ↓
rehydrateSession() calls /api/auth/rehydrate
  ↓
Next.js BFF reads httpOnly cookie
  ↓
Firebase Admin SDK restores session
  ↓
Returns user profile to frontend
```

### API Requests Authentication

```
Frontend component calls API.plan()
  ↓
ensureAuthToken() gets _tokenMemory or refreshes via Firebase
  ↓
Axios includes "Authorization: Bearer {token}" header
  ↓
Backend requireAuth middleware verifies JWT
  ↓
Request proceeds with userId claim
```

## 1.6 Key Hooks

**useAuth:**
- Manages user login/logout state
- Initializes Firebase token refresh listener
- Returns: `{ user, loading, tokenReady, logout }`

**useBoard:**
- Loads board from Firestore
- Manages hybrid canvas state synchronization
- Handles autosave to backend
- Reconciles conflicts between layers

**usePlanAndExecute:**
- Captures canvas screenshot
- Calls `/ai/plan` endpoint
- Executes action plan via ActionExecutor
- Handles errors and retries

**useScreenshot:**
- Converts canvas to base64 PNG (html2canvas)
- Called before API request to backend

**useVoice:**
- Listens for voice commands using Web Speech API
- Converts speech to text
- Triggers `usePlanAndExecute` workflow

---

# 2. BACKEND ARCHITECTURE

## 2.1 Technology Stack

- **Framework:** Express.js 5.x
- **Language:** TypeScript
- **Runtime:** Node.js + Bun
- **AI Integration:** Google GenAI SDK (Gemini)
- **Database:** Firebase Firestore (via Admin SDK)
- **Logging:** Winston
- **Port:** 8080 (dev)

## 2.2 Project Structure

```
backend/src/
├── index.ts                      # Server bootstrap
├── app.ts                        # Express app factory
├── config/
│   ├── envVars.ts               # Environment variables (Zod validated)
│   ├── firebase.ts              # Firebase Admin SDK initialization
│   ├── genai.ts                 # Google GenAI SDK configuration
│   ├── logger.ts                # Winston logger setup
│   └── index.ts                 # Config exports
├── api/
│   ├── routes/
│   │   ├── index.ts             # Route registration
│   │   ├── ai.routes.ts         # POST /ai/plan
│   │   ├── auth.routes.ts       # Authentication endpoints
│   │   ├── board.routes.ts      # Board CRUD endpoints
│   │   ├── health.routes.ts     # GET /health
│   │   ├── layout.routes.ts     # Layout endpoints
│   │   ├── media.routes.ts      # Media upload
│   │   ├── presence.routes.ts   # Active users tracking
│   │   └── search.routes.ts     # Search endpoints
│   ├── controllers/             # Route handlers
│   │   ├── ai.controller.ts
│   │   ├── board.controller.ts
│   │   └── [others...]
│   ├── middleware/
│   │   ├── auth.middleware.ts       # JWT verification
│   │   ├── error.middleware.ts      # Error handling
│   │   ├── board.middleware.ts      # Board access checks
│   │   └── ratelimit.middleware.ts  # Rate limiting
│   └── models/                  # Data models
├── services/                    # Business logic
│   ├── gemini.service.ts        # Gemini AI integration
│   ├── board.service.ts         # Board CRUD operations
│   ├── boardAccess.service.ts   # Access control
│   ├── orchestrator.service.ts  # AI orchestration
│   ├── intent-parser.ts         # Command intent parsing
│   ├── context-builder.ts       # Spatial context generation
│   ├── zoom-command.service.ts  # Zoom normalization
│   ├── presence.service.ts      # Active user tracking
│   ├── layout.service.ts        # Layout algorithms
│   ├── media.service.ts         # Media handling
│   └── search.service.ts        # Search functionality
├── prompts/
│   └── planner.prompt.ts        # Gemini system prompt
├── validators/
│   └── action.validator.ts      # Zod schemas for validation
├── utils/
│   └── spatial.ts               # Positional calculations
└── types/                       # TypeScript types
```

## 2.3 Middleware Stack

**Applied in `app.ts`:**

```typescript
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}))

app.use(cors({ origin: envVars.FRONTEND_URL }))

app.use(express.json({ limit: "10mb" }))

app.use((req, res, next) => {
  // Request logging with duration tracking
  const start = Date.now()
  res.on('finish', () => {
    const duration = Date.now() - start
    logger.info(`${req.method} ${req.path} ${res.statusCode} ${duration}ms`)
  })
  next()
})

// Routes registered here
registerRoutes(app)

// Error handler (last middleware)
app.use(errorMiddleware)
```

## 2.4 API Routes

| Route | Method | Protected | Purpose |
|-------|--------|-----------|---------|
| `/health` | GET | No | Health check (returns 200) |
| `/auth/signin` | POST | No | Authenticate user |
| `/boards` | GET | Yes | List user's boards |
| `/boards` | POST | Yes | Create new board |
| `/boards/:id` | GET | Yes | Get board details |
| `/boards/:id` | PUT | Yes | Update board state |
| `/boards/:id` | DELETE | Yes | Delete board |
| `/ai/plan` | POST | Yes | Plan AI actions (screenshot + command) |
| `/layout/:id` | GET/POST | Yes | Auto-layout endpoints |
| `/media/upload` | POST | Yes | Upload image/media |
| `/presence/:boardId` | GET | Yes | Get active users |
| `/search` | GET/POST | Yes | Search boards/content |

## 2.5 Authentication Middleware

**`requireAuth` middleware:**

```typescript
async function requireAuth(req, res, next) {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "").trim()
    
    if (!token) {
      return res.status(401).json({ error: "Unauthorized" })
    }
    
    // Verify Firebase ID token
    const decoded = await getFirebaseAuth().verifyIdToken(token)
    req.user = { uid: decoded.uid, email: decoded.email }
    next()
  } catch (err) {
    res.status(401).json({ error: "Invalid or expired token" })
  }
}
```

Protected routes wrap with: `app.post('/route', requireAuth, controller)`

---

# 3. AI INTEGRATION: GEMINI SERVICE

## 3.1 Gemini Service Flow

**Input: PlannerRequest**

```typescript
{
  boardId: string              // Board identifier
  command: string              // "organize all nodes in a grid"
  screenshot: string           // base64 PNG of canvas
  nodes: Node[]                // Current canvas nodes
  viewport?: Viewport          // Current camera state
}
```

**Output: ActionPlan**

```typescript
{
  actions: AIAction[]           // Array of structured actions
  reasoning?: string            // AI reasoning explanation
  executionOrder?: "sequential" | "parallel"
}

AIAction types:
- move:     { type, nodeId, to: { x, y } }
- connect:  { type, source, target }
- highlight: { type, nodeId, color }
- zoom:     { type, center, level, duration }
- group:    { type, nodeIds, groupId }
- cluster:  { type, nodeIds, data }
- create:   { type, label, position }
- delete:   { type, nodeId }
- transform: { type, nodeId, data }
- layout:   { type, level }
```

## 3.2 Gemini Service Pipeline

**`geminiService.planActions(input)`:**

```
1. ORCHESTRATE REQUEST
   ├─ orchestratePlanning(input)
   ├─ parseIntent(command) → identify intent & confidence
   ├─ buildSpatialContext(nodes, edges, viewport)
   └─ getIntentGuidance(intent) → intent-specific suggestions

2. BUILD GEMINI PROMPT
   ├─ System message: spatial reasoning instructions
   ├─ User message:
   │  ├─ ${COMMAND}
   │  ├─ ${SPATIAL_SUMMARY}
   │  ├─ ${GUIDANCE}
   │  └─ ${VIEWPORT}
   └─ Node context as JSON + screenshot as base64

3. CALL GEMINI API
   genAI.models.generateContent({
     model: "gemini-2.0-flash-exp",
     contents: [
       { text: prompt + nodeContext },
       { inlineData: { data: screenshot, mimeType: "image/png" } }
     ]
   })

4. PARSE RESPONSE
   ├─ Extract JSON from markdown code blocks
   ├─ Find largest JSON object in response
   └─ validateActionPlan(parsed)

5. NORMALIZE & SANITIZE
   ├─ normalizeZoomActions(actions)
   ├─ validateNodeReferences(actions, nodeIds)
   └─ sanitizeActionPositions(actions, bounds)
      └─ Clamp positions within safe bounds (±1000px expansion)

6. RETURN ACTION PLAN
```

## 3.3 AI Orchestration Pipeline

**`orchestratePlanning(request)`:**

```
Command Input: "organize all nodes in a grid"
       ↓
INTENT PARSING
  ├─ Extract command intent
  ├─ Examples: "organize", "arrange", "cluster", "search"
  └─ Return: { intent: "organize", confidence: "high" }
       ↓
SPATIAL CONTEXT ANALYSIS
  ├─ Calculate canvas bounds: minX, maxX, minY, maxY
  ├─ Analyze node clustering
  ├─ Extract connection patterns
  └─ Return: spatial data for AI reasoning
       ↓
CONTEXT SUMMARY GENERATION
  └─ Convert spatial data to human-readable summary:
     "Canvas contains 5 nodes arranged in a chain
      from (100, 100) to (500, 500). All connected
      sequentially. Viewport centered at (300, 300), zoom 1.0"
       ↓
INTENT-SPECIFIC GUIDANCE
  └─ For "organize" intent:
     "Suggest grid or row layout, preserve connections,
      position nodes relative to viewport center, maintain
      consistent spacing"
       ↓
Result: OrchestrationContext
  ├─ intent: "organize"
  ├─ spatialSummary: "...detailed context..."
  ├─ guidance: "...intent-specific suggestions..."
  └─ rawContext: { bounds, clusters, connections }
```

## 3.4 Context Builder Service

**Analyzes current canvas and extracts:**

- Node positions, labels, types
- Edge connections and relationships
- Viewport state (camera, zoom)
- Spatial bounds (minX, maxX, minY, maxY)
- Node clustering (proximity-based grouping)
- Connection density and patterns

**Output:** Human-readable spatial summary for Gemini reasoning

---

# 4. DATABASE SCHEMA

## 4.1 Firestore Collections

### **`/boards/{boardId}`**

```typescript
{
  // Ownership & Access
  ownerId: string                          // Creator's user ID
  collaborators: string[]                  // Users with access
  visibility: "edit" | "view"              // Access level
  
  // Canvas State
  nodes: string                            // JSON.stringify(Node[])
  edges: string                            // JSON.stringify(Edge[])
  elements: string                         // JSON.stringify(ExcalidrawElement[])
  files: string                            // JSON.stringify(Record<id, file>)
  
  // Metadata
  activeUsers: number                      // Count of active editors
  lastActivity: ISO timestamp              // Last modification time
  createdAt: ISO timestamp                 // Creation time
  updatedAt: ISO timestamp                 // Last update time
}
```

### **`/boards/{boardId}/presence/{userId}`**

```typescript
{
  userId: string                           // User identifier
  lastSeen: ISO timestamp                  // Last activity timestamp
  cursorPosition?: { x, y }                // Optional: live cursor position
}
```

### **`/users/{uid}/profile`** (Optional)

```typescript
{
  displayName: string
  email: string
  photoURL: string
  preferences: {
    theme: "light" | "dark"
    // ... other user preferences
  }
}
```

## 4.2 Core Data Models

### **React Flow Node**

```typescript
{
  id: string
  type?: string
  position: { x: number; y: number }
  data: {
    label?: string
    [key: string]: any
  }
  selected?: boolean
  zIndex?: number
}
```

### **React Flow Edge**

```typescript
{
  id: string
  source: string                           // source node ID
  target: string                           // target node ID
  animated?: boolean
  data?: { label?: string }
}
```

### **Excalidraw Element**

```typescript
{
  id: string
  type: "rectangle" | "diamond" | "ellipse" | "line" | "text" | ...
  x: number
  y: number
  width: number
  height: number
  angle: number
  strokeColor: string
  backgroundColor: string
  fillStyle: string
  strokeWidth: number
  roughness: number
  opacity: number
  text?: string                            // For text elements
  // ... other Excalidraw properties
}
```

### **Element Node Mapping**

```typescript
{
  excalidrawElementId: string
  reactFlowNodeId: string
  createdAt: number                        // Timestamp
  syncStatus: "synced" | "pending" | "conflict"
}
```

### **Hybrid Canvas State**

```typescript
{
  boardId: string
  
  excalidraw: {
    elements: ExcalidrawElement[]
    files: Record<string, { id, mimeType, dataURL }>
    appState: { viewBackgroundColor, colors, ... }
  }
  
  reactflow: {
    nodes: Node[]
    edges: Edge[]
  }
  
  tldraw: {
    camera: TLCamera
    selectedShapeIds: TLShapeId[]
    isPanning: boolean
  }
  
  mappings: ElementNodeMapping[]
}
```

---

# 5. COMPLETE DATA FLOW: 22-STEP JOURNEY

```
STEP 1-2: USER INTERACTION
  User speaks/types command: "organize all nodes in a grid"
       ↓

STEP 3-5: FRONTEND PREPARATION
  Capture canvas state, screenshot, prepare request payload
       ↓

STEP 6-12: BACKEND AI PROCESSING
  Validate input → Orchestrate → Build Gemini prompt → Call API → Parse response → Sanitize actions
       ↓

STEP 13-16: FRONTEND EXECUTION
  Execute action plan (sequential/parallel) → Update Zustand store → Canvas re-renders all 3 layers
       ↓

STEP 17-22: PERSISTENCE
  Trigger autosave → Serialize state → POST to backend → Firestore update → Presence update → COMPLETE
```

### Detailed Step-by-Step

**STEP 1-2: USER INTERACTION**
```
User: "Organize all nodes in a grid"
  ↓ via voice input (Web Speech API) or text input
Command ready for processing
```

**STEP 3-5: FRONTEND PREPARATION**
```
useBoard hook: getBoard() → HybridCanvasState
               ├─ nodes: Node[]
               ├─ edges: Edge[]
               ├─ elements: ExcalidrawElement[]
               └─ files: { ... }

useScreenshot: html2canvas() → base64 PNG encode

Prepare request:
{
  boardId: "board-123",
  command: "organize all nodes in a grid",
  screenshot: "data:image/png;base64,iVBORw0KG...",
  nodes: [ { id, position, data }, ... ],
  viewport: { x, y, zoom }
}
```

**STEP 6: BACKEND VALIDATION**
```
aiController.plan(req)
  → plannerRequestSchema.parse(req.body)
  → Zod schema validation
  → Return 400 if invalid
```

**STEP 7-9: BACKEND AI ORCHESTRATION**
```
orchestratePlanning(input):

a) parseIntent("organize all nodes in a grid")
   → intent: "organize", confidence: "high"

b) buildSpatialContext(nodes, edges, viewport)
   → Calculate bounds: minX=100, maxX=500, minY=100, maxY=500
   → Analyze node clustering
   → Extract connection patterns

c) generateContextSummary()
   → "Canvas contains 5 nodes in a chain from (100,100)
      to (500,500), all connected sequentially, viewport
      at (300,300), zoom 1.0"

d) getIntentGuidance("organize")
   → "Suggest grid layout, preserve connections,
      position relative to center"
```

**STEP 10-11: GEMINI SYSTEM PROMPT CONSTRUCTION**
```
System message: Spatial reasoning instructions

User message:
${COMMAND}: "organize all nodes in a grid"
${SPATIAL_SUMMARY}: "Canvas contains 5 nodes..."
${GUIDANCE}: "For organize actions: suggest..."
${VIEWPORT}: "{ x: 300, y: 300, zoom: 1.0 }"

Node context (JSON):
[
  { id: "node-1", label: "Research", position: { x: 100, y: 100 } },
  { id: "node-2", label: "Design", position: { x: 200, y: 100 } },
  ...
]

Image: [base64 PNG of canvas]
```

**STEP 12: GEMINI API CALL**
```
const result = await genAI.models.generateContent({
  model: "gemini-2.0-flash-exp",
  contents: [
    {
      role: "user",
      parts: [
        { text: <full prompt> },
        { inlineData: { data: <base64>, mimeType: "image/png" } }
      ]
    }
  ]
})
```

**STEP 13-14: GEMINI RESPONSE PARSING & NORMALIZATION**
```
Gemini responds with:
```json
{
  "actions": [
    { "type": "move", "nodeId": "node-1", "to": { "x": 100, "y": 100 } },
    { "type": "move", "nodeId": "node-2", "to": { "x": 300, "y": 100 } },
    ...
  ],
  "executionOrder": "parallel",
  "reasoning": "Arranged in 3-column grid..."
}
```

Extract JSON from markdown blocks → validateActionPlan() → Zod schema

**STEP 15-16: ACTION VALIDATION & SANITIZATION**
```
normalizeZoomActions()    → Uniform zoom format
validateNodeReferences()  → Check nodeIds exist
sanitizeActionPositions() → Clamp to safe bounds
                            └─ Expand by ±1000px, or ±5000px if empty
```

**STEP 17-22: FRONTEND EXECUTION & PERSISTENCE**
```
STEP 17: ActionExecutor.executePlan(plan)
  if parallel: Promise.all() all actions
  if sequential: for-loop each action

STEP 18: For each "move" action:
  → Find node by ID
  → Update position to { x, y }
  → setNodes(updatedNodes)

STEP 19: Zustand store update:
  → HybridCanvasState updated
  → All 3 canvas layers re-render reactively

STEP 20: Trigger Autosave (3s debounce):
  → Debounce timer started
  → After 3 seconds: serialize state

STEP 21: POST /boards/{id} with serialized state:
{
  nodes: JSON.stringify(nodes),
  edges: JSON.stringify(edges),
  elements: JSON.stringify(elements),
  files: JSON.stringify(files)
}

STEP 22: Backend persistence:
  db.collection("boards")
    .doc(boardId)
    .update({
      nodes, edges, elements, files,
      updatedAt: ISO timestamp,
      lastActivity: ISO timestamp
    })

✅ COMPLETE: Changes persisted to Firestore
```

---

# 6. GOOGLE CLOUD SERVICES

## 6.1 Cloud Infrastructure

### **Cloud Run (Container Orchestration)**
- **Service:** stun-backend
- **Port:** 8080
- **Resources:** 2 CPU, 2GB RAM per instance
- **Scaling:** Min 1, Max 10 instances (auto)
- **Health Check:** GET /health every 30s
- **Deployment:** Docker container from Artifact Registry

### **Artifact Registry (Container Storage)**
- **Repository:** stun-backend Docker images
- **Push Trigger:** On deployment via Cloud Build
- **Reference:** Used by Cloud Run to pull latest image

### **Firestore Database (NoSQL)**
- **Type:** Multi-region replication
- **Collections:**
  - `/boards/{boardId}` → Canvas state
  - `/boards/{boardId}/presence/{userId}` → Active users
  - `/users/{uid}/profile` → User profiles
- **Security:** Firestore security rules enforce access control
- **Indexing:** Automatic indexing for common queries

### **Cloud Storage (Media Storage)**
- **Purpose:** Image uploads, media files
- **Access Control:** User-scoped permissions
- **Integration:** Media service handles uploads

### **Secret Manager (Credentials)**
- **Secrets Stored:**
  - `GEMINI_API_KEY` → Google GenAI access
  - `FIREBASE_SERVICE_ACCOUNT_KEY` → Admin SDK credentials
  - `FIREBASE_URL` → Firestore endpoint
- **Access:** Cloud Run service account has read permission
- **Injection:** Environment variables at container startup

### **Cloud Logging (Log Aggregation)**
- **Source:** Cloud Run stdout/stderr
- **Integration:** Winston logger integration
- **Query:** GCP Cloud Logging UI for debugging

### **Cloud Build (CI/CD)**
- **Trigger:** Deployment script invocation
- **Steps:**
  1. Build Docker image
  2. Push to Artifact Registry
  3. Deploy to Cloud Run via Terraform

## 6.2 Deployment Pipeline

```
Local Development
  ↓
./infra/scripts/deploy.ps1
  ├─ gcloud builds submit
  │  ├─ Dockerfile.backend
  │  ├─ Pass build args (API base URL, Firebase config)
  │  └─ Push to Artifact Registry
  │
  └─ terraform apply
     ├─ Cloud Run service config
     ├─ Environment variables
     └─ Health check setup

  ↓
GCP Cloud Run Running
  ├─ Service account with Secret Manager access
  ├─ Port 8080 exposed
  ├─ Auto-scaling active
  └─ Firestore connected via Admin SDK
```

## 6.3 Environment Variables

**Backend (from Secret Manager):**
```
PORT=8080
NODE_ENV=production
FRONTEND_URL=https://stun-frontend-dev-*.a.run.app
FIREBASE_PROJECT_ID=stun-489205
FIREBASE_SERVICE_ACCOUNT_KEY={...}
GEMINI_API_KEY=...
```

**Frontend (build-time arguments via Docker/Cloud Build):**
```
NEXT_PUBLIC_API_BASE_URL=https://backend-*.run.app
NEXT_PUBLIC_FIREBASE_PROJECT_ID=stun-489205
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=stun-489205.firebaseapp.com
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=stun-489205.appspot.com
```

---

# 7. KEY FILES REFERENCE

## Frontend Critical Path

| File | Purpose |
|------|---------|
| [web/app/board/[id]/page.tsx](web/app/board/[id]/page.tsx) | Main canvas editor component |
| [web/hooks/useBoard.ts](web/hooks/useBoard.ts) | Board state management & sync |
| [web/hooks/usePlanAndExecute.ts](web/hooks/usePlanAndExecute.ts) | AI planning trigger & execution |
| [web/lib/action-executor.ts](web/lib/action-executor.ts) | Execute Gemini action plans |
| [web/store/board.store.ts](web/store/board.store.ts) | Zustand store + autosave |
| [web/lib/auth.ts](web/lib/auth.ts) | Firebase auth helpers |
| [web/lib/api-client.ts](web/lib/api-client.ts) | Axios HTTP client with JWT |
| [web/lib/canvas-mapping.ts](web/lib/canvas-mapping.ts) | Element ↔ Node ID synchronization |
| [web/lib/camera-sync.ts](web/lib/camera-sync.ts) | Viewport synchronization |

## Backend Critical Path

| File | Purpose |
|------|---------|
| [backend/src/index.ts](backend/src/index.ts) | Server bootstrap & Firebase init |
| [backend/src/app.ts](backend/src/app.ts) | Express app factory & middleware |
| [backend/src/api/controllers/ai.controller.ts](backend/src/api/controllers/ai.controller.ts) | /ai/plan handler |
| [backend/src/services/gemini.service.ts](backend/src/services/gemini.service.ts) | Gemini AI integration |
| [backend/src/services/orchestrator.service.ts](backend/src/services/orchestrator.service.ts) | AI orchestration pipeline |
| [backend/src/prompts/planner.prompt.ts](backend/src/prompts/planner.prompt.ts) | Gemini system prompt |
| [backend/src/services/board.service.ts](backend/src/services/board.service.ts) | Board CRUD & Firestore |
| [backend/src/api/middleware/auth.middleware.ts](backend/src/api/middleware/auth.middleware.ts) | JWT verification |
| [backend/src/validators/action.validator.ts](backend/src/validators/action.validator.ts) | Zod schemas for validation |
| [backend/src/config/firebase.ts](backend/src/config/firebase.ts) | Firebase Admin SDK init |

## Configuration Files

| File | Purpose |
|------|---------|
| [backend/firebase.json](backend/firebase.json) | Firebase emulator config (local dev) |
| [infra/vars.tf](infra/vars.tf) | Terraform global variables |
| [infra/versions.tf](infra/versions.tf) | Terraform provider versions |
| [infra/scripts/deploy.ps1](infra/scripts/deploy.ps1) | Cloud Run deployment script |

---

# 8. SECURITY ARCHITECTURE

## Backend Security

✅ **CORS** — Restricted to frontend origin only  
✅ **Helmet Security Headers** — XSS, clickjacking, MIME-type protections  
✅ **JWT Verification** — Firebase ID token validation on all protected routes  
✅ **Rate Limiting** — `/ai/plan` endpoint protected from abuse  
✅ **Input Validation** — All payloads validated with Zod schemas  
✅ **Firebase Auth** — No password storage, OAuth integration  
✅ **Firestore Rules** — Document-level access control  

## Frontend Security

✅ **httpOnly Cookies** — JWT tokens immune to XSS  
✅ **In-Memory Tokens** — `_tokenMemory` not persisted  
✅ **LocalStorage** — Only non-sensitive user profile data  
✅ **HTTPS** — Enforced in production  
✅ **Content Security Policy** — Helmet configured via backend  

## Database Security

✅ **Firestore Security Rules** — User-owned document access  
✅ **Document-Level Access** — Each board document checks ownership  
✅ **Field-Level Encryption** — At-rest encryption by GCP  

---

# 9. INTEGRATION POINTS

| Integration | Direction | Protocol | Auth |
|-------------|-----------|----------|------|
| Frontend ↔ Backend | Bidirectional | HTTPS JSON REST | JWT in Authorization header |
| Backend ↔ Gemini AI | Outbound | Google GenAI SDK | API key in config |
| Backend ↔ Firestore | Bidirectional | Firebase Admin SDK | Service account credentials |
| Backend ↔ Firebase Auth | Outbound | Firebase Admin SDK | Admin credentials |
| Frontend ↔ Firebase Auth | Outbound | Firebase SDK | User credentials + OAuth |
| Frontend ↔ Firebase (optional) | Inbound | WebSocket | User privileges |
| Backend → Cloud Storage | Outbound | GCS SDK | Service account |
| All → Cloud Logging | Outbound | Winston logger | GCP credentials |

---

# 10. TESTING STRUCTURE

**Backend Tests:**

```
backend/tests/
├── ai.test.ts                    # Gemini integration tests
├── board.test.ts                 # Board CRUD operations
├── firestore.test.ts             # Firestore emulator tests
├── health.test.ts                # Health check endpoint
├── layout.test.ts                # Layout algorithm tests
├── zoom-command.test.ts          # Zoom normalization
├── gemini/
│   ├── gemini-connectivity.test.ts  # API connectivity
│   ├── gemini-actions.test.ts       # Action parsing
│   └── gemini-schema.test.ts        # Response validation
├── fixtures/                     # Test data & mocks
├── setup.ts                      # Test configuration
└── [integration tests]
```

---

# 11. PERFORMANCE OPTIMIZATIONS

1. **Autosave Debounce** — 3-second delay prevents excessive API calls
2. **Parallel Action Execution** — Process independent actions concurrently
3. **State Memoization** — Zustand prevents unnecessary re-renders
4. **Screenshot Compression** — Efficient base64 PNG encoding
5. **Incremental Updates** — Only changed objects synced to Firestore
6. **Rate Limiting** — Protects `/ai/plan` from abuse (429 responses)
7. **Lazy Loading** — Canvas layers load on demand
8. **Caching** — Firebase Admin SDK handles automatic caching
9. **Connection Pooling** — Firestore SDK manages connection pool
10. **Winston Logger** — Efficient structured logging without performance hit

---

# 12. ARCHITECTURE PATTERNS

## Design Patterns Used

1. **MVC Architecture** — Controllers → Services → Data layer
2. **Service Layer Pattern** — Business logic separation (gemini.service, board.service, etc.)
3. **Middleware Pattern** — Authentication, error handling, logging
4. **Dependency Injection** — Firebase, GenAI configured once and injected
5. **Observer Pattern** — Zustand store updates trigger React re-renders
6. **Strategy Pattern** — Action execution with sequential/parallel strategies
7. **Factory Pattern** — Express app factory (createApp)
8. **Adapter Pattern** — Canvas mapping service adapts between Element and Node representations

## Separation of Concerns

- **Frontend** — UI rendering, user interaction, local state
- **Backend** — Business logic, data validation, external API orchestration
- **Database** — Persistent state, multi-user synchronization
- **AI Layer** — Gemini API isolation in dedicated service

---

# SUMMARY

**Stun** is a sophisticated full-stack application that replaces traditional text-based AI chat with **direct visual canvas manipulation**. 

**Key Achievements:**

✅ **Hybrid Canvas** — Three synchronized layers (TLDraw, Excalidraw, React Flow) provide infinite workspace + visual editing + structured knowledge graph

✅ **AI-Powered Actions** — Gemini 2.0 Flash analyzes canvas screenshots + user commands to generate structured JSON action plans

✅ **Seamless Persistence** — Zustand autosave (3s debounce) + Firestore ensures state is always synchronized

✅ **Secure Authentication** — httpOnly cookies + JWT + Firebase OAuth prevents XSS and protects user data

✅ **Cloud-Native** — Terraform-managed Google Cloud Run, Firestore, Secret Manager for production-grade infrastructure

✅ **Scalable Architecture** — Clean separation of concerns, middleware stack, service layer enables easy feature addition

The complete data flow from user command → Gemini API → action execution → Firestore persistence happens in 22 coordination steps, with safety guarantees at every stage (validation, sanitization, access control).

