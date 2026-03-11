/**
 * useBoard Hook - Hybrid Canvas State Management
 * 
 * Manages state for all three canvas layers with React Flow hooks
 * Includes backend persistence and localStorage fallback
 */

"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { sanitizeExcalidrawElements } from "@/lib/excalidraw-sanitize";
import { useAuth } from "@/hooks/useAuth";

// Default initial state - empty canvas
const defaultInitialNodes: Node[] = [];
const defaultInitialEdges: Edge[] = [];

const areNodesEquivalent = (a: Node[], b: Node[]) => {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    const an = a[i];
    const bn = b[i];
    if (
      an.id !== bn.id ||
      an.type !== bn.type ||
      an.position.x !== bn.position.x ||
      an.position.y !== bn.position.y
    ) {
      return false;
    }
  }
  return true;
};

const areEdgesEquivalent = (a: Edge[], b: Edge[]) => {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    const ae = a[i];
    const be = b[i];
    if (
      ae.id !== be.id ||
      ae.source !== be.source ||
      ae.target !== be.target
    ) {
      return false;
    }
  }
  return true;
};

const areElementsEquivalent = (
  a: readonly ExcalidrawElement[],
  b: readonly ExcalidrawElement[]
) => {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    const ae = a[i];
    const be = b[i];
    if (
      ae.id !== be.id ||
      ae.type !== be.type ||
      ae.version !== be.version
    ) {
      return false;
    }
  }
  return true;
};

// REMOVED: localStorage persistence - Firestore is the single source of truth
// All board state now flows through: Firestore → Backend API → Frontend State → Canvas Render

export function useBoard(boardId: string) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [boardData, setBoardData] = useState<Board | null>(null);
  const skipNextReactFlowSyncRef = useRef(false);
  const { user, loading: authLoading, tokenReady } = useAuth();
  const ignoreEmptyChangesRef = useRef(false);
  const lastNonEmptyElementsRef = useRef<number>(0);
  const loadSucceededRef = useRef(false);
  const nodesRef = useRef<Node[]>([]);
  const edgesRef = useRef<Edge[]>([]);
  const elementsRef = useRef<readonly ExcalidrawElement[]>([]);

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
  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);
  useEffect(() => {
    edgesRef.current = edges;
  }, [edges]);

  // Excalidraw state
  const [excalidrawElements, setExcalidrawElements] = useState<
    readonly ExcalidrawElement[]
  >(initialExcalidrawElements);
  useEffect(() => {
    elementsRef.current = excalidrawElements;
  }, [excalidrawElements]);

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
      let shouldFinalize = false;
      try {
        if (authLoading) return;
        if (!user) {
          setLoadError("Authentication required");
          return;
        }
        shouldFinalize = true;

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
        const backendElements = sanitizeExcalidrawElements(
          (boardData.elements || []) as ExcalidrawElement[]
        );

        // Update local state
        setNodes(backendNodes);
        setEdges(backendEdges);
        setExcalidrawElements(backendElements);
        lastNonEmptyElementsRef.current = backendElements.length;
        ignoreEmptyChangesRef.current = true;
        setTimeout(() => {
          ignoreEmptyChangesRef.current = false;
        }, 2000);

        // Hydrate store
        hydrateBoard(boardId, {
          nodes: backendNodes,
          edges: backendEdges,
          elements: backendElements,
        });

        loadSucceededRef.current = true;
        setLoadError(null);
      } catch (error) {
        console.error("Failed to load board from backend:", error);
        
        if (!mounted) return;

        // No localStorage fallback - Firestore is the single source of truth
        const apiError = error as ApiError;
        loadSucceededRef.current = false;
        setLoadError(apiError.message || "Failed to load board");
      } finally {
        if (mounted) {
          if (!shouldFinalize) return;
          setIsLoaded(true);
          if (loadSucceededRef.current) {
            // Re-enable autosave after load completes
            enableAutosave();
          } else {
            disableAutosave();
          }
        }
      }
    }

    loadBoard();

    return () => {
      mounted = false;
    };
  }, [boardId, createBoard, setActiveBoard, hydrateBoard, enableAutosave, disableAutosave, authLoading, user]);

  // Subscribe to store changes (for AI actions and other external updates)
  useEffect(() => {
    console.log("[useBoard] Setting up store subscription for", boardId);
    
    const unsubscribe = useBoardStore.subscribe((state) => {
      const currentBoard = state.boards[boardId];
      
      if (!currentBoard) return;
      
      // Always sync from store to local state
      const storeNodes = currentBoard.reactflow.nodes;
      const storeEdges = currentBoard.reactflow.edges;
      const storeElements = sanitizeExcalidrawElements(
        currentBoard.excalidraw.elements as ExcalidrawElement[]
      );
      
      console.log("[useBoard] Store update detected:", storeNodes.length, "nodes,", storeElements.length, "elements");
      
      // Update local state if different
      const nodesChanged = !areNodesEquivalent(nodesRef.current, storeNodes);
      const edgesChanged = !areEdgesEquivalent(edgesRef.current, storeEdges);
      const elementsChanged = !areElementsEquivalent(
        elementsRef.current,
        storeElements
      );

      if (nodesChanged || edgesChanged) {
        skipNextReactFlowSyncRef.current = true;
      }
      if (nodesChanged) {
        setNodes(storeNodes);
      }
      if (edgesChanged) {
        setEdges(storeEdges);
      }
      if (elementsChanged) {
        setExcalidrawElements(storeElements);
      }
      if (storeElements.length > 0) {
        lastNonEmptyElementsRef.current = storeElements.length;
      }
    });
    
    return unsubscribe;
  }, [boardId, setNodes, setEdges, setExcalidrawElements]);

  // REMOVED: localStorage autosave - all persistence now goes through backend API

  // Sync React Flow state to store (triggers backend autosave)
  useEffect(() => {
    if (!isLoaded) return; // Don't trigger autosave during initial load
    if (loadError) return;
    if (skipNextReactFlowSyncRef.current) {
      skipNextReactFlowSyncRef.current = false;
      return;
    }
    setReactFlowData(boardId, { nodes, edges });
  }, [boardId, nodes, edges, setReactFlowData, isLoaded, loadError]);

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
      if (!isLoaded || loadError) return;
      const sanitized = sanitizeExcalidrawElements(elements);
      if (
        (ignoreEmptyChangesRef.current && sanitized.length === 0) ||
        (sanitized.length === 0 && lastNonEmptyElementsRef.current > 0)
      ) {
        return;
      }
      const elementsChanged = !areElementsEquivalent(
        excalidrawElements,
        sanitized
      );
      if (!elementsChanged) return;
      setExcalidrawElements(sanitized);
      if (sanitized.length > 0) {
        lastNonEmptyElementsRef.current = sanitized.length;
      }
      storeSetExcalidrawElements(boardId, sanitized);
    },
    [boardId, storeSetExcalidrawElements, isLoaded, loadError, excalidrawElements]
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
