import { getFirestore, firestoreCollections } from "../config";
import type { BoardVisibility } from "../api/models/board.model";

export type { BoardVisibility };
export type AccessLevel = "owner" | "edit" | "view" | "none";

export type BoardAccessData = {
  ownerId: string;
  visibility: BoardVisibility;
  collaborators: string[];
};

export const boardAccessService = {
  /**
   * Derive access level from already-fetched board data — zero extra Firestore reads.
   * Use this when the caller already has the board document.
   */
  checkAccessFromData(data: BoardAccessData, userId: string): AccessLevel {
    if (data.ownerId === userId) return "owner";
    if (data.collaborators?.includes(userId)) return "edit";
    if (data.visibility === "view" || data.visibility === "edit") return "view";
    return "none";
  },

  /**
   * Fetch board and derive access level. Use when the caller doesn't have the doc.
   */
  async checkAccess(boardId: string, userId: string): Promise<AccessLevel> {
    const db = getFirestore();
    const doc = await db.collection(firestoreCollections.boards).doc(boardId).get();
    if (!doc.exists) return "none";
    return this.checkAccessFromData(doc.data() as BoardAccessData, userId);
  },

  async canView(boardId: string, userId: string): Promise<boolean> {
    return (await this.checkAccess(boardId, userId)) !== "none";
  },

  /**
   * Verify user has edit access
   */
  async canEdit(boardId: string, userId: string): Promise<boolean> {
    const access = await this.checkAccess(boardId, userId);
    return access === "owner" || access === "edit";
  },

  /**
   * Verify user is owner
   */
  async isOwner(boardId: string, userId: string): Promise<boolean> {
    return (await this.checkAccess(boardId, userId)) === "owner";
  },
};
