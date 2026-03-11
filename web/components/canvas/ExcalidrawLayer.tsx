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
  onElementsChange?: (elements: readonly ExcalidrawElement[]) => void;
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
  onElementsChange,
  onAppStateChange,
  onApiReady,
  className = "",
}: ExcalidrawLayerProps) {
  const initialData = useMemo(
    () => ({
      elements: sanitizeExcalidrawElements(initialElements),
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
    []
  );

  const handleChange = useCallback(
    (elements: readonly ExcalidrawElement[], appState: AppState) => {
      const sanitized = sanitizeExcalidrawElements(elements);
      if (sanitized.length !== elements.length) {
        // Avoid propagating malformed in-progress elements
        return;
      }
      onElementsChange?.(sanitized);
      onAppStateChange?.(appState);
    },
    [onElementsChange, onAppStateChange]
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
        }}
        // allow extremely small/large zoom levels; cameraSync will handle
        minZoom={0.001}
        maxZoom={100}
      />
    </div>
  );
}
