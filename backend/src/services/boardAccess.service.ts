import { firestoreConfig, getFirestore } from "../config/firestore";

export type BoardVisibility = "private" | "view" | "edit";

export type AccessLevel = "owner" | "edit" | "view" | "none";

type BoardAccessData = {
  ownerId: string;
  visibility: BoardVisibility;
  collaborators: string[];
};

export const boardAccessService = {
  /**
   * Check user's access level to a board
   */
  async checkAccess(boardId: string, userId: string): Promise<AccessLevel> {
    const db = getFirestore();
    const docRef = db.collection(firestoreConfig.collectionName).doc(boardId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return "none";
    }

    const data = doc.data() as BoardAccessData;

    // Owner has full access
    if (data.ownerId === userId) {
      return "owner";
    }

    // Check collaborators for edit access
    if (data.collaborators?.includes(userId)) {
      return "edit";
    }

    // Check visibility for view access
    if (data.visibility === "view" || data.visibility === "edit") {
      return "view";
    }

    return "none";
  },

  /**
   * Verify user has at least view access
   */
  async canView(boardId: string, userId: string): Promise<boolean> {
    const access = await this.checkAccess(boardId, userId);
    return access !== "none";
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
    const access = await this.checkAccess(boardId, userId);
    return access === "owner";
  },
};
