/**
 * usePlanAndExecute
 *
 * Wires together the AI planning pipeline:
 *   user command → screenshot → planActions API → ActionExecutor.executePlan
 */

"use client";

import { useCallback, useState } from "react";
import type { Node, Edge } from "reactflow";
import { useBoardStore } from "@/store/board.store";
import { useToastStore } from "@/store/toast.store";
import { planActions } from "@/lib/api";
import { ActionExecutor } from "@/lib/action-executor";
import { useScreenshot } from "@/hooks/useScreenshot";

export function usePlanAndExecute(boardId: string | undefined) {
  const [isPlanning, setIsPlanning] = useState(false);

  const getBoard = useBoardStore((s) => s.getBoard);
  const setReactFlowData = useBoardStore((s) => s.setReactFlowData);
  const addToast = useToastStore((s) => s.addToast);

  const execute = useCallback(
    async (command: string) => {
      if (!boardId || !command.trim()) return;
      setIsPlanning(true);

      try {
        // 1. Capture canvas screenshot (best-effort)
        let screenshot = "";
        const canvasEl = document.getElementById("canvas-root");
        if (canvasEl instanceof HTMLElement) {
          try {
            screenshot = await useScreenshot(canvasEl);
          } catch {
            // Non-fatal: proceed without screenshot
          }
        }

        // 2. Read current board state
        const board = getBoard(boardId);
        const nodes: Node[] = board?.reactflow.nodes ?? [];
        const edges: Edge[] = board?.reactflow.edges ?? [];

        // 3. Call AI planner
        const plan = await planActions({ boardId, command, screenshot, nodes });

        // 4. Mutable working copies so each executor step sees the latest state
        let liveNodes = [...nodes];
        let liveEdges = [...edges];

        // 5. Build executor with Zustand-backed adapters
        const executor = new ActionExecutor({
          nodes: liveNodes,
          edges: liveEdges,
          viewport: { x: 0, y: 0, zoom: 1 },
          setNodes: (updater) => {
            liveNodes =
              typeof updater === "function" ? updater(liveNodes) : updater;
            setReactFlowData(boardId, {
              nodes: liveNodes,
              edges: liveEdges,
            });
          },
          setEdges: (updater) => {
            liveEdges =
              typeof updater === "function" ? updater(liveEdges) : updater;
            setReactFlowData(boardId, {
              nodes: liveNodes,
              edges: liveEdges,
            });
          },
          // Viewport changes are handled by the camera-sync service; no-op here
          setViewport: () => {},
        });

        // 6. Execute
        await executor.executePlan(plan);

        if (plan.reasoning) {
          addToast(plan.reasoning, "success");
        }
      } catch (err: any) {
        console.error("[STUN] Plan execution failed:", err);
        addToast(err?.message ?? "AI command failed", "error");
      } finally {
        setIsPlanning(false);
      }
    },
    [boardId, getBoard, setReactFlowData, addToast]
  );

  return { execute, isPlanning };
}
