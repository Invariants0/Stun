import { Handle, Position, type NodeProps } from "reactflow";

type TextNodeData = {
  label: string;
};

export default function TextNode({ data }: NodeProps<TextNodeData>) {
  console.log("[TextNode] Rendering with data:", data);
  
  return (
    <div
      style={{
        padding: 12,
        border: "2px solid #10b981", // Make it more visible
        borderRadius: 8,
        background: "#1e293b",
        minWidth: 180,
        color: "#f1f5f9", // light text on dark bg
        boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)", // Green glow
        cursor: "pointer", // Show it's interactive
        userSelect: "none", // Prevent text selection
        pointerEvents: "auto", // Ensure this node can be interacted with
      }}
    >
      {/* Connection handles */}
      <Handle type="target" position={Position.Top} style={{ background: '#10b981' }} />
      <Handle type="source" position={Position.Bottom} style={{ background: '#10b981' }} />
      
      <strong style={{ color: "#10b981" }}>AI Node</strong>
      <p style={{ margin: "8px 0 0", color: "#fff" }}>{data?.label ?? "No label"}</p>
    </div>
  );
}
