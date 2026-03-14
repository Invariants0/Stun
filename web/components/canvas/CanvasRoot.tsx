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

import { useCallback, useEffect, useRef, useState } from "react";
import { useBoardStore } from "@/store/board.store";
import type { Editor, TLCamera } from "tldraw";
import type { ExcalidrawElement } from "@excalidraw/excalidraw/types/element/types";
import type { AppState } from "@excalidraw/excalidraw/types/types";

import TLDrawWorkspace from "./TLDrawWorkspace";
import ExcalidrawLayer from "./ExcalidrawLayer";
import ReactFlowGraphLayer from "./ReactFlowGraphLayer";
import { ShareDialog } from "@/components/ui/ShareDialog";
import { MediaUploader } from "@/components/ui/MediaUploader";
import { PresenceIndicators } from "@/components/ui/PresenceIndicators";
import { SearchBar } from "@/components/ui/SearchBar";
import { useBoard } from "@/hooks/useBoard";
import { usePresence } from "@/hooks/usePresence";
import { useScreenshot } from "@/hooks/useScreenshot";
import { useMediaUpload } from "@/hooks/useMediaUpload";
import { useDragAndDrop } from "@/hooks/useDragAndDrop";
import { useSearch } from "@/hooks/useSearch";
import { cameraSyncService } from "@/lib/camera-sync";
import { canvasMappingService } from "@/lib/canvas-mapping";
import { sanitizeExcalidrawElements } from "@/lib/excalidraw-sanitize";
import {
  registerReactFlowInstance,
  unregisterReactFlowInstance,
} from "@/lib/reactflow-runtime";
import {
  clearCanvasEngineState,
  setCanvasEngineState,
  type CanvasEngine,
} from "@/lib/canvas-engine-runtime";
import type { BoardVisibility, PresenceUser, MediaUploadResult } from "@/types/api.types";

// Stable empty object for Zustand selector caching
const EMPTY_FILES = {} as Record<string, { id: string; mimeType: string; dataURL: string }>;

type Props = { boardId: string };

export default function CanvasRoot({ boardId }: Props) {
  const { activeUsers, isOnline } = usePresence(boardId);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showMediaUploader, setShowMediaUploader] = useState(false);

  const { uploadFiles } = useMediaUpload();

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
    isLoaded,
    // TLDraw state
    tldrawEditor,
    setTldrawEditor,
    // Board data
    boardData,
    setBoardData,
  } = useBoard(boardId);

  const setExcalidrawFiles = useBoardStore((state) => state.setExcalidrawFiles);
  // Fixed: Use stable empty object to prevent selector caching warnings
  const excalidrawFilesFromStore = useBoardStore(
    (state) => state.boards[boardId]?.excalidraw.files ?? EMPTY_FILES
  );

  // Only initialize files on mount, not on every render
  // This prevents onChange from being triggered repeatedly when props change
  const [initialExcalidrawFiles, setInitialExcalidrawFiles] = useState(excalidrawFilesFromStore);
  useEffect(() => {
    // Update initialFiles whenever store files change (by reference comparison)
    // This ensures newly added images are passed to ExcalidrawLayer  
    if (excalidrawFilesFromStore !== initialExcalidrawFiles) {
      setInitialExcalidrawFiles(excalidrawFilesFromStore);
    }
  }, [excalidrawFilesFromStore]);

  const canvasRootRef = useRef<HTMLDivElement>(null);
  const nodesRef = useRef(nodes);
  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);

  // viewport refs & state
  const reactFlowRef = useRef<any>(null);
  const excalidrawRef = useRef<any>(null);
  const lastExcalidrawAppStateRef = useRef<Partial<AppState> | null>(null);
  const lastSyncedElementsHashRef = useRef<string>("");
  const pendingElementsRef = useRef<readonly ExcalidrawElement[] | null>(null);
  const hasInitializedSceneRef = useRef(false);
  const isSyncingSceneRef = useRef(false);
  const detectedEngineRef = useRef<CanvasEngine | null>(null);

  // ============================================================================
  // Search & highlight
  // ============================================================================

  const handleNavigateToNode = useCallback(
    (_nodeId: string, position: { x: number; y: number }) => {
      if (reactFlowRef.current) {
        reactFlowRef.current.setCenter(position.x, position.y, { zoom: 1.2, duration: 500 });
      }
    },
    [],
  );

  const handleHighlightNode = useCallback(
    (nodeId: string) => {
      setNodes((prev) =>
        prev.map((n) =>
          n.id === nodeId
            ? { ...n, data: { ...n.data, _highlighted: true } }
            : { ...n, data: { ...n.data, _highlighted: false } },
        ),
      );
      setTimeout(() => {
        setNodes((prev) =>
          prev.map((n) => ({ ...n, data: { ...n.data, _highlighted: false } })),
        );
      }, 2000);
    },
    [setNodes],
  );

  const search = useSearch({
    onNavigate: handleNavigateToNode,
    onHighlight: handleHighlightNode,
  });

  // When TLDraw camera changes we push into the sync service
  const handleTLDrawCameraChange = useCallback((camera: TLCamera) => {
    cameraSyncService.updateFromTLDraw(camera);
  }, []);

  // When Excalidraw's view changes we notify the service
  const handleExcalidrawAppStateChange = useCallback(
    (appState: Partial<AppState>) => {
      lastExcalidrawAppStateRef.current = appState;
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

  const isExcalidrawIdle = useCallback(() => {
    const appState = lastExcalidrawAppStateRef.current as any;
    if (!appState) return true;
    const tool = appState.activeTool?.type;
    if (tool && tool !== "selection" && tool !== "hand") {
      return false;
    }
    return !(
      appState.draggingElement ||
      appState.editingElement ||
      appState.isResizing ||
      appState.isRotating ||
      appState.multiElement
    );
  }, []);

  const areElementsEquivalent = useCallback(
    (a: readonly ExcalidrawElement[], b: readonly ExcalidrawElement[]) => {
      if (a.length !== b.length) return false;
      for (let i = 0; i < a.length; i += 1) {
        const elA = a[i];
        const elB = b[i];
        if (!elA || !elB) return false;
        if (
          elA.id !== elB.id ||
          elA.type !== elB.type ||
          elA.x !== elB.x ||
          elA.y !== elB.y ||
          elA.width !== elB.width ||
          elA.height !== elB.height ||
          elA.isDeleted !== elB.isDeleted
        ) {
          return false;
        }
        if ((elA as any).text !== (elB as any).text) {
          return false;
        }
      }
      return true;
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

      // Excalidraw view sync disabled to avoid corruption during draw

      // Keep TLDraw editor in sync (optional)
      if (tldrawEditor) {
        tldrawEditor.setCamera(cam.tldrawCamera);
      }
    });

    return unsub;
  }, [tldrawEditor]);

  useEffect(() => {
    hasInitializedSceneRef.current = false;
    lastSyncedElementsHashRef.current = "";
    pendingElementsRef.current = null;
  }, [boardId]);

  // Sync effect moved below syncExcalidrawScene definition to avoid TDZ

  const handleTLDrawEditorMount = useCallback(
    (editor: Editor) => {
      setTldrawEditor(editor);
      const state = setCanvasEngineState(boardId, { tldrawEditor: editor });
      if (detectedEngineRef.current !== state.engine) {
        detectedEngineRef.current = state.engine;
        console.log("[CANVAS ENGINE DETECTED]", state.engine);
      }
    },
    [setTldrawEditor, boardId]
  );

  // ============================================================================
  // Sync Excalidraw elements from store (for AI-created elements)
  // ============================================================================

  const syncExcalidrawScene = useCallback(
    (elements: readonly ExcalidrawElement[]) => {
      if (!excalidrawRef.current) return;
      if (isSyncingSceneRef.current) return;
      const sanitized = sanitizeExcalidrawElements(elements);
      const elementsHash = JSON.stringify(
        sanitized.map((el) => ({
          id: el.id,
          type: el.type,
          x: el.x,
          y: el.y,
          width: el.width,
          height: el.height,
          isDeleted: el.isDeleted,
          text: (el as any).text || "",
        }))
      );

      if (elementsHash === lastSyncedElementsHashRef.current) {
        return;
      }

      if (!isExcalidrawIdle()) {
        pendingElementsRef.current = sanitized;
        return;
      }

      try {
        const currentScene = excalidrawRef.current.getSceneElements
          ? excalidrawRef.current.getSceneElements()
          : null;
        if (currentScene && areElementsEquivalent(currentScene, sanitized)) {
          lastSyncedElementsHashRef.current = elementsHash;
          pendingElementsRef.current = null;
          return;
        }

        isSyncingSceneRef.current = true;
        // Ensure Excalidraw has access to the latest file data (images) for rendering
        if (
          excalidrawRef.current?.addFiles &&
          initialExcalidrawFiles &&
          Object.keys(initialExcalidrawFiles).length > 0
        ) {
          excalidrawRef.current.addFiles(Object.values(initialExcalidrawFiles));
        }
        excalidrawRef.current.updateScene({ elements: sanitized });
        lastSyncedElementsHashRef.current = elementsHash;
        pendingElementsRef.current = null;
      } catch (error) {
        console.error("[CanvasRoot] Failed to update Excalidraw scene:", error);
      } finally {
        isSyncingSceneRef.current = false;
      }
    },
    [areElementsEquivalent, isExcalidrawIdle, initialExcalidrawFiles]
  );

  useEffect(() => {
    if (!isLoaded) return;
    syncExcalidrawScene(excalidrawElements);
  }, [isLoaded, excalidrawElements, syncExcalidrawScene]);

  useEffect(() => {
    if (!pendingElementsRef.current) return;
    if (!isExcalidrawIdle()) return;
    syncExcalidrawScene(pendingElementsRef.current);
  }, [isExcalidrawIdle, syncExcalidrawScene, excalidrawElements]);

  useEffect(() => {
    if (!isLoaded || hasInitializedSceneRef.current) return;
    if (!excalidrawRef.current) return;
    const sanitized = sanitizeExcalidrawElements(excalidrawElements);
    if (sanitized.length === 0) return;
    try {
      excalidrawRef.current.updateScene({ elements: sanitized });
      hasInitializedSceneRef.current = true;
      lastSyncedElementsHashRef.current = JSON.stringify(
        sanitized.map((el) => ({
          id: el.id,
          type: el.type,
          x: el.x,
          y: el.y,
          width: el.width,
          height: el.height,
          isDeleted: el.isDeleted,
          text: (el as any).text || "",
        }))
      );
    } catch (error) {
      console.error("[CanvasRoot] Failed to initialize Excalidraw scene:", error);
    }
  }, [isLoaded, excalidrawElements]);

  // ============================================================================
  // Excalidraw Element Synchronization
  // ============================================================================

  const handleExcalidrawElementsChange = useCallback(
    (elements: readonly ExcalidrawElement[]) => {
      const sanitized = sanitizeExcalidrawElements(elements);
      onExcalidrawElementsChange(sanitized);

      // 🎯 CRITICAL FEATURE: Sync Excalidraw drawings to AI-manipulatable React Flow nodes
      // Use requestAnimationFrame to batch updates and prevent infinite loops
      requestAnimationFrame(() => {
        canvasMappingService.syncElementsToNodes(sanitized, nodesRef.current, setNodes);
        
        // Debug: Log mapping stats
        const stats = canvasMappingService.getStats();
        if (stats.totalMappings > 0) {
          console.log("[CanvasRoot] Element-Node mappings:", stats.totalMappings, "active");
        }
      });

      // Note: File capture happens via ExcalidrawLayer's onChange callback
    },
    [onExcalidrawElementsChange, setNodes]
  );

  // Capture Excalidraw files from onChange callback and store them
  // Files are stored silently (no autosave trigger) and included in next autosave
  // Use ref to deduplicate repeated calls with same files (prevents infinite loop)
  const previousFilesRef = useRef<Record<string, any> | null>(null);

  const handleExcalidrawFilesChange = useCallback(
    (files: Record<string, { id: string; mimeType: string; dataURL: string }>) => {
      if (files && Object.keys(files).length > 0) {
        // Only store if files actually changed (compare file IDs, not reference)
        const currentIds = Object.keys(files).sort().join(",");
        const previousIds = previousFilesRef.current ? Object.keys(previousFilesRef.current).sort().join(",") : "";
        
        if (currentIds !== previousIds) {
          console.log("[CanvasRoot] Files changed:", Object.keys(files).length, "entries");
          previousFilesRef.current = files;
          setExcalidrawFiles(boardId, files);
        }
      }
    },
    [boardId, setExcalidrawFiles]
  );

  // ============================================================================
  // Media Upload Integration
  // ============================================================================

  const handleMediaUploaded = useCallback((mediaResults: MediaUploadResult[]) => {
    const currentViewport = reactFlowRef.current?.getViewport() || { x: 0, y: 0, zoom: 1 };
    const spacing = 20;
    let yOffset = 0;

    // Create React Flow nodes for each uploaded media
    const newMediaNodes = mediaResults.map((media, index) => {
      const position = {
        x: (window.innerWidth / 2 - currentViewport.x) / currentViewport.zoom,
        y: (window.innerHeight / 2 - currentViewport.y) / currentViewport.zoom + yOffset,
      };
      
      // Adjust spacing for next media item
      yOffset += 200 + spacing;

      return {
        id: `media-${media.id}`,
        type: 'media',
        position,
        data: {
          ...media,
          isSelected: false,
        },
        dragHandle: '.media-drag-handle',
      };
    });

    // Add new media nodes to the canvas
    setNodes((prevNodes) => [...prevNodes, ...newMediaNodes]);

    console.log(`[CanvasRoot] Added ${newMediaNodes.length} media nodes to canvas`);
  }, [setNodes]);

  // ============================================================================
  // Drag & Drop for Media Files
  // ============================================================================

  const { isDragOver } = useDragAndDrop({
    onFilesUploaded: handleMediaUploaded,
    uploadFiles,
  });

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

  useEffect(() => {
    return () => {
      unregisterReactFlowInstance(boardId);
      clearCanvasEngineState(boardId);
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
          registerReactFlowInstance(boardId, instance);
          const state = setCanvasEngineState(boardId, { reactFlowInstance: instance });
          if (detectedEngineRef.current !== state.engine) {
            detectedEngineRef.current = state.engine;
            console.log("[CANVAS ENGINE DETECTED]", state.engine);
          }
          console.log("[REACTFLOW READY]", { boardId, viewport: instance.getViewport() });
        }}
      />

      {/* Layer 3: Excalidraw Visual Editing - Primary user interaction */}
      <ExcalidrawLayer
        initialElements={excalidrawElements}
        initialFiles={initialExcalidrawFiles}
        onElementsChange={handleExcalidrawElementsChange}
        onFilesChange={handleExcalidrawFilesChange}
        onAppStateChange={handleExcalidrawAppStateChange}
        onApiReady={(api) => {
          excalidrawRef.current = api;
          const state = setCanvasEngineState(boardId, { excalidrawAPI: api });
          if (detectedEngineRef.current !== state.engine) {
            detectedEngineRef.current = state.engine;
            console.log("[CANVAS ENGINE DETECTED]", state.engine);
          }
          syncExcalidrawScene(excalidrawElements);
        }}
        className="canvas-layer-excalidraw"
      />

      <div className="canvas-topbar">
        {/* Presence Indicators */}
        <PresenceIndicators 
          activeUsers={activeUsers.map((u: any): PresenceUser => ({
            userId: u.userId,
            displayName: u.displayName,
            photoURL: u.photoURL,
            lastSeen: u.lastSeen,
            cursor: u.cursor,
          }))}
          isOnline={isOnline}
        />

        {/* Semantic Search */}
        <SearchBar nodes={nodes} search={search} />

        {/* Media Upload Button */}
        <button 
          type="button" 
          className="canvas-topbar__btn"
          onClick={() => setShowMediaUploader(true)}
          title="Add media files, images, or URLs"
        >
          <span className="canvas-topbar__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" role="presentation">
              <path
                d="M21 19V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2zM8.5 13.5l2.5 3 3.5-4.5 4.5 6H5l3.5-4.5z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          Media
        </button>

        <button 
          type="button" 
          className="canvas-topbar__btn"
          onClick={() => setShowShareDialog(true)}
        >
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

      {/* Share Dialog */}
      <ShareDialog
        isOpen={showShareDialog}
        onClose={() => setShowShareDialog(false)}
        boardId={boardId}
        currentVisibility={boardData?.visibility || "edit"}
        onVisibilityChange={(visibility: BoardVisibility) => {
          setBoardData(prev => prev ? { ...prev, visibility } : null);
        }}
      />

      {/* Media Uploader */}
      {showMediaUploader && (
        <MediaUploader
          onMediaUploaded={handleMediaUploaded}
          onClose={() => setShowMediaUploader(false)}
          maxFiles={10}
        />
      )}

      {/* Drag & Drop Overlay */}
      {isDragOver && (
        <div style={{
          position: "absolute",
          inset: 0,
          zIndex: 1000,
          background: "rgba(59, 130, 246, 0.1)",
          backdropFilter: "blur(2px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
        }}>
          <div style={{
            background: "white",
            padding: "32px 48px",
            borderRadius: "16px",
            border: "2px dashed #3b82f6",
            textAlign: "center",
            boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
          }}>
            <div style={{ fontSize: "3rem", marginBottom: "16px" }}>📁</div>
            <h3 style={{ margin: "0 0 8px 0", color: "#0f172a", fontSize: "1.25rem", fontWeight: 600 }}>
              Drop files to add to canvas
            </h3>
            <p style={{ margin: 0, color: "#64748b", fontSize: "0.875rem" }}>
              Images, PDFs, CSV files, and more
            </p>
          </div>
        </div>
      )}

    </section>
  );
}
