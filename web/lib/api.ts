import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080",
});

export async function planActions(payload: {
  boardId: string;
  command: string;
  screenshot: string;
  nodes: unknown[];
}) {
  const { data } = await api.post("/ai/plan", payload);
  return data;
}
