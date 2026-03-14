/**
 * React Flow Graph Layer
 * 
 * Knowledge Graph Engine (Canvas-system.md section 2.3)
 * Responsibilities:
 * - Knowledge nodes
 * - Graph relationships
 * - Edge connections
 * - Node metadata
 * - Node positioning
 * - AI-driven node transformations
 */

"use client";

import React, { useMemo } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  type FitViewOptions,
} from "reactflow";
import NodeRenderer from "./NodeRenderer";
import EdgeRenderer from "./EdgeRenderer";

import type { ReactFlowInstance } from "reactflow";

interface ReactFlowGraphLayerProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  className?: string;
  showMiniMap?: boolean;
  showControls?: boolean;
  showBackground?: boolean;
  // callback to expose internal ReactFlow instance for imperative control
  onInit?: (instance: ReactFlowInstance) => void;
}

const fitViewOptions: FitViewOptions = {
  padding: 0.2,
};

export default function ReactFlowGraphLayer({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  className = "",
  showMiniMap = true,
  showControls = true,
  showBackground = true,
  onInit,
}: ReactFlowGraphLayerProps) {
  console.log("[ReactFlowGraphLayer] Rendering with", nodes.length, "nodes:", nodes);

  // Memoize nodeTypes and edgeTypes to prevent React Flow warnings
  // React Flow requires these to be stable across renders
  const nodeTypes = useMemo(() => NodeRenderer, []);
  const edgeTypes = useMemo(() => EdgeRenderer, []);

  return (
    <div
      className={className}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        zIndex: 3, // Layer 3: Knowledge Graph (Top - nodes and relationships)
        pointerEvents: "none", // Let all events pass through to Excalidraw
      }}
    >
      <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          proOptions={{ hideAttribution: true }}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          onInit={onInit}
          style={{
            background: "transparent",
            pointerEvents: "none",
          }}
          // Hide all nodes visually - they're infrastructure only
          nodeExtent={[[-999999, -999999], [999999, 999999]]}
        >
          {showBackground && <Background />}
          {showControls && <Controls />}
          {showMiniMap && <MiniMap />}
        </ReactFlow>
      </div>
  );
}
