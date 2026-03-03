import Link from "next/link";

export default function HomePage() {
  return (
    <main style={{ padding: 24 }}>
      <h1>Stun</h1>
      <p>Open a board to start spatial AI navigation.</p>
      <Link href="/board/demo-board">Go to demo board</Link>
    </main>
  );
}
