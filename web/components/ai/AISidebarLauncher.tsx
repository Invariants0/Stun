"use client";

import { useState } from "react";

export default function AISidebarLauncher() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`ai-sidebar ${isOpen ? "is-open" : ""}`}>
      <button
        type="button"
        className="ai-fab"
        aria-label={isOpen ? "Close AI sidebar" : "Open AI sidebar"}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span className="ai-fab__glow" aria-hidden="true" />
        <span className="ai-fab__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" role="presentation">
            <path
              d="M9.5 3.5c-2.1 0-3.8 1.6-3.9 3.7C4 7.6 3 9 3 10.7c0 1.8 1.1 3.3 2.7 3.8V17c0 2 1.6 3.6 3.6 3.6H11M14.5 3.5c2.1 0 3.8 1.6 3.9 3.7 1.6.4 2.6 1.8 2.6 3.5 0 1.8-1.1 3.3-2.7 3.8V17c0 2-1.6 3.6-3.6 3.6H13"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M9 8.5c.6-.6 1.4-1 2.3-1 1 0 1.8.4 2.4 1M9 12c.6.6 1.4 1 2.3 1 1 0 1.8-.4 2.4-1"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </span>
        <span className="ai-fab__text">{isOpen ? "Close" : "AI"}</span>
      </button>

      <aside className="ai-panel" aria-hidden={!isOpen}>
        <div className="ai-panel__inner">
          <div className="ai-panel__topbar">
            <div className="ai-panel__brand">
              <span className="ai-panel__brand-mark" />
              <span className="ai-panel__brand-text">Stun AI</span>
            </div>
            <button
              type="button"
              className="ai-panel__close"
              aria-label="Close AI sidebar"
              onClick={() => setIsOpen(false)}
            >
              x
            </button>
          </div>

          <div className="ai-panel__center">
            <div className="ai-panel__logo">
              <span className="ai-panel__logo-mark" />
              <span className="ai-panel__logo-text">SuperGrok</span>
            </div>
            <p className="ai-panel__subtitle">
              This is a placeholder AI workspace. The real assistant will arrive soon.
            </p>
          </div>

          <div className="ai-panel__input">
            <span className="ai-panel__input-icon" aria-hidden="true">?</span>
            <span className="ai-panel__input-text">What do you want to know?</span>
            <div className="ai-panel__input-actions">
              <span>Auto</span>
              <span className="ai-panel__send" aria-hidden="true">{'>'}</span>
            </div>
          </div>

          <div className="ai-panel__chips">
            <span>DeepSearch</span>
            <span>Create Images</span>
            <span>Try Projects</span>
            <span>Personas</span>
          </div>
        </div>
      </aside>

      <div
        className="ai-panel__backdrop"
        aria-hidden="true"
        onClick={() => setIsOpen(false)}
      />
    </div>
  );
}
