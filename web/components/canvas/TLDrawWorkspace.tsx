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
      suppressHydrationWarning={true}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        zIndex: 1, // Backbone layer
        pointerEvents: "auto", // Allow panning/zooming
      }}
    >
      <Tldraw
        onMount={handleMount}
        hideUi={true}
        autoFocus={true}
        components={{
          Toolbar: null,
          Menu: null,
          NavigationPanel: null,
          PageMenu: null,
          StylePanel: null,
          HelpMenu: null,
          ContextMenu: null,
          ActionsMenu: null,
          SharePanel: null,
          TopPanel: null,
        } as any}
      />
    </div>
  );
}
