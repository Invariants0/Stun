# STUN CODEBASE - COMPREHENSIVE ARCHITECTURAL ANALYSIS

**Project:** Stun (Spatial AI Thinking Environment)  
**Vision:** Infinite multimodal canvas where AI visually understands, organizes, and navigates knowledge  
**Core Concept:** AI does not reply in chat → AI navigates and transforms the canvas directly

---

## 1. SYSTEM ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         USER INTERACTION LAYER                          │
│  Voice Commands (Web Speech API) + Screenshot Capture (html2canvas)    │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │ HTTPS + JWT Token
┌────────────────────────────────▼────────────────────────────────────────┐
│               NEXT.JS FRONTEND (React 18 + TypeScript)                  │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │        HYBRID CANVAS: 3 Synchronized Layers                    │   │
│  │  1. TLDraw     → Infinite workspace (pan/zoom/camera)         │   │
│  │  2. Excalidraw → Visual UI (shapes, drawings, diagrams)      │   │
│  │  3. React Flow → Knowledge graph (structured nodes)           │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│  State: Zustand (board.store) | Hooks: useBoard, useAuth, useAction   │
│  Persistence: Firestore (single source of truth)                       │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │ REST API (/ai/plan)
┌────────────────────────────────▼────────────────────────────────────────┐
│            EXPRESS.JS BACKEND (Node.js + TypeScript)                    │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │  AI Orchestration Service                                      │    │
│  │  1. Intent Parser → Parse user command                         │    │
│  │  2. Context Builder → Build spatial summary from canvas state  │    │
│  │  3. Gemini Service → Send to Google GenAI API                  │    │
│  │  4. Action Validator → Validate & normalize JSON response      │    │
│  │  5. Zoom Normalizer → Normalize zoom commands                  │    │
│  │  6. Sanitizer → Ensure safe canvas bounds                      │    │
│  └────────────────────────────────────────────────────────────────┘    │
│  Routes: /health /auth /boards /ai /layout /media /presence /search   │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │ Vertex AI (Google GenAI SDK)
┌────────────────────────────────▼────────────────────────────────────────┐
│                    GOOGLE VERTEX AI (Gemini)                            │
│  Multimodal Input:                                                      │
│  • Screenshot of canvas (base64 PNG)                                    │
│  • Node context (positions, connections, types)                        │
│  • Viewport state                                                       │
│  • User command + spatial reasoning                                     │
│  Output:                                                                │
│  • Structured JSON action plan                                          │
│  • Actions: move, connect, highlight, zoom, group, cluster, create... │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │ Structured JSON Actions
┌────────────────────────────────▼────────────────────────────────────────┐
│           FRONTEND ACTION EXECUTOR (ActionExecutor class)               │
│  Sequential or Parallel execution of AI-generated actions               │
│  • Update Node positions, properties, connections                       │
│  • Render transformations on canvas                                     │
│  • Sync with Zustand store                                              │
│  • Auto-persist to Firestore (3s debounce)                              │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │ All state changes
┌────────────────────────────────▼────────────────────────────────────────┐
│                            FIRESTORE DATABASE                           │
│  Collections:                                                           │
│  • /boards/{boardId}  → Canvas state (nodes, edges, elements, files)   │
│  • /boards/{boardId}/presence → Active users                           │
│  • /users/{uid}/profile → User preferences                              │
│  • /auth/* → Managed by Firebase Auth                                   │
│                                                                         │
│  Security: Firestore Security Rules (auth-based access control)       │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. FRONTEND ARCHITECTURE

### 2.1 Next.js App Structure
- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Port:** 3000 (dev)

**Key Directories:**
```
web/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Landing page (auth check)
│   ├── layout.tsx                # Root layout
│   ├── board/[id]/page.tsx       # Board editor (main canvas)
│   ├── boards/page.tsx           # Board listing
│   ├── signin/page.tsx           # Sign-in page
│   └── api/auth/                 # BFF (Backend-for-Frontend) auth endpoints
│       ├── rehydrate             # Restore session from cookie
│       └── set-token             # Set httpOnly auth cookie
├── components/                   # React components
│   ├── canvas/                   # Canvas wrappers & sync logic
│   ├── nodes/                    # Custom React Flow node renderers
│   ├── ui/                       # UI components (buttons, modals, etc)
│   └── dev/                      # Dev-only components
├── hooks/                        # Custom React hooks
│   ├── useAuth.ts                # Auth state & login/logout
│   ├── useBoard.ts               # Hybrid canvas state management
│   ├── usePlanAndExecute.ts      # AI planning & action execution
│   ├── usePresence.ts            # Active users tracking
│   ├── useScreenshot.ts          # Canvas screenshot capture
│   └── useVoice.ts               # Voice command input
├── lib/                          # Utilities
│   ├── auth.ts                   # Firebase auth helpers
│   ├── api-client.ts             # Axios HTTP client
│   ├── api.ts                    # API endpoints wrapper
│   ├── action-executor.ts        # AI action execution engine
│   ├── canvas-engine-runtime.ts  # Canvas state reconciliation
│   ├── canvas-mapping.ts         # Element↔Node mapping
│   ├── camera-sync.ts            # Viewport synchronization
│   ├── canvas-command-executor.ts # Command execution
│   └── firebase.ts               # Firebase client config
├── store/                        # Zustand state stores
│   ├── board.store.ts            # Hybrid canvas + autosave state
│   ├── toast.store.ts            # Toast notifications
│   └── ui.store.ts               # UI state (modals, sidebar, etc)
├── types/                        # TypeScript type definitions
│   ├── api.types.ts              # API request/response types
│   ├── canvas.types.ts           # Hybrid canvas architecture types
│   └── auth.types.ts             # Authentication types
```

### 2.2 Hybrid Canvas Architecture

**Three Synchronized Layers:**

1. **TLDraw (Layer 0: Workspace Engine)**
   - Infinite canvas with spatial pan/zoom
   - Camera state management
   - Platform for other layers
   - Role: Provide coordinate system and viewport control

2. **Excalidraw (Layer 1: Visual UI)**
   - Drawing tools, shapes, text elements
   - User interaction layer
   - Persistent visual elements
   - Mapped to React Flow nodes via `ElementNodeMapping`

3. **React Flow (Layer 2: Knowledge Graph)**
   - Structured node-edge graph
   - AI-readable representation of knowledge
   - Event handlers for connections, deletions, etc.
   - Source of truth for AI reasoning

**Synchronization Mechanism:**
```
Canvas Mapping Service:
┌──────────────────────────────────────────────┐
│ ExcalidrawElement ID → React Flow Node ID   │
│ sync with ElemetNodeMapping                 │
└──────────────────────────────────────────────┘
        ↓
Camera Sync Service:
┌──────────────────────────────────────────────┐
│ TLDraw Camera → React Flow Viewport →      │
│ Excalidraw Transform (unified state)          │
└──────────────────────────────────────────────┘
        ↓
Board Store (Zustand):
┌──────────────────────────────────────────────┐
│ HybridCanvasState:                           │
│ • excalidraw: { elements, files, appState } │
│ • reactflow: { nodes, edges }               │
│ • tldraw: { camera, selectedShapeIds }      │
│ • mappings: ElementNodeMapping[]            │
└──────────────────────────────────────────────┘
```

### 2.3 State Management (Zustand)

**Board Store (`board.store.ts`):**
```typescript
HybridCanvasState {
  boardId: string
  excalidraw: ExcalidrawLayerData
  reactflow: { nodes: Node[]; edges: Edge[] }
  tldraw: { camera: TLCamera; selectedShapeIds: TLShapeId[] }
  mappings: ElementNodeMapping[]
  
  Actions:
  - setReactFlowData(nodes, edges)
  - setExcalidrawElements(elements)
  - setTldrawEditor(editor)
  - addMapping(elementId, nodeId)
  - hydrateBoard(data)  // Load from Firestore
  - appendNode(node)    // Add single node
}

Autosave State:
  autosaveEnabled: boolean
  isSaving: boolean
  lastSaved: number
  autosaveTimeoutId: NodeJS.Timeout
  
  triggerAutosave(boardId) - Debounced 3s
    ↓ calls updateBoard() API
    ↓ persists to Firestore
```

### 2.4 Authentication Flow

**Token Storage Strategy:**
```
┌────────────────────────────────────────────────────┐
│ httpOnly Cookie "authToken"                        │
│ • Set by Next.js API route /api/auth/set-token     │
│ • Immune to XSS attacks                            │
│ • Read by middleware for SSR protection            │
│ • Read by /api/auth/rehydrate on page refresh      │
└────────────────────────────────────────────────────┘
         
┌────────────────────────────────────────────────────┐
│ In-Memory Variable _tokenMemory                    │
│ • Used by client-side fetch() calls to backend     │
│ • Lost on page refresh (intentional)               │
│ • Safe from XSS (can't be read by scripts)         │
└────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────┐
│ LocalStorage "authUser"                            │
│ • Non-sensitive: displayName, email, photoURL      │
│ • Avoids extra network call on reload              │
└────────────────────────────────────────────────────┘
```

**Authentication Flow:**

1. **User Signs In:**
   ```
   Frontend (signin page)
     → Firebase.signInWithPopup()
     → Firebase Auth returns custom token
     → POST /api/auth/set-token
     → Next.js BFF sets httpOnly cookie
     → localStorage stores user profile
     → Redirect to /boards
   ```

2. **Session Rehydration (on page refresh):**
   ```
   useAuth hook runs
     → getStoredUser() from localStorage (fast path)
     → rehydrateSession() calls /api/auth/rehydrate
     → BFF uses httpOnly cookie to restore Firebase session
     → Returns user profile
   ```

3. **API Requests (backend calls):**
   ```
   Frontend component
     → ensureAuthToken() gets _tokenMemory or refreshes
     → Axios includes "Authorization: Bearer {token}" header
     → Backend auth.middleware verifies JWT
     → Requests proceed with userId claim
   ```

**Security:**
- JWT tokens stored in httpOnly cookie (XSS safe)
- In-memory token for client-side requests (not persisted)
- Token refresh automatic before expiry

### 2.5 Key Hooks

**useAuth:**
- Manages user login/logout state
- Initializes token refresh listener
- Returns: { user, loading, tokenReady, logout }

**useBoard:**
- Loads board from Firestore
- Manages hybrid canvas state synchronization
- Handles autosave to backend
- Reconciles conflicts between layers

**usePlanAndExecute:**
- Captures screenshot
- Calls /ai/plan endpoint
- Executes action plan via ActionExecutor
- Handles errors and retries

**useScreenshot:**
- Returns capture function
- Converts canvas to base64 PNG
- Called before API request to /ai/plan

**useVoice:**
- Listens for voice commands
- Converts speech to text
- Triggers plan & execute workflow

---

## 3. BACKEND ARCHITECTURE

### 3.1 Express Server Structure

**Framework:** Express 5.x + TypeScript  
**Port:** 8080 (dev)  
**Runtime:** Node.js + Bun

**Directory Structure:**
```
backend/
├── src/
│   ├── index.ts                   # Server bootstrap
│   ├── app.ts                     # Express app factory (middleware setup)
│   ├── config/                    # Configuration
│   │   ├── index.ts               # Config exports
│   │   ├── envVars.ts             # Environment variables
│   │   ├── firebase.ts            # Firebase Admin SDK init
│   │   ├── genai.ts               # Google GenAI SDK init
│   │   └── logger.ts              # Winston logger
│   ├── api/
│   │   ├── routes/                # API endpoint routes
│   │   │   ├── index.ts           # Route registration (main router)
│   │   │   ├── ai.routes.ts       # POST /ai/plan
│   │   │   ├── auth.routes.ts     # Auth endpoints
│   │   │   ├── board.routes.ts    # Board CRUD endpoints
│   │   │   ├── health.routes.ts   # Health check
│   │   │   ├── layout.routes.ts   # Layout endpoints
│   │   │   ├── media.routes.ts    # Media upload
│   │   │   ├── presence.routes.ts # Active users
│   │   │   └── search.routes.ts   # Search endpoints
│   │   ├── controllers/           # Route handlers
│   │   │   ├── ai.controller.ts   # /ai/plan handler
│   │   │   ├── board.controller.ts
│   │   │   └── [others...]
│   │   ├── models/                # Data models
│   │   │   ├── board.model.ts
│   │   │   └── [others...]
│   │   └── middleware/            # Middleware functions
│   │       ├── auth.middleware.ts     # JWT verification
│   │       ├── error.middleware.ts    # Error handling
│   │       ├── board.middleware.ts    # Board access checks
│   │       └── ratelimit.middleware.ts # Rate limiting
│   ├── services/                  # Business logic
│   │   ├── gemini.service.ts      # Gemini AI integration
│   │   ├── board.service.ts       # Board CRUD operations
│   │   ├── boardAccess.service.ts # Access control
│   │   ├── presence.service.ts    # Active user tracking
│   │   ├── orchestrator.service.ts # AI orchestration
│   │   ├── intent-parser.ts       # Command intent parsing
│   │   ├── context-builder.ts     # Spatial context generation
│   │   ├── zoom-command.service.ts # Zoom normalization
│   │   └── [others...]
│   ├── prompts/                   # LLM prompts
│   │   └── planner.prompt.ts      # System prompt for Gemini
│   ├── validators/                # Input validation (Zod schemas)
│   │   └── action.validator.ts    # Action plan validation
│   ├── utils/                     # Utility functions
│   │   ├── spatial.ts             # Positional calculations
│   │   └── [others...]
│   └── types/                     # TypeScript types
├── tests/                         # Test suite
│   ├── ai.test.ts
│   ├── board.test.ts
│   ├── firestore.test.ts
│   ├── gemini/
│   └── setup.ts
├── firebase.json                  # Firebase config
├── package.json
├── tsconfig.json
└── Dockerfile
```

### 3.2 AI Integration & Gemini Service

**Gemini Service (`gemini.service.ts`):**

```typescript
geminiService.planActions(input: PlannerRequest): Promise<ActionPlan>

Steps:
1. Orchestrate request:
   - orchestratePlanning(input)
   - Parse command intent
   - Build spatial context summary
   - Get intent-specific guidance

2. Build prompt:
   - System prompt: planner.prompt(command, spatialSummary, guidance)
   - Add node context as JSON
   - Prepare screenshot as base64

3. Call Gemini:
   - genAI.models.generateContent({
       model: "gemini-2.0-flash-exp"
       contents: [
         { text: prompt + nodeContext },
         { inlineData: { data: screenshot, mimeType: "image/png" } }
       ]
     })

4. Parse response:
   - Extract JSON from markdown code blocks
   - Find largest JSON object in response
   - validateActionPlan(parsed)

5. Normalize & sanitize:
   - normalizeZoomActions(actions)
   - validateNodeReferences(actions, nodeIds)
   - sanitizeActionPositions(actions, bounds)
   - Ensure nodes stay within safe bounds

6. Return ActionPlan with actions array
```

**Input: PlannerRequest**
```typescript
{
  boardId: string
  command: string              // "organize all nodes in a grid"
  screenshot: string           // base64 PNG
  nodes: Node[]                // Current canvas nodes
  viewport?: Viewport          // Current camera state
}
```

**Output: ActionPlan**
```typescript
{
  actions: AIAction[]
  reasoning?: string
  executionOrder?: "sequential" | "parallel"
}

AIAction types:
- move: { type, nodeId, to: { x, y } }
- connect: { type, source, target }
- highlight: { type, nodeId, color }
- zoom: { type, center, level, duration }
- group: { type, nodeIds, groupId }
- cluster: { type, nodeIds, data }
- create: { type, label, position }
- delete: { type, nodeId }
- transform: { type, nodeId, data }
- layout: { type, level }
```

### 3.3 AI Orchestration Pipeline

**Flow in `orchestrator.service.ts`:**

```
User Command (e.g., "organize all nodes in a grid")
           ↓
orchestratePlanning(request)
    ├─ parseIntent(command)
    │  └─ Intent: "organize", confidence: "high"
    │
    ├─ buildSpatialContext(nodes, edges, viewport)
    │  ├─ Calculate spatial bounds (minX, maxX, minY, maxY)
    │  ├─ Group nodes by proximity
    │  ├─ Analyze connections & relationships
    │  └─ Generate contextual summary
    │
    ├─ generateContextSummary(spatialContext)
    │  └─ "Canvas contains 5 nodes. Nodes labeled A-E connected in chain.
    │      Viewport centered at (0,0), zoom 1.0"
    │
    └─ getIntentGuidance(intent)
       └─ "For organize: suggest grid layout, maintain connections,
           position nodes relative to viewport center"

Result: OrchestrationContext
  - intent: "organize"
  - spatialSummary: "5 nodes in chain layout..."
  - guidance: "...grid layout..."
  - rawContext: spatial data for Gemini
```

**Context Builder (`context-builder.ts`):**

Analyzes current canvas state and extracts:
- Node positions, labels, types
- Edge connections
- Viewport state
- Spatial bounds
- Node clustering

Output: Human-readable spatial summary for AI reasoning

### 3.4 Middleware & Security

**Auth Middleware (`auth.middleware.ts`):**
- Verifies Firebase JWT tokens
- Extracts userId from token claims
- Attaches to `req.user`
- Returns 401 if missing/invalid

**Error Middleware (`error.middleware.ts`):**
- Catches all errors in pipeline
- Formats error responses
- Logs to Winston logger
- Returns appropriate HTTP status codes

**Rate Limiting (`ratelimit.middleware.ts`):**
- Limits /ai/plan endpoint (prevent AI abuse)
- Uses express-rate-limit
- Returns 429 if exceeded

**CORS:**
- Allows requests from FRONTEND_URL
- Configured in app.ts

### 3.5 Board Service

**CRUD Operations (`board.service.ts`):**

```typescript
createBoard(ownerId, payload)
  → Add new board to Firestore
  → Serialize complex objects to JSON strings
  → Return created board

listBoards(ownerId)
  → Query boards owned by user
  → Query boards where user is collaborator
  → Merge & deduplicate
  → Return combined list

getBoard(id, userId)
  → Fetch board from Firestore
  → Check access permissions
  → Update presence (user indicator)
  → Return board with active user count

updateBoard(id, userId, patch)
  → Verify access
  → Update nodes, edges, elements, files
  → Write to Firestore
  → Update lastActivity timestamp

deleteBoard(id, userId)
  → Verify ownership
  → Delete from Firestore
```

**Firestore Collections:**
```
/boards/{boardId}
  ├─ nodes: Node[]
  ├─ edges: Edge[]
  ├─ elements: ExcalidrawElement[]
  ├─ files: { [id]: { mimeType, dataURL } }
  ├─ ownerId: string
  ├─ collaborators: string[]
  ├─ visibility: "edit" | "view"
  ├─ activeUsers: number
  ├─ lastActivity: ISO timestamp
  ├─ createdAt: ISO timestamp
  └─ updatedAt: ISO timestamp

/boards/{boardId}/presence/{userId}
  ├─ userId: string
  ├─ lastSeen: ISO timestamp
  └─ [cursor position if real-time enabled]
```

### 3.6 API Routes Summary

| Route | Method | Purpose |
|-------|--------|---------|
| `/health` | GET | Health check (returns 200) |
| `/auth/signin` | POST | Authenticate user |
| `/auth/logout` | POST | Sign out user |
| `/boards` | GET | List user's boards |
| `/boards` | POST | Create new board |
| `/boards/:id` | GET | Get board details |
| `/boards/:id` | PUT | Update board state |
| `/boards/:id` | DELETE | Delete board |
| `/ai/plan` | POST | Plan AI actions (screenshot + command) |
| `/layout/:id` | GET/POST | Auto-layout endpoints |
| `/media/upload` | POST | Upload image/media |
| `/presence/:boardId` | GET | Get active users |
| `/search` | GET/POST | Search boards/content |

---

## 4. DATA MODELS & TYPES

### 4.1 Core Canvas Types

**React Flow Node:**
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

**React Flow Edge:**
```typescript
{
  id: string
  source: string          // source node ID
  target: string          // target node ID
  animated?: boolean
  data?: { label?: string }
}
```

**Excalidraw Element:**
```typescript
{
  id: string
  type: "rectangle" | "diamond" | "ellipse" | "line" | "text" | "image" | ...
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
  text?: string          // For text elements
  [other Excalidraw properties...]
}
```

**Element Node Mapping:**
```typescript
{
  excalidrawElementId: string
  reactFlowNodeId: string
  createdAt: number
  syncStatus: "synced" | "pending" | "conflict"
}
```

**Hybrid Canvas State:**
```typescript
{
  boardId: string
  
  excalidraw: {
    elements: ExcalidrawElement[]
    files: Record<string, { id, mimeType, dataURL }>
    appState: { viewBackgroundColor, colors, etc. }
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

## 5. COMPLETE DATA FLOW: USER COMMAND → AI → EXECUTION → PERSISTENCE

### Step-by-Step Flow

```
┌─ USER INTERACTION ─────────────────────────────────────────────┐

1. User speaks command
   "Organize all nodes in a grid"
   
   OR
   
   User types command
   "organize all nodes in a grid"

└────────────────────────────────────────────────────────────────┘
                            ↓
┌─ FRONTEND (via usePlanAndExecute hook) ─────────────────────────┐

2. Capture Canvas State
   getBoard() returns {
     nodes: Node[],
     edges: Edge[],
     elements: ExcalidrawElement[],
     files?: { ... }
   }

3. Screenshot Capture
   useScreenshot() → html2canvas() → base64 PNG

4. Prepare Request
   const request: AIActionRequest = {
     boardId: "board-123",
     command: "organize all nodes in a grid",
     screenshot: "data:image/png;base64,iVBORw0KG...",
     nodes: [ { id, type, position, data }, ... ],
     viewport: { x, y, zoom }
   }

5. Send to Backend
   POST /ai/plan (with JWT token in Authorization header)
   Content-Type: application/json
   Authorization: Bearer {idToken}

└────────────────────────────────────────────────────────────────┘
                            ↓
┌─ BACKEND (via AI Controller) ────────────────────────────────────┐

6. Validate Input
   aiController.plan(req)
     → plannerRequestSchema.parse(req.body)
     → Zod validation

7. Orchestrate Planning
   orchestratePlanning(input):
   
   a) Parse Intent
      parseIntent("organize all nodes in a grid")
      → intent: "organize", confidence: "high"
   
   b) Build Spatial Context
      buildSpatialContext(nodes, edges, viewport):
      └─ Analyze node positions, connections, bounds
         Calculate: minX, maxX, minY, maxY, clusters
   
   c) Generate Summary
      generateContextSummary(context)
      └─ "Canvas contains 5 nodes arranged in a chain
           from (100, 100) to (500, 500). Nodes connected
           sequentially. Viewport at (300, 300), zoom 1.0"
   
   d) Get Guidance
      getIntentGuidance("organize")
      └─ "For organize actions: suggest grid/row layout,
           preserve connections, position relative to center"

8. Build Gemini Prompt
   prompts/planner.prompt.ts:
   
   System message: Well-crafted instructions for spatial reasoning
   User message constructs:
   ${COMMAND} = "organize all nodes in a grid"
   ${SPATIAL_SUMMARY} = "Canvas contains 5 nodes..."
   ${GUIDANCE} = "For organize..."
   ${VIEWPORT} = "{ x: 300, y: 300, zoom: 1.0 }"
   
   Node context (JSON):
   [
     { id: "node-1", label: "Research", position: { x: 100, y: 100 } },
     { id: "node-2", label: "Design", position: { x: 200, y: 100 } },
     ...
   ]

9. Call Gemini API
   genAI.models.generateContent({
     model: "gemini-2.0-flash-exp",
     contents: [
       {
         role: "user",
         parts: [
           { text: <full prompt + node context> },
           { inlineData: { data: <base64 screenshot>, mimeType: "image/png" } }
         ]
       }
     ]
   })

10. Parse Gemini Response
    Gemini returns JSON like:
    ```json
    {
      "actions": [
        { "type": "move", "nodeId": "node-1", "to": { "x": 100, "y": 100 } },
        { "type": "move", "nodeId": "node-2", "to": { "x": 300, "y": 100 } },
        { "type": "move", "nodeId": "node-3", "to": { "x": 500, "y": 100 } },
        ...
      ],
      "executionOrder": "parallel",
      "reasoning": "Arranged nodes in a 3-column grid, preserving..."
    }
    ```
    
    Extract JSON from markdown blocks or JSON objects
    → validateActionPlan(parsed)

11. Normalize & Sanitize Actions
    a) normalizeZoomActions(actions)
       └─ Convert viewport zoom actions to consistent format
    
    b) validateNodeReferences(actions, nodeIds)
       └─ Ensure all nodeIds exist in current canvas
    
    c) sanitizeActionPositions(actions, bounds)
       └─ Clamp positions within safe bounds
          Expand bounds by ±1000 px
          If canvas empty, use default ±5000 bounds

12. Return Action Plan to Frontend
    HTTP Response 200:
    {
      "actions": [
        { "type": "move", "nodeId": "node-1", "to": { "x": 100, "y": 100 } },
        ...
      ],
      "reasoning": "...",
      "executionOrder": "parallel"
    }

└────────────────────────────────────────────────────────────────┘
                            ↓
┌─ FRONTEND ACTION EXECUTION ────────────────────────────────────┐

13. Execute Action Plan
    ActionExecutor.executePlan(plan):
    
    if (plan.executionOrder === "parallel") {
      await Promise.all(actions.map(a => executeAction(a)))
    } else {
      for (const action of actions) {
        await executeAction(action)
      }
    }

14. Execute Individual Actions
    actionExecutor.executeAction(action):
    
    For "move" action:
      → Find node in context.nodes
      → Update node.position to { x, y }
      → Call setNodes(updatedNodes)
      → Zustand store updates
      → React re-renders canvas
    
    For "connect" action:
      → Create new Edge { id, source, target }
      → Add to edges array
      → Call setEdges(updatedEdges)
    
    For "highlight" action:
      → Update node data: { ...node.data, highlighted: true, color }
      → Re-render with styles
    
    For "zoom" action:
      → Calculate center from viewport or provided center
      → setViewport({ x, y, zoom }) or setCenter(x, y, { zoom, duration })
      → Animate viewport change
    
    [Similar for other action types]

15. Update Zustand Store
    board.store:
    → setNodes(updatedNodes)
    → setEdges(updatedEdges)
    → HybridCanvasState updated
    → All canvas layers re-render

16. Canvas Re-renders
    Changes propagate to:
    ├─ React Flow canvas updates
    ├─ TLDraw reflects viewport
    └─ Excalidraw updates if elements sync

└────────────────────────────────────────────────────────────────┘
                            ↓
┌─ PERSISTENCE (via Autosave) ──────────────────────────────────┐

17. Trigger Autosave
    Zustand action: triggerAutosave(boardId)
    └─ Starts 3-second debounce timer
    
    After 3 seconds of inactivity:
    autosaveTriggered()
    
18. Serialize State
    boardStore.boards[boardId]:
    {
      excalidraw: { elements, files, appState },
      reactflow: { nodes, edges },
      mappings: [ ... ]
    }
    
    Serialize complex objects to JSON strings:
    {
      nodes: JSON.stringify(nodes),
      edges: JSON.stringify(edges),
      elements: JSON.stringify(elements),
      files: JSON.stringify(files)
    }

19. Call Backend Update
    PUT /boards/{boardId}
    Content-Type: application/json
    {
      "nodes": "[...]",
      "edges": "[...]",
      "elements": "[...]",
      "files": "{...}"
    }

20. Backend Persists to Firestore
    boardService.updateBoard(id, userId, patch):
    
    db.collection("boards")
      .doc(boardId)
      .update({
        nodes: patch.nodes,
        edges: patch.edges,
        elements: patch.elements,
        files: patch.files,
        updatedAt: new Date().toISOString(),
        lastActivity: new Date().toISOString()
      })

21. Firestore Database Update
    /boards/{boardId} document updated:
    {
      ownerId: "user-123",
      nodes: "[...]",
      edges: "[...]",
      elements: "[...]",
      files: "{...}",
      visibility: "edit",
      collaborators: [],
      activeUsers: 1,
      lastActivity: "2024-03-17T14:30:00Z",
      createdAt: "2024-03-17T14:00:00Z",
      updatedAt: "2024-03-17T14:30:00Z"
    }

22. Presence Update (Optional - Real-time)
    presenceService.updatePresence(boardId, userId):
    Write to /boards/{boardId}/presence/{userId}:
    {
      userId: "user-123",
      lastSeen: "2024-03-17T14:30:00Z"
    }

└────────────────────────────────────────────────────────────────┘
                            ↓
            ✅ Done! Changes persisted to database
```

### Key Synchronization Points:

1. **Frontend → Backend:** Only on autosave (3s debounce) or manual save
2. **Backend → Frontend:** On board load or real-time subscriptions (if enabled)
3. **Action Execution:** Sequential or parallel based on AI recommendation
4. **Error Handling:** 
   - Invalid nodes → filtered out
   - Out-of-bounds positions → clamped
   - Network failures → retry logic in API client

---

## 6. CLOUD DEPLOYMENT ARCHITECTURE

### 6.1 Infrastructure (Terraform)

**Cloud Resources:**
```
GCP Project: stun-489205

┌─────────────────────────────────────────────┐
│  Cloud Run                                   │
│  • stun-backend service                      │
│  • Port 8080                                 │
│  • 2 CPU, 2GB RAM per instance              │
│  • Min instances: 1, Max: 10                │
│  • Automatic request scaling                │
│  • Health check: GET /health every 30s      │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  Artifact Registry                           │
│  • stun-backend Docker image                 │
│  • Pushed on deployment                      │
│  • Referenced in Cloud Run configuration    │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  Firestore Database                          │
│  • Multi-region replication                  │
│  • Collections: boards, presence, users     │
│  • Security rules enforced                  │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  Cloud Storage                               │
│  • Media uploads (images, files)             │
│  • User-scoped access control                │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  Secret Manager                              │
│  • GEMINI_API_KEY                           │
│  • FIREBASE_*                               │
│  • Database credentials                      │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  Cloud Logging                               │
│  • Aggregates Cloud Run & app logs          │
│  • Winston logger integration                │
└─────────────────────────────────────────────┘
```

### 6.2 Docker & Deployment

**Dockerfile (Backend):**
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY src ./src
RUN npm run build
EXPOSE 8080
CMD ["node", "dist/index.js"]
```

**Deployment Process:**
1. Build Docker image
2. Push to Artifact Registry
3. Deploy to Cloud Run (terraform or CLI)
4. Firestore emulator for local dev
5. Firebase hosting for frontend (if needed)

### 6.3 Environment Variables

**Backend:**
```
PORT=8080
NODE_ENV=production
FRONTEND_URL=https://stun.example.com
FIREBASE_PROJECT_ID=stun-489205
FIREBASE_PRIVATE_KEY=...
FIREBASE_CLIENT_EMAIL=...
GEMINI_API_KEY=...
```

**Frontend (.env.local):**
```
NEXT_PUBLIC_API_BASE_URL=https://backend-service.run.app
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=stun-489205
```

---

## 7. AUTHENTICATION DEEP DIVE

### Complete Auth Flow

**Sign-In:**
```
User clicks "Sign in with Google"
  ↓
Firebase.signInWithPopup()
  ↓
Google OAuth popup (consent)
  ↓
Firebase returns custom token (Firebase JWT)
  ↓
Frontend POST /api/auth/set-token (BFF route)
  ↓
Next.js API: getAuth().verifyIdToken(token)
  ↓
Verify with Firebase Admin SDK
  ↓
Set httpOnly cookie "authToken"
  ↓
Return success + user profile
  ↓
Frontend: localStorage.setItem("authUser", JSON.stringify(profile))
  ↓
Redirect to /boards
```

**Token Management:**

```
Token Lifecycle:
├─ Fresh token (from Firebase)
├─ Stored in _tokenMemory (in-memory on frontend)
├─ Also set as httpOnly cookie by /api/auth/set-token
└─ Expiry check: decodeJwtPayload(token).exp

Token Refresh:
├─ When _tokenMemory expires, Firebase auto-refreshes
├─ current.getIdToken(true) forces refresh
├─ New token cached in _tokenMemory
└─ Old cookie replaced with new expiry

Session Recovery (page refresh):
├─ httpOnly cookie still present
├─ /api/auth/rehydrate reads cookie
├─ Returns user profile stored in Firebase
├─ localStorage "authUser" also available (cached)
└─ useAuth hook populates state
```

---

## 8. SECURITY FEATURES

**Backend:**
- ✅ CORS restricted to frontend origin
- ✅ Helmet security headers
- ✅ JWT verification on all protected routes
- ✅ Rate limiting on /ai/plan endpoint
- ✅ Input validation with Zod schemas
- ✅ Firebase Auth integration
- ✅ Firestore security rules

**Frontend:**
- ✅ httpOnly cookies (XSS safe tokens)
- ✅ Content Security Policy (Helmet)
- ✅ HTTPS only (enforced in production)
- ✅ Firebase Auth client verification
- ✅ Local storage for non-sensitive data only

**Database:**
- ✅ Firestore security rules enforce user-owned access
- ✅ Document-level access control
- ✅ Field-level encryption (at rest)

---

## 9. KEY INTEGRATION POINTS

| Component | Integrates With | Method | Data Flow |
|-----------|-----------------|--------|-----------|
| Frontend | Backend | HTTPS REST API | Request/Response JSON |
| Backend | Gemini AI | SDK (genai package) | JSON prompt + Screenshot base64 |
| Backend | Firestore | Firebase Admin SDK | Document read/write, queries |
| Backend | Firebase Auth | Firebase Admin SDK | JWT verification |
| Frontend | Firebase Auth | Firebase SDK | OAuth, custom tokens |
| Frontend | Firestore | Firebase SDK (if direct) | Realtime subscriptions (optional) |
| Frontend | Canvas libs | NPM packages | Data binding, event handling |

---

## 10. TESTING STRUCTURE

**Backend Tests:**
```
tests/
├─ ai.test.ts           # Gemini integration tests
├─ board.test.ts        # Board CRUD operations
├─ firestore.test.ts    # Firestore emulator tests
├─ health.test.ts       # Health check endpoint
├─ layout.test.ts       # Layout algorithm tests
├─ zoom-command.test.ts # Zoom normalization
├─ gemini/
│  ├─ gemini-connectivity.test.ts    # API connectivity
│  ├─ gemini-actions.test.ts         # Action parsing
│  └─ gemini-schema.test.ts          # Response validation
├─ fixtures/            # Test data
├─ setup.ts             # Test configuration
```

---

## 11. PERFORMANCE OPTIMIZATIONS

1. **Autosave Debounce:** 3-second delay prevents excessive API calls
2. **Parallel Action Execution:** Process independent actions concurrently
3. **State Memoization:** Zustand prevents unnecessary re-renders
4. **Screenshot Compression:** Efficient base64 encoding for network
5. **Incremental Updates:** Only changed objects synced to Firestore
6. **Rate Limiting:** Protects /ai/plan from abuse
7. **Lazy Loading:** Canvas layers load on demand
