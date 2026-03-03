import { create } from "zustand";
import type { Edge, Node } from "reactflow";

type BoardState = {
  boards: Record<string, { nodes: Node[]; edges: Edge[] }>;
  setBoardState: (
    boardId: string,
    data: { nodes: Node[]; edges: Edge[] },
  ) => void;
};

export const useBoardStore = create<BoardState>((set) => ({
  boards: {},
  setBoardState: (boardId, data) =>
    set((state) => ({
      boards: {
        ...state.boards,
        [boardId]: data,
      },
    })),
}));
