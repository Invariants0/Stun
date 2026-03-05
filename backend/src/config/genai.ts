/**
 * Google GenAI (Gemini) client — singleton.
 */
import { GoogleGenAI } from "@google/genai";
import { env } from "./env";

let instance: GoogleGenAI | null = null;

export function getGenAI(): GoogleGenAI {
  if (instance) return instance;

  if (!env.googleApiKey) {
    throw new Error("GOOGLE_API_KEY environment variable is required");
  }

  instance = new GoogleGenAI({ apiKey: env.googleApiKey });
  return instance;
}

export const genAIConfig = {
  model:    env.vertexModel,
  location: env.gcpRegion,
  project:  env.gcpProjectId,
} as const;
