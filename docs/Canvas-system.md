# Stun Canvas System Architecture

## Hybrid Canvas: Excalidraw + TLDraw + React Flow

This document defines the **canvas architecture and implementation strategy for Stun**, combining three specialized engines:

* **Excalidraw** → User Interface & Visual Editing
* **TLDraw** → Infinite Workspace & Camera System
* **React Flow** → Structured Knowledge Graph Engine

The goal is to create a **spatial AI environment** where users freely create ideas visually while AI manipulates structured knowledge nodes.

---

# 1. Architecture Overview

Stun uses a **multi-layer canvas architecture** where each engine is responsible for a specific interaction domain.

```
User Interaction Layer
        │
        ▼
Excalidraw UI Layer
        │
        ▼
TLDraw Workspace Layer
        │
        ▼
React Flow Graph Engine
        │
        ▼
AI Action System
        │
        ▼
Gemini Multimodal Reasoning
```

Each layer performs a **distinct function** to prevent architectural conflicts.

---

# 2. Responsibility Breakdown

## 2.1 Excalidraw – UI Interaction Layer

Excalidraw is responsible for the **primary user-facing interface and editing tools**.

Responsibilities:

* Canvas UI controls
* Drawing tools
* Shapes
* Text editing
* Frames
* Arrows and connectors
* Sticky notes
* Diagram blocks
* Mermaid diagram rendering
* Text → Diagram generation
* Element selection and editing

Supported elements include:

```
rectangle
ellipse
arrow
line
text
image
frame
```

Excalidraw provides the **clean visual design and intuitive editing experience** used by the user.

It acts as the **creative visual layer of the workspace.**

---

## 2.2 TLDraw – Infinite Workspace Engine

TLDraw is used as the **canvas infrastructure layer** responsible for spatial navigation.

Responsibilities:

* Infinite canvas
* Pan and zoom control
* Camera transformations
* Canvas coordinate system
* Workspace navigation
* Canvas viewport state
* Workspace event system

TLDraw effectively acts as the **canvas operating system**.

It manages the global workspace where all visual and structured objects exist.

---

## 2.3 React Flow – Knowledge Graph Engine

React Flow manages **structured objects that AI can reason about and manipulate.**

Responsibilities:

* Knowledge nodes
* Graph relationships
* Edge connections
* Node metadata
* Node positioning
* Layout algorithms
* AI-driven node transformations

Example node structure:

```
Node
 ├─ id
 ├─ position
 ├─ type
 ├─ metadata
 └─ relationships
```

React Flow acts as the **machine-readable knowledge graph** behind the canvas.

---

# 3. Layered Canvas Model

```
┌──────────────────────────────────────────┐
│ TLDraw Infinite Workspace                │
│                                          │
│   ┌──────────────────────────────────┐   │
│   │ Excalidraw Visual Editing Layer │   │
│   │                                  │  │
│   │   rectangles, arrows, notes      │  │
│   │   diagrams, sketches             │  │
│   └──────────────────────────────────┘   │
│                                          │
│   ┌──────────────────────────────────┐   │
│   │ React Flow Graph Layer          │   │
│   │                                  │  │
│   │  Idea Node ── Concept Node       │  │
│   │      │                           │  │
│   │   Summary Node                   │  │
│   └──────────────────────────────────┘   │
│                                          │
└──────────────────────────────────────────┘
```

---

# 4. Data Ownership Model

Each system owns its own data model.

| Engine     | Owns                        |
| ---------- | --------------------------- |
| Excalidraw | drawing elements            |
| TLDraw     | canvas state & viewport     |
| React Flow | nodes & graph relationships |

Data synchronization happens through **mapping layers.**

---

# 5. Element–Node Mapping

Each visual element corresponds to a structured graph node.

Example mapping:

```
Excalidraw Rectangle
        │
        ▼
React Flow IdeaNode
```

Example mapping record:

```
{
  excalidrawElementId: "shape-21",
  reactFlowNodeId: "node-5"
}
```

This allows AI to manipulate nodes while preserving the visual representation.

---

# 6. AI Interaction Flow

Example user command:

> “Convert these ideas into a roadmap.”

Processing pipeline:

```
Voice Command
      │
      ▼
Canvas Screenshot
      │
      ▼
Gemini Multimodal Model
      │
      ▼
Structured Action Plan
      │
      ▼
React Flow Graph Updates
      │
      ▼
Visual Update on Canvas
```

AI modifies the **React Flow graph**, which updates the canvas representation.

---

# 7. Screenshot Pipeline

AI requires full spatial context.

The system captures a screenshot of the entire canvas container.

```
TLDraw workspace
+ Excalidraw elements
+ React Flow nodes
```

Example implementation:

```javascript
html2canvas(document.getElementById("canvas-root"))
```

The image is sent to Gemini for multimodal reasoning.

---

# 8. AI Action Model

Example AI response:

```
{
  "actions": [
    {
      "type": "move",
      "nodeId": "node-3",
      "to": { "x": 420, "y": 180 }
    },
    {
      "type": "connect",
      "source": "node-3",
      "target": "node-7"
    }
  ]
}
```

Allowed actions include:

```
move
connect
highlight
zoom
group
cluster
```

React Flow executes the graph changes.

---

# 9. Canvas Synchronization

Viewport synchronization ensures all layers move together.

Camera updates propagate as follows:

```
TLDraw Camera
     │
     ▼
React Flow Viewport
     │
     ▼
Excalidraw Canvas Transform
```

This keeps all objects aligned spatially.

---

# 10. Canvas Root Component

System structure:

```
CanvasRoot
│
├── TLDrawWorkspace
│
├── ExcalidrawLayer
│
├── ReactFlowGraphEngine
│
└── AIController
```

Layer stacking uses absolute positioning.

---

# 11. Technology Stack

## Frontend Libraries

```
tldraw
reactflow
@excalidraw/excalidraw
zustand
html2canvas
tailwindcss
axios
```

## Backend Libraries

```
express
@google/generative-ai
firebase-admin
zod
```

---

# 12. AI Control System

The AI controller coordinates:

* voice commands
* canvas screenshot capture
* Gemini API requests
* action plan validation
* node execution

---

# 13. Benefits of the Hybrid Architecture

### Best User Interface

Excalidraw provides a beautiful and intuitive editing experience.

### Infinite Workspace

TLDraw provides robust canvas navigation.

### Structured AI Reasoning

React Flow provides machine-readable graph structure.

### Multimodal Intelligence

Gemini interprets spatial layouts and content.

---

# 14. Challenges

The hybrid architecture introduces complexity in:

* camera synchronization
* event propagation
* element-to-node mapping
* layered rendering

These challenges must be carefully managed.

---

# 15. Future Extensions

Possible future improvements include:

* collaborative editing
* semantic node clustering
* AI-generated diagrams
* workflow automation
* plugin architecture
* canvas history replay

---

# Final Summary

Stun combines three powerful canvas technologies:

* **Excalidraw** for visual interaction and diagrams
* **TLDraw** for infinite canvas navigation
* **React Flow** for structured knowledge graph management

Together they create a **spatial AI environment where ideas can be freely expressed and intelligently organized by AI.**
