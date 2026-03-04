import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080",
  timeout: 30000, // 30s timeout
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
