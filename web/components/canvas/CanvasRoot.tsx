/**
 * Canvas Root Component
 * 
 * Hybrid Canvas System (Canvas-system.md section 10)
 * 
 * Layer Stack (bottom to top):
 * ┌──────────────────────────────────────────┐
 * │ TLDraw Infinite Workspace (z-index: 1)  │
 * │   ├── Excalidraw Visual Layer (z: 2)    │
 * │   └── React Flow Graph Engine (z: 3)    │
 * └──────────────────────────────────────────┘
 */

"use client";

import { useCallback, useEffect, useRef } from "react";
import type { Editor, TLCamera } from "tldraw";
import type { ExcalidrawElement } from "@excalidraw/excalidraw/types/element/types";
import type { AppState } from "@excalidraw/excalidraw/types/types";

import TLDrawWorkspace from "./TLDrawWorkspace";
import ExcalidrawLayer from "./ExcalidrawLayer";
import ReactFlowGraphLayer from "./ReactFlowGraphLayer";
import { useBoard } from "@/hooks/useBoard";
import { cameraSyncService } from "@/lib/camera-sync";
import { canvasMappingService } from "@/lib/canvas-mapping";

type Props = { boardId: string };

export default function CanvasRoot({ boardId }: Props) {
  const {
    // React Flow state
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    // Excalidraw state
    excalidrawElements,
    onExcalidrawElementsChange,
    // TLDraw state
    tldrawEditor,
    setTldrawEditor,
  } = useBoard(boardId);

  const canvasRootRef = useRef<HTMLDivElement>(null);

  // viewport refs & state
  const reactFlowRef = useRef<any>(null);
  const excalidrawRef = useRef<any>(null);

  // ============================================================================
  // Camera synchronization
  // ============================================================================

  // When TLDraw camera changes we push into the sync service
  const handleTLDrawCameraChange = useCallback((camera: TLCamera) => {
    cameraSyncService.updateFromTLDraw(camera);
  }, []);

  // When Excalidraw's view changes we notify the service
  const handleExcalidrawAppStateChange = useCallback(
    (appState: Partial<AppState>) => {
      // ts doesn't know about viewX/viewY on Partial<AppState>, so cast
      const state: any = appState;
      const x: number = state.viewX ?? 0;
      const y: number = state.viewY ?? 0;
      let zoomVal: any = state.zoom ?? 1;
      if (typeof zoomVal === "object" && zoomVal !== null && "value" in zoomVal) {
        zoomVal = zoomVal.value;
      }
      const zoomNum: number = typeof zoomVal === "number" ? zoomVal : 1;

      cameraSyncService.updateFromExcalidraw({ x, y, zoom: zoomNum });
    },
    []
  );

  // Subscribe once to unified camera updates and apply to layers
  useEffect(() => {
    const unsub = cameraSyncService.subscribe((cam) => {
      // Update React Flow viewport
      if (reactFlowRef.current) {
        reactFlowRef.current.setViewport(cam.reactFlowViewport);
      }

      // Update Excalidraw view
      if (excalidrawRef.current) {
        try {
          excalidrawRef.current.updateScene({
            appState: {
              viewX: cam.excalidrawTransform.x,
              viewY: cam.excalidrawTransform.y,
              zoom: cam.excalidrawTransform.zoom,
            },
          });
        } catch (e) {
          // ignore if API not available yet
        }
      }

      // Keep TLDraw editor in sync (optional)
      if (tldrawEditor) {
        tldrawEditor.setCamera(cam.tldrawCamera);
      }
    });

    return unsub;
  }, [tldrawEditor]);

  const handleTLDrawEditorMount = useCallback(
    (editor: Editor) => {
      setTldrawEditor(editor);
    },
    [setTldrawEditor]
  );

  // ============================================================================
  // Excalidraw Element Synchronization
  // ============================================================================

  const handleExcalidrawElementsChange = useCallback(
    (elements: readonly ExcalidrawElement[]) => {
      onExcalidrawElementsChange(elements);

      // TODO: Sync with React Flow nodes via mapping service
      // For now, we'll implement basic mapping later
    },
    [onExcalidrawElementsChange]
  );

  // ============================================================================
  // Canvas Initialization
  // ============================================================================

  useEffect(() => {
    // Initialize canvas mapping service
    canvasMappingService.clear();

    return () => {
      // Cleanup
      canvasMappingService.clear();
    };
  }, [boardId]);

  return (
    <section
      ref={canvasRootRef}
      id="canvas-root"
      style={{
        height: "100%",
        width: "100%",
        position: "relative",
        overflow: "hidden",
        background: "#f8fafc",
      }}
    >
      {/* Layer 1: TLDraw Workspace (Canvas OS) - Hidden, infrastructure only */}
      <TLDrawWorkspace
        onCameraChange={handleTLDrawCameraChange}
        onEditorMount={handleTLDrawEditorMount}
        className="canvas-layer-tldraw"
      />

      {/* Layer 2: React Flow Knowledge Graph - AI-driven infrastructure (z: 3) */}
      <ReactFlowGraphLayer
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        className="canvas-layer-reactflow"
        showMiniMap={false}
        showControls={false}
        showBackground={false}
        onInit={(instance) => {
          reactFlowRef.current = instance;
        }}
      />

      {/* Layer 3: Excalidraw Visual Editing - Primary user interaction */}
      <ExcalidrawLayer
        ref={excalidrawRef}
        initialElements={excalidrawElements}
        onElementsChange={handleExcalidrawElementsChange}
        onAppStateChange={handleExcalidrawAppStateChange}
        className="canvas-layer-excalidraw"
      />

    </section>
  );
}
