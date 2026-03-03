"use client";

import html2canvas from "html2canvas";

export async function useScreenshot(element: HTMLElement): Promise<string> {
  const canvas = await html2canvas(element);
  return canvas.toDataURL("image/png");
}
