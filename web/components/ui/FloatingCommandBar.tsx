"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useUIStore } from "@/store/ui.store";
import { useVoice } from "@/hooks/useVoice";
import { usePlanAndExecute } from "@/hooks/usePlanAndExecute";
import { useBoardStore } from "@/store/board.store";
import { useBoard } from "@/hooks/useBoard";

// ─── Icons ────────────────────────────────────────────────────────────────────

const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M12 5v14M5 12h14" />
  </svg>
);

const MicIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="22" />
    <line x1="8" y1="22" x2="16" y2="22" />
  </svg>
);

const AIIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
  </svg>
);

const SendIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 2L11 13" />
    <path d="M22 2L15 22l-4-9-9-4 20-7z" />
  </svg>
);

// ─── Component ────────────────────────────────────────────────────────────────

type Props = {
  boardId: string;
};

export function FloatingCommandBar({ boardId }: Props) {
  const { isCommandPanelOpen, openCommandPanel, toggleCommandPanel } = useUIStore();
  const { listening, toggleListening, transcript } = useVoice();
  const { execute, isPlanning } = usePlanAndExecute(boardId);
  const appendNode = useBoardStore((s) => s.appendNode);
  const getBoard = useBoardStore((s) => s.getBoard);
  // useBoard requires a defined boardId; it should always be provided by the parent
  const { setNodes } = useBoard(boardId);

  const [inputValue, setInputValue] = useState("");
  const [hovered, setHovered] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAddNode = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!boardId) return;
      const board = getBoard(boardId);
      const existingCount = board?.reactflow.nodes.length ?? 0;
      const col = existingCount % 5;
      const row = Math.floor(existingCount / 5);
      const newNode = {
        id: `node-${Date.now()}`,
        type: "text",
        position: { x: 80 + col * 200, y: 80 + row * 120 },
        data: { label: "New node" },
      };
      // update React Flow local state so it appears immediately
      setNodes((nodes) => [...nodes, newNode]);
      // also persist to store/autosave
      appendNode(boardId, newNode);
    },
    [boardId, appendNode, getBoard, setNodes]
  );

  // Sync voice transcript into the input field
  useEffect(() => {
    if (transcript) {
      setInputValue(transcript);
    }
  }, [transcript]);

  // ⌘K / Ctrl+K global shortcut to open/close
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        toggleCommandPanel();
        if (!isCommandPanelOpen) {
          setTimeout(() => inputRef.current?.focus(), 50);
        }
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [toggleCommandPanel, isCommandPanelOpen]);

  const handleBarClick = useCallback(() => {
    openCommandPanel();
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [openCommandPanel]);

  const handleInputFocus = useCallback(() => {
    openCommandPanel();
  }, [openCommandPanel]);

  const handleMicClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      toggleListening();
    },
    [toggleListening]
  );

  const handleSend = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!inputValue.trim() || isPlanning) return;
      const cmd = inputValue;
      setInputValue("");
      execute(cmd);
    },
    [inputValue, isPlanning, execute]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && inputValue.trim() && !isPlanning) {
        const cmd = inputValue;
        setInputValue("");
        execute(cmd);
      }
      // Stop Esc from bubbling to SidePanel close when typing
      if (e.key === "Escape") {
        e.currentTarget.blur();
      }
    },
    [inputValue, isPlanning, execute]
  );

  return (
    <>
      <div
        role="search"
        aria-label="STUN command bar"
        onClick={handleBarClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          position: "fixed",
          bottom: 24,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 1002,
          // pill container
          display: "flex",
          alignItems: "center",
          gap: 0,
          height: 44,
          minWidth: 420,
          maxWidth: 560,
          background: hovered
            ? "rgba(255,255,255,1)"
            : "rgba(255,255,255,0.92)",
          border: `1px solid ${isCommandPanelOpen ? "rgba(15,23,42,0.16)" : "rgba(15,23,42,0.09)"}`,
          borderRadius: 100,
          boxShadow: hovered
            ? "0 6px 24px rgba(15,23,42,0.12), 0 1px 4px rgba(15,23,42,0.06)"
            : "0 2px 12px rgba(15,23,42,0.07), 0 1px 3px rgba(15,23,42,0.04)",
          backdropFilter: "blur(16px)",
          cursor: "text",
          transition:
            "box-shadow 0.15s ease, border-color 0.15s ease, background 0.12s ease",
          userSelect: "none",
          padding: "0 8px 0 4px",
        }}
      >
      {/* ── Left: + button ── */}
      <button
        type="button"
        aria-label="Add node"
        onClick={handleAddNode}
        style={{
          width: 32,
          height: 32,
          borderRadius: 100,
          border: "none",
          background: "transparent",
          color: "#475569",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          transition: "background 0.1s ease, color 0.1s ease",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = "rgba(15,23,42,0.06)";
          (e.currentTarget as HTMLButtonElement).style.color = "#0f172a";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = "transparent";
          (e.currentTarget as HTMLButtonElement).style.color = "#475569";
        }}
      >
        <PlusIcon />
      </button>

      {/* ── Center: text input or processing message ── */}
      {isPlanning ? (
        <div
          style={{
            flex: 1,
            height: "100%",
            display: "flex",
            alignItems: "center",
            fontSize: "0.8125rem",
            color: "#64748b",
            fontFamily: "'Space Grotesk', Inter, sans-serif",
            fontWeight: 450,
            letterSpacing: "-0.01em",
            padding: "0 4px",
            gap: "4px",
          }}
        >
          <span>Generating</span>
          <span style={{ animation: "dotBlink1 1.4s ease-in-out infinite" }}>.</span>
          <span style={{ animation: "dotBlink2 1.4s ease-in-out infinite" }}>.</span>
          <span style={{ animation: "dotBlink3 1.4s ease-in-out infinite" }}>.</span>
        </div>
      ) : (
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          onClick={(e) => e.stopPropagation()}
          placeholder={listening ? "Listening…" : "Message STUN"}
          aria-label="Command input"
          style={{
            flex: 1,
            height: "100%",
            border: "none",
            outline: "none",
            background: "transparent",
            fontSize: "0.8125rem",
            color: "#0f172a",
            fontFamily: "'Space Grotesk', Inter, sans-serif",
            fontWeight: 450,
            letterSpacing: "-0.01em",
            caretColor: "#2563eb",
            cursor: "text",
            padding: "0 4px",
          }}
        />
      )}

      {/* ── Right section ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          flexShrink: 0,
        }}
      >
        {/* Status dot */}
        <span
          title="Connected"
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: "#22c55e",
            marginRight: 4,
            boxShadow: "0 0 0 2px rgba(34,197,94,0.2)",
          }}
        />

        {/* Send button — visible when there's input */}
        {inputValue.trim() && (
          <button
            type="button"
            aria-label={isPlanning ? "Planning…" : "Send command"}
            disabled={isPlanning}
            onClick={handleSend}
            style={{
              width: 28,
              height: 28,
              borderRadius: 100,
              border: "none",
              background: isPlanning ? "#94a3b8" : "#0f172a",
              color: "#fff",
              cursor: isPlanning ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background 0.12s ease",
            }}
          >
            <SendIcon />
          </button>
        )}

        {/* AI icon */}
        {!inputValue.trim() && (
          <button
            type="button"
            aria-label="AI assistant"
            onClick={(e) => {
              e.stopPropagation();
              toggleCommandPanel();
            }}
            style={{
              width: 28,
              height: 28,
              borderRadius: 100,
              border: "none",
              background: "transparent",
              color: "#475569",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background 0.12s ease, color 0.12s ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(15,23,42,0.06)";
              (e.currentTarget as HTMLButtonElement).style.color = "#0f172a";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "transparent";
              (e.currentTarget as HTMLButtonElement).style.color = "#475569";
            }}
          >
            <AIIcon />
          </button>
        )}

        {/* Mic icon */}
        <button
          type="button"
          aria-label={listening ? "Stop recording" : "Start voice input"}
          onClick={handleMicClick}
          style={{
            width: 28,
            height: 28,
            borderRadius: 100,
            border: "none",
            background: listening ? "rgba(220,38,38,0.08)" : "transparent",
            color: listening ? "#dc2626" : "#475569",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "background 0.12s ease, color 0.12s ease",
            animation: listening ? "micPulse 1.2s ease-in-out infinite" : undefined,
          }}
          onMouseEnter={(e) => {
            if (!listening) {
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(15,23,42,0.06)";
              (e.currentTarget as HTMLButtonElement).style.color = "#0f172a";
            }
          }}
          onMouseLeave={(e) => {
            if (!listening) {
              (e.currentTarget as HTMLButtonElement).style.background = "transparent";
              (e.currentTarget as HTMLButtonElement).style.color = "#475569";
            }
          }}
        >
          <MicIcon />
        </button>
      </div>
    </div>
      <style>{`
      @keyframes dotBlink1 {
        0%, 10%, 100% { opacity: 0.3; }
        50% { opacity: 1; }
      }
      @keyframes dotBlink2 {
        0%, 10%, 100% { opacity: 0.3; }
        33% { opacity: 0.3; }
        60% { opacity: 1; }
      }
      @keyframes dotBlink3 {
        0%, 10%, 100% { opacity: 0.3; }
        66% { opacity: 0.3; }
        80% { opacity: 1; }
      }
      @keyframes micPulse {
        0% { opacity: 1; }
        50% { opacity: 0.6; }
        100% { opacity: 1; }
      }
    `}</style>
  </>
);}
