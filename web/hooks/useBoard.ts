/**
 * useBoard Hook - Hybrid Canvas State Management
 * 
 * Manages state for all three canvas layers with React Flow hooks
 * Includes backend persistence and localStorage fallback
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
import { getBoard } from "@/lib/api";
import type { ApiError } from "@/lib/api-client";

// Default initial state - empty canvas
const defaultInitialNodes: Node[] = [];
const defaultInitialEdges: Edge[] = [];

// Load board state from localStorage
function loadBoardState(boardId: string): {
  nodes: Node[];
  edges: Edge[];
  excalidrawElements: readonly ExcalidrawElement[];
  tldrawCamera?: { x: number; y: number; zoom: number };
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
      tldrawCamera: parsed.tldrawCamera,
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
  excalidrawElements: readonly ExcalidrawElement[],
  tldrawCamera?: { x: number; y: number; zoom: number }
) {
  if (typeof window === "undefined") return;

  try {
    const state: any = {
      nodes,
      edges,
      excalidrawElements,
      lastSaved: Date.now(),
    };
    if (tldrawCamera) {
      state.tldrawCamera = tldrawCamera;
    }
    localStorage.setItem(`stun-board-${boardId}`, JSON.stringify(state));
  } catch (error) {
    console.error("Failed to save board state:", error);
  }
}

export function useBoard(boardId: string) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Load saved state or use defaults
  const savedState = loadBoardState(boardId);
  let initialNodes = savedState?.nodes || defaultInitialNodes;
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

        // Save to localStorage as backup
        saveBoardState(boardId, backendNodes, backendEdges, backendElements);

        setLoadError(null);
      } catch (error) {
        console.error("Failed to load board from backend:", error);
        
        if (!mounted) return;

        // Fallback to localStorage if backend fails
        const localData = loadBoardState(boardId);
        if (localData) {
          setNodes(localData.nodes);
          setEdges(localData.edges);
          setExcalidrawElements(localData.excalidrawElements);
          
          hydrateBoard(boardId, {
            nodes: localData.nodes,
            edges: localData.edges,
            elements: localData.excalidrawElements as ExcalidrawElement[],
          });

          if (localData.tldrawCamera) {
            setInitialTldrawCamera(localData.tldrawCamera);
          }
        }

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

  // Auto-save to localStorage as backup (separate from backend autosave)
  useEffect(() => {
    if (!isLoaded) return; // Don't save during initial load

    const timeoutId = setTimeout(() => {
      const cam = tldrawEditor?.getCamera();
      saveBoardState(
        boardId,
        nodes,
        edges,
        excalidrawElements,
        cam
          ? { x: cam.x, y: cam.y, zoom: cam.z }
          : undefined
      );
    }, 500); // Debounce saves by 500ms

    return () => clearTimeout(timeoutId);
  }, [boardId, nodes, edges, excalidrawElements, isLoaded, tldrawEditor]);

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

    // Loading state
    isLoaded,
    loadError,
  };
}
