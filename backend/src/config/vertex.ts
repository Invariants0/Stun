export const vertexConfig = {
  projectId: process.env.GCP_PROJECT_ID ?? "",
  location: process.env.GCP_REGION ?? "us-central1",
  model: process.env.VERTEX_MODEL ?? "gemini-2.0-flash",
};
