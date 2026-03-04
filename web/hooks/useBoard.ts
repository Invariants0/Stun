/**
 * useBoard Hook - Hybrid Canvas State Management
 * 
 * Manages state for all three canvas layers with React Flow hooks
 * Includes localStorage persistence
 */

"use client";

import { useCallback, useEffect, useState } from "react";
import {
  addEdge,
  type Connection,
  type Edge,
  type Node,
  useEdgesState,
  useNodesState,
} from "reactflow";
import type { ExcalidrawElement } from "@excalidraw/excalidraw/types/element/types";
import type { Editor } from "tldraw";
import { useBoardStore } from "@/store/board.store";

// Default initial state - empty canvas
const defaultInitialNodes: Node[] = [];
const defaultInitialEdges: Edge[] = [];

// Load board state from localStorage
function loadBoardState(boardId: string): {
  nodes: Node[];
  edges: Edge[];
  excalidrawElements: readonly ExcalidrawElement[];
} | null {
  if (typeof window === "undefined") return null;

  try {
    const saved = localStorage.getItem(`stun-board-${boardId}`);
    if (!saved) return null;

    const parsed = JSON.parse(saved);
    return {
      nodes: parsed.nodes || [],
      edges: parsed.edges || [],
      excalidrawElements: parsed.excalidrawElements || [],
    };
  } catch (error) {
    console.error("Failed to load board state:", error);
    return null;
  }
}

// Save board state to localStorage
function saveBoardState(
  boardId: string,
  nodes: Node[],
  edges: Edge[],
  excalidrawElements: readonly ExcalidrawElement[]
) {
  if (typeof window === "undefined") return;

  try {
    const state = {
      nodes,
      edges,
      excalidrawElements,
      lastSaved: Date.now(),
    };
    localStorage.setItem(`stun-board-${boardId}`, JSON.stringify(state));
  } catch (error) {
    console.error("Failed to save board state:", error);
  }
}

export function useBoard(boardId: string) {
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved state or use defaults
  const savedState = loadBoardState(boardId);
  const initialNodes = savedState?.nodes || defaultInitialNodes;
  const initialEdges = savedState?.edges || defaultInitialEdges;
  const initialExcalidrawElements = savedState?.excalidrawElements || [];

  // React Flow state
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Excalidraw state
  const [excalidrawElements, setExcalidrawElements] = useState<
    readonly ExcalidrawElement[]
  >(initialExcalidrawElements);

  // TLDraw state
  const [tldrawEditor, setTldrawEditor] = useState<Editor | null>(null);

  // Board store actions
  const {
    setReactFlowData,
    setExcalidrawElements: storeSetExcalidrawElements,
    setTldrawEditor: storeSetTldrawEditor,
    createBoard,
    setActiveBoard,
  } = useBoardStore();

  // Initialize board
  useEffect(() => {
    createBoard(boardId);
    setActiveBoard(boardId);
    setIsLoaded(true);
  }, [boardId, createBoard, setActiveBoard]);

  // Auto-save to localStorage whenever state changes
  useEffect(() => {
    if (!isLoaded) return; // Don't save during initial load

    const timeoutId = setTimeout(() => {
      saveBoardState(boardId, nodes, edges, excalidrawElements);
    }, 500); // Debounce saves by 500ms

    return () => clearTimeout(timeoutId);
  }, [boardId, nodes, edges, excalidrawElements, isLoaded]);

  // Sync React Flow state to store
  useEffect(() => {
    setReactFlowData(boardId, { nodes, edges });
  }, [boardId, nodes, edges, setReactFlowData]);

  // Handle connections
  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((current) => addEdge(connection, current));
    },
    [setEdges]
  );

  // Handle Excalidraw elements change
  const onExcalidrawElementsChange = useCallback(
    (elements: readonly ExcalidrawElement[]) => {
      setExcalidrawElements(elements);
      storeSetExcalidrawElements(boardId, elements);
    },
    [boardId, storeSetExcalidrawElements]
  );

  // Handle TLDraw editor mount
  const handleSetTldrawEditor = useCallback(
    (editor: Editor | null) => {
      setTldrawEditor(editor);
      storeSetTldrawEditor(boardId, editor);
    },
    [boardId, storeSetTldrawEditor]
  );

  return {
    // React Flow
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    setNodes,
    setEdges,

    // Excalidraw
    excalidrawElements,
    onExcalidrawElementsChange,

    // TLDraw
    tldrawEditor,
    setTldrawEditor: handleSetTldrawEditor,
  };
}
