# Stun — Full Codebase Analysis
**Date:** March 12, 2026  
**Based on:** IDEA.md + PRD.md + full codebase scan

---

## TL;DR

The codebase is **~70% complete** against the PRD. The core infrastructure, AI pipeline, and hybrid canvas are solid. The gaps are primarily around: Gemini Live API (never added), real-time collaboration (only polling), frontend node interactivity (nodes aren't editable), and several media/content node types (PDF, CSV, YouTube embeds).

---

## 1. What's Fully Implemented ✅

### Infrastructure & Platform
| Feature | Status | Location |
|---|---|---|
| Next.js 14 App Router (TypeScript) | ✅ Working | `web/` |
| Express backend (TypeScript) | ✅ Working | `backend/src/` |
| Firebase Authentication (JWT) | ✅ Working | `backend/src/api/middleware/auth.middleware.ts` |
| Firestore board persistence | ✅ Working | `backend/src/services/board.service.ts` |
| Google GenAI SDK (Gemini) | ✅ Working | `backend/src/config/genai.ts` |
| Environment validation (Zod) | ✅ Working | `backend/src/config/envVars.ts` |
| Helmet + CORS + Rate limiting | ✅ Working | `backend/src/app.ts`, `ratelimit.middleware.ts` |
| Docker + Cloud Run deployment | ✅ Files exist | `backend/Dockerfile`, `web/Dockerfile`, `infra/` |
| GCP Terraform infra | ✅ Written | `infra/modules/` |
| Error handling middleware | ✅ Working | `backend/src/api/middleware/error.middleware.ts` |

### Canvas System (Hybrid 3-Layer Architecture)
| Feature | Status | Location |
|---|---|---|
| TLDraw as infinite workspace backbone | ✅ Working | `web/components/canvas/TLDrawWorkspace.tsx` |
| Excalidraw as visual UI layer | ✅ Working | `web/components/canvas/ExcalidrawLayer.tsx` |
| React Flow as knowledge graph engine | ✅ Working | `web/components/canvas/ReactFlowGraphLayer.tsx` |
| Camera sync across all 3 layers | ✅ Working | `web/lib/camera-sync.ts` |
| Canvas ↔ Excalidraw element mapping | ✅ Working | `web/lib/canvas-mapping.ts` |
| CanvasRoot orchestrating all layers | ✅ Working | `web/components/canvas/CanvasRoot.tsx` |
| Screenshot capture (html2canvas) | ✅ Working | `web/hooks/useScreenshot.ts` |
| Image compression pipeline | ✅ Working | `web/lib/image-compression.ts` |

### AI Planning Pipeline
| Feature | Status | Location |
|---|---|---|
| POST `/ai/plan` endpoint | ✅ Working | `backend/src/api/routes/ai.routes.ts` |
| Gemini multimodal reasoning (screenshot + nodes) | ✅ Working | `backend/src/services/gemini.service.ts` |
| Structured JSON action plan output | ✅ Working | `backend/src/validators/action.validator.ts` |
| Zod validation of action plan | ✅ Working | `backend/src/validators/action.validator.ts` |
| Spatial context builder | ✅ Working | `backend/src/services/context-builder.ts` |
| Intent parser (rule-based classifier) | ✅ Working | `backend/src/services/intent-parser.ts` |
| Orchestrator service | ✅ Working | `backend/src/services/orchestrator.service.ts` |
| Planner prompt (comprehensive, 9 action types) | ✅ Working | `backend/src/prompts/planner.prompt.ts` |
| Position bounds clamping (zone-safe placement) | ✅ Working | `backend/src/utils/spatial.ts` |

### Action Execution (Frontend)
| Action Type | Status | Notes |
|---|---|---|
| `move` | ✅ Working | Repositions React Flow node |
| `connect` | ✅ Working | Creates edge between nodes |
| `highlight` | ✅ Working | Visual border + shadow, auto-removes |
| `zoom` | ✅ Working | (viewport needed) |
| `group` | ✅ Working | Adds groupId + dashed border |
| `cluster` | ✅ Working | Circular arrangement of nodes |
| `create` | ✅ Working | Creates Excalidraw text element → RF node |
| `delete` | ✅ Working | Removes node from graph |
| `transform` | ✅ Working | Changes node type |
| `layout` | ✅ Working | Calls `/layout/transform` API |

### Board CRUD & Access Control
| Feature | Status | Location |
|---|---|---|
| Create board | ✅ Working | `POST /boards` |
| List boards (owned + collaborated) | ✅ Working | `GET /boards` |
| Get board | ✅ Working | `GET /boards/:id` |
| Update board (autosave) | ✅ Working | `PUT /boards/:id` |
| Delete board | ✅ Working | `DELETE /boards/:id` |
| Board visibility (edit/view/private) | ✅ Working | `PATCH /boards/:id/visibility` |
| Collaborator add/remove | ✅ Working | `POST/DELETE /boards/:id/share` |
| Owner/edit/view/none access levels | ✅ Working | `backend/src/services/boardAccess.service.ts` |
| Autosave (3s debounce) | ✅ Working | `web/store/board.store.ts` |

### UI Components
| Component | Status | Location |
|---|---|---|
| Landing page (EnterPage) | ✅ Working | `web/components/EnterPage.tsx` |
| Boards list page | ✅ Working | `web/app/boards/page.tsx` |
| Board page (`/board/[id]`) | ✅ Working | `web/app/board/[id]/page.tsx` |
| Sign-in page (Google OAuth) | ✅ Working | `web/app/signin/` |
| FloatingCommandBar (AI + voice + add node) | ✅ Working | `web/components/ui/FloatingCommandBar.tsx` |
| SidePanel with AI quick-actions | ✅ Working | `web/components/ui/SidePanel.tsx` |
| ShareDialog (visibility + collaborators) | ✅ Working | `web/components/ui/ShareDialog.tsx` |
| MediaUploader (drag & drop + URL) | ✅ Working | `web/components/ui/MediaUploader.tsx` |
| SearchBar | ✅ Working | `web/components/ui/SearchBar.tsx` |
| PresenceIndicators | ✅ Working | `web/components/ui/PresenceIndicators.tsx` |
| DeleteDialog | ✅ Working | `web/components/ui/DeleteDialog.tsx` |
| LinkPreview | ✅ Working | `web/components/ui/LinkPreview.tsx` |
| Toast notifications | ✅ Working | `web/components/Toast.tsx` |
| ErrorBoundary | ✅ Working | `web/components/ErrorBoundary.tsx` |
| ProfileIcon | ✅ Working | `web/components/ProfileIcon.tsx` |

### Media System
| Feature | Status | Location |
|---|---|---|
| File upload (GCS + local fallback) | ✅ Working | `backend/src/services/media.service.ts` |
| Image thumbnail generation (sharp) | ✅ Working | `media.service.ts` |
| Image/video/document node rendering | ✅ Working | `web/components/nodes/MediaNode.tsx` |
| YouTube/Vimeo card (thumbnail + link) | ✅ Working | `MediaNode.tsx` |
| URL parsing + link preview (cheerio) | ✅ Working | `media.service.ts` |
| Drag & drop file upload | ✅ Working | `web/hooks/useDragAndDrop.ts` |
| `POST /media/upload` | ✅ Working | `backend/src/api/routes/media.routes.ts` |
| `POST /media/parse-url` | ✅ Working | media routes |
| `GET /media/preview` | ✅ Working | media routes |

### Search
| Feature | Status | Location |
|---|---|---|
| Semantic search via `text-embedding-004` | ✅ Working | `backend/src/services/search.service.ts` |
| Cosine similarity ranking | ✅ Working | `search.service.ts` |
| `POST /search` endpoint | ✅ Working | `backend/src/api/routes/search.routes.ts` |
| `useSearch` hook with 350ms debounce | ✅ Working | `web/hooks/useSearch.ts` |
| Navigate-to-node on result select | ✅ Working | `CanvasRoot.tsx` + `useSearch.ts` |
| Node highlight on search | ✅ Working | `CanvasRoot.tsx` |

### Presence System
| Feature | Status | Location |
|---|---|---|
| Heartbeat presence (15s interval) | ✅ Working | `web/hooks/usePresence.ts` |
| Active users polling (10s interval) | ✅ Working | `usePresence.ts` |
| `POST/GET /presence/:boardId` | ✅ Working | `backend/src/api/routes/presence.routes.ts` |
| Stale presence cleanup | ✅ Working | `backend/src/services/presence.service.ts` |
| Presence indicator UI | ✅ Working | `PresenceIndicators.tsx` |

### Layout Transformations
| Layout Type | Status | Location |
|---|---|---|
| Mind map (radial) | ✅ Working | `backend/src/services/layout.service.ts` |
| Roadmap (sequential phases) | ✅ Working | `layout.service.ts` |
| Timeline (chronological) | ✅ Working | `layout.service.ts` |
| Flowchart (hierarchical) | ✅ Working | `layout.service.ts` |
| Presentation (slide-by-slide) | ✅ Working | `layout.service.ts` |
| `POST /layout/transform` | ✅ Working | `backend/src/api/routes/layout.routes.ts` |

### Voice Input
| Feature | Status | Location |
|---|---|---|
| Web Speech API STT | ✅ Working | `web/hooks/useVoice.ts` |
| Mic button → transcript → command input | ✅ Working | `FloatingCommandBar.tsx` |
| Continuous + interim results | ✅ Working | `useVoice.ts` |

---

## 2. Partially Implemented / Has Bugs ⚠️

### 2.1 Gemini API vs Vertex AI — Critical Hackathon Issue
**Status:** ⚠️ Using Gemini API directly, NOT Vertex AI SDK

- `backend/src/config/genai.ts` uses `GoogleGenAI({ apiKey: envVars.GEMINI_API_KEY })`
- This is the **Gemini API** (ai.google.dev), not **Vertex AI** (cloud.google.com/vertex-ai)
- PRD compliance checklist says: `✔ Uses Vertex AI` — but the code doesn't
- The `VERTEX_MODEL` env var name is misleading — it just sets the model name, not actual Vertex AI
- **Impact:** Hackathon "Uses Vertex AI" requirement may not be satisfied
- **Fix needed:** Use `VertexAI` from `@google-cloud/vertexai` OR `googleai` provider on Vertex AI endpoint

### 2.2 React Flow Nodes Not Interactive
**Status:** ⚠️ Nodes are read-only

- `ReactFlowGraphLayer.tsx` sets `nodesDraggable={false}`, `nodesConnectable={false}`, `elementsSelectable={false}`
- The layer's `pointerEvents: "none"` means ALL user interactions pass through to Excalidraw
- TextNode has no inline editing — just displays `data.label` statically
- Users cannot drag React Flow nodes manually — only AI can move them
- **Impact:** Users can't manually rearrange AI-created nodes on the graph layer

### 2.3 Voice Input Is One-Way (No AI Voice Response)
**Status:** ⚠️ STT only, no TTS

- `useVoice.ts` captures voice → sets transcript in input field
- User still must press Enter or "Send" to trigger AI
- No AI voice response back (no text-to-speech)
- **IDEA/PRD says:** "Speaks optionally (voice)" — NOT implemented
- **Impact:** Voice is a convenience input mechanism, not true voice-first interaction

### 2.4 YouTube/Video Nodes — No Actual Embedding
**Status:** ⚠️ Shows thumbnail + button, opens in new tab

- `MediaNode.tsx` renders a YouTube/Vimeo card with thumbnail
- Clicking opens the video in a **new browser tab**
- No in-canvas YouTube `<iframe>` embed
- No video keyframe extraction
- No transcript summarization from video content
- **Impact:** Video content can't be analyzed or played within the canvas

### 2.5 Screenshot in usePlanAndExecute — Partial
**Status:** ⚠️ Screenshots of hybrid canvas are unreliable

- `usePlanAndExecute.ts` uses `html2canvas` on `#canvas-root`
- TLDraw and Excalidraw render on Canvas elements — `html2canvas` often captures blank/empty areas
- The screenshot passed to Gemini may not accurately represent what the user sees
- **Impact:** AI's multimodal reasoning may be based on an empty/incorrect screenshot

### 2.6 Layout Action in Backend Validator — Missing Schema
**Status:** ⚠️ `layout` action type not in Zod schema

- `action.validator.ts` defines union for: move, connect, highlight, zoom, group, create, delete, transform
- `layout` action type is in the **prompt** and **frontend executor** but NOT in the backend Zod schema
- If AI returns a `layout` action, backend validation will reject it with a Zod error
- **Fix needed:** Add `layoutActionSchema` to `actionSchema` union in validator

### 2.7 Cluster Action Not in Backend Validator
**Status:** ⚠️ Same issue as layout — `cluster` is in executor but not in Zod schema

- Backend will reject `cluster` action type
- Only the frontend executor has it

### 2.8 TextNode Label — Not Editable in UI
**Status:** ⚠️ Static render only

- TextNode renders `data.label` with no edit affordance
- No double-click to edit, no contenteditable
- Nodes created by AI via `create` action show static text
- **Impact:** Users can't correct or update AI-created node content

### 2.9 CanvasRoot Not Wired to MediaUploader Properly
**Status:** ⚠️ Upload works but nodes aren't added to canvas

- `MediaUploader` calls `onMediaUploaded` callback
- In `CanvasRoot.tsx` the `showMediaUploader` state is managed but the `onMediaUploaded` callback implementation needs verification for actually creating Media nodes on the canvas

---

## 3. Missing — Not Implemented ❌

### 3.1 Gemini Live API (Real-Time Voice + AI)
**Status:** ❌ Not implemented

- The **IDEA.md** explicitly mentions: *"Gemini Live API (voice + real-time)"*
- Currently: Web Speech API → typed command → HTTP request → AI response
- **Should be:** Continuous voice stream → Gemini Live bidirectional streaming → real-time AI narration + canvas actions
- **Impact:** The product's core "voice-first spatial AI" interaction is a basic STT input, not live AI voice

### 3.2 Real-Time Collaboration (WebSockets / Firestore Listeners)
**Status:** ❌ Not implemented — only polling

- Presence is polling every 10-15s
- No WebSocket connection for live canvas state sync
- If User A moves a node, User B sees it only after ~10+ seconds (if at all)
- **Impact:** "Real-time collaboration" claim is misleading — it's async polling only

### 3.3 AI Auto-Organization (Background Continuous Scanning)
**Status:** ❌ Not implemented

- **IDEA.md says:** *"AI continuously scans all nodes and clusters related nodes, draws connections..."*
- Currently: AI only acts when user explicitly sends a command
- No background AI worker, no automatic clustering trigger
- **Impact:** Canvas doesn't self-organize, which was a core IDEA feature

### 3.4 OCR for Screenshots / Image Content Analysis
**Status:** ❌ Not implemented

- **IDEA.md says:** *"OCR for screenshots", "Image scanning & annotation"*
- Currently: Images are uploaded and stored, but no AI analysis of image content
- No endpoint to analyze/annotate an existing image node
- **Impact:** Images on canvas are opaque to the AI (can't read text in images)

### 3.5 PDF Node / PDF Viewer
**Status:** ❌ Not implemented

- IDEA says: Drop PDFs → becomes a Node with visual preview
- Backend media service handles PDF upload but no PDF rendering
- No PDF viewer component
- No PDF text extraction for AI context

### 3.6 CSV / Sheets Node
**Status:** ❌ Not implemented

- IDEA says: Drop CSV/Sheets → becomes a node
- Media uploader accepts CSV files but no table/spreadsheet node renderer
- No CSV parsing or visualization component

### 3.7 TopBar Navigation (Figma-Style)
**Status:** ❌ Not implemented

- **IDEA.md Section 5.7:** *"Asset Navigation Bar (Figma-like): Media asset library, Search, Voice input, AI tools, Canvas tools (draw, connect, resize)"*
- PRD structure shows `components/layout/TopBar.tsx` — **does not exist**
- Currently only FloatingCommandBar (bottom) + SidePanel (right)
- No persistent top navigation bar

### 3.8 Node Right-Click Context Menu
**Status:** ❌ Not implemented

- No right-click context menu on React Flow nodes
- Users can't delete, edit, duplicate, or AI-analyze specific nodes via context menu
- All node operations must go through the command bar or AI

### 3.9 Video Keyframe Extraction / Transcript Summarization
**Status:** ❌ Not implemented

- **IDEA.md says:** *"Video keyframe extraction", "Transcript summarization"*
- MediaNode just shows YouTube thumbnail — no actual video processing
- No backend pipeline for video content analysis

### 3.10 Semantic Embedding Storage / Persistent Search Index
**Status:** ❌ Not fully implemented

- Search service generates embeddings on-the-fly for **every search query**
- No persistent vector store or cached embeddings
- Every search re-embeds all nodes from scratch
- **Impact:** Search is slow for large boards; embedding costs accumulate

### 3.11 Node History / Undo System
**Status:** ❌ Not implemented

- No undo/redo for AI actions
- If AI deletes wrong nodes, no recovery
- Autosave overwrites previous state
- **Impact:** High risk of destructive AI actions with no recovery

### 3.12 AI Memory / Canvas Memory
**Status:** ❌ Not implemented

- **IDEA.md Section 5.7 SidePanel:** *"History, Memory"* listed as UI sections
- No persistent AI memory between sessions
- AI has no context of what it did before in the current session
- **Impact:** AI can't reference previous actions or maintain context across commands

### 3.13 Diagram Generation Node Type
**Status:** ❌ Partially missing

- Planner prompt describes diagram creation with start/process/decision/end nodes
- But `transform` action's "diagram" nodeType has no corresponding DiagramNode component
- No Mermaid diagram rendering in React Flow nodes
- **Impact:** `transform` to "diagram" produces no visual change

### 3.14 Node Annotations (Bounding Box Overlays)
**Status:** ❌ Not implemented

- **IDEA.md says:** *"Draws bounding boxes on images", "Adds annotation nodes"*
- No annotation overlay system on image nodes
- No bounding box drawing from AI actions

### 3.15 Continuous Live Observation Mode
**Status:** ❌ Not implemented

- **PRD Future Roadmap:** *"Continuous live observation mode"*
- AI can't passively watch the canvas and proactively suggest actions

### 3.16 Mobile Responsiveness
**Status:** ❌ Out of scope per PRD, but worth noting

---

## 4. Working Status by System

```
System                          Status    Confidence
─────────────────────────────────────────────────────
Authentication (Firebase)        ✅ WORKS    HIGH
Board CRUD (Firestore)           ✅ WORKS    HIGH
AI planning pipeline (Gemini)   ✅ WORKS    HIGH
Canvas rendering (3-layer)       ✅ WORKS    HIGH
AI action execution              ✅ WORKS    MEDIUM
Media upload (local mode)        ✅ WORKS    HIGH
Media upload (GCS mode)          ✅ WORKS    MEDIUM
Semantic search                  ✅ WORKS    HIGH
Layout transformations           ✅ WORKS    HIGH
Voice STT input                  ✅ WORKS    HIGH
Presence/heartbeat               ✅ WORKS    HIGH
Collaboration (share)            ✅ WORKS    HIGH
─────────────────────────────────────────────────────
Vertex AI compliance             ⚠️  ISSUE   HIGH RISK
Backend action validation        ⚠️  ISSUE   MEDIUM RISK
Screenshot for AI                ⚠️  PARTIAL MEDIUM RISK
Node interactivity               ⚠️  PARTIAL MEDIUM RISK
YouTube embedded player          ⚠️  PARTIAL LOW RISK
─────────────────────────────────────────────────────
Gemini Live API (voice stream)   ❌ MISSING  HIGH PRIORITY
Real-time collab (WebSocket)     ❌ MISSING  MEDIUM
PDF viewer node                  ❌ MISSING  MEDIUM
CSV/table node                   ❌ MISSING  LOW
AI auto-organization             ❌ MISSING  MEDIUM
OCR / image analysis             ❌ MISSING  MEDIUM
Node undo/redo                   ❌ MISSING  MEDIUM
TopBar navigation                ❌ MISSING  LOW
AI memory                        ❌ MISSING  LOW
Video transcript                 ❌ MISSING  LOW
```

---

## 5. Critical Bugs to Fix Now

### Bug 1: Missing `layout` and `cluster` in backend action validator
**File:** `backend/src/validators/action.validator.ts`  
**Problem:** AI can return `layout` or `cluster` action types (they're in the prompt), but backend Zod schema rejects them → 400 error  
**Fix:** Add these two schemas to the `actionSchema` discriminated union

```typescript
const clusterActionSchema = z.object({
  type: z.literal("cluster"),
  nodeIds: z.array(z.string()).min(1),
  center: z.object({ x: z.number(), y: z.number() }).optional(),
});

const layoutActionSchema = z.object({
  type: z.literal("layout"),
  layoutType: z.enum(["mindmap", "roadmap", "timeline", "flowchart", "presentation"]),
  options: z.object({
    spacing: z.object({ x: z.number(), y: z.number() }).optional(),
    centerPosition: z.object({ x: z.number(), y: z.number() }).optional(),
    direction: z.enum(["horizontal", "vertical", "radial"]).optional(),
  }).optional(),
});
```

### Bug 2: Gemini API vs Vertex AI
**File:** `backend/src/config/genai.ts`  
**Problem:** Using Gemini API key, not Vertex AI — hackathon compliance violation  
**Fix:** Switch to `@google-cloud/vertexai` SDK or use the `google-genai` SDK's Vertex AI constructor

### Bug 3: Screenshot reliability
**File:** `web/hooks/usePlanAndExecute.ts`  
**Problem:** `html2canvas` on `#canvas-root` doesn't capture TLDraw/Excalidraw canvas frames correctly (they're rendered as WebGL/Canvas2D contexts)  
**Fix:** Use `getScreenshot()` API from Excalidraw instance, OR use TLDraw's `editor.toImage()`, store it in a ref, pass to AI planner

### Bug 4: `reasoning` field missing from action plan schema
**File:** `backend/src/validators/action.validator.ts`  
**Problem:** Frontend `usePlanAndExecute` reads `plan.reasoning` for toast message, but `actionPlanSchema` doesn't include `reasoning` field — Zod strips unknown fields by default  
**Fix:** Add `reasoning: z.string().optional()` to `actionPlanSchema`

---

## 6. What Needs to Be Added for Full PRD Compliance

### Priority 1 — Hackathon Blockers
1. **Fix Vertex AI usage** — Switch to proper Vertex AI SDK (requirement in PRD compliance checklist)
2. **Fix backend validator** — Add `layout` and `cluster` action schemas
3. **Fix `reasoning` field** — Pass through from AI for UX toasts
4. **Validate screenshot** — Use Excalidraw API or fallback blank image reliably

### Priority 2 — Core UX Missing
5. **Inline node editing** — Double-click to edit TextNode label
6. **Node right-click context menu** — Delete, duplicate, AI-analyze
7. **Undo/redo system** — Before/after snapshots for AI action reversibility
8. **TopBar** — Media asset panel, canvas tools (currently missing entirely)

### Priority 3 — PRD Must-Haves not done
9. **Gemini Live API** — Real-time voice bidirectional stream (huge scope, likely post-hackathon)
10. **YouTube iframe embed** — Proper embeds instead of thumbnail + open-in-tab
11. **AI response voice (TTS)** — Text-to-speech for AI reasoning output

### Priority 4 — PRD Nice-to-Haves
12. **Persistent embeddings** — Cache node embeddings in Firestore for search speed
13. **AI auto-organization trigger** — Manual "auto-organize" button calling the AI planner
14. **PDF text extraction** — Backend `pdf-parse` for AI context
15. **CSV table node** — Basic table renderer

---

## 7. Architecture Quality Assessment

### Strengths
- The 3-layer hybrid canvas (TLDraw + Excalidraw + React Flow) is architecturally sophisticated and well-documented
- The AI pipeline (intent parser → spatial context → Gemini → Zod validation → action executor) is clean and extensible
- Backend is properly layered (controllers → services → validators)
- Security is strong: JWT auth, Zod validation, coordinate clamping, node ID whitelist
- Autosave with debounce is well-implemented

### Weaknesses
- The 3-layer canvas creates complexity: camera sync is fragile across 3 different viewport systems
- React Flow layer is purely infrastructure (all nodes invisible, no pointer events) — feels like over-engineering for current use
- Voice is an afterthought: it just fills a text box, no actual AI voice integration
- No undo stack means every AI action is irreversible — high risk in a demo
- `html2canvas` screenshots are unreliable for canvas-based rendering

---

## 8. File/Component Count Summary

| Area | Files |
|---|---|
| Backend services | 10 |
| Backend controllers | 8 |
| Backend routes | 9 |
| Backend middleware | 4 |
| Frontend components | ~20 |
| Frontend hooks | 10 |
| Frontend lib utilities | 8 |
| Frontend store | 3 |
| Tests (backend) | 7 |
| Infra (Terraform) | 6+ modules |

**Total codebase files:** ~100+ TypeScript files  
**Estimated LOC:** ~8,000–12,000 lines
