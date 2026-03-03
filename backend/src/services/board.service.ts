type BoardPayload = {
  nodes: unknown[];
  edges: unknown[];
};

type BoardRecord = {
  id: string;
  ownerId: string;
  nodes: unknown[];
  edges: unknown[];
  updatedAt: string;
};

const memoryStore = new Map<string, BoardRecord>();

export const boardService = {
  async createBoard(ownerId: string, payload: BoardPayload) {
    const id = `board-${Date.now()}`;
    const board: BoardRecord = {
      id,
      ownerId,
      nodes: payload.nodes,
      edges: payload.edges,
      updatedAt: new Date().toISOString(),
    };
    memoryStore.set(id, board);
    return board;
  },

  async getBoard(id: string, ownerId: string) {
    const board = memoryStore.get(id);
    if (!board || board.ownerId !== ownerId) {
      return {
        id,
        ownerId,
        nodes: [],
        edges: [],
        updatedAt: new Date().toISOString(),
      };
    }
    return board;
  },

  async updateBoard(id: string, ownerId: string, payload: BoardPayload) {
    const existing = await this.getBoard(id, ownerId);
    const updated: BoardRecord = {
      ...existing,
      id,
      ownerId,
      nodes: payload.nodes,
      edges: payload.edges,
      updatedAt: new Date().toISOString(),
    };
    memoryStore.set(id, updated);
    return updated;
  },
};
