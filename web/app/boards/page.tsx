"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { listBoards, createBoard } from "@/lib/api";
import type { Board } from "@/types/api.types";
import type { ApiError } from "@/lib/api-client";

export default function BoardsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/signin");
      return;
    }

    loadBoards();
  }, [user, authLoading, router]);

  async function loadBoards() {
    try {
      setLoading(true);
      setError(null);
      const data = await listBoards();
      setBoards(data);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || "Failed to load boards");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateBoard() {
    try {
      setCreating(true);
      setError(null);
      const newBoard = await createBoard();
      router.push(`/board/${newBoard.id}`);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || "Failed to create board");
      setCreating(false);
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading boards...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Boards</h1>
          <button
            onClick={handleCreateBoard}
            disabled={creating}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {creating ? "Creating..." : "+ New Board"}
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {boards.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-600 mb-4">No boards yet. Create your first board to get started!</p>
            <button
              onClick={handleCreateBoard}
              disabled={creating}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {creating ? "Creating..." : "Create First Board"}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {boards.map((board) => (
              <div
                key={board.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      Board {board.id.slice(0, 8)}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {new Date(board.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                    {board.visibility}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                  <span>{board.nodes.length} nodes</span>
                  <span>{board.edges.length} edges</span>
                  {board.activeUsers > 0 && (
                    <span className="text-green-600">{board.activeUsers} active</span>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => router.push(`/board/${board.id}`)}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    Open
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
