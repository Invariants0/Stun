export type BoardVisibility = "private" | "view" | "edit";

export type CanvasNode = {
  id: string;
  type?: string;
  position?: { x: number; y: number };
  data?: unknown;
  [key: string]: unknown;
};

export type CanvasEdge = {
  id: string;
  source: string;
  target: string;
  [key: string]: unknown;
};

// Input payload: nodes/edges arrive as raw JSON blobs from the client.
// The Board type carries the typed representation after retrieval.
export type BoardPayload = {
  nodes: unknown[];
  edges: unknown[];
  elements?: unknown[];
};

export type Board = {
  id: string;
  ownerId: string;
  // Raw canvas data — typed as unknown[] since we store arbitrary JSON.
  // Consumers can cast to CanvasNode[] / CanvasEdge[] as needed.
  nodes: unknown[];
  edges: unknown[];
  elements: unknown[];
  visibility: BoardVisibility;
  collaborators: string[];
  activeUsers: number;
  lastActivity: string;
  createdAt: string;
  updatedAt: string;
};
