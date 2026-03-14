/**
 * usePlanAndExecute
 *
 * Wires together the AI planning pipeline:
 *   user command -> screenshot -> planActions API -> executeCanvasActions
 */

"use client";

import { useCallback, useState } from "react";
import type { Edge, Node } from "reactflow";
import { useBoardStore } from "@/store/board.store";
import { useToastStore } from "@/store/toast.store";
import { planActions } from "@/lib/api";
import { useScreenshot } from "@/hooks/useScreenshot";
import {
  getReactFlowInstance,
  waitForReactFlowInstance,
} from "@/lib/reactflow-runtime";
import { executeCanvasActions } from "@/lib/canvas-command-executor";
import {
  getCanvasEngineState,
  getEngineViewport,
} from "@/lib/canvas-engine-runtime";

export function usePlanAndExecute(boardId: string | undefined) {
  const [isPlanning, setIsPlanning] = useState(false);

  const setReactFlowData = useBoardStore((s) => s.setReactFlowData);
  const addToast = useToastStore((s) => s.addToast);

  const execute = useCallback(
    async (command: string) => {
      if (!boardId || !command.trim()) return;
      setIsPlanning(true);

      try {
        const rfReadyInstance = await waitForReactFlowInstance(boardId, 3000);
        void rfReadyInstance;

        let screenshot = "";
        const canvasEl = document.getElementById("canvas-root");
        if (canvasEl instanceof HTMLElement) {
          try {
            screenshot = await useScreenshot(canvasEl);
          } catch {
            // Non-fatal: proceed without screenshot
          }
        }

        const getLiveReactFlow = () => getReactFlowInstance(boardId);

        const boardState = useBoardStore.getState();
        const currentBoard = boardState.boards[boardId];
        const nodes: Node[] = currentBoard?.reactflow?.nodes ?? [];
        const edges: Edge[] = currentBoard?.reactflow?.edges ?? [];
        const canvasState = getCanvasEngineState(boardId);
        const currentViewport = getEngineViewport(canvasState);

        console.log("[AI COMMAND SENT]", {
          boardId,
          command,
          viewport: currentViewport,
          nodeCount: nodes.length,
          edgeCount: edges.length,
        });

        const plan = await planActions({
          boardId,
          command,
          screenshot,
          nodes,
          viewport: {
            zoom: currentViewport.zoom,
            x: currentViewport.x,
            y: currentViewport.y,
          },
        });

        console.log("[AI PLAN RECEIVED]", {
          actionCount: plan.actions?.length ?? 0,
          actions: plan.actions,
        });

        if (!plan.actions || plan.actions.length === 0) {
          console.warn("[usePlanAndExecute] No actions to execute");
          addToast("AI returned no actions to execute", "info");
          return;
        }

        const freshBoardState = useBoardStore.getState();
        const freshBoard = freshBoardState.boards[boardId];
        let liveNodes = [...(freshBoard?.reactflow?.nodes ?? [])];
        let liveEdges = [...(freshBoard?.reactflow?.edges ?? [])];

        if (!getLiveReactFlow()) {
          throw new Error("ReactFlow instance not ready; cannot execute canvas actions");
        }

        await executeCanvasActions(plan.actions, {
          boardId,
          nodes: liveNodes,
          edges: liveEdges,
          canvasState: getCanvasEngineState(boardId),
          setNodes: (updater) => {
            const prevCount = liveNodes.length;
            liveNodes = typeof updater === "function" ? updater(liveNodes) : updater;
            console.log("[usePlanAndExecute] Nodes updated:", prevCount, "->", liveNodes.length);
            setReactFlowData(boardId, { nodes: liveNodes, edges: liveEdges });
          },
          setEdges: (updater) => {
            const prevCount = liveEdges.length;
            liveEdges = typeof updater === "function" ? updater(liveEdges) : updater;
            console.log("[usePlanAndExecute] Edges updated:", prevCount, "->", liveEdges.length);
            setReactFlowData(boardId, { nodes: liveNodes, edges: liveEdges });
          },
        });

        addToast("AI actions executed successfully", "success");

        if (plan.reasoning) {
          addToast(plan.reasoning, "success");
        }
      } catch (err: any) {
        console.error("[STUN] Plan execution failed:", err);
        console.error("[STUN] Error stack:", err.stack);
        addToast(err?.message ?? "AI command failed", "error");
      } finally {
        setIsPlanning(false);
      }
    },
    [boardId, setReactFlowData, addToast]
  );

  return { execute, isPlanning };
}
