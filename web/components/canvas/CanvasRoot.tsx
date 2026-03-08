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
import { usePresence } from "@/hooks/usePresence";
import { useScreenshot } from "@/hooks/useScreenshot";
import { cameraSyncService } from "@/lib/camera-sync";
import { canvasMappingService } from "@/lib/canvas-mapping";

type Props = { boardId: string };

export default function CanvasRoot({ boardId }: Props) {
  const { activeUsers } = usePresence(boardId);

  const {
    // React Flow state
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    setNodes,
    setEdges,
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

      // 🎯 CRITICAL FEATURE: Sync Excalidraw drawings to AI-manipulatable React Flow nodes
      // Use requestAnimationFrame to prevent infinite loops
      requestAnimationFrame(() => {
        canvasMappingService.syncElementsToNodes(elements, nodes, setNodes);
        
        // Debug: Log mapping stats
        const stats = canvasMappingService.getStats();
        if (stats.totalMappings > 0) {
          console.log("[CanvasRoot] Element-Node mappings:", stats.totalMappings, "active");
        }
      });
    },
    [onExcalidrawElementsChange, setNodes] // Removed 'nodes' to prevent dependency loop
  );

  // ============================================================================
  // Canvas Initialization
  // ============================================================================

  useEffect(() => {
    // Initialize canvas mapping service
    console.log("[CanvasRoot] Canvas mapping service initialized");
    
    // Clear any existing mappings when component mounts
    canvasMappingService.clear();
    
    return () => {
      // Cleanup mappings when component unmounts
      canvasMappingService.clear();
    };
  }, []);

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

      <div className="canvas-topbar">
        {/* Active collaborator avatars */}
        {activeUsers.length > 0 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              marginRight: 8,
            }}
          >
            {activeUsers.slice(0, 5).map((u) => (
              <span
                key={u.userId}
                title={u.displayName ?? u.userId}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: "#6366f1",
                  border: "2px solid #fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#fff",
                  flexShrink: 0,
                  overflow: "hidden",
                }}
              >
                {u.photoURL ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={u.photoURL}
                    alt={u.displayName ?? ""}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  (u.displayName ?? u.userId).charAt(0).toUpperCase()
                )}
              </span>
            ))}
            {activeUsers.length > 5 && (
              <span
                style={{
                  fontSize: 11,
                  color: "#475569",
                  fontWeight: 500,
                }}
              >
                +{activeUsers.length - 5}
              </span>
            )}
          </div>
        )}

        <button type="button" className="canvas-topbar__btn">
          <span className="canvas-topbar__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" role="presentation">
              <path
                d="M7.5 12a3 3 0 1 0-3-3 3 3 0 0 0 3 3zM16.5 11a2.5 2.5 0 1 0-2.5-2.5A2.5 2.5 0 0 0 16.5 11zM4 19.5a4.5 4.5 0 0 1 9 0M13.5 19.5a3.5 3.5 0 0 1 7 0"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          Collab
        </button>
        <button type="button" className="canvas-topbar__btn">
          <span className="canvas-topbar__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" role="presentation">
              <path
                d="M7 12a3 3 0 1 0 3-3M17 8a3 3 0 1 0 3 3M7.5 9.5l7-3M7.5 14.5l7 3"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          Share
        </button>
      </div>
    </section>
  );
}
