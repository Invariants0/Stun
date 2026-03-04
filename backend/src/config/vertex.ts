import { GoogleGenAI } from "@google/genai";

export const vertexConfig = {
  projectId: process.env.GCP_PROJECT_ID ?? "",
  location: process.env.GCP_REGION ?? "us-central1",
  model: process.env.VERTEX_MODEL ?? "gemini-2.0-flash-exp",
  apiKey: process.env.GOOGLE_API_KEY ?? "",
};

let genAIInstance: GoogleGenAI | null = null;

export function getGenAI(): GoogleGenAI {
  if (!genAIInstance) {
    if (!vertexConfig.apiKey) {
      throw new Error("GOOGLE_API_KEY environment variable is required");
    }
    genAIInstance = new GoogleGenAI({
      apiKey: vertexConfig.apiKey,
    });
  }
  return genAIInstance;
}
