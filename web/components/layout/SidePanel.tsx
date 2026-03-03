"use client";

type Props = {
  boardId: string;
};

export default function SidePanel({ boardId }: Props) {
  return (
    <aside style={{ borderRight: "1px solid #334155", padding: 16 }}>
      <h3 style={{ marginTop: 0 }}>Board Controls</h3>
      <p style={{ opacity: 0.85 }}>Board ID: {boardId}</p>
      <ul style={{ paddingLeft: 20 }}>
        <li>Create node</li>
        <li>Connect nodes</li>
        <li>Run AI planner</li>
      </ul>
    </aside>
  );
}
