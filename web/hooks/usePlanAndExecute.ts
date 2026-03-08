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

        // 2. Get current live board state from store (not potentially stale API cache)
        const boardState = useBoardStore.getState();
        const currentBoard = boardState.boards[boardId];
        const nodes: Node[] = currentBoard?.reactflow?.nodes ?? [];
        const edges: Edge[] = currentBoard?.reactflow?.edges ?? [];
        
        console.log("[usePlanAndExecute] Using current nodes for AI:", nodes.map(n => ({ id: n.id, type: n.type })));

        // 3. Call AI planner with current state
        const plan = await planActions({ boardId, command, screenshot, nodes });
        
        console.log("[usePlanAndExecute] AI plan received:", plan);

        // 4. Refresh live state before execution (in case it changed during AI call)
        const freshBoardState = useBoardStore.getState();
        const freshBoard = freshBoardState.boards[boardId];
        let liveNodes = [...(freshBoard?.reactflow?.nodes ?? [])];
        let liveEdges = [...(freshBoard?.reactflow?.edges ?? [])];
        
        console.log("[usePlanAndExecute] Starting execution with", liveNodes.length, "nodes:", liveNodes.map(n => n.id));

        // 5. Build executor with Zustand-backed adapters
        const executor = new ActionExecutor({
          nodes: liveNodes,
          edges: liveEdges,
          viewport: { x: 0, y: 0, zoom: 1 }, // TODO: Get actual viewport from React Flow
          setNodes: (updater) => {
            const prevCount = liveNodes.length;
            liveNodes =
              typeof updater === "function" ? updater(liveNodes) : updater;
            console.log("[usePlanAndExecute] Nodes updated:", prevCount, "→", liveNodes.length);
            console.log("[usePlanAndExecute] New nodes:", liveNodes.map(n => ({ id: n.id, pos: n.position })));
            setReactFlowData(boardId, {
              nodes: liveNodes,
              edges: liveEdges,
            });
          },
          setEdges: (updater) => {
            const prevCount = liveEdges.length;
            liveEdges =
              typeof updater === "function" ? updater(liveEdges) : updater;
            console.log("[usePlanAndExecute] Edges updated:", prevCount, "→", liveEdges.length);
            setReactFlowData(boardId, {
              nodes: liveNodes,
              edges: liveEdges,
            });
          },
          // Viewport changes are handled by the camera-sync service; no-op here
          setViewport: () => {},
        }, boardId); // Pass boardId to ActionExecutor

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
