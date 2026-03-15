/**
 * Excalidraw UI Layer
 * 
 * User Interface & Visual Editing Layer (Canvas-system.md section 2.1)
 * Responsibilities:
 * - Drawing tools
 * - Shapes (rectangle, ellipse, arrow, line, text, image, frame)
 * - Text editing
 * - Diagram blocks
 * - Element selection and editing
 */

"use client";

import React, { useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import type { ExcalidrawElement } from "@excalidraw/excalidraw/types/element/types";
import type { AppState } from "@excalidraw/excalidraw/types/types";
import { sanitizeExcalidrawElements } from "@/lib/excalidraw-sanitize";

interface ExcalidrawLayerProps {
  initialElements?: readonly ExcalidrawElement[];
  initialFiles?: Record<string, { id: string; mimeType: string; dataURL: string }>;
  onElementsChange?: (elements: readonly ExcalidrawElement[]) => void;
  onFilesChange?: (files: Record<string, { id: string; mimeType: string; dataURL: string }>) => void;
  onAppStateChange?: (appState: Partial<AppState>) => void;
  onApiReady?: (api: any) => void;
  className?: string;
}

const ExcalidrawAny: any = dynamic(
  () => import("@excalidraw/excalidraw").then((mod) => (mod as any).Excalidraw ?? (mod as any).default ?? mod),
  { ssr: false, loading: () => <div style={{ width: "100%", height: "100%", pointerEvents: "none" }} /> }
);

export default function ExcalidrawLayer({
  initialElements = [],
  initialFiles = {},
  onElementsChange,
  onFilesChange,
  onAppStateChange,
  onApiReady,
  className = "",
}: ExcalidrawLayerProps) {
  const supportsCanvasPixelRead = useMemo(() => {
    // Some browsers/privacy modes block getImageData(), which causes Excalidraw's
    // image resize pipeline (pica) to throw at runtime.
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 1;
      canvas.height = 1;
      const ctx = canvas.getContext("2d");
      if (!ctx) return false;
      ctx.getImageData(0, 0, 1, 1);
      return true;
    } catch {
      return false;
    }
  }, []);

  const initialData = useMemo(
    () => ({
      elements: sanitizeExcalidrawElements(initialElements),
      files: initialFiles,
      appState: {
        viewBackgroundColor: "transparent",
        currentItemStrokeColor: "#1e293b",
        currentItemBackgroundColor: "#f1f5f9",
        currentItemFillStyle: "solid",
        currentItemStrokeWidth: 2,
        currentItemRoughness: 1,
        currentItemOpacity: 100,
      },
    }),
    [initialElements, initialFiles]
  );

  const handleChange = useCallback(
    (
      elements: readonly ExcalidrawElement[],
      appState: AppState,
      files?: Record<string, { mimeType: string; id: string; dataURL: string }>
    ) => {
      // Capture files if provided
      if (files) {
        onFilesChange?.(files);
      }

      // Attach file data to any elements that reference valid fileIds.
      const elementsWithFiles = elements.map((el) => {
        if (el.type === "image" && (el as any).fileId && files?.[(el as any).fileId]) {
          const file = files[(el as any).fileId];
          return {
            ...el,
            file,
            url: file.dataURL,
          } as ExcalidrawElement;
        }
        return el;
      });

      const sanitized = sanitizeExcalidrawElements(elementsWithFiles);
      if (sanitized.length !== elementsWithFiles.length) {
        // Avoid propagating malformed in-progress elements
        return;
      }
      onElementsChange?.(sanitized);
      onAppStateChange?.(appState);
    },
    [onElementsChange, onAppStateChange, onFilesChange]
  );

  return (
    <div
      className={className}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        zIndex: 2, // Layer 2: Visual Content
        pointerEvents: "auto",
      }}
    >
      <ExcalidrawAny
        excalidrawAPI={onApiReady}
        initialData={initialData}
        onChange={handleChange}
        UIOptions={{
          canvasActions: {
            clearCanvas: true,
            loadScene: true,
            saveToActiveFile: true,
          },
          tools: {
            image: supportsCanvasPixelRead,
          },
        }}
        // allow extremely small/large zoom levels; cameraSync will handle
        minZoom={0.001}
        maxZoom={100}
      />
    </div>
  );
}
