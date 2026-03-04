import admin from "firebase-admin";

export const firestoreConfig = {
  projectId: process.env.GCP_PROJECT_ID ?? "",
  collectionName: process.env.BOARDS_COLLECTION ?? "boards",
};

let firestoreInstance: admin.firestore.Firestore | null = null;

export function getFirestore(): admin.firestore.Firestore {
  if (!firestoreInstance) {
    if (!admin.apps.length) {
      admin.initializeApp({
        projectId: firestoreConfig.projectId,
      });
    }
    firestoreInstance = admin.firestore();
  }
  return firestoreInstance;
}
