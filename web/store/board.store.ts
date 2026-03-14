/**
 * Board Store - Hybrid Canvas State Management
 * 
 * Manages state for all three canvas layers:
 * - Excalidraw (drawing elements)
 * - TLDraw (canvas state & viewport)
 * - React Flow (nodes & graph relationships)
 * 
 * Features:
 * - Backend persistence with autosave (3s debounce)
 * - Local state management
 * - Prevents infinite autosave loops
 */

import { create } from "zustand";
import type { Edge, Node } from "reactflow";
import type { ExcalidrawElement } from "@excalidraw/excalidraw/types/element/types";
import type { Editor } from "tldraw";
import type { HybridCanvasState, ElementNodeMapping } from "@/types/canvas.types";
import { updateBoard } from "@/lib/api";

// Helper: Convert blob: URL to base64 dataURL
async function blobToDataURL(blobUrl: string): Promise<string> {
  const response = await fetch(blobUrl);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

interface BoardState {
  // All boards
  boards: Record<string, HybridCanvasState>;

  // Current active board
  activeBoardId: string | null;

  // Autosave state
  autosaveEnabled: boolean;
  isSaving: boolean;
  lastSaved: number | null;
  autosaveTimeoutId: NodeJS.Timeout | null;

  // React Flow actions
  setReactFlowData: (
    boardId: string,
    data: { nodes: Node[]; edges: Edge[] }
  ) => void;

  appendNode: (boardId: string, node: Node) => void;

  // Excalidraw actions
  setExcalidrawElements: (
    boardId: string,
    elements: readonly ExcalidrawElement[]
  ) => void;
  setExcalidrawFiles: (
    boardId: string,
    files: Record<string, { id: string; mimeType: string; dataURL: string }>
  ) => void;

  // TLDraw actions
  setTldrawEditor: (boardId: string, editor: Editor | null) => void;

  // Mapping actions
  addMapping: (boardId: string, mapping: ElementNodeMapping) => void;
  removeMapping: (boardId: string, elementId: string) => void;

  // Board management
  createBoard: (boardId: string) => void;
  setActiveBoard: (boardId: string) => void;
  getBoard: (boardId: string) => HybridCanvasState | undefined;
  
  // Hydrate board from backend
  hydrateBoard: (
    boardId: string,
    data: {
      nodes: Node[];
      edges: Edge[];
      elements: ExcalidrawElement[];
      files?: Record<string, { id: string; mimeType: string; dataURL: string }>;
    }
  ) => void;

  // Autosave control
  enableAutosave: () => void;
  disableAutosave: () => void;
  triggerAutosave: (boardId: string) => void;
}

const createEmptyBoard = (boardId: string): HybridCanvasState => ({
  boardId,
  excalidraw: {
    elements: [],
    files: {},
    appState: {
      viewBackgroundColor: "transparent",
      currentItemStrokeColor: "#1e293b",
      currentItemBackgroundColor: "#f1f5f9",
      currentItemFillStyle: "solid",
      currentItemStrokeWidth: 2,
      currentItemRoughness: 1,
      currentItemOpacity: 100,
    },
  },
  tldraw: {
    camera: {
      id: "camera:page:page" as any,
      typeName: "camera" as const,
      x: 0,
      y: 0,
      z: 1,
      meta: {},
    },
    selectedShapeIds: [],
    isPanning: false,
    isZooming: false,
  },
  reactflow: {
    nodes: [],
    edges: [],
    viewport: { x: 0, y: 0, zoom: 1 },
  },
  mappings: [],
  camera: {
    tldrawCamera: {
      id: "camera:page:page" as any,
      typeName: "camera" as const,
      x: 0,
      y: 0,
      z: 1,
      meta: {},
    },
    reactFlowViewport: { x: 0, y: 0, zoom: 1 },
    excalidrawTransform: { x: 0, y: 0, zoom: 1 },
    lastUpdated: Date.now(),
    source: "tldraw",
  },
});

export const useBoardStore = create<BoardState>((set, get) => ({
  boards: {},
  activeBoardId: null,
  autosaveEnabled: true,
  isSaving: false,
  lastSaved: null,
  autosaveTimeoutId: null,

  // React Flow data
  setReactFlowData: (boardId, data) =>
    set((state) => {
      console.log("[BoardStore] setReactFlowData called for", boardId, "with", data.nodes.length, "nodes:", data.nodes);
      
      const board = state.boards[boardId] || createEmptyBoard(boardId);
      const newState = {
        boards: {
          ...state.boards,
          [boardId]: {
            ...board,
            reactflow: {
              ...board.reactflow,
              nodes: data.nodes,
              edges: data.edges,
            },
          },
        },
      };
      
      console.log("[BoardStore] New board state:", newState.boards[boardId].reactflow.nodes.length, "nodes");
      
      // Trigger autosave after state update
      setTimeout(() => get().triggerAutosave(boardId), 0);
      
      return newState;
    }),

  appendNode: (boardId, node) =>
    set((state) => {
      const board = state.boards[boardId] || createEmptyBoard(boardId);
      const newNodes = [...board.reactflow.nodes, node];
      setTimeout(() => get().triggerAutosave(boardId), 0);
      return {
        boards: {
          ...state.boards,
          [boardId]: {
            ...board,
            reactflow: { ...board.reactflow, nodes: newNodes },
          },
        },
      };
    }),

  // Excalidraw elements
  setExcalidrawElements: (boardId, elements) =>
    set((state) => {
      const board = state.boards[boardId] || createEmptyBoard(boardId);
      console.log("[BoardStore] setExcalidrawElements called with", elements.length, "elements");
      const newState = {
        boards: {
          ...state.boards,
          [boardId]: {
            ...board,
            excalidraw: {
              ...board.excalidraw,
              elements,
            },
          },
        },
      };
      
      console.log("[BoardStore] New excalidraw state:", newState.boards[boardId].excalidraw.elements.length, "elements");
      
      // Trigger autosave after state update
      setTimeout(() => get().triggerAutosave(boardId), 0);
      
      return newState;
    }),

  // Excalidraw files (for image persistence)
  // Triggers autosave to persist files to backend
  setExcalidrawFiles: (boardId, files) =>
    set((state) => {
      const board = state.boards[boardId] || createEmptyBoard(boardId);
      const newState = {
        boards: {
          ...state.boards,
          [boardId]: {
            ...board,
            excalidraw: {
              ...board.excalidraw,
              files,
            },
          },
        },
      };

      // Trigger autosave to persist files to backend
      setTimeout(() => get().triggerAutosave(boardId), 0);

      return newState;
    }),

  // TLDraw editor
  setTldrawEditor: (boardId, editor) =>
    set((state) => {
      const board = state.boards[boardId] || createEmptyBoard(boardId);
      // Store editor reference if needed
      // For now, we don't store it in state
      return state;
    }),

  // Mapping management
  addMapping: (boardId, mapping) =>
    set((state) => {
      const board = state.boards[boardId] || createEmptyBoard(boardId);
      return {
        boards: {
          ...state.boards,
          [boardId]: {
            ...board,
            mappings: [...board.mappings, mapping],
          },
        },
      };
    }),

  removeMapping: (boardId, elementId) =>
    set((state) => {
      const board = state.boards[boardId];
      if (!board) return state;

      return {
        boards: {
          ...state.boards,
          [boardId]: {
            ...board,
            mappings: board.mappings.filter(
              (m) => m.excalidrawElementId !== elementId
            ),
          },
        },
      };
    }),

  // Board management
  createBoard: (boardId) =>
    set((state) => ({
      boards: {
        ...state.boards,
        [boardId]: createEmptyBoard(boardId),
      },
    })),

  setActiveBoard: (boardId) =>
    set(() => ({
      activeBoardId: boardId,
    })),

  getBoard: (boardId) => {
    return get().boards[boardId];
  },

  // Hydrate board from backend
  hydrateBoard: (boardId, data) =>
    set((state) => {
      const board = state.boards[boardId] || createEmptyBoard(boardId);
      return {
        boards: {
          ...state.boards,
          [boardId]: {
            ...board,
            reactflow: {
              ...board.reactflow,
              nodes: data.nodes,
              edges: data.edges,
            },
            excalidraw: {
              ...board.excalidraw,
              elements: data.elements,
              files: data.files ?? {},
            },
          },
        },
      };
    }),

  // Autosave control
  enableAutosave: () => set({ autosaveEnabled: true }),
  
  disableAutosave: () => set({ autosaveEnabled: false }),

  triggerAutosave: (boardId: string) => {
    const state = get();
    
    // Don't autosave if disabled or already saving
    if (!state.autosaveEnabled || state.isSaving) {
      return;
    }

    // Clear existing timeout
    if (state.autosaveTimeoutId) {
      clearTimeout(state.autosaveTimeoutId);
    }

    // Set new timeout (3 second debounce)
    const timeoutId = setTimeout(async () => {
      const currentState = get();
      const board = currentState.boards[boardId];
      
      if (!board) return;

      try {
        set({ isSaving: true });

        // make a deep copy of elements so we can modify urls
        const elementsCopy = JSON.parse(JSON.stringify(board.excalidraw.elements)) as ExcalidrawElement[];
        
        // DEBUG: Log all image elements before conversion
        const imageElements = elementsCopy.filter((el: any) => el.type === "image");
        if (imageElements.length > 0) {
          console.log("🖼️ Image elements before conversion:", JSON.stringify(imageElements, null, 2));
        }
        
        // convert any blob: urls to data URLs
        for (let i = 0; i < elementsCopy.length; i++) {
          const el = elementsCopy[i] as any;
          if (el.type === "image") {
            // Check el.url for blob URLs
            if (typeof el.url === "string" && el.url.startsWith("blob:")) {
              try {
                console.log("Converting blob URL at el.url");
                el.url = await blobToDataURL(el.url);
              } catch (err) {
                console.warn("Failed to convert blob at el.url", err);
              }
            }
            // Also check el.file.dataURL for blob URLs
            if (el.file && typeof el.file.dataURL === "string" && el.file.dataURL.startsWith("blob:")) {
              try {
                console.log("Converting blob URL at el.file.dataURL");
                const dataUrl = await blobToDataURL(el.file.dataURL);
                el.file.dataURL = dataUrl;
                el.url = dataUrl; // Also set top-level url for Excalidraw
              } catch (err) {
                console.warn("Failed to convert blob at el.file.dataURL", err);
              }
            }
          }
        }
        
        // DEBUG: Log image elements after conversion
        const imageElementsAfter = elementsCopy.filter((el: any) => el.type === "image");
        if (imageElementsAfter.length > 0) {
          console.log("🖼️ Image elements after conversion:", JSON.stringify(imageElementsAfter, null, 2));
        }
        
        await updateBoard(boardId, {
          nodes: board.reactflow.nodes,
          edges: board.reactflow.edges,
          elements: elementsCopy,
          files: board.excalidraw.files ?? {},
        });

        set({ 
          isSaving: false, 
          lastSaved: Date.now(),
          autosaveTimeoutId: null,
        });
      } catch (error) {
        console.error("Autosave failed:", error);
        set({ 
          isSaving: false,
          autosaveTimeoutId: null,
        });
      }
    }, 3000); // 3 second debounce

    set({ autosaveTimeoutId: timeoutId });
  },
}));
