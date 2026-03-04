import "./globals.scss";
import "reactflow/dist/style.css";
import "tldraw/tldraw.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Stun - Spatial AI Thinking Environment",
  description: "Infinite multimodal canvas where AI visually navigates and organizes knowledge",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, overflow: "hidden" }}>
        {children}
      </body>
    </html>
  );
}
