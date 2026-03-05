import CanvasRoot from "@/components/canvas/CanvasRoot";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ProfileIcon } from "@/components/ProfileIcon";

export default async function BoardPage({ params }: { params: { id: string } | Promise<{ id: string }> }) {
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
        <ProfileIcon />
        <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
          <CanvasRoot boardId={boardId} />
        </div>
      </main>
    </ErrorBoundary>
  );
}
