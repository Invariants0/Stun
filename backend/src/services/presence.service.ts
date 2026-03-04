import { getFirestore } from "../config/firestore";

type PresenceData = {
  boardId: string;
  userId: string;
  lastSeen: string;
  cursor?: {
    x: number;
    y: number;
  };
};

const PRESENCE_COLLECTION = "board_presence";
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
    const presenceRef = db.collection(PRESENCE_COLLECTION).doc(presenceId);

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
    const presenceRef = db.collection(PRESENCE_COLLECTION);
    
    const cutoffTime = new Date(Date.now() - PRESENCE_TIMEOUT_MS).toISOString();
    
    const snapshot = await presenceRef
      .where("boardId", "==", boardId)
      .where("lastSeen", ">", cutoffTime)
      .get();

    return snapshot.docs.map((doc) => {
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
    const presenceRef = db.collection(PRESENCE_COLLECTION).doc(presenceId);

    await presenceRef.delete();
  },

  /**
   * Clean up stale presence records
   */
  async cleanupStalePresence(): Promise<void> {
    const db = getFirestore();
    const presenceRef = db.collection(PRESENCE_COLLECTION);
    
    const cutoffTime = new Date(Date.now() - PRESENCE_TIMEOUT_MS).toISOString();
    
    const snapshot = await presenceRef
      .where("lastSeen", "<", cutoffTime)
      .get();

    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
  },
};
