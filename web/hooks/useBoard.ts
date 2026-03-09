/**
 * useBoard Hook - Hybrid Canvas State Management
 * 
 * Manages state for all three canvas layers with React Flow hooks
 * Includes backend persistence and localStorage fallback
 */

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
import { getBoard } from "@/lib/api";
import type { ApiError } from "@/lib/api-client";
import type { Board } from "@/types/api.types";

// Default initial state - empty canvas
const defaultInitialNodes: Node[] = [];
const defaultInitialEdges: Edge[] = [];

// REMOVED: localStorage persistence - Firestore is the single source of truth
// All board state now flows through: Firestore → Backend API → Frontend State → Canvas Render

export function useBoard(boardId: string) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [boardData, setBoardData] = useState<Board | null>(null);

  // Use empty defaults - state will be loaded from backend
  let initialNodes = defaultInitialNodes;
  const initialEdges = defaultInitialEdges;
  const initialExcalidrawElements: readonly ExcalidrawElement[] = [];

  // React Flow state
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  
  // Debug: Log when nodes change
  useEffect(() => {
    console.log("[useBoard] Nodes updated:", nodes.length, "nodes", nodes.map(n => ({ id: n.id, type: n.type, pos: n.position })));
  }, [nodes]);

  // Excalidraw state
  const [excalidrawElements, setExcalidrawElements] = useState<
    readonly ExcalidrawElement[]
  >(initialExcalidrawElements);

  // TLDraw state
  const [tldrawEditor, setTldrawEditor] = useState<Editor | null>(null);
  const [initialTldrawCamera, setInitialTldrawCamera] = useState<{
    x: number;
    y: number;
    zoom: number;
  } | null>(null);

  // Board store actions
  const {
    setReactFlowData,
    setExcalidrawElements: storeSetExcalidrawElements,
    setTldrawEditor: storeSetTldrawEditor,
    createBoard,
    setActiveBoard,
    hydrateBoard,
    enableAutosave,
    disableAutosave,
  } = useBoardStore();

  // Load board from backend on mount
  useEffect(() => {
    let mounted = true;

    async function loadBoard() {
      try {
        // Disable autosave during initial load
        disableAutosave();

        // Initialize board in store
        createBoard(boardId);
        setActiveBoard(boardId);

        // Try to load from backend
        const boardData = await getBoard(boardId);
        
        if (!mounted) return;

        // Store board metadata
        setBoardData(boardData);

        // Hydrate state from backend
        const backendNodes = (boardData.nodes || []) as Node[];
        const backendEdges = (boardData.edges || []) as Edge[];
        const backendElements = (boardData.elements || []) as ExcalidrawElement[];

        // Update local state
        setNodes(backendNodes);
        setEdges(backendEdges);
        setExcalidrawElements(backendElements);

        // Hydrate store
        hydrateBoard(boardId, {
          nodes: backendNodes,
          edges: backendEdges,
          elements: backendElements,
        });

        setLoadError(null);
      } catch (error) {
        console.error("Failed to load board from backend:", error);
        
        if (!mounted) return;

        // No localStorage fallback - Firestore is the single source of truth
        const apiError = error as ApiError;
        setLoadError(apiError.message || "Failed to load board");
      } finally {
        if (mounted) {
          setIsLoaded(true);
          // Re-enable autosave after load completes
          enableAutosave();
        }
      }
    }

    loadBoard();

    return () => {
      mounted = false;
    };
  }, [boardId, createBoard, setActiveBoard, hydrateBoard, enableAutosave, disableAutosave]);

  // Subscribe to store changes (for AI actions and other external updates)
  useEffect(() => {
    console.log("[useBoard] Setting up store subscription for", boardId);
    
    const unsubscribe = useBoardStore.subscribe((state) => {
      const currentBoard = state.boards[boardId];
      
      if (!currentBoard) return;
      
      // Always sync from store to local state
      const storeNodes = currentBoard.reactflow.nodes;
      const storeEdges = currentBoard.reactflow.edges;
      const storeElements = currentBoard.excalidraw.elements;
      
      console.log("[useBoard] Store update detected:", storeNodes.length, "nodes,", storeElements.length, "elements");
      
      // Update local state if different
      setNodes(storeNodes);
      setEdges(storeEdges);
      setExcalidrawElements(storeElements);
    });
    
    return unsubscribe;
  }, [boardId, setNodes, setEdges, setExcalidrawElements]);

  // REMOVED: localStorage autosave - all persistence now goes through backend API

  // Sync React Flow state to store (triggers backend autosave)
  useEffect(() => {
    if (!isLoaded) return; // Don't trigger autosave during initial load
    setReactFlowData(boardId, { nodes, edges });
  }, [boardId, nodes, edges, setReactFlowData, isLoaded]);

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
      if (isLoaded) {
        storeSetExcalidrawElements(boardId, elements);
      }
    },
    [boardId, storeSetExcalidrawElements, isLoaded]
  );

  // Handle TLDraw editor mount
  const handleSetTldrawEditor = useCallback(
    (editor: Editor | null) => {
      setTldrawEditor(editor);
      storeSetTldrawEditor(boardId, editor);
      // if we have an initial camera saved, apply it once
      if (editor && initialTldrawCamera) {
        editor.setCamera({
          x: initialTldrawCamera.x,
          y: initialTldrawCamera.y,
          z: initialTldrawCamera.zoom,
        } as any);
      }
    },
    [boardId, storeSetTldrawEditor, initialTldrawCamera]
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

    // Board metadata
    boardData,
    setBoardData,

    // Loading state
    isLoaded,
    loadError,
  };
}
