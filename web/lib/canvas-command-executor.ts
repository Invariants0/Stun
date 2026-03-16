import type { Edge, Node, Viewport } from "reactflow";
import type { AIAction } from "@/types/canvas.types";
import { ActionExecutor } from "@/lib/action-executor";
import type { CanvasEngineState } from "@/lib/canvas-engine-runtime";
import { getEngineViewport } from "@/lib/canvas-engine-runtime";
import { cameraSyncService } from "@/lib/camera-sync";

export interface ExecuteCanvasActionsOptions {
  boardId: string;
  nodes: Node[];
  edges: Edge[];
  canvasState: CanvasEngineState;
  setNodes: (nodes: Node[] | ((nodes: Node[]) => Node[])) => void;
  setEdges: (edges: Edge[] | ((edges: Edge[]) => Edge[])) => void;
}

export async function executeCanvasActions(
  actions: AIAction[],
  options: ExecuteCanvasActionsOptions
): Promise<void> {
  const clampZoom = (z: number) => Math.max(0.1, Math.min(4, z));
  const getViewport = () => getEngineViewport(options.canvasState);

  const setCenter = async (
    x: number,
    y: number,
    config?: { zoom?: number; duration?: number }
  ): Promise<boolean> => {
    const zoom = clampZoom(config?.zoom ?? getViewport().zoom);
    const duration = config?.duration ?? 600;
    const state = options.canvasState;

    console.log("[CANVAS ENGINE DETECTED]", state.engine);

    if (state.engine === "reactflow" && state.reactFlowInstance) {
      await state.reactFlowInstance.setCenter(x, y, { zoom, duration });
      cameraSyncService.updateFromReactFlow(state.reactFlowInstance.getViewport());
      return true;
    }

    if (state.engine === "excalidraw" && state.excalidrawAPI) {
      const appState = state.excalidrawAPI.getAppState?.() ?? {};
      const width = appState.width ?? window.innerWidth;
      const height = appState.height ?? window.innerHeight;
      const scrollX = width / (2 * zoom) - x;
      const scrollY = height / (2 * zoom) - y;

      state.excalidrawAPI.updateScene?.({
        appState: {
          ...appState,
          zoom: { value: zoom },
          scrollX,
          scrollY,
        },
      });

      cameraSyncService.updateFromExcalidraw({
        x: scrollX,
        y: scrollY,
        zoom,
      });
      return true;
    }

    if (state.engine === "tldraw" && state.tldrawEditor) {
      state.tldrawEditor.setCamera({
        x,
        y,
        z: zoom,
      } as any);
      cameraSyncService.updateFromTLDraw(state.tldrawEditor.getCamera());
      return true;
    }

    throw new Error(`No API available for canvas engine: ${state.engine}`);
  };

  const setViewport = async (viewport: Viewport): Promise<boolean> => {
    return setCenter(viewport.x, viewport.y, { zoom: clampZoom(viewport.zoom), duration: 600 });
  };

  const executor = new ActionExecutor(
    {
      nodes: options.nodes,
      edges: options.edges,
      viewport: getViewport(),
      getViewport,
      setNodes: options.setNodes,
      setEdges: options.setEdges,
      setViewport,
      setCenter,
      getNode: (nodeId) => options.canvasState.reactFlowInstance?.getNode(nodeId),
    },
    options.boardId
  );

  await executor.executePlan({
    actions,
    executionOrder: "sequential",
  });
}
