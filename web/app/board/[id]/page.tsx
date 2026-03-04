import CanvasRoot from "@/components/canvas/CanvasRoot";
// TopBar removed per request
import { ErrorBoundary } from "@/components/ErrorBoundary";

export default async function BoardPage({ params }: { params: { id: string } | Promise<{ id: string }> }) {
  // Unwrap params (may be a thenable in some Next versions)
  const resolvedParams = await params;
  const boardId = resolvedParams.id;

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
        {/* Canvas Area */}
        <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
          <CanvasRoot boardId={boardId} />
        </div>
      </main>
    </ErrorBoundary>
  );
}
