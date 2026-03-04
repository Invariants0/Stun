import { firestoreConfig, getFirestore } from "../config/firestore";
import { boardAccessService, type BoardVisibility } from "./boardAccess.service";
import { presenceService } from "./presence.service";

type BoardPayload = {
  nodes: unknown[];
  edges: unknown[];
  elements?: unknown[];
};

type BoardRecord = {
  id: string;
  ownerId: string;
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

export const boardService = {
  async createBoard(ownerId: string, payload: BoardPayload) {
    const db = getFirestore();
    const boardsRef = db.collection(firestoreConfig.collectionName);
    
    const now = new Date().toISOString();
    const boardData = {
      ownerId,
      nodes: payload.nodes ?? [],
      edges: payload.edges ?? [],
      elements: payload.elements ?? [],
      visibility: "private" as BoardVisibility,
      collaborators: [],
      activeUsers: 0,
      lastActivity: now,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await boardsRef.add(boardData);
    
    return {
      id: docRef.id,
      ...boardData,
    };
  },

  async getBoard(id: string, userId: string): Promise<BoardRecord> {
    const db = getFirestore();
    const docRef = db.collection(firestoreConfig.collectionName).doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      throw new Error("Board not found");
    }

    const data = doc.data();
    
    // Check access permissions
    const canView = await boardAccessService.canView(id, userId);
    if (!canView) {
      throw new Error("Unauthorized access to board");
    }

    // Update presence
    await presenceService.updatePresence(id, userId);

    // Get active users count
    const activeUsers = await presenceService.getActiveUsers(id);

    return {
      id: doc.id,
      ownerId: data?.ownerId ?? "",
      nodes: data?.nodes ?? [],
      edges: data?.edges ?? [],
      elements: data?.elements ?? [],
      visibility: data?.visibility ?? "private",
      collaborators: data?.collaborators ?? [],
      activeUsers: activeUsers.length,
      lastActivity: data?.lastActivity ?? data?.updatedAt ?? "",
      createdAt: data?.createdAt ?? "",
      updatedAt: data?.updatedAt ?? "",
    };
  },

  async updateBoard(id: string, userId: string, payload: BoardPayload): Promise<BoardRecord> {
    const db = getFirestore();
    const docRef = db.collection(firestoreConfig.collectionName).doc(id);
    
    const doc = await docRef.get();
    if (!doc.exists) {
      throw new Error("Board not found");
    }

    // Check edit permissions
    const canEdit = await boardAccessService.canEdit(id, userId);
    if (!canEdit) {
      throw new Error("Unauthorized access to board");
    }

    const data = doc.data();
    const now = new Date().toISOString();
    
    const updateData = {
      nodes: payload.nodes ?? [],
      edges: payload.edges ?? [],
      elements: payload.elements ?? [],
      lastActivity: now,
      updatedAt: now,
    };

    await docRef.update(updateData);

    // Update presence
    await presenceService.updatePresence(id, userId);

    // Get active users count
    const activeUsers = await presenceService.getActiveUsers(id);

    return {
      id: doc.id,
      ownerId: data?.ownerId ?? "",
      nodes: updateData.nodes,
      edges: updateData.edges,
      elements: updateData.elements,
      visibility: data?.visibility ?? "private",
      collaborators: data?.collaborators ?? [],
      activeUsers: activeUsers.length,
      lastActivity: updateData.lastActivity,
      createdAt: data?.createdAt ?? "",
      updatedAt: updateData.updatedAt,
    };
  },

  async updateVisibility(
    id: string,
    userId: string,
    visibility: BoardVisibility
  ): Promise<void> {
    const db = getFirestore();
    const docRef = db.collection(firestoreConfig.collectionName).doc(id);

    // Only owner can change visibility
    const isOwner = await boardAccessService.isOwner(id, userId);
    if (!isOwner) {
      throw new Error("Only owner can change board visibility");
    }

    await docRef.update({
      visibility,
      updatedAt: new Date().toISOString(),
    });
  },

  async addCollaborator(id: string, ownerId: string, collaboratorId: string): Promise<void> {
    const db = getFirestore();
    const docRef = db.collection(firestoreConfig.collectionName).doc(id);

    // Only owner can add collaborators
    const isOwner = await boardAccessService.isOwner(id, ownerId);
    if (!isOwner) {
      throw new Error("Only owner can add collaborators");
    }

    const doc = await docRef.get();
    if (!doc.exists) {
      throw new Error("Board not found");
    }

    const data = doc.data();
    const collaborators = data?.collaborators ?? [];

    if (collaborators.includes(collaboratorId)) {
      throw new Error("User is already a collaborator");
    }

    if (data?.ownerId === collaboratorId) {
      throw new Error("Owner is already a collaborator");
    }

    await docRef.update({
      collaborators: [...collaborators, collaboratorId],
      updatedAt: new Date().toISOString(),
    });
  },

  async removeCollaborator(id: string, ownerId: string, collaboratorId: string): Promise<void> {
    const db = getFirestore();
    const docRef = db.collection(firestoreConfig.collectionName).doc(id);

    // Only owner can remove collaborators
    const isOwner = await boardAccessService.isOwner(id, ownerId);
    if (!isOwner) {
      throw new Error("Only owner can remove collaborators");
    }

    const doc = await docRef.get();
    if (!doc.exists) {
      throw new Error("Board not found");
    }

    const data = doc.data();
    const collaborators = data?.collaborators ?? [];

    await docRef.update({
      collaborators: collaborators.filter((id: string) => id !== collaboratorId),
      updatedAt: new Date().toISOString(),
    });
  },

  async getCollaborators(id: string, userId: string): Promise<string[]> {
    const db = getFirestore();
    const docRef = db.collection(firestoreConfig.collectionName).doc(id);

    // User must have view access
    const canView = await boardAccessService.canView(id, userId);
    if (!canView) {
      throw new Error("Unauthorized access to board");
    }

    const doc = await docRef.get();
    if (!doc.exists) {
      throw new Error("Board not found");
    }

    const data = doc.data();
    return data?.collaborators ?? [];
  },
};
