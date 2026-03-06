import { getFirestore, firestoreCollections } from "../config";
import type { QueryDocumentSnapshot } from "firebase-admin/firestore";

type PresenceData = {
  boardId: string;
  userId: string;
  lastSeen: string;
  cursor?: {
    x: number;
    y: number;
  };
};

const PRESENCE_TIMEOUT_MS = 60000; // 1 minute

export const presenceService = {
  /**
   * Update user presence on a board
   */
  async updatePresence(
    boardId: string,
    userId: string,
    cursor?: { x: number; y: number }
  ): Promise<void> {
    const db = getFirestore();
    const presenceId = `${boardId}_${userId}`;
    const presenceRef = db.collection(firestoreCollections.presence).doc(presenceId);

    const presenceData: PresenceData = {
      boardId,
      userId,
      lastSeen: new Date().toISOString(),
      ...(cursor && { cursor }),
    };

    await presenceRef.set(presenceData, { merge: true });
  },

  /**
   * Get active users on a board
   */
  async getActiveUsers(boardId: string): Promise<string[]> {
    const db = getFirestore();
    const presenceRef = db.collection(firestoreCollections.presence);
    
    const cutoffTime = new Date(Date.now() - PRESENCE_TIMEOUT_MS).toISOString();
    
    const snapshot = await presenceRef
      .where("boardId", "==", boardId)
      .where("lastSeen", ">", cutoffTime)
      .get();

    return snapshot.docs.map((doc: QueryDocumentSnapshot) => {
      const data = doc.data() as PresenceData;
      return data.userId;
    });
  },

  /**
   * Remove user presence from a board
   */
  async removePresence(boardId: string, userId: string): Promise<void> {
    const db = getFirestore();
    const presenceId = `${boardId}_${userId}`;
    const presenceRef = db.collection(firestoreCollections.presence).doc(presenceId);

    await presenceRef.delete();
  },

  /**
   * Clean up stale presence records
   */
  async cleanupStalePresence(): Promise<void> {
    try {
      const db = getFirestore();
      const presenceRef = db.collection(firestoreCollections.presence);
      
      const cutoffTime = new Date(Date.now() - PRESENCE_TIMEOUT_MS).toISOString();
      
      const snapshot = await presenceRef
        .where("lastSeen", "<", cutoffTime)
        .get();

      const batch = db.batch();
      snapshot.docs.forEach((doc: QueryDocumentSnapshot) => {
        batch.delete(doc.ref);
      });

      await batch.commit();
    } catch (error: any) {
      // Ignore collection not found errors — presence collection may not exist yet
      if (error.code === 5 || error.code === "NOT_FOUND") {
        return;
      }
      throw error;
    }
  },
};

/**
 * Start a background interval to purge stale presence records.
 * Call once at server startup (index.ts).
 * Returns the interval handle so it can be cleared in tests.
 */
export function startPresenceCleanup(intervalMs = 5 * 60 * 1000): ReturnType<typeof setInterval> {
  return setInterval(() => {
    presenceService.cleanupStalePresence().catch((err) => {
      console.error("[presence] cleanup error", err);
    });
  }, intervalMs);
}
