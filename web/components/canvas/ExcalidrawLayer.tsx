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

import { Excalidraw } from "@excalidraw/excalidraw";
import type { ExcalidrawElement } from "@excalidraw/excalidraw/types/element/types";
import type { AppState } from "@excalidraw/excalidraw/types/types";
import { useCallback } from "react";

interface ExcalidrawLayerProps {
  initialElements?: readonly ExcalidrawElement[];
  onElementsChange?: (elements: readonly ExcalidrawElement[]) => void;
  onAppStateChange?: (appState: Partial<AppState>) => void;
  className?: string;
}

export default function ExcalidrawLayer({
  initialElements = [],
  onElementsChange,
  onAppStateChange,
  className = "",
}: ExcalidrawLayerProps) {
  const handleChange = useCallback(
    (elements: readonly ExcalidrawElement[], appState: AppState) => {
      onElementsChange?.(elements);
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
        zIndex: 3, // Top layer - primary user interaction
        pointerEvents: "auto",
      }}
    >
      <Excalidraw
        initialData={{
          elements: initialElements,
          appState: {
            viewBackgroundColor: "transparent",
            currentItemStrokeColor: "#1e293b",
            currentItemBackgroundColor: "#f1f5f9",
            currentItemFillStyle: "solid",
            currentItemStrokeWidth: 2,
            currentItemRoughness: 1,
            currentItemOpacity: 100,
          },
        }}
        onChange={handleChange}
        UIOptions={{
          canvasActions: {
            clearCanvas: true,
            loadScene: true,
            saveToActiveFile: true,
          },
        }}
      />
    </div>
  );
}
