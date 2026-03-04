"use client";

import CanvasRoot from "@/components/canvas/CanvasRoot";
import TopBar from "@/components/layout/TopBar";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useState } from "react";

export default function BoardPage({ params }: { params: { id: string } }) {
  const [showSidePanel] = useState(false); // Will be toggled later

  return (
    <ErrorBoundary>
      <main
        style={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          background: "#0f172a",
        }}
      >
        {/* Top Navigation Bar */}
        <TopBar boardId={params.id} />

        {/* Canvas Area */}
        <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
          <CanvasRoot boardId={params.id} />
        </div>
      </main>
    </ErrorBoundary>
  );
}
