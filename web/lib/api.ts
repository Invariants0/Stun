import axios from "axios";
import { getStoredToken } from "@/lib/auth";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080",
  timeout: 30000,
});

// Attach the Firebase ID token automatically on every request
api.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export async function planActions(payload: {
  boardId: string;
  command: string;
  screenshot: string;
  nodes: unknown[];
}) {
  try {
    const { data } = await api.post("/ai/plan", payload);
    return data;
  } catch (error: any) {
    console.error("API error in planActions:", error);
    if (error.response) {
      // Server responded with a status code outside the 2xx range
      throw new Error(error.response.data?.message || `Server error: ${error.response.status}`);
    } else if (error.request) {
      // Request was made but no response was received
      throw new Error("Network error: No response from server. Please check your connection.");
    } else {
      // Something happened in setting up the request
      throw new Error(error.message || "Failed to call AI planner");
    }
  }
}

// board APIs
export async function createBoard() {
  try {
    const { data } = await api.post("/boards", {});
    return data;
  } catch (err: any) {
    console.error("API error in createBoard:", err);
    throw err;
  }
}

export async function listBoards() {
  try {
    const { data } = await api.get("/boards");
    return data.boards as Array<any>;
  } catch (err: any) {
    console.error("API error in listBoards:", err);
    throw err;
  }
}
