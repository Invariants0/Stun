"use client";

import { useCallback, useEffect } from "react";
import {
  addEdge,
  type Connection,
  type Edge,
  type Node,
  useEdgesState,
  useNodesState,
} from "reactflow";
import { useBoardStore } from "@/store/board.store";

const initialNodes: Node[] = [
  {
    id: "node-1",
    type: "text",
    position: { x: 50, y: 50 },
    data: { label: "Welcome to Stun" },
  },
  {
    id: "node-2",
    type: "image",
    position: { x: 380, y: 160 },
    data: { src: "https://placehold.co/220x120" },
  },
];

const initialEdges: Edge[] = [];

export function useBoard(boardId: string) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const setBoardState = useBoardStore((state) => state.setBoardState);

  useEffect(() => {
    setBoardState(boardId, { nodes, edges });
  }, [boardId, nodes, edges, setBoardState]);

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((current) => addEdge(connection, current));
    },
    [setEdges],
  );

  return {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    setNodes,
    setEdges,
  };
}
