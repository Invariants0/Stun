"use client";

import { useEffect, useRef } from "react";
import { useUIStore } from "@/store/ui.store";
import { SidePanelSection } from "./SidePanelSection";
import { SidePanelItem } from "./SidePanelItem";

// ─── Icons ────────────────────────────────────────────────────────────────────

const SparkleIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
  </svg>
);

const LayoutIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M9 3v18M3 9h6" />
  </svg>
);

const CircleIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8v4l3 3" />
  </svg>
);

const BrainIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.5 2a2.5 2.5 0 0 1 5 0" />
    <path d="M14.5 2c1.4 0 2.5 1.1 2.5 2.5 0 .5-.1 1-.4 1.4C17.8 6.5 19 7.9 19 9.5c0 1-.5 1.9-1.2 2.5.5.5.7 1.2.7 2 0 1.7-1.3 3-3 3h-7c-1.7 0-3-1.3-3-3 0-.8.3-1.5.7-2C5.5 11.4 5 10.5 5 9.5c0-1.6 1.2-3 2.9-3.1-.3-.4-.4-.9-.4-1.4C7.5 3.1 8.6 2 10 2" />
  </svg>
);

const ImageIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="9" cy="9" r="2" />
    <path d="m21 15-5-5L5 21" />
  </svg>
);

const LinkIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

const KeyboardIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="6" width="20" height="12" rx="2" />
    <path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M8 14h8" />
  </svg>
);

const NodeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="5" r="3" />
    <circle cx="5" cy="19" r="3" />
    <circle cx="19" cy="19" r="3" />
    <path d="M12 8v4M7.2 17.2l3.6-3.6M16.8 17.2l-3.6-3.6" />
  </svg>
);

const CloseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

const GridIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);

const SettingsIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
  </svg>
);

const DiagramIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="5" height="5" rx="1" />
    <rect x="16" y="3" width="5" height="5" rx="1" />
    <rect x="9.5" y="16" width="5" height="5" rx="1" />
    <path d="M5.5 8v3a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2V8M12 13v3" />
  </svg>
);

// ─── Component ────────────────────────────────────────────────────────────────

export function SidePanel() {
  const { isCommandPanelOpen, closeCommandPanel } = useUIStore();
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCommandPanel();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [closeCommandPanel]);

  return (
    <>
      {/* Invisible backdrop — click outside to close */}
      <div
        onClick={closeCommandPanel}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 1000,
          pointerEvents: isCommandPanelOpen ? "auto" : "none",
        }}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="STUN command panel"
        style={{
          position: "fixed",
          right: 16,
          top: 80,
          bottom: 16,
          width: 300,
          zIndex: 1001,
          display: "flex",
          flexDirection: "column",
          background: "rgba(255,255,255,0.97)",
          border: "1px solid rgba(15,23,42,0.08)",
          borderRadius: 16,
          boxShadow:
            "0 8px 32px rgba(15,23,42,0.1), 0 1px 4px rgba(15,23,42,0.06)",
          backdropFilter: "blur(20px)",
          overflow: "hidden",
          // Animation
          transform: isCommandPanelOpen
            ? "translateX(0) scale(1)"
            : "translateX(24px) scale(0.97)",
          opacity: isCommandPanelOpen ? 1 : 0,
          transition:
            "transform 0.22s cubic-bezier(0.22,1,0.36,1), opacity 0.16s ease",
          pointerEvents: isCommandPanelOpen ? "auto" : "none",
        }}
      >
        {/* ── Header ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 16px 12px",
            flexShrink: 0,
          }}
        >
          <div>
            <p
              style={{
                margin: 0,
                fontSize: "0.9375rem",
                fontWeight: 650,
                color: "#0f172a",
                letterSpacing: "-0.02em",
                fontFamily: "'Space Grotesk', sans-serif",
              }}
            >
              STUN
            </p>
            <p
              style={{
                margin: "1px 0 0",
                fontSize: "0.7rem",
                color: "#94a3b8",
                fontWeight: 450,
                letterSpacing: "-0.01em",
                fontFamily: "inherit",
              }}
            >
              The Infinite Canvas
            </p>
          </div>
          <button
            type="button"
            onClick={closeCommandPanel}
            aria-label="Close panel"
            style={{
              width: 28,
              height: 28,
              borderRadius: 7,
              border: "1px solid rgba(15,23,42,0.07)",
              background: "rgba(15,23,42,0.04)",
              color: "#64748b",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background 0.12s ease",
              flexShrink: 0,
            }}
          >
            <CloseIcon />
          </button>
        </div>

        {/* ── Divider ── */}
        <div
          style={{ height: 1, background: "rgba(15,23,42,0.06)", flexShrink: 0 }}
        />

        {/* ── Scrollable Content ── */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "8px 8px 4px",
          }}
        >
          {/* AI Tools */}
          <SidePanelSection title="AI Tools">
            <SidePanelItem
              label="Explain Canvas"
              icon={<BrainIcon />}
              badge="AI"
            />
            <SidePanelItem
              label="Organize Ideas"
              icon={<SparkleIcon />}
              badge="AI"
            />
            <SidePanelItem
              label="Generate Diagram"
              icon={<DiagramIcon />}
              badge="AI"
            />
            <SidePanelItem
              label="Summarize Nodes"
              icon={<CircleIcon />}
              badge="AI"
            />
          </SidePanelSection>

          {/* Canvas */}
          <SidePanelSection title="Canvas">
            <SidePanelItem label="Nodes" icon={<NodeIcon />} />
            <SidePanelItem label="Connections" icon={<LinkIcon />} />
            <SidePanelItem label="Layers" icon={<LayoutIcon />} />
            <SidePanelItem label="Layout Tools" icon={<GridIcon />} />
          </SidePanelSection>

          {/* Assets */}
          <SidePanelSection title="Assets">
            <SidePanelItem label="Images" icon={<ImageIcon />} />
            <SidePanelItem label="Links" icon={<LinkIcon />} />
          </SidePanelSection>

          {/* Settings */}
          <SidePanelSection title="Settings">
            <SidePanelItem
              label="Keyboard Shortcuts"
              icon={<KeyboardIcon />}
              shortcut="⌘/"
            />
            <SidePanelItem label="Preferences" icon={<SettingsIcon />} />
          </SidePanelSection>
        </div>

        {/* ── Footer ── */}
        <div
          style={{
            flexShrink: 0,
            padding: "10px 16px",
            borderTop: "1px solid rgba(15,23,42,0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span
            style={{
              fontSize: "0.6875rem",
              color: "#94a3b8",
              fontFamily: "inherit",
            }}
          >
            Powered by Gemini
          </span>
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontSize: "0.6875rem",
              color: "#22c55e",
              fontFamily: "inherit",
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#22c55e",
                display: "inline-block",
              }}
            />
            Connected
          </span>
        </div>
      </div>
    </>
  );
}
