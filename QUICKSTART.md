# Stun - Quick Setup Guide

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ or Bun
- Git

### Installation

#### 1. Clone and Navigate
```bash
git clone <repo-url>
cd Stun
```

#### 2. Frontend Setup
```bash
cd web
bun install   # or npm install
bun dev       # or npm run dev
```

Frontend runs at: **http://localhost:3000**

#### 3. Backend Setup (in new terminal)
```bash
cd backend
npm install
npm run dev
```

Backend runs at: **http://localhost:8080**

---

## 🎨 Using the Hybrid Canvas

### Access a Board
Navigate to: `http://localhost:3000/board/demo-board`

### Canvas Layers

**Layer 1 - TLDraw Workspace (Hidden UI)**
- Pan: Click and drag
- Zoom: Mouse wheel / Pinch

**Layer 2 - Excalidraw (Visual Tools)**
- Drawing tools in toolbar
- Create shapes, arrows, text
- Freehand drawing
- Diagram creation

**Layer 3 - React Flow (Knowledge Graph)**
- Visible as structured nodes
- AI-manipulatable
- Shows connections/edges

---

## 🧪 Testing the Hybrid Canvas

### Test 1: Basic Interaction
1. Open `/board/demo-board`
2. You should see:
   - 3 default React Flow nodes
   - Excalidraw toolbar on the left
   - Canvas background

### Test 2: Drawing
1. Select rectangle tool from Excalidraw
2. Draw a rectangle
3. Add text with text tool
4. Draw arrows connecting elements

### Test 3: React Flow Nodes
1. Drag the existing nodes
2. Connect nodes by dragging from one edge to another
3. Observe the mini-map

### Test 4: Camera Movement
1. Pan the canvas (drag)
2. Zoom in/out (scroll wheel)
3. All layers should move together

---

## 📁 Key Files to Understand

### Canvas Components
- `web/components/canvas/CanvasRoot.tsx` - Main orchestrator
- `web/components/canvas/TLDrawWorkspace.tsx` - Workspace layer
- `web/components/canvas/ExcalidrawLayer.tsx` - Drawing layer
- `web/components/canvas/ReactFlowGraphLayer.tsx` - Graph layer

### State Management
- `web/store/board.store.ts` - Zustand store for all layers
- `web/hooks/useBoard.ts` - Main canvas hook

### Services
- `web/lib/camera-sync.ts` - Camera synchronization
- `web/lib/canvas-mapping.ts` - Element-to-node mapping
- `web/lib/action-executor.ts` - AI action execution

### Types
- `web/types/canvas.types.ts` - Complete type system

---

## 🔧 Development Commands

### Frontend
```bash
cd web
bun dev          # Start dev server
bun build        # Build for production
bun lint         # Run linter
```

### Backend
```bash
cd backend
npm run dev      # Start dev server (with hot reload)
npm run build    # Compile TypeScript
npm start        # Run compiled code
```

---

## 🐛 Troubleshooting

### Port Already in Use
If port 3000 or 8080 is taken:
```bash
# Frontend - use different port
PORT=3001 bun dev

# Backend - change in src/index.ts
```

### CSS Not Loading
Make sure these are imported in `app/layout.tsx`:
```tsx
import "reactflow/dist/style.css";
import "tldraw/tldraw.css";
```

### TypeScript Errors
```bash
cd web
bun run tsc --noEmit   # Check for type errors
```

### Dependencies Issues
```bash
# Clean install
rm -rf node_modules package-lock.json
bun install
```

---

## 🎯 Next Integration Steps

### 1. Voice Command Integration
- Connect VoiceOrb component to backend
- Implement speech-to-text
- Test command processing

### 2. Screenshot Capture
- Implement html2canvas on entire canvas
- Send to backend `/ai/plan` endpoint
- Include node metadata

### 3. AI Action Execution
- Wire up Gemini response parsing
- Test ActionExecutor with sample actions
- Validate action safety

### 4. Firebase Setup
- Create Firebase project
- Add config to `web/lib/firebase.ts`
- Implement authentication
- Set up Firestore

### 5. Vertex AI Integration
- Enable Vertex AI API
- Configure service account
- Update `backend/src/services/gemini.service.ts`
- Test multimodal requests

---

## 📚 Resources

- [Canvas Architecture](docs/Canvas-system.md)
- [Product Requirements](docs/PRD.md)
- [Implementation Details](FRONTEND_IMPLEMENTATION.md)
- [React Flow Docs](https://reactflow.dev)
- [Excalidraw Docs](https://docs.excalidraw.com)
- [TLDraw Docs](https://tldraw.dev)

---

## ✅ Verification Checklist

- [ ] Frontend starts without errors
- [ ] Backend starts without errors
- [ ] Can access `/board/demo-board`
- [ ] See Excalidraw toolbar
- [ ] See React Flow nodes
- [ ] Can draw shapes
- [ ] Can move nodes
- [ ] Can pan canvas
- [ ] Can zoom canvas
- [ ] TypeScript compiles without errors

---

## 🎉 You're Ready!

The hybrid canvas architecture is fully implemented and ready for AI integration!

**Next**: Connect the AI backend to make the canvas truly intelligent! 🚀
