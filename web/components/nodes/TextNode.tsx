import { Handle, Position, type NodeProps } from "reactflow";

type TextNodeData = {
  label: string;
};

export default function TextNode({ data }: NodeProps<TextNodeData>) {
  // Mapped nodes from Excalidraw should be invisible - Excalidraw shows the visual
  // Only render media nodes or other special node types
  const isMappedNode = data && 'originalElementId' in data;
  
  if (isMappedNode) {
    // Return invisible node for mapped Excalidraw elements
    return (
      <div style={{ display: 'none', pointerEvents: 'none' }}>
        <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
        <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
      </div>
    );
  }
  
  // Render visible node for non-mapped nodes (media, AI-created, etc.)
  return (
    <div
      style={{
        padding: 12,
        border: "2px solid #10b981",
        borderRadius: 8,
        background: "#1e293b",
        minWidth: 180,
        color: "#f1f5f9",
        boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
        cursor: "pointer",
        userSelect: "none",
        pointerEvents: "auto",
      }}
    >
      <Handle type="target" position={Position.Top} style={{ background: '#10b981' }} />
      <Handle type="source" position={Position.Bottom} style={{ background: '#10b981' }} />
      
      <strong style={{ color: "#10b981" }}>AI Node</strong>
      <p style={{ margin: "8px 0 0", color: "#fff" }}>{data?.label ?? "No label"}</p>
    </div>
  );
}
