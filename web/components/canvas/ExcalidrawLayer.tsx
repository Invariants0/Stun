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
import dynamic from "next/dynamic";

// Use Next dynamic import with ssr:false so Excalidraw only loads in the browser
const ExcalidrawAny: any = dynamic(
  () => import("@excalidraw/excalidraw").then((mod) => (mod as any).Excalidraw ?? (mod as any).default ?? mod),
  { ssr: false, loading: () => <div style={{ width: "100%", height: "100%", pointerEvents: "none" }} /> }
);
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
          zIndex: 2, // Layer 2: Visual Content
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
