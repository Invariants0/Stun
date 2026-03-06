# Web Layer Audit — Comprehensive Technical Analysis

**Project:** Stun - Spatial AI Thinking Environment  
**Audit Date:** March 6, 2026  
**Scope:** Complete `web/` directory frontend architecture  
**Purpose:** Deep technical audit for backend integration and cloud deployment readiness

---

## Executive Summary

The Stun frontend is a **Next.js 14 App Router** application implementing a sophisticated **hybrid canvas architecture** that combines three distinct canvas layers into a unified infinite workspace. The system is production-ready with robust authentication, state management, and AI integration patterns, though some areas require attention before full deployment.

**Key Findings:**
- ✅ Solid architectural foundation with clear separation of concerns
- ✅ Production-grade authentication using Firebase + BFF pattern
- ✅ Innovative multi-layer canvas system (TLDraw + Excalidraw + React Flow)
- ⚠️ Camera synchronization needs testing under load
- ⚠️ Missing environment variable validation
- ⚠️ No error boundaries on critical paths
- ⚠️ Voice API has browser compatibility issues

---

## 1. Project Structure Analysis

### 1.1 Directory Hierarchy

```
web/
├── app/                    # Next.js 14 App Router
│   ├── api/               # Backend-for-Frontend (BFF) routes
│   │   └── auth/          # Auth token management
│   ├── auth/              # OAuth callback handlers
│   ├── board/[id]/        # Dynamic board routes
│   ├── signin/            # Authentication page
│   ├── globals.scss       # Global styles + canvas cleanup
│   ├── layout.tsx         # Root layout with providers
│   └── page.tsx           # Landing page
├── components/            # React components
│   ├── ai/               # AI sidebar launcher
│   ├── canvas/           # Multi-layer canvas system
│   ├── layout/           # Layout components (TopBar, SidePanel)
│   ├── nodes/            # Custom React Flow nodes
│   └── voice/            # Voice command UI
├── hooks/                # Custom React hooks
│   ├── useAuth.ts        # Authentication state
│   ├── useBoard.ts       # Canvas state management
│   ├── useVoice.ts       # Web Speech API wrapper
│   └── useScreenshot.ts  # Canvas screenshot utility
├── lib/                  # Core utilities
│   ├── action-executor.ts # AI action execution engine
│   ├── api.ts            # Axios HTTP client
│   ├── auth.ts           # Auth helpers (token, session)
│   ├── camera-sync.ts    # Multi-canvas camera sync
│   ├── canvas-mapping.ts # Element-to-node mapping
│   └── firebase.ts       # Firebase SDK initialization
├── store/                # Zustand state management
│   ├── board.store.ts    # Hybrid canvas state
│   └── toast.store.ts    # Toast notifications
├── types/                # TypeScript definitions
│   └── canvas.types.ts   # Canvas architecture types
├── middleware.ts         # Next.js auth middleware
├── next.config.mjs       # Next.js configuration
├── package.json          # Dependencies
└── tsconfig.json         # TypeScript configuration
```


### 1.2 Key Modules & Entry Points

**Entry Points:**
- `app/layout.tsx` - Root layout with global styles and providers
- `app/page.tsx` - Landing page with animated entry screen
- `app/board/[id]/page.tsx` - Main canvas workspace
- `middleware.ts` - Auth protection for all routes

**Core Modules:**
- `components/canvas/CanvasRoot.tsx` - Orchestrates 3-layer canvas system
- `lib/action-executor.ts` - Executes AI-generated canvas actions
- `lib/camera-sync.ts` - Synchronizes viewport across all layers
- `hooks/useBoard.ts` - Manages hybrid canvas state with persistence
- `store/board.store.ts` - Zustand store for global canvas state

**Module Roles:**

| Directory | Purpose | Key Files |
|-----------|---------|-----------|
| `app/` | Next.js routing, pages, API routes | layout.tsx, page.tsx, middleware.ts |
| `components/canvas/` | Multi-layer canvas implementation | CanvasRoot, TLDrawWorkspace, ExcalidrawLayer, ReactFlowGraphLayer |
| `hooks/` | Reusable React logic | useAuth, useBoard, useVoice |
| `lib/` | Business logic & utilities | action-executor, camera-sync, canvas-mapping, api, auth |
| `store/` | Global state management | board.store, toast.store |
| `types/` | TypeScript type definitions | canvas.types |

---

## 2. Framework & Stack Detection

### 2.1 Core Technologies

**Framework:** Next.js 14.2.23 (App Router)
- **Routing:** File-based routing with dynamic segments (`[id]`)
- **Rendering:** Hybrid SSR + CSR (Server Components + Client Components)
- **API Routes:** Backend-for-Frontend (BFF) pattern in `app/api/`
- **Middleware:** Route protection with cookie-based auth

**React:** 18.2.0
- **State Management:** Zustand 5.0.3 (lightweight, no boilerplate)
- **Hooks:** Custom hooks for auth, board state, voice commands
- **Error Boundaries:** Class-based ErrorBoundary component

**TypeScript:** 5.8.2
- **Strict Mode:** Enabled (`strict: true`)
- **Path Aliases:** `@/*` maps to workspace root
- **Type Safety:** Full type coverage for canvas architecture

### 2.2 Canvas Libraries

**Three-Layer Architecture:**

1. **TLDraw 2.4.6** - Infinite Canvas OS
   - Provides pan/zoom infrastructure
   - Camera coordinate system
   - Workspace navigation
   - Hidden UI (acts as backbone only)

2. **Excalidraw 0.18.0** - Visual Editing Layer
   - Drawing tools (shapes, arrows, text)
   - User-facing UI
   - Element manipulation
   - Diagram creation

3. **React Flow 11.11.4** - Knowledge Graph Engine
   - Structured nodes and edges
   - AI-driven transformations
   - Graph relationships
   - Metadata management

### 2.3 Build Tooling

**Package Manager:** Bun (bun.lock present)
- Fast installation and execution
- Compatible with npm ecosystem

**Build System:** Next.js built-in (Turbopack/Webpack)
- SWC compiler for TypeScript
- Sass support (sass 1.85.1)
- CSS Modules + Global SCSS

**Development:**
```json
"scripts": {
  "dev": "cross-env NODE_OPTIONS=--max-old-space-size=8192 next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint"
}
```

**Memory Allocation:** 8GB heap size for dev server (handles large canvas states)


### 2.4 Architecture Pattern

**Pattern:** Hybrid SSR + CSR with BFF

```
┌─────────────────────────────────────────────────────────────┐
│                     Browser (Client)                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Next.js App Router (React 18)                       │  │
│  │  ├── Server Components (SSR)                         │  │
│  │  │   └── Initial page load, SEO, metadata           │  │
│  │  └── Client Components ("use client")                │  │
│  │      ├── Canvas layers (TLDraw, Excalidraw, RF)     │  │
│  │      ├── Interactive UI (voice, AI sidebar)         │  │
│  │      └── State management (Zustand)                 │  │
│  └──────────────────────────────────────────────────────┘  │
│                           ↕                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Next.js API Routes (BFF Layer)                      │  │
│  │  ├── /api/auth/set-token (httpOnly cookie)          │  │
│  │  └── /api/auth/rehydrate (session restore)          │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                           ↕
┌─────────────────────────────────────────────────────────────┐
│              Backend API (localhost:8080)                   │
│  ├── /auth/* (OAuth, token exchange)                       │
│  ├── /boards/* (CRUD operations)                           │
│  └── /ai/* (Gemini AI orchestration)                       │
└─────────────────────────────────────────────────────────────┘
```

**Key Characteristics:**
- **SSR for SEO:** Landing page, auth pages rendered server-side
- **CSR for Interactivity:** Canvas, AI features run client-side
- **BFF for Security:** httpOnly cookies set via Next.js API routes
- **Middleware Protection:** All routes except `/signin` require auth

---

## 3. Component Architecture

### 3.1 Component Classification

**Layout Components:**
- `app/layout.tsx` - Root layout with global providers
- `components/layout/TopBar.tsx` - Canvas toolbar
- `components/layout/SidePanel.tsx` - Side navigation
- `components/ProfileIcon.tsx` - User profile dropdown

**Canvas Components (Core System):**
- `components/canvas/CanvasRoot.tsx` - Orchestrator for 3 layers
- `components/canvas/TLDrawWorkspace.tsx` - Infinite canvas backbone
- `components/canvas/ExcalidrawLayer.tsx` - Visual editing layer
- `components/canvas/ReactFlowGraphLayer.tsx` - Knowledge graph layer
- `components/canvas/NodeRenderer.tsx` - Custom node types
- `components/canvas/EdgeRenderer.tsx` - Custom edge types
- `components/canvas/CameraController.tsx` - Camera sync controller

**AI Components:**
- `components/ai/AISidebarLauncher.tsx` - Floating AI assistant
- `components/voice/VoiceOrb.tsx` - Voice command button

**Node Components:**
- `components/nodes/TextNode.tsx` - Text content nodes
- `components/nodes/ImageNode.tsx` - Image nodes

**Utility Components:**
- `components/EnterPage.tsx` - Animated landing page
- `components/ErrorBoundary.tsx` - Error handling
- `components/Toast.tsx` - Notification system

### 3.2 Component Hierarchy

```
RootLayout (app/layout.tsx)
├── ToastContainer (global notifications)
├── AISidebarLauncher (floating AI assistant)
└── {children}
    └── BoardPage (app/board/[id]/page.tsx)
        ├── ProfileIcon (user menu)
        └── ErrorBoundary
            └── CanvasRoot
                ├── TLDrawWorkspace (z-index: 1, hidden UI)
                ├── ReactFlowGraphLayer (z-index: 3, nodes/edges)
                └── ExcalidrawLayer (z-index: 2, drawing UI)
```

**Z-Index Stacking:**
1. **TLDraw (z: 1):** Backbone layer, provides pan/zoom
2. **Excalidraw (z: 2):** Visual content, user interaction
3. **React Flow (z: 3):** Knowledge nodes, AI-driven


### 3.3 Props Structure & Data Flow

**CanvasRoot Props:**
```typescript
type Props = { boardId: string };
```

**Data Flow:**
```
useBoard(boardId)
  ↓
  ├── nodes, edges (React Flow state)
  ├── excalidrawElements (Excalidraw state)
  └── tldrawEditor (TLDraw editor instance)
  ↓
Passed to child layers:
  ├── ReactFlowGraphLayer (nodes, edges, callbacks)
  ├── ExcalidrawLayer (elements, onChange)
  └── TLDrawWorkspace (camera callbacks)
```

**State Propagation:**
1. User interacts with Excalidraw (draws shape)
2. `onElementsChange` callback fires
3. State updates in `useBoard` hook
4. Auto-saved to localStorage (debounced 500ms)
5. Synced to Zustand store
6. Camera changes propagate via `cameraSyncService`

### 3.4 Context Usage

**No React Context Used** - Zustand provides global state without Context API overhead.

**Global State Access:**
```typescript
// Any component can access board state
const { boards, activeBoardId } = useBoardStore();

// Toast notifications
const { addToast } = useToastStore();
```

### 3.5 Canvas UI Architecture

**Infinite Canvas Implementation:**

The system uses **TLDraw as the canvas operating system** with Excalidraw and React Flow layered on top:

```typescript
// TLDraw provides:
- Infinite pan/zoom
- Camera transformations
- Coordinate system
- Gesture handling

// Excalidraw provides:
- Drawing tools
- Shape manipulation
- Visual editing UI
- Element serialization

// React Flow provides:
- Structured nodes
- Graph relationships
- AI-driven transformations
- Metadata management
```

**Pointer Events Strategy:**
- TLDraw: `pointerEvents: auto` (handles pan/zoom)
- React Flow: `pointerEvents: none` (pass-through to TLDraw)
- Excalidraw: `pointerEvents: auto` (handles drawing)

This allows users to draw with Excalidraw while TLDraw handles navigation.

---

## 4. State Management

### 4.1 Global State System

**Library:** Zustand 5.0.3

**Why Zustand:**
- Zero boilerplate (no providers, actions, reducers)
- TypeScript-first design
- Minimal re-renders (selector-based)
- DevTools support
- No Context API overhead

### 4.2 Store Structure

**Board Store (`store/board.store.ts`):**

```typescript
interface BoardState {
  // All boards indexed by ID
  boards: Record<string, HybridCanvasState>;
  
  // Currently active board
  activeBoardId: string | null;
  
  // Actions
  setReactFlowData: (boardId, data) => void;
  setExcalidrawElements: (boardId, elements) => void;
  setTldrawEditor: (boardId, editor) => void;
  addMapping: (boardId, mapping) => void;
  removeMapping: (boardId, elementId) => void;
  createBoard: (boardId) => void;
  setActiveBoard: (boardId) => void;
  getBoard: (boardId) => HybridCanvasState | undefined;
}
```

**Toast Store (`store/toast.store.ts`):**

```typescript
interface ToastState {
  toasts: Toast[];
  addToast: (message, type, duration?) => void;
  removeToast: (id) => void;
}
```

### 4.3 State Slices

**Hybrid Canvas State:**

```typescript
interface HybridCanvasState {
  boardId: string;
  
  // Excalidraw layer
  excalidraw: {
    elements: readonly ExcalidrawElement[];
    appState: { /* drawing settings */ };
  };
  
  // TLDraw layer
  tldraw: {
    camera: TLCamera;
    selectedShapeIds: TLShapeId[];
    isPanning: boolean;
    isZooming: boolean;
  };
  
  // React Flow layer
  reactflow: {
    nodes: Node[];
    edges: Edge[];
    viewport: { x, y, zoom };
  };
  
  // Cross-layer mappings
  mappings: ElementNodeMapping[];
  
  // Unified camera state
  camera: UnifiedCameraState;
}
```


### 4.4 Persistence Behavior

**localStorage Strategy:**

```typescript
// Key format: stun-board-{boardId}
localStorage.setItem('stun-board-demo-board', JSON.stringify({
  nodes: [...],
  edges: [...],
  excalidrawElements: [...],
  tldrawCamera: { x, y, zoom },
  lastSaved: Date.now()
}));
```

**Auto-Save Logic:**
- Debounced 500ms after any state change
- Saves on every node/edge/element update
- Includes camera position for restore
- No backend sync (local-only persistence)

**Session Restore:**
1. Page loads → `useBoard` hook initializes
2. Reads from localStorage
3. Restores nodes, edges, elements
4. Applies saved camera position
5. Continues auto-saving

**Limitations:**
- ⚠️ No cross-device sync
- ⚠️ No version control
- ⚠️ No conflict resolution
- ⚠️ 5-10MB localStorage limit

### 4.5 Canvas State Updates

**Update Flow:**

```
User Action (draw, move, connect)
  ↓
Component Event Handler
  ↓
useBoard Hook State Update
  ↓
┌─────────────────────────────────┐
│ Parallel Updates:               │
│ 1. Local React state            │
│ 2. Zustand store                │
│ 3. localStorage (debounced)     │
│ 4. Camera sync service          │
└─────────────────────────────────┘
  ↓
Re-render affected components
```

**React Flow Updates:**
```typescript
// Managed by React Flow hooks
const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

// Synced to store
useEffect(() => {
  setReactFlowData(boardId, { nodes, edges });
}, [nodes, edges]);
```

**Excalidraw Updates:**
```typescript
const handleExcalidrawElementsChange = (elements) => {
  setExcalidrawElements(elements);
  storeSetExcalidrawElements(boardId, elements);
};
```

---

## 5. API Integration

### 5.1 API Client Configuration

**Library:** Axios 1.8.2

**Base Configuration (`lib/api.ts`):**

```typescript
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080",
  timeout: 30000, // 30 seconds
});

// Auto-attach Firebase ID token
api.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

### 5.2 API Routes

**Backend Endpoints Called:**

| Endpoint | Method | Purpose | Payload |
|----------|--------|---------|---------|
| `/auth/url` | GET | Get Google OAuth URL | - |
| `/auth/signin` | POST | Exchange OAuth code for token | `{ code, redirectUri }` |
| `/auth/me` | GET | Get current user profile | - |
| `/auth/signout` | POST | Invalidate session | - |
| `/boards` | POST | Create new board | `{}` |
| `/boards` | GET | List user's boards | - |
| `/ai/plan` | POST | Generate AI action plan | `{ boardId, command, screenshot, nodes }` |

**Request Patterns:**

```typescript
// AI Planning
async function planActions(payload: {
  boardId: string;
  command: string;
  screenshot: string;
  nodes: unknown[];
}) {
  const { data } = await api.post("/ai/plan", payload);
  return data;
}

// Board Management
async function createBoard() {
  const { data } = await api.post("/boards", {});
  return data;
}
```

### 5.3 Error Handling

**API Error Strategy:**

```typescript
try {
  const { data } = await api.post("/ai/plan", payload);
  return data;
} catch (error: any) {
  if (error.response) {
    // Server responded with error status
    throw new Error(error.response.data?.message || `Server error: ${error.response.status}`);
  } else if (error.request) {
    // No response received
    throw new Error("Network error: No response from server");
  } else {
    // Request setup error
    throw new Error(error.message || "Failed to call AI planner");
  }
}
```

**User-Facing Errors:**
- Toast notifications for API failures
- Error boundaries for component crashes
- Fallback UI for missing data


### 5.4 Retry Logic

**Current State:** ❌ No automatic retry logic

**Recommendation:** Implement exponential backoff for transient failures:

```typescript
// Suggested implementation
import axios from 'axios';
import axiosRetry from 'axios-retry';

axiosRetry(api, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    return axiosRetry.isNetworkOrIdempotentRequestError(error) ||
           error.response?.status === 429; // Rate limit
  }
});
```

### 5.5 Backend Expectations

**Authentication:**
- Expects `Authorization: Bearer <firebase-id-token>` header
- Token validated via Firebase Admin SDK on backend
- Token auto-refreshed by Firebase client SDK

**Request Format:**
- JSON payloads
- Content-Type: application/json
- UTF-8 encoding

**Response Format:**
```typescript
// Success
{ data: { ... }, message?: string }

// Error
{ error: string, message: string, statusCode: number }
```

---

## 6. Realtime & Collaboration Readiness

### 6.1 Current State

**Collaboration Features:** ❌ Not Implemented

**Realtime Sync:** ❌ Not Implemented

**Presence System:** ❌ Not Implemented

### 6.2 Architecture Gaps

**Missing Components:**

1. **WebSocket Connection**
   - No socket.io or WebSocket client
   - No connection management
   - No reconnection logic

2. **Operational Transform (OT) / CRDT**
   - No conflict resolution
   - No concurrent edit handling
   - No version vectors

3. **Presence Tracking**
   - No cursor positions
   - No user avatars on canvas
   - No "who's viewing" indicator

4. **Real-time State Sync**
   - localStorage only (no server sync)
   - No broadcast of changes
   - No optimistic updates

### 6.3 Collaboration Readiness Assessment

**Current Architecture Supports:**
- ✅ Multi-layer canvas (ready for multi-user)
- ✅ Unique board IDs (shareable URLs)
- ✅ Structured state (easy to serialize)
- ✅ Camera sync infrastructure (can extend to multi-user)

**Requires Implementation:**
- ❌ WebSocket/SSE connection layer
- ❌ Conflict resolution algorithm
- ❌ Presence service integration
- ❌ Cursor broadcasting
- ❌ Optimistic UI updates
- ❌ Offline queue for actions

### 6.4 Recommended Approach

**Phase 1: Basic Realtime (2-3 weeks)**
```typescript
// Add WebSocket client
import { io } from 'socket.io-client';

const socket = io(process.env.NEXT_PUBLIC_WS_URL);

socket.on('board:update', (update) => {
  // Apply remote changes
  applyRemoteUpdate(update);
});

socket.emit('board:subscribe', { boardId });
```

**Phase 2: Presence (1 week)**
```typescript
// Track cursor positions
socket.emit('presence:cursor', {
  boardId,
  userId,
  position: { x, y }
});

socket.on('presence:cursors', (cursors) => {
  renderRemoteCursors(cursors);
});
```

**Phase 3: Conflict Resolution (2-3 weeks)**
- Implement CRDT (Yjs or Automerge)
- Or use Operational Transform
- Handle concurrent edits gracefully

---

## 7. AI Integration

### 7.1 AI-Related Components

**AI Sidebar (`components/ai/AISidebarLauncher.tsx`):**
- Floating action button (FAB) in bottom-right
- Expandable panel with AI chat interface
- Voice command integration
- Screenshot capture for context

**Voice Orb (`components/voice/VoiceOrb.tsx`):**
- Web Speech API wrapper
- Real-time transcription
- Visual feedback (pulsing animation)
- Browser compatibility fallback

### 7.2 AI Action System

**Action Executor (`lib/action-executor.ts`):**

```typescript
class ActionExecutor {
  async executePlan(plan: AIActionPlan): Promise<void> {
    if (plan.executionOrder === "parallel") {
      await Promise.all(plan.actions.map(a => this.executeAction(a)));
    } else {
      for (const action of plan.actions) {
        await this.executeAction(action);
      }
    }
  }
}
```

**Supported Actions:**

| Action | Purpose | Parameters |
|--------|---------|------------|
| `move` | Reposition node | `nodeId`, `to: {x, y}` |
| `connect` | Create edge | `source`, `target` |
| `highlight` | Emphasize node | `nodeId`, `color`, `duration` |
| `zoom` | Change viewport | `viewport: {x, y, zoom}` |
| `group` | Group nodes | `nodeIds[]`, `groupId` |
| `cluster` | Arrange nodes | `nodeIds[]` (circular layout) |
| `create` | Add new node | `to`, `data` |
| `delete` | Remove node | `nodeId` |
| `transform` | Modify node | `nodeId`, `data` |


### 7.3 Context Extraction

**Screenshot Capture (`hooks/useScreenshot.ts`):**

```typescript
// Captures canvas as base64 image
const screenshot = await html2canvas(canvasElement);
const base64 = screenshot.toDataURL('image/png');
```

**Context Payload:**

```typescript
interface AIContextPayload {
  boardId: string;
  command: string;        // User's natural language command
  screenshot: string;     // Base64 canvas image
  nodes: Node[];          // Structured node data
}
```

**AI Flow:**

```
User Voice/Text Command
  ↓
Capture Canvas Screenshot
  ↓
Extract Node Metadata
  ↓
POST /ai/plan
  ↓
Backend → Gemini AI
  ↓
Receive Action Plan
  ↓
ActionExecutor.executePlan()
  ↓
Canvas Updates
```

### 7.4 Voice Command Handling

**Web Speech API Integration:**

```typescript
const SpeechRecognition = 
  window.SpeechRecognition || window.webkitSpeechRecognition;

const recognizer = new SpeechRecognition();
recognizer.continuous = true;
recognizer.interimResults = true;
recognizer.lang = "en-US";

recognizer.onresult = (event) => {
  // Extract transcript
  const transcript = event.results[i][0].transcript;
  setTranscript(transcript);
};
```

**Browser Support:**
- ✅ Chrome/Edge (WebKit)
- ✅ Safari (WebKit)
- ❌ Firefox (no native support)
- ❌ Mobile browsers (limited)

**Fallback Strategy:**
- Show "unsupported" message
- Provide text input alternative
- Consider cloud speech API (Google/Azure)

### 7.5 AI Integration Readiness

**Strengths:**
- ✅ Clean action execution system
- ✅ Structured action types
- ✅ Screenshot context capture
- ✅ Node metadata extraction

**Gaps:**
- ⚠️ No action validation before execution
- ⚠️ No undo/redo for AI actions
- ⚠️ No action preview/confirmation
- ⚠️ Limited error recovery
- ⚠️ Voice API browser compatibility

---

## 8. Canvas Data Model

### 8.1 Node Model

**React Flow Node Structure:**

```typescript
interface Node {
  id: string;                    // Unique identifier
  type: string;                  // "text" | "image" | "video" | "diagram"
  position: { x: number; y: number };
  data: NodeData;                // Type-specific data
  style?: CSSProperties;         // Visual styling
  selected?: boolean;
  draggable?: boolean;
}
```

**Node Types:**

```typescript
// Text Node
interface TextNodeData {
  label: string;
  content?: string;
  color?: string;
  fontSize?: number;
}

// Image Node
interface ImageNodeData {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
}

// Diagram Node
interface DiagramNodeData {
  type: "mermaid" | "excalidraw";
  content: string;
  rendered?: string;
}
```

### 8.2 Edge Model

**React Flow Edge Structure:**

```typescript
interface Edge {
  id: string;                    // Unique identifier
  source: string;                // Source node ID
  target: string;                // Target node ID
  type?: string;                 // "default" | "step" | "smoothstep"
  label?: string;
  animated?: boolean;
  style?: CSSProperties;
}
```

### 8.3 Element-to-Node Mapping

**Mapping System (`lib/canvas-mapping.ts`):**

```typescript
interface ElementNodeMapping {
  excalidrawElementId: string;   // Visual element ID
  reactFlowNodeId: string;       // Knowledge node ID
  createdAt: number;
  syncStatus: "synced" | "pending" | "conflict";
}

class CanvasMappingService {
  private mappings: Map<string, ElementNodeMapping>;
  
  addMapping(elementId: string, nodeId: string): void;
  getMappingByElement(elementId: string): ElementNodeMapping | undefined;
  getMappingByNode(nodeId: string): ElementNodeMapping | undefined;
  removeMapping(elementId: string): void;
}
```

**Purpose:**
- Links visual drawings (Excalidraw) to structured data (React Flow)
- Enables AI to manipulate visual elements via node IDs
- Maintains bidirectional lookup

### 8.4 Positioning & Coordinates

**Coordinate System:**
- All layers share same coordinate space
- Origin (0, 0) at canvas center
- Positive X → right, Positive Y → down
- Zoom: 1.0 = 100%, 0.5 = 50%, 2.0 = 200%

**Camera Synchronization:**

```typescript
interface UnifiedCameraState {
  tldrawCamera: TLCamera;        // Primary source of truth
  reactFlowViewport: { x, y, zoom };
  excalidrawTransform: { x, y, zoom };
  lastUpdated: number;
  source: "tldraw" | "reactflow" | "excalidraw";
}
```

**Sync Flow:**
```
User pans TLDraw canvas
  ↓
TLDraw camera changes
  ↓
cameraSyncService.updateFromTLDraw()
  ↓
Converts to React Flow viewport
  ↓
Converts to Excalidraw transform
  ↓
Notifies all listeners
  ↓
All layers update in sync
```


### 8.5 Serialization Format

**Board Persistence:**

```typescript
// localStorage format
{
  nodes: Node[];                 // React Flow nodes
  edges: Edge[];                 // React Flow edges
  excalidrawElements: ExcalidrawElement[];
  tldrawCamera: { x, y, zoom };
  lastSaved: number;
}
```

**Example Board State:**

```json
{
  "nodes": [
    {
      "id": "node-1",
      "type": "text",
      "position": { "x": 100, "y": 100 },
      "data": { "label": "Hello World" }
    }
  ],
  "edges": [
    {
      "id": "edge-1-2",
      "source": "node-1",
      "target": "node-2"
    }
  ],
  "excalidrawElements": [
    {
      "id": "elem-1",
      "type": "rectangle",
      "x": 100,
      "y": 100,
      "width": 200,
      "height": 100
    }
  ],
  "tldrawCamera": { "x": 0, "y": 0, "zoom": 1 },
  "lastSaved": 1709740800000
}
```

---

## 9. Environment Configuration

### 9.1 Environment Variables

**Required Variables:**

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Backend API
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080

# WebSocket (future)
NEXT_PUBLIC_WS_URL=ws://localhost:8080
```

**Variable Usage:**

| Variable | Used In | Purpose |
|----------|---------|---------|
| `NEXT_PUBLIC_FIREBASE_*` | `lib/firebase.ts` | Firebase SDK initialization |
| `NEXT_PUBLIC_API_BASE_URL` | `lib/api.ts`, `lib/auth.ts` | Backend API base URL |

### 9.2 Configuration Issues

**Problems Identified:**

1. ❌ **No Environment Validation**
   - Missing variables fail silently
   - No startup checks
   - Runtime errors instead of build errors

2. ❌ **No .env.example File**
   - Developers don't know what variables are needed
   - No documentation of required values

3. ❌ **Hardcoded Fallbacks**
   ```typescript
   baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080"
   ```
   - Masks missing configuration
   - Production deployments may use wrong URL

**Recommended Solution:**

```typescript
// lib/env.ts
import { z } from 'zod';

const envSchema = z.object({
  NEXT_PUBLIC_FIREBASE_API_KEY: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().min(1),
  NEXT_PUBLIC_API_BASE_URL: z.string().url(),
});

export const env = envSchema.parse(process.env);
```

---

## 10. Security Review

### 10.1 Authentication Architecture

**Token Storage Strategy:**

```
┌─────────────────────────────────────────────────────────┐
│  httpOnly Cookie "authToken"                            │
│  ✅ Immune to XSS (JavaScript cannot read)              │
│  ✅ Sent automatically with requests                    │
│  ✅ Secure flag in production                           │
│  ✅ SameSite=Strict (CSRF protection)                   │
└─────────────────────────────────────────────────────────┘
         ↕
┌─────────────────────────────────────────────────────────┐
│  Module-level memory variable _tokenMemory              │
│  ✅ Used for client-side API calls                      │
│  ✅ Lost on page refresh (rehydrated via cookie)        │
│  ✅ Not accessible to other scripts                     │
└─────────────────────────────────────────────────────────┘
         ↕
┌─────────────────────────────────────────────────────────┐
│  localStorage "authUser" (profile only, NOT token)      │
│  ✅ Non-sensitive: displayName, email, photoURL         │
│  ✅ Avoids extra network call on reload                 │
└─────────────────────────────────────────────────────────┘
```

**Security Strengths:**
- ✅ httpOnly cookies prevent XSS token theft
- ✅ SameSite=Strict prevents CSRF attacks
- ✅ Token never exposed to client JavaScript
- ✅ BFF pattern isolates sensitive operations
- ✅ Firebase ID tokens auto-refresh

### 10.2 Client-Side Validation

**Current State:** ⚠️ Minimal validation

**Input Validation:**
- ❌ No form validation on signin page
- ❌ No sanitization of user input
- ❌ No length limits on text nodes
- ❌ No file type validation for images

**Recommended Additions:**

```typescript
// Add zod validation
import { z } from 'zod';

const textNodeSchema = z.object({
  label: z.string().max(1000),
  content: z.string().max(50000).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
});

// Validate before creating node
const validated = textNodeSchema.parse(userInput);
```


### 10.3 API Security

**Authorization:**
- ✅ Bearer token in Authorization header
- ✅ Token validated by backend (Firebase Admin SDK)
- ✅ Middleware protects all routes except `/signin`

**CORS:**
- ⚠️ Not configured in frontend (handled by backend)
- Backend must whitelist frontend origin

**Rate Limiting:**
- ❌ No client-side rate limiting
- ❌ No request throttling
- Backend must implement rate limits

### 10.4 XSS Prevention

**React's Built-in Protection:**
- ✅ JSX escapes strings by default
- ✅ No `dangerouslySetInnerHTML` usage (except for CSS)

**Potential Vulnerabilities:**

1. **User-Generated Content:**
   ```typescript
   // Text nodes render user input
   <div>{node.data.label}</div>  // ✅ Safe (React escapes)
   ```

2. **Image Sources:**
   ```typescript
   // Image nodes use user-provided URLs
   <img src={node.data.src} />  // ⚠️ Potential for malicious URLs
   ```
   **Mitigation:** Validate image URLs, use Content Security Policy

3. **Excalidraw Elements:**
   - Excalidraw sanitizes SVG content
   - No known XSS vectors

### 10.5 State Desync Risks

**Potential Issues:**

1. **Race Conditions:**
   - Multiple rapid updates to same node
   - Camera sync conflicts
   - Concurrent AI actions

2. **localStorage Corruption:**
   - Malformed JSON
   - Quota exceeded
   - Browser clears storage

3. **Stale Data:**
   - User opens multiple tabs
   - localStorage out of sync
   - No cross-tab communication

**Mitigation Strategies:**

```typescript
// Add version field to detect conflicts
interface BoardState {
  version: number;
  nodes: Node[];
  // ...
}

// Check version before applying updates
if (remoteVersion > localVersion) {
  applyRemoteUpdate();
} else {
  handleConflict();
}
```

### 10.6 Injection Vectors

**SQL Injection:** N/A (no direct database access)

**Command Injection:** N/A (no server-side execution)

**NoSQL Injection:** ⚠️ Potential risk if backend uses Firestore queries with user input

**Recommendation:** Backend must sanitize all query parameters

---

## 11. Performance Analysis

### 11.1 Rendering Performance

**Potential Bottlenecks:**

1. **Large Canvas States:**
   - 1000+ nodes → slow React Flow rendering
   - 500+ Excalidraw elements → laggy drawing
   - Solution: Virtualization, viewport culling

2. **Unnecessary Re-renders:**
   ```typescript
   // ❌ Bad: Creates new object on every render
   const nodeTypes = { text: TextNode, image: ImageNode };
   
   // ✅ Good: Memoized
   const nodeTypes = useMemo(() => ({ text: TextNode, image: ImageNode }), []);
   ```

3. **Camera Sync Overhead:**
   - Every camera change triggers 3 layer updates
   - Debounce camera updates (16ms = 60fps)

**Optimization Opportunities:**

```typescript
// Debounce camera sync
const debouncedCameraUpdate = useMemo(
  () => debounce((camera) => {
    cameraSyncService.updateFromTLDraw(camera);
  }, 16),
  []
);
```

### 11.2 State Management Overhead

**Zustand Performance:**
- ✅ Minimal overhead (no Context re-renders)
- ✅ Selector-based subscriptions
- ✅ No unnecessary updates

**localStorage Performance:**
- ⚠️ Synchronous writes block main thread
- ⚠️ Large states (>1MB) slow serialization

**Optimization:**

```typescript
// Use IndexedDB for large states
import { openDB } from 'idb';

const db = await openDB('stun-boards', 1, {
  upgrade(db) {
    db.createObjectStore('boards');
  }
});

await db.put('boards', boardState, boardId);
```

### 11.3 Network Performance

**API Calls:**
- ✅ 30-second timeout prevents hanging
- ❌ No request caching
- ❌ No request deduplication

**Screenshot Upload:**
- ⚠️ Base64 encoding increases size by 33%
- ⚠️ Large canvases → multi-MB payloads

**Optimization:**

```typescript
// Compress screenshot before upload
import pako from 'pako';

const compressed = pako.deflate(base64);
const payload = { screenshot: compressed };
```

### 11.4 Memory Leaks

**Potential Leaks:**

1. **Event Listeners:**
   ```typescript
   // ✅ Good: Cleanup in useEffect
   useEffect(() => {
     const unsub = cameraSyncService.subscribe(handler);
     return unsub; // Cleanup
   }, []);
   ```

2. **Timers:**
   ```typescript
   // ✅ Good: Clear timeout
   useEffect(() => {
     const id = setTimeout(() => {}, 500);
     return () => clearTimeout(id);
   }, []);
   ```

3. **Canvas References:**
   - Excalidraw/TLDraw hold large canvas buffers
   - Must be properly unmounted

### 11.5 Bundle Size

**Current Dependencies:**

```json
{
  "@excalidraw/excalidraw": "^0.18.0",  // ~2MB
  "tldraw": "2.4.6",                     // ~1.5MB
  "reactflow": "^11.11.4",               // ~500KB
  "firebase": "^12.10.0",                // ~1MB
  "axios": "^1.8.2",                     // ~50KB
  "zustand": "^5.0.3",                   // ~10KB
  "next": "14.2.23"                      // ~500KB
}
```

**Total Bundle:** ~6-7MB (uncompressed)

**Optimization Strategies:**
- ✅ Next.js code splitting (automatic)
- ✅ Dynamic imports for canvas libraries
- ⚠️ Consider lazy loading Excalidraw
- ⚠️ Tree-shake unused Firebase modules


---

## 12. Deployment Readiness

### 12.1 Vercel Deployment

**Compatibility:** ✅ Fully Compatible

**Vercel-Specific Features:**
- ✅ Next.js 14 App Router (native support)
- ✅ API routes (serverless functions)
- ✅ Middleware (edge runtime)
- ✅ Environment variables (dashboard config)
- ✅ Automatic HTTPS
- ✅ CDN for static assets

**Deployment Configuration:**

```json
// vercel.json (recommended)
{
  "buildCommand": "bun run build",
  "devCommand": "bun run dev",
  "installCommand": "bun install",
  "framework": "nextjs",
  "regions": ["iad1"],
  "env": {
    "NEXT_PUBLIC_API_BASE_URL": "@api-base-url",
    "NEXT_PUBLIC_FIREBASE_API_KEY": "@firebase-api-key"
  }
}
```

**Potential Issues:**

1. **Bun Runtime:**
   - Vercel uses Node.js by default
   - May need to configure Node.js runtime
   - Or use Vercel's experimental Bun support

2. **Memory Limits:**
   - Serverless functions: 1GB default
   - May need Pro plan for larger limits

3. **Cold Starts:**
   - API routes may have 1-2s cold start
   - Consider warming functions

### 12.2 Static Hosting (Netlify, Cloudflare Pages)

**Compatibility:** ✅ Compatible with SSG

**Static Export:**

```javascript
// next.config.mjs
export default {
  output: 'export', // Enable static export
  images: {
    unoptimized: true, // Required for static export
  },
};
```

**Limitations:**
- ❌ No API routes (need separate backend)
- ❌ No middleware (client-side auth only)
- ❌ No server-side rendering
- ✅ Canvas works (client-side only)

**Recommendation:** Use Vercel or deploy API routes separately

### 12.3 Tauri Desktop Integration

**Compatibility:** ⚠️ Requires Modifications

**Tauri Architecture:**

```
┌─────────────────────────────────────────┐
│  Tauri Window (WebView)                 │
│  ├── Next.js Frontend (localhost:3000)  │
│  └── Canvas Layers                      │
└─────────────────────────────────────────┘
         ↕
┌─────────────────────────────────────────┐
│  Rust Backend (Tauri Core)              │
│  ├── File System Access                 │
│  ├── Native APIs                        │
│  └── IPC Bridge                         │
└─────────────────────────────────────────┘
```

**Required Changes:**

1. **API Client:**
   ```typescript
   // Detect Tauri environment
   const isTauri = typeof window !== 'undefined' && 
                   '__TAURI__' in window;
   
   const baseURL = isTauri 
     ? 'tauri://localhost' 
     : process.env.NEXT_PUBLIC_API_BASE_URL;
   ```

2. **File System:**
   ```typescript
   // Use Tauri's file system API
   import { save } from '@tauri-apps/api/dialog';
   import { writeTextFile } from '@tauri-apps/api/fs';
   
   const path = await save();
   await writeTextFile(path, JSON.stringify(boardState));
   ```

3. **Authentication:**
   - OAuth redirect to desktop app
   - Or use device code flow
   - Store tokens in secure storage

**Benefits:**
- ✅ Offline-first
- ✅ Native file system access
- ✅ Better performance
- ✅ No CORS issues

### 12.4 Environment-Specific Issues

**Development:**
- ✅ Works on localhost
- ✅ Hot reload functional
- ⚠️ 8GB memory allocation needed

**Staging:**
- ⚠️ Need separate Firebase project
- ⚠️ Need staging backend URL
- ⚠️ CORS configuration required

**Production:**
- ⚠️ Must use HTTPS (Firebase requirement)
- ⚠️ Need production Firebase credentials
- ⚠️ CDN caching strategy needed
- ⚠️ Error tracking (Sentry) recommended

---

## 13. Backend Compatibility

### 13.1 Expected Backend Capabilities

**Authentication:**
- ✅ Google OAuth 2.0 flow
- ✅ Custom token generation (Firebase)
- ✅ Token validation (Firebase Admin SDK)
- ✅ User profile endpoint (`/auth/me`)

**Board Management:**
- ✅ Create board (`POST /boards`)
- ✅ List boards (`GET /boards`)
- ⚠️ Missing: Update board (`PUT /boards/:id`)
- ⚠️ Missing: Delete board (`DELETE /boards/:id`)
- ⚠️ Missing: Get board by ID (`GET /boards/:id`)

**AI Orchestration:**
- ✅ Plan actions (`POST /ai/plan`)
- ⚠️ Missing: Action history
- ⚠️ Missing: Undo/redo support

### 13.2 Data Storage Expectations

**Firestore Schema (Expected):**

```typescript
// boards collection
{
  id: string;
  ownerId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  title: string;
  nodes: Node[];
  edges: Edge[];
  excalidrawElements: ExcalidrawElement[];
  camera: { x, y, zoom };
  collaborators: string[];
  isPublic: boolean;
}

// users collection
{
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  createdAt: Timestamp;
  lastLoginAt: Timestamp;
}
```

### 13.3 Collaboration Backend Requirements

**For Multi-User Support:**

1. **WebSocket Server:**
   - Socket.io or native WebSocket
   - Room-based connections (one room per board)
   - Broadcast updates to all clients

2. **Presence Service:**
   - Track active users per board
   - Cursor positions
   - Selection state

3. **Conflict Resolution:**
   - Operational Transform or CRDT
   - Version vectors
   - Merge strategies

4. **Permissions:**
   - Owner, editor, viewer roles
   - Share links with access control
   - Public/private boards

### 13.4 AI Backend Requirements

**Gemini Integration:**
- ✅ Screenshot analysis
- ✅ Natural language understanding
- ✅ Action plan generation
- ⚠️ Missing: Streaming responses
- ⚠️ Missing: Context memory

**Expected Response Format:**

```typescript
interface AIResponse {
  actions: AIAction[];
  reasoning?: string;
  executionOrder: "sequential" | "parallel";
  confidence?: number;
}
```

### 13.5 Integration Gaps

**Missing Endpoints:**

| Endpoint | Method | Purpose | Priority |
|----------|--------|---------|----------|
| `/boards/:id` | GET | Fetch board by ID | High |
| `/boards/:id` | PUT | Update board | High |
| `/boards/:id` | DELETE | Delete board | Medium |
| `/boards/:id/share` | POST | Generate share link | High |
| `/boards/:id/collaborators` | GET | List collaborators | Medium |
| `/ai/history` | GET | Get action history | Low |
| `/ai/undo` | POST | Undo last action | Medium |

**Recommendation:** Implement high-priority endpoints before production launch


---

## 14. Final Summary

### 14.1 Architecture Overview

The Stun frontend is a **sophisticated hybrid canvas system** built on Next.js 14 with a unique three-layer architecture:

**Layer 1: TLDraw (Canvas OS)**
- Provides infinite pan/zoom infrastructure
- Acts as coordinate system backbone
- Hidden UI, infrastructure only

**Layer 2: Excalidraw (Visual Layer)**
- User-facing drawing tools
- Shape manipulation
- Primary interaction layer

**Layer 3: React Flow (Knowledge Graph)**
- Structured nodes and edges
- AI-driven transformations
- Metadata management

**Key Architectural Decisions:**
- ✅ Zustand for state management (minimal overhead)
- ✅ BFF pattern for secure authentication
- ✅ localStorage for client-side persistence
- ✅ Camera sync service for multi-layer coordination
- ✅ Action executor for AI integration

### 14.2 Stability Assessment

**Production-Ready Components:**
- ✅ Authentication system (Firebase + httpOnly cookies)
- ✅ Canvas rendering (TLDraw + Excalidraw + React Flow)
- ✅ State management (Zustand + localStorage)
- ✅ API integration (Axios with interceptors)
- ✅ Error boundaries (component-level)
- ✅ Toast notifications (user feedback)

**Requires Attention:**
- ⚠️ Camera synchronization under load (needs stress testing)
- ⚠️ Voice API browser compatibility (Firefox unsupported)
- ⚠️ Environment variable validation (silent failures)
- ⚠️ API retry logic (no automatic retries)
- ⚠️ Input validation (minimal sanitization)

**Critical Issues:**
- ❌ No realtime collaboration (WebSocket needed)
- ❌ No conflict resolution (CRDT/OT needed)
- ❌ No cross-device sync (localStorage only)
- ❌ No undo/redo for AI actions
- ❌ No action preview/confirmation

**Overall Stability:** 7/10
- Core functionality is solid
- Missing features for production collaboration
- Needs hardening for edge cases

### 14.3 Deployment Readiness

**Vercel Deployment:** ✅ Ready
- Next.js 14 fully supported
- API routes work as serverless functions
- Middleware runs on edge runtime
- Environment variables via dashboard
- **Action Required:** Configure environment variables

**Static Hosting:** ⚠️ Limited
- Can export as static site
- Loses API routes and middleware
- Requires separate backend deployment
- **Recommendation:** Use Vercel or similar platform

**Tauri Desktop:** ⚠️ Requires Modifications
- Need Tauri-specific API client
- File system integration needed
- OAuth flow adaptation required
- **Estimated Effort:** 2-3 weeks

**Docker/Self-Hosted:** ✅ Compatible
- Standard Node.js deployment
- Dockerfile needed (not present)
- Nginx reverse proxy recommended
- **Action Required:** Create Dockerfile

### 14.4 Collaboration Readiness

**Current State:** ❌ Not Ready

**Missing Components:**
1. WebSocket/SSE connection layer
2. Operational Transform or CRDT
3. Presence tracking system
4. Cursor broadcasting
5. Optimistic UI updates
6. Offline action queue

**Estimated Implementation Time:**
- Basic realtime sync: 2-3 weeks
- Presence system: 1 week
- Conflict resolution: 2-3 weeks
- **Total:** 5-7 weeks for full collaboration

**Architecture Supports:**
- ✅ Multi-layer canvas (ready for multi-user)
- ✅ Unique board IDs (shareable URLs)
- ✅ Structured state (easy to serialize)
- ✅ Camera sync infrastructure (extensible)

### 14.5 AI Integration Readiness

**Current State:** ✅ Mostly Ready

**Strengths:**
- ✅ Clean action execution system
- ✅ 9 action types supported
- ✅ Screenshot context capture
- ✅ Node metadata extraction
- ✅ Parallel/sequential execution

**Gaps:**
- ⚠️ No action validation
- ⚠️ No undo/redo
- ⚠️ No preview/confirmation
- ⚠️ Limited error recovery
- ⚠️ Voice API compatibility issues

**Recommended Enhancements:**

```typescript
// 1. Action validation
interface ActionValidator {
  validate(action: AIAction): ValidationResult;
  canExecute(action: AIAction, state: BoardState): boolean;
}

// 2. Undo/redo stack
interface ActionHistory {
  undo(): void;
  redo(): void;
  getHistory(): AIAction[];
}

// 3. Action preview
interface ActionPreview {
  preview(action: AIAction): PreviewState;
  confirm(): void;
  cancel(): void;
}
```

### 14.6 Potential Risks

**High Priority:**
1. **Camera Sync Race Conditions**
   - Multiple rapid updates may conflict
   - **Mitigation:** Debounce updates, add version tracking

2. **localStorage Quota Exceeded**
   - Large boards may exceed 5-10MB limit
   - **Mitigation:** Migrate to IndexedDB, implement compression

3. **API Token Expiration**
   - Firebase tokens expire after 1 hour
   - **Mitigation:** Auto-refresh working, test edge cases

4. **Browser Compatibility**
   - Voice API unsupported in Firefox
   - **Mitigation:** Provide text input fallback

**Medium Priority:**
5. **Memory Leaks**
   - Canvas layers hold large buffers
   - **Mitigation:** Proper cleanup in useEffect

6. **Bundle Size**
   - 6-7MB uncompressed
   - **Mitigation:** Lazy load canvas libraries

7. **No Error Tracking**
   - Production errors go unnoticed
   - **Mitigation:** Integrate Sentry or similar

**Low Priority:**
8. **No Analytics**
   - No usage tracking
   - **Mitigation:** Add Google Analytics or Mixpanel

9. **No A/B Testing**
   - Can't test feature variations
   - **Mitigation:** Add feature flags

### 14.7 Recommended Next Iteration Goals

**Phase 1: Production Hardening (2 weeks)**
1. Add environment variable validation (zod)
2. Implement API retry logic (axios-retry)
3. Add input validation (zod schemas)
4. Create .env.example file
5. Add error tracking (Sentry)
6. Write Dockerfile for self-hosting
7. Add loading states for all async operations
8. Implement proper error boundaries on all routes

**Phase 2: Collaboration Foundation (5-7 weeks)**
1. Implement WebSocket connection layer
2. Add presence tracking system
3. Implement CRDT or Operational Transform
4. Add cursor broadcasting
5. Implement optimistic UI updates
6. Add offline action queue
7. Test with 10+ concurrent users

**Phase 3: AI Enhancements (2-3 weeks)**
1. Add action validation
2. Implement undo/redo stack
3. Add action preview/confirmation
4. Improve error recovery
5. Add streaming AI responses
6. Implement context memory

**Phase 4: Performance Optimization (1-2 weeks)**
1. Implement viewport culling for large canvases
2. Migrate to IndexedDB for large states
3. Add request caching
4. Compress screenshot uploads
5. Lazy load canvas libraries
6. Optimize camera sync (debounce)

**Phase 5: Feature Completeness (3-4 weeks)**
1. Implement board CRUD operations
2. Add share links with permissions
3. Add public/private board toggle
4. Implement board search
5. Add board templates
6. Add export functionality (PDF, PNG, JSON)

---

## 15. Conclusion

The Stun frontend demonstrates **excellent architectural design** with a unique multi-layer canvas system that successfully integrates three distinct canvas libraries into a cohesive user experience. The authentication system is production-grade, the state management is efficient, and the AI integration is well-structured.

**Key Strengths:**
- Innovative hybrid canvas architecture
- Secure authentication with BFF pattern
- Clean separation of concerns
- Type-safe TypeScript implementation
- Extensible action execution system

**Critical Path to Production:**
1. Add environment validation
2. Implement realtime collaboration
3. Add error tracking
4. Stress test camera synchronization
5. Implement missing backend endpoints

**Estimated Timeline to Production:**
- **Minimum Viable:** 2 weeks (hardening only)
- **With Collaboration:** 7-9 weeks (hardening + realtime)
- **Full Feature Set:** 12-15 weeks (all phases)

The codebase is well-organized, maintainable, and ready for the next phase of development. With the recommended improvements, Stun will be a robust, production-ready spatial thinking environment.

---

**End of Audit**

