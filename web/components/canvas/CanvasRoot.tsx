"use client";

import ReactFlow, { Background, Controls, MiniMap } from "reactflow";
import "reactflow/dist/style.css";

import NodeRenderer from "./NodeRenderer";
import EdgeRenderer from "./EdgeRenderer";
import CameraController from "./CameraController";
import VoiceOrb from "@/components/voice/VoiceOrb";
import { useBoard } from "@/hooks/useBoard";

type Props = { boardId: string };

export default function CanvasRoot({ boardId }: Props) {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect } =
    useBoard(boardId);

  return (
    <section style={{ height: "100%", position: "relative" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={NodeRenderer}
        edgeTypes={EdgeRenderer}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap />
        <CameraController />
      </ReactFlow>
      <VoiceOrb />
    </section>
  );
}
