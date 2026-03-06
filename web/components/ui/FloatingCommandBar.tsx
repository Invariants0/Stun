"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useUIStore } from "@/store/ui.store";
import { useVoice } from "@/hooks/useVoice";

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
  boardId?: string;
};

export function FloatingCommandBar({ boardId }: Props) {
  const { isCommandPanelOpen, openCommandPanel, toggleCommandPanel } = useUIStore();
  const { listening, toggleListening, transcript } = useVoice();

  const [inputValue, setInputValue] = useState("");
  const [hovered, setHovered] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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
      if (!inputValue.trim()) return;
      // Command send — wired to AI planner in next stage
      console.log("[STUN] Command:", inputValue, "BoardId:", boardId);
      setInputValue("");
    },
    [inputValue, boardId]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && inputValue.trim()) {
        console.log("[STUN] Command:", inputValue, "BoardId:", boardId);
        setInputValue("");
      }
      // Stop Esc from bubbling to SidePanel close when typing
      if (e.key === "Escape") {
        e.currentTarget.blur();
      }
    },
    [inputValue, boardId]
  );

  return (
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
        onClick={(e) => e.stopPropagation()}
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

      {/* ── Center: text input ── */}
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
            aria-label="Send command"
            onClick={handleSend}
            style={{
              width: 28,
              height: 28,
              borderRadius: 100,
              border: "none",
              background: "#0f172a",
              color: "#fff",
              cursor: "pointer",
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
  );
}
