/**
 * Shared API Types
 * 
 * Type-safe definitions for all API requests and responses
 * Matches backend models and controllers
 */

import type { Node, Edge } from "reactflow";
import type { ExcalidrawElement } from "@excalidraw/excalidraw/types/element/types";

// ============================================================================
// Board Types
// ============================================================================

export type BoardVisibility = "private" | "view" | "edit";

export interface Board {
  id: string;
  ownerId: string;
  nodes: Node[];
  edges: Edge[];
  elements: ExcalidrawElement[];
  visibility: BoardVisibility;
  collaborators: string[];
  activeUsers: number;
  lastActivity: string;
  createdAt: string;
  updatedAt: string;
}

export interface BoardPayload {
  nodes: Node[];
  edges: Edge[];
  elements?: ExcalidrawElement[];
}

export interface BoardListResponse {
  boards: Board[];
}

// ============================================================================
// AI Types
// ============================================================================

export interface AIActionRequest {
  boardId: string;
  command: string;
  screenshot: string;
  nodes: Node[];
}

export interface AIAction {
  type: "move" | "connect" | "highlight" | "zoom" | "group" | "cluster" | "create" | "delete" | "transform";
  nodeId?: string;
  nodeIds?: string[];
  to?: { x: number; y: number };
  source?: string;
  target?: string;
  viewport?: { x: number; y: number; zoom: number };
  groupId?: string;
  color?: string;
  duration?: number;
  data?: Record<string, unknown>;
}

export interface AIActionPlan {
  actions: AIAction[];
  reasoning?: string;
  executionOrder: "sequential" | "parallel";
}

// ============================================================================
// Presence Types
// ============================================================================

export interface PresenceUser {
  userId: string;
  displayName?: string;
  photoURL?: string;
  lastSeen: string;
  cursor?: { x: number; y: number };
}

export interface PresenceResponse {
  users: PresenceUser[];
}

// ============================================================================
// Auth Types
// ============================================================================

export interface AuthUser {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
}

// ============================================================================
// Collaborator Types
// ============================================================================

export interface Collaborator {
  userId: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  addedAt: string;
}

export interface CollaboratorsResponse {
  collaborators: Collaborator[];
}

// ============================================================================
// Generic API Response Types
// ============================================================================

export interface SuccessResponse {
  success: boolean;
}

export interface ErrorResponse {
  error: string;
  message: string;
}
