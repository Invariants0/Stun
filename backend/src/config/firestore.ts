export const firestoreConfig = {
  projectId: process.env.GCP_PROJECT_ID ?? "",
  collectionName: process.env.BOARDS_COLLECTION ?? "boards",
};
