import type { NodeProps } from "reactflow";

type TextNodeData = {
  label: string;
};

export default function TextNode({ data }: NodeProps<TextNodeData>) {
  return (
    <div
      style={{
        padding: 12,
        border: "1px solid #334155",
        borderRadius: 8,
        background: "#1e293b",
        minWidth: 180,
        color: "#f1f5f9", // light text on dark bg
      }}
    >
      <strong style={{ color: "#fff" }}>Text</strong>
      <p style={{ margin: "8px 0 0" }}>{data?.label ?? "New note"}</p>
    </div>
  );
}
