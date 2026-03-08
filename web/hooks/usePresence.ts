/**
 * usePresence Hook - Lightweight Presence System
 * 
 * Features:
 * - Heartbeat every 15 seconds
 * - Shows active users on board
 * - No websockets (polling-based)
 */

"use client";

import { useEffect, useState } from "react";
import { updatePresence, getActiveUsers } from "@/lib/api";
import type { PresenceUser } from "@/types/api.types";

export interface UsePresenceReturn {
  activeUsers: PresenceUser[];
  isOnline: boolean;
  error: string | null;
}

export function usePresence(boardId: string | null): UsePresenceReturn {
  const [activeUsers, setActiveUsers] = useState<PresenceUser[]>([]);
  const [isOnline, setIsOnline] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!boardId) {
      setActiveUsers([]);
      setIsOnline(false);
      return;
    }

    const currentBoardId = boardId; // Capture for type narrowing
    let mounted = true;
    let heartbeatInterval: NodeJS.Timeout | null = null;
    let pollInterval: NodeJS.Timeout | null = null;

    // Send heartbeat to backend
    async function sendHeartbeat() {
      try {
        await updatePresence(currentBoardId);
        if (mounted) {
          setIsOnline(true);
          setError(null);
        }
      } catch (err: any) {
        console.error("Presence heartbeat failed:", err);
        if (mounted) {
          setIsOnline(false);
          setError(err.message || "Failed to update presence");
        }
      }
    }

    // Poll for active users
    async function pollActiveUsers() {
      try {
        const response = await getActiveUsers(currentBoardId);
        if (mounted) {
          setActiveUsers(response.users ?? []);
          setError(null);
        }
      } catch (err: any) {
        console.error("Failed to fetch active users:", err);
        if (mounted) {
          setError(err.message || "Failed to fetch active users");
        }
      }
    }

    // Initial heartbeat and poll
    sendHeartbeat();
    pollActiveUsers();

    // Set up heartbeat interval (every 15 seconds)
    heartbeatInterval = setInterval(sendHeartbeat, 15000);

    // Set up polling interval (every 10 seconds)
    pollInterval = setInterval(pollActiveUsers, 10000);

    return () => {
      mounted = false;
      if (heartbeatInterval) clearInterval(heartbeatInterval);
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [boardId]);

  return {
    activeUsers,
    isOnline,
    error,
  };
}
