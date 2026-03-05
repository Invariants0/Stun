/**
 * Google GenAI (Gemini) client — singleton.
 */
import { GoogleGenAI } from "@google/genai";
import envVars from "./envVars";

let instance: GoogleGenAI | null = null;

export function getGenAI(): GoogleGenAI {
  if (instance) return instance;

  instance = new GoogleGenAI({ apiKey: envVars.GOOGLE_API_KEY });
  return instance;
}

export const genAIConfig = {
  model:    envVars.VERTEX_MODEL,
  location: envVars.GCP_REGION,
  project:  envVars.GCP_PROJECT_ID,
} as const;
