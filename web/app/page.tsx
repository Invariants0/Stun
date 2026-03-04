"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function HomePage() {
  const router = useRouter();
  const [boardId, setBoardId] = useState("demo-board");

  const handleCreateBoard = () => {
    const newBoardId = `board-${Date.now()}`;
    router.push(`/board/${newBoardId}`);
  };

  const handleOpenBoard = () => {
    router.push(`/board/${boardId}`);
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        color: "#f1f5f9",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div style={{ maxWidth: 600, textAlign: "center" }}>
        <h1
          style={{
            fontSize: 64,
            fontWeight: 900,
            marginBottom: 16,
            background: "linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Stun
        </h1>
        
        <p
          style={{
            fontSize: 20,
            color: "#cbd5e1",
            marginBottom: 12,
            lineHeight: 1.6,
          }}
        >
          Spatial AI Thinking Environment
        </p>
        
        <p
          style={{
            fontSize: 14,
            color: "#94a3b8",
            marginBottom: 48,
            lineHeight: 1.6,
          }}
        >
          An infinite multimodal canvas where AI visually understands,
          organizes, and navigates knowledge. AI does not reply in text—AI
          navigates the canvas.
        </p>

        <div
          style={{
            background: "#1e293b",
            padding: 32,
            borderRadius: 12,
            border: "1px solid #334155",
            marginBottom: 32,
          }}
        >
          <h3 style={{ fontSize: 16, marginBottom: 24, color: "#e2e8f0" }}>
            Open a Board
          </h3>
          
          <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
            <input
              type="text"
              value={boardId}
              onChange={(e) => setBoardId(e.target.value)}
              placeholder="Enter board ID"
              style={{
                flex: 1,
                padding: "12px 16px",
                borderRadius: 8,
                border: "1px solid #475569",
                background: "#0f172a",
                color: "#f1f5f9",
                fontSize: 14,
              }}
            />
            <button
              onClick={handleOpenBoard}
              style={{
                padding: "12px 24px",
                borderRadius: 8,
                border: "none",
                background: "#3b82f6",
                color: "white",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Open
            </button>
          </div>

          <div style={{ fontSize: 12, color: "#64748b", marginBottom: 16 }}>
            or
          </div>

          <button
            onClick={handleCreateBoard}
            style={{
              padding: "12px 24px",
              borderRadius: 8,
              border: "1px solid #475569",
              background: "transparent",
              color: "#cbd5e1",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              width: "100%",
            }}
          >
            Create New Board
          </button>
        </div>

        <div
          style={{
            fontSize: 12,
            color: "#64748b",
            marginTop: 32,
          }}
        >
          <p style={{ marginBottom: 8 }}>🎨 Hybrid Canvas Architecture</p>
          <p>TLDraw + Excalidraw + React Flow</p>
        </div>
      </div>
    </main>
  );
}
