"use client";

import { useState, type ReactNode } from "react";

type Props = {
  label: string;
  icon?: ReactNode;
  shortcut?: string;
  onClick?: () => void;
  badge?: string;
};

export function SidePanelItem({ label, icon, shortcut, onClick, badge }: Props) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        width: "100%",
        padding: "7px 10px",
        background: hovered ? "rgba(15,23,42,0.05)" : "transparent",
        border: "none",
        borderRadius: 8,
        cursor: "pointer",
        textAlign: "left",
        transition: "background 0.12s ease",
        color: "#334155",
      }}
    >
      {icon && (
        <span
          style={{
            width: 28,
            height: 28,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 6,
            background: hovered ? "rgba(15,23,42,0.06)" : "rgba(15,23,42,0.04)",
            color: "#475569",
            flexShrink: 0,
            transition: "background 0.12s ease",
          }}
        >
          {icon}
        </span>
      )}
      <span
        style={{
          fontSize: "0.8125rem",
          fontWeight: 450,
          color: "#1e293b",
          fontFamily: "inherit",
          flex: 1,
          letterSpacing: "-0.01em",
        }}
      >
        {label}
      </span>
      {badge && (
        <span
          style={{
            fontSize: "0.625rem",
            fontWeight: 600,
            color: "#2563eb",
            background: "rgba(37,99,235,0.08)",
            borderRadius: 4,
            padding: "2px 6px",
            letterSpacing: "0.02em",
          }}
        >
          {badge}
        </span>
      )}
      {shortcut && (
        <span
          style={{
            fontSize: "0.6875rem",
            color: "#94a3b8",
            fontFamily: "inherit",
          }}
        >
          {shortcut}
        </span>
      )}
    </button>
  );
}
