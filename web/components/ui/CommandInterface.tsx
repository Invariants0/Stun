"use client";

import { FloatingCommandBar } from "@/components/ui/FloatingCommandBar";
import { SidePanel } from "@/components/ui/SidePanel";

type Props = {
  boardId: string;
};

/**
 * CommandInterface
 *
 * Renders the floating command bar + expandable side panel.
 * Scoped to the board page (fixed-positioned, portal-like).
 */
export function CommandInterface({ boardId }: Props) {
  return (
    <>
      <FloatingCommandBar boardId={boardId} />
      <SidePanel />
    </>
  );
}
