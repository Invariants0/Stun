import { getFirestore, firestoreCollections } from "../config";
import { NotFoundError, ForbiddenError, ConflictError } from "../api/middleware/error.middleware";
import { boardAccessService, type BoardAccessData } from "./boardAccess.service";
import { presenceService } from "./presence.service";
import type { Board, BoardPayload, BoardVisibility } from "../api/models/board.model";

/** Raw shape stored in Firestore — no computed fields like activeUsers */
type FirestoreBoard = BoardAccessData & {
  nodes: unknown[];
  edges: unknown[];
  elements: unknown[];
  activeUsers: number;
  lastActivity: string;
  createdAt: string;
  updatedAt: string;
};

/** Map a Firestore document + id + active user list → Board response */
function docToBoard(
  id: string,
  data: FirestoreBoard,
  activeUsers: string[]
): Board {
  return {
    id,
    ownerId:       data.ownerId,
    nodes:         data.nodes        ?? [],
    edges:         data.edges        ?? [],
    elements:      data.elements     ?? [],
    visibility:    data.visibility   ?? "private",
    collaborators: data.collaborators ?? [],
    activeUsers:   activeUsers.length,
    lastActivity:  data.lastActivity  ?? data.updatedAt ?? "",
    createdAt:     data.createdAt     ?? "",
    updatedAt:     data.updatedAt     ?? "",
  };
}

export const boardService = {
  async createBoard(ownerId: string, payload: BoardPayload): Promise<Board> {
    const db  = getFirestore();
    const col = db.collection(firestoreCollections.boards);
    const now = new Date().toISOString();

    const data: FirestoreBoard = {
      ownerId,
      nodes:         payload.nodes    ?? [],
      edges:         payload.edges    ?? [],
      elements:      payload.elements ?? [],
      visibility:    "private",
      collaborators: [],
      activeUsers:   0,
      lastActivity:  now,
      createdAt:     now,
      updatedAt:     now,
    };

    try {
      const docRef = await col.add(data);
      return docToBoard(docRef.id, data, []);
    } catch (error: any) {
      if (error.code === 5 || error.message?.includes('NOT_FOUND')) {
        throw new Error(
          'Firestore database not found. ' +
          'For local dev: Start Firestore emulator with "firebase emulators:start --only firestore". ' +
          'For production: Create a Firestore database in Google Cloud Console. ' +
          'See FIRESTORE_SETUP.md for details.'
        );
      }
      throw error;
    }
  },

  async listBoards(ownerId: string): Promise<Board[]> {
    const db  = getFirestore();
    const col = db.collection(firestoreCollections.boards);

    try {
      // Parallel queries — owned and collaborated
      const [ownedSnap, collabSnap] = await Promise.all([
        col.where("ownerId",       "==",            ownerId).get(),
        col.where("collaborators", "array-contains", ownerId).get(),
      ]);

      // Merge + dedupe by document id
      const map = new Map<string, Board>();
      for (const doc of [...ownedSnap.docs, ...collabSnap.docs]) {
        if (!map.has(doc.id)) {
          const data = doc.data() as FirestoreBoard;
          map.set(doc.id, docToBoard(doc.id, data, []));
        }
      }
      return Array.from(map.values());
    } catch (error: any) {
      if (error.code === 5 || error.message?.includes('NOT_FOUND')) {
        throw new Error(
          'Firestore database not found. ' +
          'For local dev: Start Firestore emulator with "firebase emulators:start --only firestore". ' +
          'For production: Create a Firestore database in Google Cloud Console. ' +
          'See FIRESTORE_SETUP.md for details.'
        );
      }
      throw error;
    }
  },

  async getBoard(id: string, userId: string): Promise<Board> {
    const db     = getFirestore();
    const doc    = await db.collection(firestoreCollections.boards).doc(id).get();

    if (!doc.exists) throw new NotFoundError("Board not found");

    const data   = doc.data() as FirestoreBoard;
    const access = boardAccessService.checkAccessFromData(data, userId);

    if (access === "none") throw new ForbiddenError("Unauthorized access to board");

    // Parallel: update presence + fetch active users
    const [, activeUsers] = await Promise.all([
      presenceService.updatePresence(id, userId),
      presenceService.getActiveUsers(id),
    ]);

    return docToBoard(id, data, activeUsers);
  },

  async updateBoard(id: string, userId: string, payload: BoardPayload): Promise<Board> {
    const db     = getFirestore();
    const docRef = db.collection(firestoreCollections.boards).doc(id);
    const doc    = await docRef.get();

    if (!doc.exists) throw new NotFoundError("Board not found");

    const data   = doc.data() as FirestoreBoard;
    const access = boardAccessService.checkAccessFromData(data, userId);

    if (access === "none" || access === "view") {
      throw new ForbiddenError("Unauthorized access to board");
    }

    const now        = new Date().toISOString();
    const updateData = {
      nodes:        payload.nodes    ?? [],
      edges:        payload.edges    ?? [],
      elements:     payload.elements ?? [],
      lastActivity: now,
      updatedAt:    now,
    };

    // Parallel: persist update + update presence
    const [, activeUsers] = await Promise.all([
      docRef.update(updateData),
      presenceService.updatePresence(id, userId),
      presenceService.getActiveUsers(id),
    ]).then(([,, users]) => [undefined, users] as const);

    return docToBoard(id, { ...data, ...updateData }, activeUsers);
  },

  async deleteBoard(id: string, userId: string): Promise<void> {
    const db     = getFirestore();
    const docRef = db.collection(firestoreCollections.boards).doc(id);
    const doc    = await docRef.get();

    if (!doc.exists) throw new NotFoundError("Board not found");

    const data = doc.data() as FirestoreBoard;
    
    // Only owner can delete board
    if (data.ownerId !== userId) {
      throw new ForbiddenError("Only the board owner can delete this board");
    }

    // Clean up presence data and delete board
    await Promise.all([
      docRef.delete(),
      presenceService.clearBoard(id),
    ]);
  },

  async updateVisibility(id: string, userId: string, visibility: BoardVisibility): Promise<void> {
    const db     = getFirestore();
    const docRef = db.collection(firestoreCollections.boards).doc(id);
    const doc    = await docRef.get();

    if (!doc.exists) throw new NotFoundError("Board not found");

    const access = boardAccessService.checkAccessFromData(doc.data() as FirestoreBoard, userId);
    if (access !== "owner") throw new ForbiddenError("Only owner can change board visibility");

    await docRef.update({ visibility, updatedAt: new Date().toISOString() });
  },

  async addCollaborator(id: string, ownerId: string, collaboratorId: string): Promise<void> {
    const db     = getFirestore();
    const docRef = db.collection(firestoreCollections.boards).doc(id);
    const doc    = await docRef.get();

    if (!doc.exists) throw new NotFoundError("Board not found");

    const data   = doc.data() as FirestoreBoard;
    const access = boardAccessService.checkAccessFromData(data, ownerId);
    if (access !== "owner") throw new ForbiddenError("Only owner can add collaborators");

    if (data.ownerId === collaboratorId) {
      throw new ConflictError("Owner is already a collaborator");
    }
    if (data.collaborators?.includes(collaboratorId)) {
      throw new ConflictError("User is already a collaborator");
    }

    await docRef.update({
      collaborators: [...(data.collaborators ?? []), collaboratorId],
      updatedAt:     new Date().toISOString(),
    });
  },

  async removeCollaborator(id: string, ownerId: string, collaboratorId: string): Promise<void> {
    const db     = getFirestore();
    const docRef = db.collection(firestoreCollections.boards).doc(id);
    const doc    = await docRef.get();

    if (!doc.exists) throw new NotFoundError("Board not found");

    const data   = doc.data() as FirestoreBoard;
    const access = boardAccessService.checkAccessFromData(data, ownerId);
    if (access !== "owner") throw new ForbiddenError("Only owner can remove collaborators");

    await docRef.update({
      // Fixed: was shadowing outer `id` parameter with `(id: string) =>`
      collaborators: (data.collaborators ?? []).filter((uid) => uid !== collaboratorId),
      updatedAt:     new Date().toISOString(),
    });
  },

  async getCollaborators(id: string, userId: string): Promise<string[]> {
    const db  = getFirestore();
    const doc = await db.collection(firestoreCollections.boards).doc(id).get();

    if (!doc.exists) throw new NotFoundError("Board not found");

    const data   = doc.data() as FirestoreBoard;
    const access = boardAccessService.checkAccessFromData(data, userId);
    if (access === "none") throw new ForbiddenError("Unauthorized access to board");

    return data.collaborators ?? [];
  },
};
