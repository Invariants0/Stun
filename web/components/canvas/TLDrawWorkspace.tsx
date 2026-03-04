/**
 * TLDraw Workspace Layer
 * 
 * Acts as the Canvas Operating System (Canvas-system.md section 2.2)
 * Responsibilities:
 * - Infinite canvas
 * - Pan and zoom control
 * - Camera transformations
 * - Canvas coordinate system
 * - Workspace navigation
 */

"use client";

import { Tldraw, Editor, TLCamera } from "tldraw";
import { useCallback, useEffect, useRef } from "react";

interface TLDrawWorkspaceProps {
  onCameraChange?: (camera: TLCamera) => void;
  onEditorMount?: (editor: Editor) => void;
  className?: string;
}

export default function TLDrawWorkspace({
  onCameraChange,
  onEditorMount,
  className = "",
}: TLDrawWorkspaceProps) {
  const editorRef = useRef<Editor | null>(null);

  const handleMount = useCallback(
    (editor: Editor) => {
      editorRef.current = editor;
      
      // Subscribe to camera changes
      const unsubscribe = editor.store.listen(
        () => {
          // Listen for camera changes
          const camera = editor.getCamera();
          onCameraChange?.(camera);
        },
        { scope: "document" }
      );

      onEditorMount?.(editor);

      return () => {
        unsubscribe();
      };
    },
    [onCameraChange, onEditorMount]
  );

  return (
    <div
      className={className}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        zIndex: 1,
        pointerEvents: "none", // Infrastructure only, no direct interaction
      }}
    >
      <Tldraw
        onMount={handleMount}
        hideUi={true}
      />
    </div>
  );
}
