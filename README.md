

# 🎨 Stun — Spatial AI Thinking Environment

> **Stop typing. Start thinking visually.** 
> 
> An infinite canvas where Google Gemini AI directly navigates, organizes, and transforms your thoughts in real-time.

<p align="center">

[![MIT License](https://img.shields.io/badge/License-MIT-blue?style=flat)](LICENSE)
[![Status: Live](https://img.shields.io/badge/Status-Live-green?style=flat)](https://stun-frontend-dev-279596491182.us-central1.run.app)
[![Gemini 2.5](https://img.shields.io/badge/AI-Gemini%202.5-red?style=flat&logo=google)](https://ai.google.dev/)
[![Google Cloud](https://img.shields.io/badge/Cloud-Google%20Cloud-4285F4?style=flat&logo=googlecloud)](https://cloud.google.com/)

</p>

## Built With

- **Language:** TypeScript
- **Frontend:** Next.js, React, Zustand
- **Canvas:** TLDraw, Excalidraw, React Flow
- **AI:** Google Gemini 2.5 Flash (GenAI SDK)
- **Backend:** Node.js, Express, Firebase Admin
- **Database:** Firestore
- **Cloud:** Google Cloud Run, Secret Manager, Artifact Registry
- **Infrastructure:** Terraform
- **Voice:** Web Speech API

---

## 📑 Table of Contents

- [🎯 The Problem](#-the-problem)
- [✨ What is Stun?](#-what-is-stun)
- [🚀 Key Features](#-key-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [🎓 Why Gemini 2.5 Flash?](#-why-gemini-25-flash)
- [🚀 Getting Started](#-getting-started)
- [📖 Usage Guide](#-usage-guide)
- [🏗️ Architecture](#️-architecture)
- [🧪 Testing & QA](#-testing--qa)
- [☁️ Google Cloud Deployment](#️-google-cloud-deployment)
- [📊 Performance](#-performance)
- [🔐 Security](#-security)
- [📚 Documentation](#-documentation)
- [🤝 Contributing](#-contributing)
- [📈 Impact & Learning](#-impact--learning)
- [🏆 Hackathon Category](#-hackathon-category)
- [🎥 Demo & Resources](#-demo--resources)

---

---

## 🎯 Quick Start

### 🚀 Try It Live Now
👉 **[Open Stun Live App](https://stun-frontend-dev-279596491182.us-central1.run.app)** (Google Cloud hosted | Real-time deployment)

### 📋 Local Development (3 Commands)

```bash
# Terminal 1: Firestore Emulator
cd backend && firebase emulators:start --only firestore --project stun-489205

# Terminal 2: Backend API
cd backend && bun install && bun run dev

# Terminal 3: Frontend App  
cd web && bun install && bun run dev
```

**Windows?** Single command:
```powershell
.\scripts\start-dev.ps1
```

---

## 🎯 The Problem

Traditional AI is **text-in, text-out**. You type. It responds. You're stuck in a chat box.

But thinking isn't linear. It's spatial. Visual. Interconnected.

**Stun reimagines AI interaction** — instead of receiving text responses, AI visually understands your canvas, interprets spatial relationships, and directly navigates your workspace. Every command becomes a visual transformation.

---

## ✨ What is Stun?

**Stun** is a **UI Navigator** that blends three synchronized canvas layers into one intelligent workspace:

```
🎨 Layer 1: TLDraw          → Infinite pan/zoom workspace
📐 Layer 2: Excalidraw      → Visual shapes & diagrams  
🧠 Layer 3: React Flow      → AI-readable knowledge graph
```

### How It Works

1. **You speak or type** a command  
   *Example: "Turn this into a roadmap"*

2. **Gemini sees your canvas** (screenshot + structured node data)

3. **AI plans actions** (move, create, group, connect, zoom)

4. **Actions execute live** on your canvas

5. **Your board transforms** in real-time

**No chat box. No back-and-forth. Pure visual interaction.**

---

## 🚀 Key Features

### 🧠 Visual AI Understanding
- **Multimodal Context**: Gemini analyzes both canvas screenshots AND structured node data
- **Spatial Reasoning**: AI understands relationships, distances, and hierarchies
- **Action Planning**: Generates executable, validated command sequences

### 🎮 Hybrid Canvas Architecture
- **Infinite Workspace**: Pan/zoom with TLDraw's operating system layer
- **Visual Tools**: Draw, shape, annotate with Excalidraw
- **Knowledge Graph**: React Flow nodes/edges for AI-readable logic

### 🗣️ Natural Interaction
- **Voice Commands**: Web Speech API integration
- **Text Input**: Type or speak your intent
- **Real-Time Execution**: Watch AI transform your canvas live

### 🤝 Real-Time Collaboration
- **Live Presence**: See who's editing (active user tracking)
- **Shared Boards**: Invite collaborators for joint thinking
- **Instant Sync**: All changes sync across users via Firestore

### 💾 Persistent & Offline-First
- **Auto-Save**: Every action auto-saved to Firestore (debounced 3s)
- **Recovery**: Resume work instantly, even after browser restart
- **Conflict-Free**: Last-write-wins strategy with Firestore timestamps

### 🔒 Enterprise Security
- **OAuth 2.0**: Google authentication (no passwords)
- **JWT Tokens**: Firebase ID tokens with 1-hour expiry, auto-renewal
- **Access Control**: Firestore rules enforce user-scoped read/write
- **Secrets Management**: API keys in Google Secret Manager (not in code)

---

## 🛠️ Tech Stack

### 🎨 Frontend
- **Framework**: Next.js 14 (App Router, TypeScript)
- **State**: Zustand (lightweight, autosave-friendly)
- **Canvas Engines**:
  - 🎨 TLDraw 2.4.6 (infinite workspace)
  - 📐 Excalidraw 0.17.6 (visual editing)
  - 🧠 React Flow 11.11.4 (knowledge graph)
- **Voice**: Web Speech API
- **Screenshots**: html2canvas
- **Styling**: SCSS
- **Storage**: Firebase SDK + localStorage

### 🔧 Backend
- **Runtime**: Node.js 20+
- **Framework**: Express.js 5 (TypeScript)
- **AI Model**: Google Gemini 2.5 Flash (via Google GenAI SDK)
- **Database**: Firestore (NoSQL, real-time listeners)
- **Authentication**: Firebase Admin SDK
- **Validation**: Zod (type-safe runtime checks)
- **Logging**: Winston

### ☁️ Google Cloud Stack
- **Compute**: Cloud Run (auto-scaling containers)
- **Database**: Firestore (NoSQL, real-time)
- **Secrets**: Secret Manager (API key storage)
- **Registry**: Artifact Registry (container images)
- **Terraform**: Infrastructure as Code

### 📦 Deployment
- **Container**: Docker (separate images for backend & frontend)
- **Orchestration**: Terraform (6+ modules for GCP resources)
- **CI/CD**: GitHub Actions → Artifact Registry → Cloud Run
- **Region**: us-central1 (multi-zone availability)

---

## 🎓 Why Gemini 2.5 Flash?

| Capability | Why It's Perfect |
|-----------|------------------|
| **Multimodal** | Understands screenshots + text context together |
| **Spatial Reasoning** | Interprets node positions, connections, grouping |
| **Speed** | 100-500ms inference (real-time response) |
| **Cost** | Fast models = lower bill per 1M tokens |
| **JSON Output** | Native structured response (easy validation) |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 20+ ([download](https://nodejs.org))
- **Bun** ([install](https://bun.sh)) or npm/yarn
- **Google Cloud Account** ([free tier eligible](https://cloud.google.com/free))
- **Gemini API Key** ([get free here](https://aistudio.google.com/app/apikey))
- **Firebase Project** ([create one](https://console.firebase.google.com))

### Installation (Full Setup)

**Step 1: Clone Repository**
```bash
git clone https://github.com/Invariants0/Stun.git
cd Stun
```

**Step 2: Backend Setup**
```bash
cd backend
cp .env.example .env.local

# Edit .env.local and add:
# GEMINI_API_KEY=your_key_here
# GCP_PROJECT_ID=stun-489205
# FIREBASE_SERVICE_ACCOUNT_KEY=<JSON from Firebase>

bun install
bun run dev
# Backend runs on http://localhost:8080
```

**Step 3: Frontend Setup**
```bash
cd ../web
cp .env.example .env.local

# Edit .env.local and add Firebase config:
# NEXT_PUBLIC_FIREBASE_API_KEY=...
# NEXT_PUBLIC_FIREBASE_PROJECT_ID=...

bun install
bun run dev
# Frontend runs on http://localhost:3000 → /board/demo-board
```

**Step 4: Firestore Emulator** (in separate terminal)
```bash
cd backend
firebase emulators:start --only firestore --project stun-489205
```

✅ **You're ready!** Open [http://localhost:3000/board/demo-board](http://localhost:3000/board/demo-board)

---

## 📖 Usage Guide

### 1. Open a Board
```
http://localhost:3000/board/demo-board
```

### 2. Draw & Create Nodes
- Use Excalidraw tools to draw shapes
- Click to create React Flow nodes
- Connect nodes with edges

### 3. Issue a Command
- **Voice**: Click the mic 🎤 button, speak your intent
- **Text**: Type in the floating command bar (`Ctrl+K` to focus)

### 4. Watch AI Transform
Gemini analyzes your canvas + command, then executes actions live:
- Move nodes
- Create new nodes
- Group related elements
- Connect nodes with edges
- Zoom to focus areas

### 5. Collaborate
- Invite collaborators via share button
- See active users in real-time
- All changes sync instantly

---

## 🏗️ Architecture

```
USER BROWSER
    ↓
NEXT.JS FRONTEND (Hybrid Canvas)
    ↓ HTTP REST + Firebase JWT
CLOUD RUN BACKEND (Express.js)
    ├─ Intent Parser (command type detection)
    ├─ Orchestrator (spatial context builder)
    ├─ Gemini Service (AI coordination)
    ├─ Board Service (CRUD)
    ├─ Presence Service (collaboration)
    └─ Auth Middleware (JWT validation)
    ↓
GOOGLE GEMINI 2.5 FLASH (AI Planning)
    ↓ JSON Action Plan
FIRESTORE DATABASE
    ├─ boards (canvas state)
    └─ board_presence (active users)
```

**Full Architecture Diagram**: See [ARCHITECTURE.md](ARCHITECTURE.md)

---

## 🧪 Testing & QA

### Test the AI Pipeline
```bash
cd backend
bun test tests/gemini/gemini-connectivity.test.ts
bun test tests/gemini/gemini-actions.test.ts
```

### Test Board Persistence
```bash
cd backend
bun test tests/firestore.test.ts
```

### Test Health Check
```bash
curl http://localhost:8080/health
```

### Integration Test (E2E)
```bash
cd backend
bun test tests/ai.test.ts
```

---

## ☁️ Google Cloud Deployment

### 1. Prerequisites
```bash
gcloud auth login
gcloud config set project stun-489205
terraform --version  # >= 1.5.0
```

### 2. Deploy Infrastructure
```bash
cd infra/environments/dev
terraform init
terraform plan
terraform apply
```

### 3. Build & Deploy Services
```bash
cd infra
./scripts/deploy.ps1  # Windows
./scripts/deploy.sh   # macOS/Linux
```

### 4. View Live App
```
https://stun-frontend-dev-279596491182.us-central1.run.app
```

### 5. Monitor Logs
```bash
gcloud run logs read stun-backend-dev --limit=100
gcloud run logs read stun-frontend-dev --limit=100
```

**Proof of GCP Deployment**: 
- ✅ Live app: [stun-frontend-dev](https://stun-frontend-dev-279596491182.us-central1.run.app)
- ✅ IaC code: [infra/modules/](infra/modules/)
- ✅ Terraform configs: Cloud Run, Firestore, Secret Manager, Artifact Registry

---

## 📊 Performance

| Metric | Value | Notes |
|--------|-------|-------|
| **Canvas Interaction** | <16ms | 60fps rendering |
| **Screenshot Capture** | 100-300ms | html2canvas |
| **Gemini API Call** | 200-800ms | LLM inference |
| **Firestore Write** | 50-200ms | Network I/O |
| **Full AI Cycle** | 500-1500ms | End-to-end command execution |

**Optimizations**:
- Debounced auto-save (3s) reduces write load
- Optimistic UI updates before persistence
- 3-layer canvas render optimization with requestAnimationFrame
- Firestore real-time listeners for sub-second collaboration sync

---

## 🔐 Security

### Authentication & Authorization
- ✅ Google OAuth 2.0 for login
- ✅ Firebase JWT tokens (1-hour TTL, auto-refresh)
- ✅ Backend validates every request token
- ✅ Firestore rules scoped to user ID

### Data Protection
- ✅ Secrets in Google Secret Manager (not in code)
- ✅ HTTPS enforced (Cloud Run default)
- ✅ httpOnly cookies (XSS-resistant)
- ✅ CORS whitelist for frontend domain

### Input Validation
- ✅ Zod schemas validate all API requests
- ✅ Zod validates Gemini JSON responses (prevents hallucinations)
- ✅ Position sanitization prevents out-of-bounds node placement
- ✅ Rate limiting (express-rate-limit)

---

## 📚 Documentation

| 📄 Document | 📝 Purpose | 🔗 Link |
|-----------|---------|--------|
| **Architecture Overview** | Complete system design & data flow | [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) |
| **Canvas System** | 3-layer hybrid canvas synchronization | [docs/Canvas-system.md](docs/Canvas-system.md) |
| **Product Requirements** | Feature specifications & roadmap | [docs/PRD.md](docs/PRD.md) |
| **Deployment Runbook** | GCP deployment procedures | [DEPLOY.md](DEPLOY.md) |
| **Local Testing Guide** | Development setup & troubleshooting | [LOCAL_TESTING_GUIDE.md](LOCAL_TESTING_GUIDE.md) |

---

## 🤝 Contributing

We welcome contributions! To contribute:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m "Add your feature"`
4. Push branch: `git push origin feature/your-feature`
5. Open a Pull Request

**Code Standards**:
- TypeScript (strict mode)
- ESLint + Prettier for formatting
- Zod for runtime validation
- Tests for new features (Bun test)

---


## 📈 Impact & Learning

### What We Built
A production-grade spatial AI thinking environment that proves AI can go beyond chat. Instead of responding in text, our AI **visually navigates** your workspace.

### Key Learnings
1. **Gemini's Multimodal Power**: Screenshots + structured text data = richer AI understanding
2. **Real-Time Interaction UX**: Users expect <1s response times for AI actions
3. **Hybrid Architecture Complexity**: Syncing 3 canvas layers requires careful state management
4. **Firestore at Scale**: 1MB document limits force creative data structuring
5. **Spatial Reasoning Challenge**: Teaching AI to understand coordinates & layouts is non-trivial

### Use Cases Beyond Demo
- 📋 **Project Management**: Visual task boards with AI auto-organization
- 🧠 **Brainstorming**: Mind maps that AI helps structure
- 🎨 **Design Thinking**: Collaboration boards with AI layout assistance
- 📊 **Data Visualization**: Charts that AI reorganizes based on insights
- 🧑‍🎓 **Education**: Interactive learning spaces with AI mentoring

---

## 🏆 Hackathon Category

**Category**: UI Navigator ☸️  
**Challenge**: Build an agent that visually understands UI and performs actions based on intent

**How Stun Qualifies**:
- ✅ **Visual UI Understanding**: Gemini analyzes canvas screenshots
- ✅ **Multimodal Input**: Images (screenshots) + text (commands) + structured data (nodes)
- ✅ **Executable Actions**: AI outputs validated, sanitized actions that execute on canvas
- ✅ **Real-Time Interaction**: Sub-2-second command-to-execution cycle
- ✅ **Live Deployment**: Production-grade app running on Google Cloud

---

---

## 📞 Support & Community

**Need help?** Check these resources:

| 💬 Channel | 🔗 Link | 📌 For |
|-----------|--------|--------|
| 🐛 **Issues** | [github.com/.../Stun/issues](https://github.com/Invariants0/Stun/issues) | Bug reports & feature requests |
| 💡 **Discussions** | [github.com/.../Stun/discussions](https://github.com/Invariants0/Stun/discussions) | Questions & ideas |
| 📖 **Code** | [github.com/Invariants0/Stun](https://github.com/Invariants0/Stun) | Source + PRs |
| 🏆 **Hackathon** | [devpost.com/.../stun-7ct2km](https://devpost.com/software/stun-7ct2km) | Submission details |

---

## 📄 License & Acknowledgments

**License**: MIT — See [LICENSE](LICENSE)

**Built With** ❤️ by a passionate team using:
- **Google Gemini** — Multimodal AI powerhouse
- **Google Cloud Platform** — Production infrastructure
- **Open Source** — TLDraw, Excalidraw, React Flow, Next.js, Express, Bun

---

## 🎥 Live Demo & Resources

<div align="center">

### Quick Links

[![🚀 Open App](https://img.shields.io/badge/Open-Live%20Demo-brightgreen?style=flat)](https://stun-frontend-dev-279596491182.us-central1.run.app)
[![📖 GitHub](https://img.shields.io/badge/GitHub-View%20Code-black?style=flat&logo=github)](https://github.com/Invariants0/Stun)
[![🏗️ Docs](https://img.shields.io/badge/Docs-Architecture-blue?style=flat)](docs/ARCHITECTURE.md)
[![🏆 Devpost](https://img.shields.io/badge/Hackathon-Devpost-purple?style=flat)](https://devpost.com/software/stun-7ct2km)

### Built With

![Gemini 2.5](https://img.shields.io/badge/Gemini%202.5-red?style=flat&logo=google)
![Next.js 14](https://img.shields.io/badge/Next.js%2014-black?style=flat&logo=nextdotjs)
![Express](https://img.shields.io/badge/Express-gray?style=flat&logo=express)
![Firestore](https://img.shields.io/badge/Firestore-orange?style=flat&logo=firebase)
![Cloud Run](https://img.shields.io/badge/Cloud%20Run-4285F4?style=flat&logo=googlecloud)

---

### 💫 Made for Hackathon

Gemini Live Agent Challenge 2026 — Transforming spatial thinking into visual reality

[![Devpost](https://img.shields.io/badge/🏆%20Devpost-Submission-purple?style=flat)](https://devpost.com/software/stun-7ct2km)

</div>
