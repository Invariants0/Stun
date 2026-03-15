import { Handle, Position, type NodeProps } from "reactflow";

type TextNodeData = {
  label: string;
  _highlighted?: boolean;
};

export default function TextNode({ data, selected }: NodeProps<TextNodeData>) {
  // Mapped nodes from Excalidraw should be invisible - Excalidraw shows the visual
  // Only render media nodes or other special node types
  const isMappedNode = data && 'originalElementId' in data;
  const isHighlighted = data?._highlighted ?? false;
  
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
        border: isHighlighted || selected ? "3px solid #fbbf24" : "2px solid #10b981",
        borderRadius: 8,
        background: isHighlighted || selected ? "#fef3c7" : "#1e293b",
        minWidth: 180,
        color: isHighlighted || selected ? "#1e293b" : "#f1f5f9",
        boxShadow: isHighlighted || selected 
          ? "0 0 20px rgba(251, 191, 36, 0.6), 0 4px 12px rgba(251, 191, 36, 0.3)"
          : "0 4px 12px rgba(16, 185, 129, 0.3)",
        cursor: "pointer",
        userSelect: "none",
        pointerEvents: "auto",
        transition: "all 0.2s ease",
        transform: isHighlighted || selected ? "scale(1.05)" : "scale(1)",
      }}
    >
      <Handle 
        type="target" 
        position={Position.Top} 
        style={{ background: isHighlighted || selected ? '#fbbf24' : '#10b981' }} 
      />
      <Handle 
        type="source" 
        position={Position.Bottom} 
        style={{ background: isHighlighted || selected ? '#fbbf24' : '#10b981' }} 
      />
      
      <strong style={{ color: isHighlighted || selected ? "#d97706" : "#10b981" }}>AI Node</strong>
      <p style={{ margin: "8px 0 0", color: isHighlighted || selected ? "#1e293b" : "#fff" }}>
        {data?.label ?? "No label"}
      </p>
    </div>
  );
}
