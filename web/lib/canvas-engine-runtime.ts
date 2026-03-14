import type { ReactFlowInstance, Viewport } from "reactflow";
import type { Editor } from "tldraw";

export type CanvasEngine = "reactflow" | "excalidraw" | "tldraw";

export interface CanvasEngineState {
  engine: CanvasEngine;
  reactFlowInstance?: ReactFlowInstance;
  excalidrawAPI?: any;
  tldrawEditor?: Editor;
}

const states = new Map<string, CanvasEngineState>();

function detectEngine(state: Partial<CanvasEngineState>): CanvasEngine {
  // Visible primary layer preference for this app: Excalidraw > TLDraw > ReactFlow
  if (state.excalidrawAPI) return "excalidraw";
  if (state.tldrawEditor) return "tldraw";
  return "reactflow";
}

export function setCanvasEngineState(
  boardId: string,
  partial: Partial<CanvasEngineState>
): CanvasEngineState {
  const prev = states.get(boardId) ?? { engine: "reactflow" as CanvasEngine };
  const merged: CanvasEngineState = {
    ...prev,
    ...partial,
  };
  merged.engine = detectEngine(merged);
  states.set(boardId, merged);
  return merged;
}

export function getCanvasEngineState(boardId: string): CanvasEngineState {
  return states.get(boardId) ?? { engine: "reactflow" };
}

export function clearCanvasEngineState(boardId: string): void {
  states.delete(boardId);
}

export function getEngineViewport(state: CanvasEngineState): Viewport {
  if (state.engine === "reactflow" && state.reactFlowInstance) {
    return state.reactFlowInstance.getViewport();
  }

  if (state.engine === "excalidraw" && state.excalidrawAPI?.getAppState) {
    const appState = state.excalidrawAPI.getAppState() as any;
    const zoom =
      typeof appState?.zoom === "number"
        ? appState.zoom
        : appState?.zoom?.value ?? 1;
    const width = appState?.width ?? window.innerWidth;
    const height = appState?.height ?? window.innerHeight;
    const scrollX = appState?.scrollX ?? 0;
    const scrollY = appState?.scrollY ?? 0;
    return {
      x: width / (2 * zoom) - scrollX,
      y: height / (2 * zoom) - scrollY,
      zoom,
    };
  }

  if (state.engine === "tldraw" && state.tldrawEditor) {
    const camera = state.tldrawEditor.getCamera();
    return { x: camera.x, y: camera.y, zoom: camera.z };
  }

  return { x: 0, y: 0, zoom: 1 };
}
