# STUN — Issues, Missing Connections & Roadmap

**Created:** March 8, 2026  
**Status:** MVP Phase vs PRD Vision Gap Analysis  

---

## 📊 Executive Summary

| Category | Status | Details |
|----------|--------|---------|
| **Core AI Pipeline** | ✅ Working | Gemini → Actions → Canvas |
| **Auth System** | ✅ Working | Google OAuth + Firebase |
| **Canvas Rendering** | ✅ Working | Multi-layer (TLDraw + Excalidraw + React Flow) |
| **Collaboration** | 🟡 Partial | APIs ✅, UI ❌ |
| **Element-Node Sync** | ❌ Missing | Excalidraw shapes not mapped to React Flow |
| **Media Support** | ❌ Missing | Video/PDF/images as nodes |
| **Canvas Transformations** | ❌ Missing | Roadmap/mindmap/timeline layouts |
| **Cloud Deployment** | ⏳ Ready | Code ready, not deployed yet |

---

## 🔴 Critical Issues (Block Demo)

### 1. **Element-to-Node Mapping Missing**

**File:** `web/components/canvas/CanvasRoot.tsx` line 129  
**Issue:** TODO comment shows mapping not implemented

```typescript
// TODO: Sync with React Flow nodes via mapping service
// For now, we'll implement basic mapping later
```

**Impact:** 
- User draws shapes in Excalidraw → NOT visible as React Flow nodes
- AI can only manipulate manually-created nodes, not drawn elements
- Canvas is fractured: drawing layer separate from AI-manipulatable layer

**What's Needed:**
```typescript
const handleExcalidrawElementsChange = useCallback((elements) => {
  onExcalidrawElementsChange(elements);
  
  // Add this:
  // For each new/updated Excalidraw element:
  //   - Check if exists in mapping service
  //   - If not, create React Flow node from element
  //   - Update mapping record (excalidrawId ↔ nodeId)
  //   - Sync position/size to React Flow
}, [onExcalidrawElementsChange]);
```

**Priority:** 🔴 **CRITICAL** — Blocks users from drawing ideas that AI can understand

---

### 2. **No Board Deletion Endpoint**

**Status:** API endpoint missing, frontend has no delete UI

**Current:** 
- Can create, read, update boards
- Cannot delete boards

**Fix:**
```typescript
// backend/src/api/routes/board.routes.ts
boardRouter.delete("/:id", requireAuth, boardController.delete);

// backend/src/api/controllers/board.controller.ts
async delete(req: Request, res: Response, next): Promise<void> {
  // Check ownership
  // Delete from Firestore
  // Return { success: true }
}
```

**Priority:** 🟡 **MEDIUM** — Nice-to-have but used in cleanup

---

## 🟡 Features Missing Per PRD

### 1. **Media Upload Support**

**PRD Section:** 5.1 "Drop: Text, Images, PDFs, YouTube videos, Sheets/CSV, Web links"

**Current Implementation:** None

**Needs:**
- [ ] File upload component
- [ ] Video URL parser (YouTube, Vimeo)
- [ ] PDF preview handling
- [ ] Image drag-drop
- [ ] Sheet/CSV importer
- [ ] Web link preview (thumbnail + metadata)
- [ ] Cloud Storage integration (backend upload handler)

**Frontend Files Needed:**
```
web/components/ui/MediaUploader.tsx
web/components/ui/LinkPreview.tsx
web/hooks/useMediaUpload.ts
web/lib/media-parser.ts
```

**Backend Files Needed:**
```
backend/src/api/routes/media.routes.ts
backend/src/api/controllers/media.controller.ts
backend/src/services/media.service.ts (handle upload to Cloud Storage)
```

**Priority:** 🟡 **MEDIUM** — Demo can work without it, but limits use cases

---

### 2. **Canvas Transformation Layouts**

**PRD Section:** 5.5 "AI can restructure canvas into: Mind map, Roadmap, Timeline, Flowchart, Presentation layout"

**Current:** No layout transformation API

**What It Should Do:**
```
User: "Convert this into a roadmap"
AI: Repositions nodes vertically, adds arrows, colors phases
```

**Missing:**
- [ ] Layout algorithm service
- [ ] Mindmap layout
- [ ] Roadmap (sequential, colored phases)
- [ ] Timeline (horizontal/vertical)
- [ ] Flowchart (hierarchical)
- [ ] Presentation (slide-by-slide)

**Backend Service:**
```typescript
// backend/src/services/layout.service.ts
layoutService.mindmap(nodes, edges): { nodes, edges }
layoutService.roadmap(nodes, edges): { nodes, edges }
layoutService.timeline(nodes, edges): { nodes, edges }
// etc.
```

**AI Prompt Update:**
Currently asks: "Generate actions"  
Should ask: "If user asks for layout transformation, include layout changes"

**Priority:** 🟡 **MEDIUM** — Nice-to-have, not essential for MVP

---

### 3. **Semantic Search Across Canvas**

**PRD Section:** 4.4 "Voice & Search Navigation"

**Current:** No search functionality

**Missing:**
- [ ] Search bar UI component
- [ ] Semantic search API endpoint
- [ ] Vector embeddings for nodes (Vertex AI embeddings)
- [ ] Filter by type, topic, date
- [ ] Highlight results

**Priority:** 🟡 **MEDIUM** — Can be added, not blocking

---

### 4. **Real-Time Collaboration (WebSocket)**

**PRD Section:** 4.2 "Nice-to-Have: Real-time collaboration"

**Current:** Polling-based (10s latency)

**Issues:**
- [ ] usePresence polls every 10 seconds
- [ ] Board updates not synced to collaborators in real-time
- [ ] Presence data doesn't reflect live edits

**Current Works But Slow:**
```typescript
// web/hooks/usePresence.ts
pollInterval = setInterval(pollActiveUsers, 10000); // 10s delay
```

**Better Approach (Out of Scope for Hackathon):**
- Switch to Firebase Realtime Database or Firestore listeners
- Or implement Socket.io on backend

**Priority:** 🟡 **LOW** — Hackathon judges won't notice 10s latency on single machine

---

## 🟢 API Endpoints Analysis

### Implemented & Used ✅

| Endpoint | Method | Used By | Status |
|----------|--------|---------|--------|
| `/health` | GET | Monitoring | ✅ Working |
| `/auth/url` | GET | SignIn Page | ✅ Working |
| `/auth/signin` | POST | SignIn Flow | ✅ Working |
| `/auth/callback` | POST | SignIn Flow | ✅ Working |
| `/auth/verify-token` | POST | Token validation | ✅ Implemented |
| `/auth/me` | GET | Header/Profile | ✅ Working |
| `/auth/signout` | POST | Logout | ✅ Working |
| `/boards` | POST | Create Board | ✅ Working |
| `/boards` | GET | List Boards | ✅ Working |
| `/boards/:id` | GET | Load Board | ✅ Working |
| `/boards/:id` | PUT | Save Canvas | ✅ Working |
| `/ai/plan` | POST | Voice Commands | ✅ Working |
| `/presence/:boardId` | POST | Active Users | ✅ Working |
| `/presence/:boardId` | GET | Active Users | ✅ Working |

### Implemented But Unused ❌

| Endpoint | Method | Reason | Status |
|----------|--------|--------|--------|
| `/boards/:id/visibility` | PATCH | No UI to change visibility | 🟡 Remove or add UI |
| `/boards/:id/share` | POST | No UI for collaboration | 🟡 Needs Share Dialog |
| `/boards/:id/share/:userId` | DELETE | No UI for collaboration | 🟡 Needs Collaborator List |
| `/boards/:id/collaborators` | GET | No UI to display collaborators | 🟡 Needs Collaborator List |
| `/auth/verify-token` | POST | Frontend has its own validation | 🟡 Can Remove |

### Missing Per PRD 🔴

| Endpoint | Purpose | Priority |
|----------|---------|----------|
| `POST /media/upload` | File upload to Cloud Storage | 🟡 Medium |
| `DELETE /boards/:id` | Delete board | 🟡 Medium |
| `GET /media/:id` | Retrieve uploaded media | 🟡 Medium |
| `POST /search` | Semantic search across nodes | 🟡 Medium |
| `POST /layout/transform` | Canvas layout transformation | 🟡 Medium |

---

## ⚙️ Configuration Issues Found & Status

### 1. **Auth System Configuration**

**Issue:** Was forcing emulator mode to bypass real auth  
**Status:** ✅ **FIXED** — Real Google OAuth now working  
**Details:**
- Removed `code === "EMULATOR"` shortcut
- Service account credentials now properly loaded
- Firebase Auth Emulator auto-handles local testing
- Production ready

---

### 2. **Firestore Emulator vs Production**

**Issue:** FIRESTORE_EMULATOR_HOST must be removed for production deploy  
**Current State:** Set in `.env`

**For Production:**
```bash
# Comment out in backend/.env:
# FIRESTORE_EMULATOR_HOST=127.0.0.1:8081

# Ensure this points to real project:
GCP_PROJECT_ID=stun-489205
```

**Priority:** 🟡 **Before Cloud Run deployment**

---

### 3. **Model Configuration**

**Issue:** Was `gemini-2.0-flash-exp` (incorrect)  
**Status:** ✅ **FIXED** — Now `gemini-2.5-flash`

```env
# backend/.env
VERTEX_MODEL=gemini-2.5-flash ✅ Correct
```

---

### 4. **Service Account Key Storage**

**Issue:** Private key embedded in `.env` (security risk)  
**Recommendation for Production:**
- Store in Google Cloud Secret Manager
- Or use Workload Identity on Cloud Run
- Never commit `.env` with credentials

**Current:** ✅ Mostly working, but `.env` should be in `.gitignore`

---

### 5. **CORS Configuration**

**Issue:** Frontend URL hardcoded in backend  
**Current:** `FRONTEND_URL=http://localhost:3000`

**For Production:**
```env
# backend/.env
FRONTEND_URL=https://stun.mycompany.com  # Update before deploy
```

**Status:** ⏳ Needs update before Cloud Run

---

## 🔗 Missing Connections (Code Gaps)

### 1. **Element-Node Mapping Service**

**File:** `web/lib/canvas-mapping.ts`  
**Current State:** Stub exists, not implemented

**Needs Implementation:**
```typescript
interface MappingRecord {
  excalidrawElementId: string;
  reactFlowNodeId: string;
  lastSync: number;
}

class CanvasMappingService {
  // Track which Excalidraw elements → React Flow nodes
  private mappings = new Map<string, MappingRecord>();
  
  // When user draws a shape:
  // → Create React Flow node
  // → Record mapping
  // → Keep positions synced
}
```

**Where Used:** `CanvasRoot.tsx` line 129 (TODO comment)

**Priority:** 🔴 **CRITICAL**

---

### 2. **AI Action Validation**

**Issue:** `ActionValidationError` is thrown but not caught gracefully

**File:** `backend/src/validators/action.validator.ts`

**Current:** Hard fails on invalid actions  
**Should:** Log, filter invalid actions, proceed with valid ones

**Priority:** 🟡 **Medium** — Nice-to-have but improves UX

---

### 3. **Screenshot Fallback**

**Issue:** If `html2canvas` fails, pipeline breaks

**File:** `web/hooks/usePlanAndExecute.ts` line ~35

**Current:**
```typescript
try {
  screenshot = await useScreenshot(canvasEl);
} catch {
  // Non-fatal: proceed without screenshot
}
```

**Status:** ✅ Already has fallback (good!)

---

### 4. **Presence Data Sync**

**Issue:** Board updates not propagated to other active users

**Current Behavior:**
1. User A draws something
2. Board saved to Firestore
3. User B's presence session still shows old state

**Needs:** Firestore listeners or WebSocket to push updates

**Files:**
```
backend/src/services/presence.service.ts  // Polling-based
web/hooks/usePresence.ts                  // 10s poll interval
web/hooks/useBoard.ts                     // No real-time sync
```

**Priority:** 🟡 **Low** — Not blocking for single-user demo

---

## 🚀 Implementation Roadmap

### Phase 1: Demo Ready (ASAP)

- [ ] **Element-Node Mapping** (1-2 days)
  - Listen to Excalidraw changes
  - Create React Flow node for each shape
  - Keep positions synced
  - **File:** `web/lib/canvas-mapping.ts`

- [ ] **Test Complete Flow** (1 day)
  - Draw shape → AI sees it → manipulates it
  - Verify end-to-end

### Phase 2: Collaborator UI (For Share/Demo)

- [ ] **Collaborator Dialog** (2-3 days)
  - Share button in TopBar
  - Input email/userId
  - Display active collaborators
  - Remove collaborators
  - **Files:** 
    - `web/components/ui/ShareDialog.tsx`
    - `web/components/ui/CollaboratorsList.tsx`

### Phase 3: Production Ready

- [ ] **Remove Emulator Config** (Config change)
  - Comment out FIRESTORE_EMULATOR_HOST
  - Update FRONTEND_URL to production domain
  - Verify Cloud Run deployment

- [ ] **Delete Board Feature** (1 day)
  - Backend endpoint
  - Frontend UI button
  - Confirmation dialog

- [ ] **Media Upload** (3-5 days)
  - File upload component
  - Cloud Storage backend
  - Preview generation

### Phase 4: Advanced Features (Post-Hackathon)

- [ ] **Canvas Layouts** (3 days)
  - Mindmap algorithm
  - Roadmap layout
  - Timeline rendering

- [ ] **Semantic Search** (2 days)
  - Vector embeddings
  - Search UI
  - Filtering

- [ ] **Real-Time Sync** (3 days)
  - WebSocket or Firestore listeners
  - Live board updates
  - Presence indicators

---

## 📋 Checklist for Hackathon Submission

### Must Complete

- [ ] Element-Node Mapping working
- [ ] Test: Draw shape → AI manipulates it
- [ ] Test: Voice command → AI executes
- [ ] Canvas rendering smooth (no errors)
- [ ] Auth flow working (Google OAuth)
- [ ] Screenshot capture working for AI
- [ ] AI plan generation responses in < 3s

### Nice-to-Have

- [ ] Collaborator sharing UI (demo feature)
- [ ] Multiple board management
- [ ] Board visibility settings

### Don't Need for Hackathon

- [ ] Media upload (can demo with manual nodes)
- [ ] Search
- [ ] Real-time collaboration
- [ ] Advanced layouts (can be done with AI commands)

---

## 🎯 Priority Matrix

```
IMPACT
  ^
  |  CRITICAL        IMPORTANT
  |  • Element-Node  • Collab UI
  |    Mapping       • Board Delete
  |  • Delete Board  • Layout Algos
  |
  |  NICE-TO-HAVE    LOW-IMPACT
  |  • Search        • WebSocket sync
  |  • Media Upload  • Visibility PATCH
  |
  +─────────────────────────→ EFFORT
```

---

## 🔍 Testing Checklist

Before submission, verify:

- [ ] `POST /auth/signin` → Returns valid JWT
- [ ] `GET /boards` → Lists all user boards
- [ ] `POST /boards` → Creates board successfully
- [ ] `PUT /boards/:id` → Updates canvas state
- [ ] `POST /ai/plan` → AI returns valid actions
- [ ] Voice input → Captures transcript
- [ ] Screenshot → Sent to AI
- [ ] Actions execute → Canvas updates
- [ ] Multiple users → Active users shown (via polling)
- [ ] Excalidraw draw → React Flow node created (AFTER mapping fix)

---

## 📚 Related Docs

- [Canvas-system.md](docs/Canvas-system.md) — Architecture overview
- [PRD.md](docs/PRD.md) — Full product requirements
- [CODEBASE_CONNECTION_AUDIT.md](CODEBASE_CONNECTION_AUDIT.md) — API connections
- [integration-test-results.md](integration-test-results.md) — Test results

---

## 📝 Notes

**What's Actually Working:**
- Core AI pipeline (voice → screenshot → Gemini → actions)
- Canvas multi-layer rendering
- Node creation, movement, connection (via AI)
- Board persistence in Firestore
- User authentication

**What's Actually Missing:**
- Drawing-to-node synchronization (critical gap)
- Collaborator management UI
- Board deletion
- Media upload support
- Advanced layout transformations

**Hackathon Timeline:**
- If Element-Node Mapping done → Can submit with full feature set
- If skipped → Demo works but drawing not AI-manipulatable

