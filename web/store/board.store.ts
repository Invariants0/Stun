/**
 * Board Store - Hybrid Canvas State Management
 * 
 * Manages state for all three canvas layers:
 * - Excalidraw (drawing elements)
 * - TLDraw (canvas state & viewport)
 * - React Flow (nodes & graph relationships)
 */

import { create } from "zustand";
import type { Edge, Node } from "reactflow";
import type { ExcalidrawElement } from "@excalidraw/excalidraw/types/element/types";
import type { Editor } from "tldraw";
import type { HybridCanvasState, ElementNodeMapping } from "@/types/canvas.types";

interface BoardState {
  // All boards
  boards: Record<string, HybridCanvasState>;

  // Current active board
  activeBoardId: string | null;

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

  // React Flow data
  setReactFlowData: (boardId, data) =>
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
          },
        },
      };
    }),

  // Excalidraw elements
  setExcalidrawElements: (boardId, elements) =>
    set((state) => {
      const board = state.boards[boardId] || createEmptyBoard(boardId);
      return {
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
}));
