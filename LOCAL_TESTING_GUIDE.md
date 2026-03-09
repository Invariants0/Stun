# Local Testing Guide - Full App Simulation

**Date:** March 6, 2026  
**Goal:** Test complete app functionality locally with Firebase Emulator (no cloud credits needed)

---

## Prerequisites

- ✅ Node.js / Bun installed
- ✅ Firebase CLI installed
- ✅ All credentials in `.env` and `.env.local`
- ✅ Dependencies installed (`npm install` / `bun install`)

---

## Setup & Startup (3 Terminals)

### Terminal 1: Firestore Emulator

```bash
cd backend
firebase emulators:start 
```

**Expected Output:**
```
⚠️  emulator not configured in firebase.json, using defaults
✔ firestore: listening on 127.0.0.1:8080
```

**If error:** Note the error and we'll debug together

---

### Terminal 2: Backend Server

```bash
cd backend
npm run dev
# or: bun run dev
```

**Expected Output:**
```
Server running on http://localhost:8080
Firestore connected to emulator at localhost:8080
```

---

### Terminal 3: Frontend (Next.js)

```bash
cd web
npm run dev
# or: bun run dev
```

**Expected Output:**
```
▲ Next.js 14.2
  Local:        http://localhost:3000
  Environments: .env.local
```

---

## Full Testing Flow

### 1. **Sign-In Flow** (Google OAuth)

**URL:** `http://localhost:3000`

- Click "Sign in with Google"
- Google popup opens
- Sign in with your test account
- Should redirect to `/board` (home)
- User state saved in browser

**Verify:** You should see:
- ✅ User profile icon (top right)
- ✅ Board list loads
- ✅ Can create new board

---

### 2. **Create & Load Board**

**On Home Page:**

- Click "Create Board"
- Enter board name: "Test Board"
- Click Create
- Should redirect to `/board/[id]`

**Verify in Browser DevTools:**
```javascript
// In console:
localStorage.getItem('board-state')
// Should show current board state
```

---

### 3. **Canvas System Testing**

### 3a. Create Nodes
- Click on canvas (TLDraw layer)
- Double-click to create text node
- Type: "Test Node"
- Press Enter

**Verify:**
- Node appears on canvas
- Can select and move
- Shows in React Flow graph

### 3b. Connect Nodes
- Create 2nd node: "Another Node"
- Double-click between nodes
- Drag connection line
- Should create edge

**Verify:**
```javascript
// In console:
JSON.parse(localStorage.getItem('board-state')).edges
// Should show connection
```

### 3c. Test Action Executor
- Send command: "highlight first node"
- Should flash with color
- Returns to normal

**Verify:** Color pulse animation plays

---

### 4. **Voice Input Testing**

**On Canvas Page:**

- Click the **Voice Orb** (purple circle, bottom right)
- **Orb changes color** (listening mode)
- **Speak:** "create a text node"
- Orb pulses while listening
- **Transcript appears** at top

**Verify in Console:**
```javascript
// In console:
// Should show transcript captured
```

---

### 5. **AI Planning & Actions**

**Via Voice (Recommended):**
- Click Voice Orb
- Speak: "create three nodes and connect them"
- Backend hits Gemini API
- **Actions execute on canvas:**
  - ✅ 3 nodes created
  - ✅ Connections drawn
  - ✅ Camera zooms to fit

**Verify:**
- All nodes appear
- Edges visible
- Camera repositions

---

### 6. **Store & Persistence Testing**

### 6a. LocalStorage
```javascript
// In console, check what's persisted:
localStorage.getItem('board-state')
localStorage.getItem('toast-state')
localStorage.getItem('board-list')
```

### 6b. Refresh & Restore
- Open DevTools Console
- Run: `localStorage.getItem('board-state')`
- **Note the nodes/edges**
- **Refresh page (F5)**
- **Canvas should restore exactly the same state**

**Verify:** No data loss on refresh

### 6c. Multiple Boards
- Create 2 boards: "Board A" and "Board B"
- Add different content to each
- Switch between them
- Each remembers its state

**Verify:**
```javascript
// In console:
localStorage.getItem(`board-state-boardA`)
localStorage.getItem(`board-state-boardB`)
```

---

### 7. **Firestore (Emulator) Testing**

### 7a. Save Board to Emulator

If backend has save endpoint, test it:

```bash
curl -X POST http://localhost:8080/api/boards/save \
  -H "Content-Type: application/json" \
  -d '{
    "boardId": "test-board-123",
    "name": "Test Board",
    "nodes": [...],
    "edges": [...]
  }'
```

### 7b. Check Emulator Data

**In Terminal 1 (Firestore Emulator):**
- Should log writes: `firestore:write`
- Data persists between refreshes

### 7c. View Emulator Data UI

Open: `http://localhost:4000/firestore`
- See collections
- Browse documents
- Verify saved boards

---

## Test Checklist

### ✅ Authentication
- [ ] Google Sign-in works
- [ ] User profile shows
- [ ] Sign-out works
- [ ] Auth token persists on refresh

### ✅ Canvas & Actions
- [ ] Create nodes
- [ ] Connect nodes
- [ ] Move nodes (smooth animation)
- [ ] Highlight action (color pulse)
- [ ] Zoom to fit
- [ ] Delete node/edge
- [ ] Undo/Redo (if implemented)

### ✅ Voice System
- [ ] Voice Orb responds to click
- [ ] Microphone activates (browser permission)
- [ ] Transcript appears
- [ ] Interim text shows while speaking
- [ ] Final transcript on pause

### ✅ AI Integration
- [ ] Voice → Gemini API → Actions
- [ ] Actions execute in correct order
- [ ] Camera syncs across layers
- [ ] Error handling if API fails

### ✅ Persistence
- [ ] LocalStorage saves on every change
- [ ] Refresh restores exact state
- [ ] Multiple boards isolated
- [ ] Firestore emulator stores data
- [ ] Data survives browser close/reopen

### ✅ UI/UX
- [ ] Dark theme applies
- [ ] Responsive layout
- [ ] Toast notifications work
- [ ] Error boundary catches crashes
- [ ] No console errors (except CORS if API down)

---

## Troubleshooting

### Firebase Emulator Won't Start
```bash
# Clear cache and try again
firebase emulators:start --only firestore --verbose

# If port 8080 in use:
lsof -i :8080  # Find process
kill -9 <PID>  # Kill it
```

### Backend Can't Connect to Emulator
**Check `.env`:**
```env
# When emulator is running:
FIRESTORE_EMULATOR_HOST=localhost:8080
```

### Voice Not Working
- Check browser permissions (chrome://settings/content/microphone)
- Refresh page
- Try different browser (Chrome/Edge are best)

### Canvas Actions Don't Execute
- Check backend logs (Terminal 2)
- Verify Gemini API key in `.env`
- Check browser console for errors

### Data Not Persisting
```javascript
// In console:
localStorage.clear()
// Then refresh and try again
```

---

## Advanced Testing

### Test Error Handling
- Disconnect backend (Ctrl+C in Terminal 2)
- Try creating node
- Should show toast error
- Reconnect backend
- Should work again

### Test Concurrent Users (Same Machine)
- Open `http://localhost:3000` in 2 browsers
- Sign in differently if possible
- Create boards on each
- Verify isolation

### Load Emulator UI
```
http://localhost:4000
```
- See all Firebase services
- Firestore section shows real data
- Watch writes happen in real-time

---

## Expected Performance

| Feature | Expected | Notes |
|---------|----------|-------|
| Node creation | <100ms | Instant feel |
| AI response | 2-5s | Gemini API latency |
| Canvas sync | <50ms | Smooth 60fps |
| Persistence | <10ms | LocalStorage |
| Emulator write | <200ms | Firestore emulator |

---

## When Ready for Production

Once you have cloud credits:
- Replace `FIRESTORE_EMULATOR_HOST` with real Firestore
- Add Cloud Run deployment
- Keep everything else the same
- Data migrates automatically

---

**Status:** Ready to test! Start with Terminal 1, then 2, then 3. Follow the flow above.
