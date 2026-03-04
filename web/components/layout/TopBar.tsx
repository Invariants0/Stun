"use client";

type Props = {
  boardId: string;
};

export default function TopBar({ boardId }: Props) {
  return (
    <header
      style={{
        height: 56,
        borderBottom: "1px solid #1e293b",
        background: "#0f172a",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        color: "#f1f5f9",
        zIndex: 100,
        position: "relative",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <strong style={{ fontSize: 20, fontWeight: 700 }}>Stun</strong>
        <div
          style={{
            fontSize: 12,
            color: "#94a3b8",
            padding: "4px 8px",
            background: "#1e293b",
            borderRadius: 6,
          }}
        >
          Board: {boardId}
        </div>
      </div>
      
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ fontSize: 12, color: "#64748b" }}>
          Hybrid Canvas: TLDraw + Excalidraw + React Flow
        </div>
      </div>
    </header>
  );
}
