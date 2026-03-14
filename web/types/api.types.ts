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

export type BoardVisibility = "view" | "edit";

export interface Board {
  id: string;
  ownerId: string;
  nodes: Node[];
  edges: Edge[];
  elements: ExcalidrawElement[];
  files?: Record<string, { id: string; mimeType: string; dataURL: string }>;
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
  files?: Record<string, { id: string; mimeType: string; dataURL: string }>;
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
// Media Types
// ============================================================================

export type MediaType = 'image' | 'pdf' | 'csv' | 'excel' | 'doc' | 'youtube' | 'vimeo' | 'website';

export interface MediaUploadResult {
  id: string;
  fileName?: string;
  originalName?: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  type: MediaType;
  metadata?: {
    width?: number;
    height?: number;
    duration?: number;
    title?: string;
    description?: string;
    videoId?: string;
    platform?: string;
  };
  uploadedAt: string;
  userId: string;
}

export interface LinkPreviewData {
  url: string;
  title: string;
  description?: string;
  image?: string;
  siteName?: string;
  type: MediaType;
  metadata?: {
    videoId?: string;
    platform?: string;
    duration?: string;
    author?: string;
  };
}

export interface MediaParseRequest {
  url: string;
}

// ============================================================================
// Presence Types
// ============================================================================

export interface PresenceUser {
  userId: string;
  userName?: string;
  userEmail?: string;
  userAvatar?: string;
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
  userName?: string;
  userEmail?: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  addedAt: string;
}

export interface CollaboratorsResponse {
  collaborators: Collaborator[];
}

// ============================================================================
// Search Types
// ============================================================================

export interface SearchResult {
  nodeId: string;
  score: number;
  preview: string;
  type: string;
  position?: { x: number; y: number };
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  query: string;
}

export interface SearchFilters {
  type?: string;
  minScore?: number;
  topK?: number;
}

export interface SearchRequest {
  query: string;
  nodes: Array<{
    id: string;
    type?: string;
    position?: { x: number; y: number };
    data?: Record<string, unknown>;
  }>;
  filters?: SearchFilters;
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
