"use client";

import type { ReactNode } from "react";

type Props = {
  title: string;
  children: ReactNode;
};

export function SidePanelSection({ title, children }: Props) {
  return (
    <div style={{ marginBottom: 4 }}>
      <p
        style={{
          fontSize: "0.6875rem",
          fontWeight: 600,
          color: "#94a3b8",
          letterSpacing: "0.07em",
          textTransform: "uppercase",
          padding: "8px 10px 4px",
          margin: 0,
          fontFamily: "inherit",
        }}
      >
        {title}
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {children}
      </div>
    </div>
  );
}
