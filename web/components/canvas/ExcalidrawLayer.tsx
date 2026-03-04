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

import React, { useCallback, useImperativeHandle, useRef } from "react";
import { Excalidraw } from "@excalidraw/excalidraw";
// Excalidraw's type definitions currently omit the ref, so we'll treat it as any when we need
const ExcalidrawAny = Excalidraw as any;
import type { ExcalidrawElement } from "@excalidraw/excalidraw/types/element/types";
import type { AppState } from "@excalidraw/excalidraw/types/types";

interface ExcalidrawLayerProps {
  initialElements?: readonly ExcalidrawElement[];
  onElementsChange?: (elements: readonly ExcalidrawElement[]) => void;
  onAppStateChange?: (appState: Partial<AppState>) => void;
  className?: string;
}

const ExcalidrawLayer = React.forwardRef<any, ExcalidrawLayerProps>(
  (
    {
      initialElements = [],
      onElementsChange,
      onAppStateChange,
      className = "",
    },
    ref
  ) => {
    const internalRef = useRef<any>(null);

    // expose the internal API to parent
    useImperativeHandle(ref, () => internalRef.current);

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
        <ExcalidrawAny
          ref={internalRef}
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
          // allow extremely small/large zoom levels; cameraSync will handle
          minZoom={0.001}
          maxZoom={100}
        />
      </div>
    );
  }
);

export default ExcalidrawLayer;
