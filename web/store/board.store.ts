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

  // Excalidraw actions
  setExcalidrawElements: (
    boardId: string,
    elements: readonly ExcalidrawElement[]
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
  hydrateBoard: (boardId: string, data: {
    nodes: Node[];
    edges: Edge[];
    elements: ExcalidrawElement[];
  }) => void;

  // Autosave control
  enableAutosave: () => void;
  disableAutosave: () => void;
  triggerAutosave: (boardId: string) => void;
}

const createEmptyBoard = (boardId: string): HybridCanvasState => ({
  boardId,
  excalidraw: {
    elements: [],
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
      
      // Trigger autosave after state update
      setTimeout(() => get().triggerAutosave(boardId), 0);
      
      return newState;
    }),

  // Excalidraw elements
  setExcalidrawElements: (boardId, elements) =>
    set((state) => {
      const board = state.boards[boardId] || createEmptyBoard(boardId);
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
      
      // Trigger autosave after state update
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

        await updateBoard(boardId, {
          nodes: board.reactflow.nodes,
          edges: board.reactflow.edges,
          elements: board.excalidraw.elements as ExcalidrawElement[],
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
