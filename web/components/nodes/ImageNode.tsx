import type { NodeProps } from "reactflow";

type ImageNodeData = {
  src?: string;
  alt?: string;
};

export default function ImageNode({ data }: NodeProps<ImageNodeData>) {
  return (
    <div
      style={{
        padding: 8,
        border: "1px solid #334155",
        borderRadius: 8,
        background: "#0f172a",
      }}
    >
      <strong style={{ display: "block", marginBottom: 8 }}>Image</strong>
      <img
        src={data?.src ?? "https://placehold.co/220x120"}
        alt={data?.alt ?? "Image node"}
        style={{ width: 220, height: 120, objectFit: "cover", borderRadius: 6 }}
      />
    </div>
  );
}
