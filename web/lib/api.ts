/**
 * API Service Layer
 * 
 * High-level API functions for all backend endpoints
 * Uses centralized api-client with retry logic and error handling
 */

import { api } from "./api-client";
import type {
  Board,
  BoardPayload,
  BoardListResponse,
  AIActionRequest,
  AIActionPlan,
  PresenceResponse,
  CollaboratorsResponse,
  SuccessResponse,
  BoardVisibility,
} from "@/types/api.types";

// ============================================================================
// Board APIs
// ============================================================================

export async function createBoard(payload?: BoardPayload): Promise<Board> {
  return api.post<Board>("/boards", payload || { nodes: [], edges: [] });
}

export async function listBoards(): Promise<Board[]> {
  const response = await api.get<BoardListResponse>("/boards");
  return response.boards;
}

export async function getBoard(boardId: string): Promise<Board> {
  return api.get<Board>(`/boards/${boardId}`);
}

export async function updateBoard(boardId: string, payload: BoardPayload): Promise<Board> {
  return api.put<Board>(`/boards/${boardId}`, payload);
}

export async function deleteBoard(boardId: string): Promise<SuccessResponse> {
  return api.delete<SuccessResponse>(`/boards/${boardId}`);
}

export async function updateBoardVisibility(
  boardId: string,
  visibility: BoardVisibility
): Promise<SuccessResponse> {
  return api.patch<SuccessResponse>(`/boards/${boardId}/visibility`, { visibility });
}

export async function addCollaborator(boardId: string, userId: string): Promise<SuccessResponse> {
  return api.post<SuccessResponse>(`/boards/${boardId}/share`, { userId });
}

export async function removeCollaborator(
  boardId: string,
  userId: string
): Promise<SuccessResponse> {
  return api.delete<SuccessResponse>(`/boards/${boardId}/share/${userId}`);
}

export async function getCollaborators(boardId: string): Promise<CollaboratorsResponse> {
  return api.get<CollaboratorsResponse>(`/boards/${boardId}/collaborators`);
}

// ============================================================================
// AI APIs
// ============================================================================

export async function planActions(payload: AIActionRequest): Promise<AIActionPlan> {
  return api.post<AIActionPlan>("/ai/plan", payload);
}

// ============================================================================
// Presence APIs
// ============================================================================

export async function updatePresence(boardId: string): Promise<SuccessResponse> {
  return api.post<SuccessResponse>(`/presence/${boardId}`);
}

export async function getActiveUsers(boardId: string): Promise<PresenceResponse> {
  return api.get<PresenceResponse>(`/presence/${boardId}`);
}
