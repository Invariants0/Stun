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
  // Memoize nodeTypes/edgeTypes to prevent React Flow re-creation warnings
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
        pointerEvents: "none", // allow pointer events to fall through to Excalidraw
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
          nodesDraggable={true}
          nodesConnectable={true}
          elementsSelectable={true}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onInit={onInit}
        >
          {showBackground && <Background />}
          {showControls && <Controls />}
          {showMiniMap && <MiniMap />}
        </ReactFlow>
      </div>
  );
}
