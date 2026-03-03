import CanvasRoot from "@/components/canvas/CanvasRoot";
import SidePanel from "@/components/layout/SidePanel";
import TopBar from "@/components/layout/TopBar";

export default function BoardPage({ params }: { params: { id: string } }) {
  return (
    <main
      style={{
        height: "100vh",
        display: "grid",
        gridTemplateRows: "56px 1fr",
        gridTemplateColumns: "280px 1fr",
      }}
    >
      <div style={{ gridColumn: "1 / -1" }}>
        <TopBar boardId={params.id} />
      </div>
      <SidePanel boardId={params.id} />
      <CanvasRoot boardId={params.id} />
    </main>
  );
}
