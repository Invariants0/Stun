"use client";

type Props = {
  boardId: string;
};

export default function TopBar({ boardId }: Props) {
  return (
    <header
      style={{
        height: 56,
        borderBottom: "1px solid #334155",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 16px",
      }}
    >
      <strong>Stun</strong>
      <span>Board: {boardId}</span>
    </header>
  );
}
