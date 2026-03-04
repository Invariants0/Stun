# Stun Frontend Implementation Plan
**Last Updated:** March 4, 2026  
**Project:** UI Navigator & Multimodal Spatial AI Agent  
**Status:** Mid-Development (Core Features Complete, Integration Pending)

---

## Executive Summary

**Overall Progress:** 65 / 100 (Beta Stage)  
**Audit Score:** 35 / 100 (Alpha/MVP Stage) - **OUTDATED**

### Major Progress Since Audit:
- ✅ Action Executor fully implemented (was 0%, now 100%)
- ✅ Web Speech API integrated (was 10%, now 100%)
- ✅ LocalStorage persistence added (was 0%, now 100%)
- ✅ Hybrid canvas system operational (TLDraw + Excalidraw + React Flow)
- ✅ Camera synchronization across all three layers
- ⚠️ Error handling still missing across most systems
- ⚠️ Authentication flows still not implemented
- ⚠️ Voice-to-AI integration not connected

---

## Table of Contents

1. [Current Architecture Status](#current-architecture-status)
2. [Audit Comparison](#audit-comparison)
3. [Implementation Stages](#implementation-stages)
4. [Stage 1: Critical Systems](#stage-1-critical-systems-priority-1)
5. [Stage 2: Integration & UX](#stage-2-integration--ux-priority-2)
6. [Stage 3: Enhancement](#stage-3-enhancement-priority-3)
7. [Stage 4: Production Readiness](#stage-4-production-readiness-priority-4)
8. [Technical Debt](#technical-debt)
9. [Risk Assessment](#risk-assessment)

---

## Current Architecture Status

### ✅ Fully Implemented Systems (100%)

#### 1. Action Executor System
- **File:** `web/lib/action-executor.ts`
- **Status:** ✅ COMPLETE (311 lines)
- **Implementation:** Full ActionExecutor class with all action types
- **Actions Supported:**
  - ✅ `move` - Reposition nodes
  - ✅ `connect` - Create edges between nodes
  - ✅ `highlight` - Visual emphasis with color/duration
  - ✅ `zoom` - Viewport transformation
  - ✅ `group` - Grouping multiple nodes
  - ✅ `cluster` - Circular arrangement
  - ✅ `create` - Add new nodes
  - ✅ `delete` - Remove nodes and edges
  - ✅ `transform` - Modify node type/data
- **Audit Said:** 0% (all stubs)
- **Reality:** 100% functional with sequential/parallel execution

#### 2. Voice System
- **Files:** `web/hooks/useVoice.ts`, `web/components/voice/VoiceOrb.tsx`
- **Status:** ✅ COMPLETE (voice capture only)
- **Implementation:**
  - ✅ Web Speech API integration
  - ✅ Continuous recognition with interim results
  - ✅ Transcript accumulation
  - ✅ Error handling for unsupported browsers
  - ✅ Visual feedback (listening states, pulse animation)
  - ⚠️ Not connected to AI planner yet
- **Audit Said:** 10% (UI only)
- **Reality:** 80% (capture works, AI integration pending)

#### 3. LocalStorage Persistence
- **File:** `web/hooks/useBoard.ts`
- **Status:** ✅ COMPLETE
- **Implementation:**
  - ✅ Save/load board state (nodes, edges, elements)
  - ✅ Camera position persistence
  - ✅ Auto-save on state changes
  - ✅ Error handling for parse failures
- **Audit Said:** 0% (no persistence)
- **Reality:** 100% for local storage (Firestore still missing)

#### 4. Hybrid Canvas System
- **Files:** `web/components/canvas/*`
- **Status:** ✅ OPERATIONAL
- **Layers:**
  - ✅ TLDraw (z-index: 1) - Infinite workspace, camera source
  - ✅ Excalidraw (z-index: 2) - Visual editing layer
  - ✅ React Flow (z-index: 3) - Knowledge graph
  - ✅ Camera sync service (bidirectional synchronization)
  - ✅ Element-to-node mapping service
- **Audit Said:** Architecturally sound
- **Reality:** Fully functional, synced, and stable

#### 5. Canvas Node System
- **Files:** `web/components/nodes/*`
- **Status:** ✅ COMPLETE
- **Node Types:**
  - ✅ TextNode - Dark theme, label display
  - ✅ ImageNode - 220x120 aspect ratio
- **Registry:** NodeRenderer with type mapping

#### 6. Screenshot System
- **File:** `web/hooks/useScreenshot.ts`
- **Status:** ✅ FUNCTIONAL
- **Implementation:** html2canvas with base64 encoding
- **Issues:** ⚠️ No error handling, ⚠️ No size optimization

---

### ⚠️ Partially Implemented Systems (40-80%)

#### 7. API Layer
- **File:** `web/lib/api.ts`
- **Status:** ⚠️ 60% COMPLETE
- **Working:**
  - ✅ Axios client configured
  - ✅ `planActions()` endpoint function
  - ✅ Environment variable support
- **Missing:**
  - ❌ Error handling (try/catch)
  - ❌ Response validation/typing
  - ❌ Authentication headers
  - ❌ Timeout configuration
  - ❌ Retry logic
  - ❌ Loading states

#### 8. Board State Management
- **Files:** `web/hooks/useBoard.ts`, `web/store/board.store.ts`
- **Status:** ⚠️ 70% COMPLETE
- **Working:**
  - ✅ React Flow hooks (useNodesState, useEdgesState)
  - ✅ Excalidraw element state
  - ✅ TLDraw editor state
  - ✅ LocalStorage persistence
  - ✅ Zustand store setup
- **Issues:**
  - ⚠️ Store is write-only (never read back)
  - ⚠️ Potential desync between store and React state
  - ❌ No Firestore sync

#### 9. UI Layout
- **Files:** `web/components/layout/*`, `web/app/board/[id]/page.tsx`
- **Status:** ⚠️ 50% COMPLETE
- **Working:**
  - ✅ TopBar with branding
  - ✅ SidePanel placeholder
  - ✅ 3-column CSS Grid layout
  - ✅ VoiceOrb overlay (z-index: 1000)
- **Missing:**
  - ❌ Interactive controls in SidePanel
  - ❌ AI planner trigger button
  - ❌ Loading/error states
  - ❌ Responsive breakpoints

---

### ❌ Not Implemented Systems (0-20%)

#### 10. Error Handling
- **Files:** ALL
- **Status:** ❌ 5% (minimal console.error calls)
- **Missing Everywhere:**
  - ❌ Try/catch blocks in async functions
  - ❌ Error boundaries for React components
  - ❌ User-facing error messages
  - ❌ Retry mechanisms
  - ❌ Fallback states
  - ❌ Error logging service integration

#### 11. Authentication System
- **File:** `web/lib/firebase.ts`
- **Status:** ❌ 10% (SDK initialized only)
- **Missing:**
  - ❌ Sign-in/sign-up components
  - ❌ User context provider
  - ❌ Route guards/middleware
  - ❌ Token management
  - ❌ Session persistence
  - ❌ API authentication headers

#### 12. Firestore Persistence
- **Status:** ❌ 0% (not initialized)
- **Missing:**
  - ❌ Firestore SDK setup
  - ❌ Board document schema
  - ❌ Real-time sync listeners
  - ❌ Multi-user collaboration
  - ❌ Conflict resolution
  - ❌ Migration from localStorage

#### 13. Voice-to-AI Integration
- **Status:** ❌ 20% (capture works, processing missing)
- **Missing:**
  - ❌ Send transcript to AI planner
  - ❌ Parse voice commands
  - ❌ Execute AI actions from voice input
  - ❌ Visual feedback during processing
  - ❌ Command history/suggestions

#### 14. Testing
- **Status:** ❌ 0%
- **Missing:**
  - ❌ Unit tests (Jest/Vitest)
  - ❌ Component tests (React Testing Library)
  - ❌ E2E tests (Playwright/Cypress)
  - ❌ Integration tests
  - ❌ Visual regression tests

#### 15. Responsive Design
- **Status:** ❌ 0% (desktop only)
- **Missing:**
  - ❌ Mobile breakpoints
  - ❌ Touch gesture support
  - ❌ Adaptive layouts
  - ❌ Mobile-optimized controls

---

## Audit Comparison

### FRONTEND_AUDIT.txt Findings vs Current Reality

| Feature | Audit Score | Current Score | Delta | Notes |
|---------|-------------|---------------|-------|-------|
| **Action Executor** | 0% ❌ | 100% ✅ | +100% | Fully implemented with 9 action types |
| **Voice System** | 10% ❌ | 80% ⚠️ | +70% | Web Speech API working, AI integration pending |
| **Data Persistence** | 0% ❌ | 100% ✅ | +100% | LocalStorage complete, Firestore still missing |
| **Auth Flows** | 0% ❌ | 10% ❌ | +10% | SDK initialized, no UI/flows yet |
| **Error Handling** | 0% ❌ | 5% ❌ | +5% | Still critically missing |
| **Canvas System** | 80% ⚠️ | 95% ✅ | +15% | TLDraw sync added, fully operational |
| **API Layer** | 40% ⚠️ | 60% ⚠️ | +20% | No validation/error handling added |
| **State Management** | 50% ⚠️ | 70% ⚠️ | +20% | LocalStorage persistence added |
| **Screenshot System** | 60% ⚠️ | 60% ⚠️ | 0% | No changes, still missing optimization |
| **UI/UX** | 40% ⚠️ | 50% ⚠️ | +10% | VoiceOrb improved, layouts same |
| **Testing** | 0% ❌ | 0% ❌ | 0% | No progress |
| **Responsive** | 0% ❌ | 0% ❌ | 0% | No progress |

### Critical Issues from Audit

| Issue # | Severity | Description | Status | Notes |
|---------|----------|-------------|--------|-------|
| **#1** | 🔴 CRITICAL | Action executor empty | ✅ RESOLVED | Fully implemented |
| **#2** | 🔴 CRITICAL | No error handling | ❌ OPEN | Still missing everywhere |
| **#3** | 🔴 CRITICAL | Voice system unstubbed | ⚠️ PARTIAL | Capture works, AI integration missing |
| **#4** | 🔴 CRITICAL | No authentication | ❌ OPEN | SDK only, no flows |
| **#5** | 🔴 CRITICAL | No data persistence | ⚠️ PARTIAL | LocalStorage works, Firestore missing |
| **#6** | 🟠 HIGH | Zustand store desync | ❌ OPEN | Still write-only |
| **#7** | 🟠 HIGH | No screenshot error handling | ❌ OPEN | No progress |
| **#8** | 🟠 HIGH | No API response validation | ❌ OPEN | No progress |
| **#9** | 🟠 HIGH | React Flow styling conflict | ⚠️ PARTIAL | Dark theme applied, may need tweaks |

---

## Implementation Stages

### Priority Matrix

```
┌──────────────────────────────────────────────────────────┐
│  Impact vs Effort                                         │
│                                                           │
│  High Impact  │  #2 Error Handling   │  #4 Auth System  │
│               │  #3 Voice-AI Link    │  #5 Firestore    │
│  ──────────────┼──────────────────────┼──────────────────┤
│  Med Impact   │  #8 API Validation   │  #6 Store Sync   │
│               │  #7 Screenshot Errors│  #14 Testing     │
│  ──────────────┼──────────────────────┼──────────────────┤
│  Low Impact   │  #9 Theme Tweaks     │  #15 Responsive  │
│               │  UI Polish           │  Advanced Features│
│               │                       │                   │
│               │  Low Effort          │  High Effort     │
└──────────────────────────────────────────────────────────┘
```

---

## Stage 1: Critical Systems (Priority 1)

**Goal:** Make the AI features functional and prevent user-facing crashes  
**Timeline:** 1-2 weeks  
**Blocking Issues:** #2, #3, #8

### 1.1 Error Handling System

**Status:** ❌ Not Started  
**Priority:** 🔴 CRITICAL  
**Effort:** Medium (2-3 days)

#### Tasks:
- [ ] **1.1.1** Create error boundary component for React tree
  - File: `web/components/ErrorBoundary.tsx`
  - Wrap board page and canvas components
  - Display user-friendly error UI
  
- [ ] **1.1.2** Add try/catch to all async functions
  - `web/lib/api.ts` - Wrap API calls
  - `web/hooks/useScreenshot.ts` - Handle html2canvas failures
  - `web/hooks/useBoard.ts` - Handle localStorage errors
  - `web/lib/action-executor.ts` - Wrap action execution
  
- [ ] **1.1.3** Create toast notification system
  - File: `web/components/Toast.tsx`
  - Use for non-critical errors
  - Auto-dismiss after 5 seconds
  
- [ ] **1.1.4** Add loading states
  - Create `useAsync` hook for API calls
  - Add loading spinners to UI
  - Disable buttons during processing

#### Acceptance Criteria:
- ✅ No unhandled promise rejections in console
- ✅ User sees error messages for failed operations
- ✅ App doesn't crash on API failures
- ✅ Loading states visible during async operations

---

### 1.2 Voice-to-AI Integration

**Status:** ⚠️ 20% Complete (capture only)  
**Priority:** 🔴 CRITICAL  
**Effort:** Medium (2-3 days)

#### Tasks:
- [ ] **1.2.1** Connect voice transcript to AI planner
  - Modify `VoiceOrb.tsx` to trigger `planActions()` on transcript
  - Pass transcript as `command` parameter
  - Show processing state while AI responds
  
- [ ] **1.2.2** Integrate ActionExecutor with API response
  - Create `useAIPlanner` hook
  - Call `ActionExecutor.executePlan()` with response
  - Handle execution errors
  
- [ ] **1.2.3** Add visual feedback
  - Show "Processing..." state in VoiceOrb
  - Display action execution progress
  - Show success/failure states
  
- [ ] **1.2.4** Add voice command parsing (optional enhancement)
  - Simple keyword detection ("move", "connect", "create")
  - Fall back to full AI if no keywords match

#### Files to Modify:
- `web/components/voice/VoiceOrb.tsx`
- `web/hooks/useVoice.ts`
- `web/components/canvas/CanvasRoot.tsx`
- New: `web/hooks/useAIPlanner.ts`

#### Acceptance Criteria:
- ✅ User speaks command → VoiceOrb displays transcript
- ✅ Transcript sent to AI backend automatically
- ✅ AI response executed on canvas
- ✅ User sees nodes move/connect based on voice
- ✅ Error messages shown if AI call fails

---

### 1.3 API Response Validation

**Status:** ❌ Not Started  
**Priority:** 🟠 HIGH  
**Effort:** Low (1 day)

#### Tasks:
- [ ] **1.3.1** Create TypeScript types for API responses
  - File: `web/types/api.types.ts`
  - Define `PlanActionsResponse` interface
  - Define error response types
  
- [ ] **1.3.2** Add Zod schema validation
  - Install: `bun add zod`
  - Create schemas in `web/lib/validators.ts`
  - Validate responses before using
  
- [ ] **1.3.3** Add response error handling
  - Check for 4xx/5xx status codes
  - Parse error messages from backend
  - Throw typed errors with context

#### Acceptance Criteria:
- ✅ Malformed responses caught before execution
- ✅ TypeScript autocomplete for response data
- ✅ Clear error messages for invalid data
- ✅ No runtime errors from unexpected response shapes

---

### 1.4 SidePanel Interactive Controls

**Status:** ❌ Not Started (placeholder only)  
**Priority:** 🟠 HIGH  
**Effort:** Low (1-2 days)

#### Tasks:
- [ ] **1.4.1** Add "Run AI Planner" button
  - Trigger screenshot → planActions() flow
  - Add text input for manual commands
  - Show loading state during processing
  
- [ ] **1.4.2** Add node creation controls
  - "Add Text Node" button
  - "Add Image Node" button
  - Position new nodes at viewport center
  
- [ ] **1.4.3** Add action history display
  - Show last 5 executed actions
  - Allow replaying actions
  - Clear history button

#### Files to Modify:
- `web/components/layout/SidePanel.tsx`

#### Acceptance Criteria:
- ✅ User can trigger AI planner from button
- ✅ User can create nodes without dragging
- ✅ Action history visible and interactive

---

## Stage 2: Integration & UX (Priority 2)

**Goal:** Improve user experience and system reliability  
**Timeline:** 1-2 weeks  
**Blocking Issues:** #7, #9

### 2.1 Screenshot System Enhancement

**Status:** ⚠️ 60% Complete  
**Priority:** 🟠 HIGH  
**Effort:** Low (1 day)

#### Tasks:
- [ ] **2.1.1** Add error handling to useScreenshot
  - Try/catch around html2canvas
  - Fallback to text-only mode if screenshot fails
  - User notification on failure
  
- [ ] **2.1.2** Add screenshot size optimization
  - Resize to max 1920x1080 before encoding
  - Use canvas.toBlob() with quality parameter
  - Compress base64 if > 500KB
  
- [ ] **2.1.3** Add loading indicator
  - Show "Capturing screenshot..." overlay
  - Estimate time based on canvas size
  - Cancel button for long operations

#### Acceptance Criteria:
- ✅ Screenshot failures don't crash app
- ✅ Large canvases don't cause memory issues
- ✅ User sees progress during capture
- ✅ Screenshots under 500KB for network transmission

---

### 2.2 Backend AI Integration

**Status:** ❌ Not Started (backend uses stub)  
**Priority:** 🟠 HIGH  
**Effort:** Medium (2-3 days) - Backend work

#### Tasks:
- [ ] **2.2.1** Implement Gemini vision API in backend
  - File: `backend/src/services/gemini.service.ts`
  - Replace stub with real Vertex AI call
  - Send screenshot + command to Gemini
  - Parse structured JSON response
  
- [ ] **2.2.2** Add prompt engineering
  - File: `backend/src/prompts/planner.prompt.ts`
  - Improve system prompt for better results
  - Add few-shot examples
  - Include canvas state context
  
- [ ] **2.2.3** Add response validation
  - Validate action schema before returning
  - Filter out invalid actions
  - Add execution order optimization

#### Acceptance Criteria:
- ✅ Backend calls real Gemini API
- ✅ Actions generated match user intent
- ✅ Invalid actions filtered out
- ✅ Response time < 3 seconds for typical commands

---

### 2.3 Zustand Store Sync Fix

**Status:** ❌ Not Started  
**Priority:** 🟡 MEDIUM  
**Effort:** Low (0.5 day)

#### Tasks:
- [ ] **2.3.1** Review store usage pattern
  - Decide: Keep bidirectional sync or make store read-only?
  - Document decision in code comments
  
- [ ] **2.3.2** Option A: Remove store if unused
  - Delete `web/store/board.store.ts`
  - Remove store writes from useBoard
  - Rely on React state + localStorage only
  
- [ ] **2.3.3** Option B: Make store authoritative
  - Read from store in useBoard initialization
  - Subscribe to store changes
  - Ensure single source of truth

#### Acceptance Criteria:
- ✅ No state desync between store and React
- ✅ Clear documentation of state flow
- ✅ Performance not degraded

---

### 2.4 UI/UX Polish

**Status:** ⚠️ 50% Complete  
**Priority:** 🟡 MEDIUM  
**Effort:** Low (1-2 days)

#### Tasks:
- [ ] **2.4.1** Theme consistency
  - Audit all inline styles
  - Ensure dark theme colors consistent
  - Fix React Flow control colors if needed
  
- [ ] **2.4.2** VoiceOrb improvements
  - Add keyboard shortcut (Space to talk)
  - Show transcript in expandable panel
  - Add "Send to AI" button next to transcript
  
- [ ] **2.4.3** Canvas UI improvements
  - Add minimap (React Flow built-in)
  - Add node count indicator
  - Add "Clear Canvas" button with confirmation
  
- [ ] **2.4.4** Loading states
  - Skeleton loaders for initial board load
  - Progress bar for AI processing
  - Shimmer effect for pending actions

#### Acceptance Criteria:
- ✅ UI looks professional and consistent
- ✅ User has clear feedback for all actions
- ✅ No visual glitches or theme conflicts

---

## Stage 3: Enhancement (Priority 3)

**Goal:** Add authentication and cloud persistence  
**Timeline:** 2-3 weeks  
**Blocking Issues:** #4, #5

### 3.1 Authentication System

**Status:** ❌ 10% (SDK only)  
**Priority:** 🟠 HIGH (for production)  
**Effort:** High (4-5 days)

#### Tasks:
- [ ] **3.1.1** Create authentication UI
  - File: `web/components/auth/SignIn.tsx`
  - Email/password sign-in form
  - Google OAuth button
  - Error handling for auth failures
  
- [ ] **3.1.2** Create user context provider
  - File: `web/contexts/AuthContext.tsx`
  - Wrap app with provider
  - Expose `user`, `loading`, `signIn`, `signOut`
  - Persist auth state
  
- [ ] **3.1.3** Add route guards
  - File: `web/middleware.ts` (Next.js middleware)
  - Redirect to /signin if not authenticated
  - Allow public access to home page only
  
- [ ] **3.1.4** Add auth to API calls
  - Get Firebase ID token
  - Add `Authorization: Bearer <token>` header
  - Refresh token on expiry

#### Files to Create:
- `web/components/auth/SignIn.tsx`
- `web/components/auth/SignUp.tsx`
- `web/contexts/AuthContext.tsx`
- `web/app/signin/page.tsx`
- `web/middleware.ts`

#### Acceptance Criteria:
- ✅ User can sign in with email/password
- ✅ User can sign in with Google
- ✅ Protected routes require authentication
- ✅ API calls include auth token
- ✅ User state persists across refreshes

---

### 3.2 Firestore Persistence

**Status:** ❌ 0%  
**Priority:** 🟠 HIGH (for production)  
**Effort:** High (5-6 days)

#### Tasks:
- [ ] **3.2.1** Initialize Firestore
  - File: `web/lib/firebase.ts`
  - Add Firestore SDK import
  - Create db instance
  - Set up security rules in Firebase Console
  
- [ ] **3.2.2** Create board schema
  - Collection: `boards`
  - Document structure:
    ```typescript
    {
      id: string;
      ownerId: string;
      name: string;
      nodes: Node[];
      edges: Edge[];
      excalidrawElements: ExcalidrawElement[];
      tldrawCamera: { x, y, zoom };
      createdAt: Timestamp;
      updatedAt: Timestamp;
      collaborators: string[];
    }
    ```
  
- [ ] **3.2.3** Implement save/load functions
  - File: `web/lib/firestore.ts`
  - `saveBoard(boardId, data)` - debounced auto-save
  - `loadBoard(boardId)` - load on mount
  - `subscribeToBoard(boardId, callback)` - real-time updates
  
- [ ] **3.2.4** Migrate from localStorage
  - Add migration logic in useBoard
  - Keep localStorage as offline cache
  - Sync to Firestore when online
  
- [ ] **3.2.5** Add conflict resolution
  - Last-write-wins strategy
  - Show warning if concurrent edits detected
  - Optional: Operational Transform for true collaboration

#### Acceptance Criteria:
- ✅ Boards saved to Firestore automatically
- ✅ Boards load from Firestore on mount
- ✅ Real-time sync across browser tabs
- ✅ Offline edits synced when online
- ✅ User sees boards list from Firestore

---

### 3.3 Multi-User Collaboration (Optional)

**Status:** ❌ 0%  
**Priority:** 🟢 LOW (Nice to have)  
**Effort:** Very High (1-2 weeks)

#### Tasks:
- [ ] **3.3.1** Add presence system
  - Show cursors of other users
  - Display user avatars
  - Color-code each user
  
- [ ] **3.3.2** Add operational transforms
  - Use library like Yjs or Automerge
  - Sync node positions without conflicts
  - Handle concurrent edge creation
  
- [ ] **3.3.3** Add collaboration UI
  - User list in SidePanel
  - Invite button
  - Share link generation

#### Acceptance Criteria:
- ✅ Multiple users can edit same board
- ✅ Changes appear in real-time
- ✅ No conflicts or data loss

---

## Stage 4: Production Readiness (Priority 4)

**Goal:** Make the app production-grade  
**Timeline:** 2-3 weeks  
**Blocking Issues:** None (all enhancements)

### 4.1 Testing Infrastructure

**Status:** ❌ 0%  
**Priority:** 🟡 MEDIUM  
**Effort:** High (5-7 days)

#### Tasks:
- [ ] **4.1.1** Set up testing framework
  - Install: `bun add -d vitest @testing-library/react`
  - Configure: `vitest.config.ts`
  - Add test scripts to package.json
  
- [ ] **4.1.2** Write unit tests
  - Test hooks: useVoice, useBoard, useScreenshot
  - Test utilities: action-executor, api, camera-sync
  - Target: 60% code coverage
  
- [ ] **4.1.3** Write component tests
  - Test: VoiceOrb, TextNode, ImageNode
  - Test: CanvasRoot integration
  - Mock external dependencies
  
- [ ] **4.1.4** Set up E2E tests
  - Install: `bun add -d playwright`
  - Test critical flows: create node, voice command, AI execution
  - Run in CI/CD pipeline

#### Acceptance Criteria:
- ✅ 60% unit test coverage
- ✅ All critical components tested
- ✅ E2E tests passing
- ✅ Tests run in CI/CD

---

### 4.2 Responsive Design

**Status:** ❌ 0%  
**Priority:** 🟢 LOW  
**Effort:** Medium (3-4 days)

#### Tasks:
- [ ] **4.2.1** Add mobile breakpoints
  - File: `web/app/globals.scss`
  - Define breakpoints: mobile (< 768px), tablet (768-1024px)
  - Use CSS Grid for responsive layouts
  
- [ ] **4.2.2** Mobile-optimize canvas
  - Hide SidePanel on mobile (hamburger menu)
  - Make TopBar sticky
  - Add touch gesture support for React Flow
  
- [ ] **4.2.3** Mobile-optimize VoiceOrb
  - Larger touch target (80x80px)
  - Bottom-center position on mobile
  - Full-screen transcript view
  
- [ ] **4.2.4** Test on real devices
  - iPhone, Android, iPad
  - Safari, Chrome mobile
  - Fix touch/gesture issues

#### Acceptance Criteria:
- ✅ App usable on mobile devices
- ✅ No horizontal scrolling
- ✅ Touch gestures work smoothly
- ✅ VoiceOrb accessible on small screens

---

### 4.3 Performance Optimization

**Status:** ❌ 0%  
**Priority:** 🟢 LOW  
**Effort:** Medium (2-3 days)

#### Tasks:
- [ ] **4.3.1** Add React.memo to expensive components
  - CanvasRoot, NodeRenderer, EdgeRenderer
  - Prevent unnecessary re-renders
  
- [ ] **4.3.2** Optimize React Flow rendering
  - Use `nodesDraggable={false}` for large graphs
  - Implement virtual scrolling for 100+ nodes
  - Debounce position updates
  
- [ ] **4.3.3** Lazy load components
  - Code-split Excalidraw component
  - Code-split TLDraw component
  - Use Next.js dynamic imports
  
- [ ] **4.3.4** Add performance monitoring
  - Install: `bun add web-vitals`
  - Track LCP, FID, CLS metrics
  - Send to analytics

#### Acceptance Criteria:
- ✅ Lighthouse score > 90
- ✅ No jank when dragging 50+ nodes
- ✅ Bundle size < 500KB (gzipped)
- ✅ First paint < 1.5 seconds

---

### 4.4 Styling System Refactor (Optional)

**Status:** ❌ 0%  
**Priority:** 🟢 LOW  
**Effort:** Medium (3-4 days)

#### Tasks:
- [ ] **4.4.1** Migrate to CSS modules or styled-components
  - Create component-scoped styles
  - Remove inline styles
  - Better type safety
  
- [ ] **4.4.2** Create design tokens
  - File: `web/styles/tokens.scss`
  - Define colors, spacing, typography
  - Use CSS variables
  
- [ ] **4.4.3** Add Tailwind CSS (optional)
  - Install: `bun add -D tailwindcss`
  - Configure: `tailwind.config.js`
  - Migrate inline styles to Tailwind classes

#### Acceptance Criteria:
- ✅ No inline styles in components
- ✅ Consistent design system
- ✅ Easy to theme/customize

---

## Technical Debt

### High Priority Debt

1. **Remove Zustand Store or Make It Authoritative**
   - Current state: Write-only, never read
   - Risk: Confusion for future developers
   - Fix: Choose one source of truth (Stage 2.3)

2. **TypeScript Deprecation Warnings**
   - Files: `backend/tsconfig.json`, `web/tsconfig.json`
   - Issue: `moduleResolution: "Node"` and `baseUrl` deprecated
   - Fix: Update to modern config or add `ignoreDeprecations`

3. **Backend Gemini Service Stub**
   - File: `backend/src/services/gemini.service.ts`
   - Current: Returns hardcoded actions
   - Fix: Implement real Vertex AI integration (Stage 2.2)

### Medium Priority Debt

4. **No TypeScript Types for Backend Responses**
   - Risk: Runtime errors from API changes
   - Fix: Add Zod validation (Stage 1.3)

5. **Screenshot Size Issues**
   - Risk: Large payloads slow down API calls
   - Fix: Add compression (Stage 2.1)

6. **No Logging/Monitoring**
   - Risk: Can't debug production issues
   - Fix: Add Sentry or LogRocket (Stage 4)

### Low Priority Debt

7. **Inline Styles Everywhere**
   - Maintainability: Hard to change theme
   - Fix: CSS modules or Tailwind (Stage 4.4)

8. **No Git Hooks or Pre-commit Checks**
   - Risk: Broken code pushed to main
   - Fix: Add Husky + lint-staged

---

## Risk Assessment

### Critical Risks 🔴

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| **API failures break app** | High | High | Add error handling (Stage 1.1) |
| **AI doesn't execute actions** | High | Medium | Already mitigated (ActionExecutor complete) |
| **Voice doesn't work on Safari** | High | Medium | Already handled (feature detection in useVoice) |
| **No auth = data exposure** | Critical | High | Add authentication (Stage 3.1) |

### High Risks 🟠

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| **Screenshot fails silently** | Medium | High | Add error handling (Stage 2.1) |
| **State desync causes data loss** | High | Medium | Fix Zustand pattern (Stage 2.3) |
| **Large canvases crash browser** | Medium | Medium | Add size limits + optimization (Stage 2.1) |
| **Concurrent edits corrupt data** | High | Low | Add Firestore sync (Stage 3.2) |

### Medium Risks 🟡

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| **Poor mobile experience** | Medium | High | Add responsive design (Stage 4.2) |
| **Slow performance at scale** | Medium | Medium | Optimize rendering (Stage 4.3) |
| **No tests = regression bugs** | Medium | High | Add testing (Stage 4.1) |

---

## Success Metrics

### Stage 1 Complete:
- ✅ 0 unhandled errors in production
- ✅ Voice commands execute AI actions
- ✅ Users can trigger AI from UI button
- ✅ All API responses validated

### Stage 2 Complete:
- ✅ Screenshot success rate > 95%
- ✅ AI response time < 3 seconds
- ✅ No state desyncs reported
- ✅ UI polish score > 4/5 (user feedback)

### Stage 3 Complete:
- ✅ 100% of boards in Firestore
- ✅ Auth flow conversion rate > 80%
- ✅ Real-time sync working
- ✅ Zero data loss incidents

### Stage 4 Complete:
- ✅ Test coverage > 60%
- ✅ Lighthouse score > 90
- ✅ Mobile usability score > 4/5
- ✅ Production ready for launch

---

## Quick Reference: What's ✅ Done vs ❌ TODO

### ✅ Already Complete (Can Skip)
- Action Executor (all 9 action types)
- Web Speech API integration
- LocalStorage persistence
- Hybrid canvas rendering
- Camera synchronization
- Node types (Text, Image)
- Basic VoiceOrb UI
- Screenshot capture (basic)
- API client setup

### ❌ Must Implement (Critical Path)
- **Stage 1:** Error handling, Voice-AI integration, API validation, SidePanel controls
- **Stage 2:** Screenshot optimization, Backend Gemini integration, Store sync fix
- **Stage 3:** Authentication, Firestore persistence
- **Stage 4:** Testing, Responsive design, Performance

### ⚠️ Needs Improvement
- Error handling (add try/catch everywhere)
- Backend (replace stub with real Gemini)
- Store pattern (fix or remove Zustand)
- UI polish (loading states, themes)

---

## Timeline Estimate

| Stage | Duration | Dependencies | Start Condition |
|-------|----------|--------------|-----------------|
| **Stage 1** | 1-2 weeks | None | Immediately |
| **Stage 2** | 1-2 weeks | Stage 1 complete | Error handling done |
| **Stage 3** | 2-3 weeks | Stage 2 complete | Backend AI working |
| **Stage 4** | 2-3 weeks | Stage 3 complete | Auth + Firestore done |

**Total Timeline:** 6-10 weeks to production-ready  
**MVP Timeline:** 2-3 weeks (Stage 1 + partial Stage 2)

---

## Next Actions (Prioritized)

### This Week:
1. ✅ Complete this implementation plan
2. ❌ Implement error boundaries (1.1.1)
3. ❌ Add try/catch to API calls (1.1.2)
4. ❌ Connect voice transcript to AI (1.2.1)
5. ❌ Add "Run AI Planner" button to SidePanel (1.4.1)

### Next Week:
1. ❌ Implement backend Gemini integration (2.2.1)
2. ❌ Add API response validation (1.3)
3. ❌ Optimize screenshot system (2.1)
4. ❌ UI polish pass (2.4)

### Month 2:
1. ❌ Add authentication (3.1)
2. ❌ Implement Firestore sync (3.2)
3. ❌ Begin testing (4.1)

---

**Document Version:** 1.0  
**Last Updated:** March 4, 2026  
**Maintained By:** Development Team  
**Review Frequency:** Weekly during active development
