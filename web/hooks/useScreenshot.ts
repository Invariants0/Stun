"use client";

import html2canvas from "html2canvas";

export async function useScreenshot(element: HTMLElement): Promise<string> {
  try {
    const canvas = await html2canvas(element, {
      useCORS: true,
      scale: 1, // Full resolution but we could optimize later
      backgroundColor: null,
      logging: false,
    });
    // Return compressed JPEG if it's too large, but PNG is default
    return canvas.toDataURL("image/png", 0.8);
  } catch (error: any) {
    console.error("Screenshot capture failed:", error);
    throw new Error(`Failed to capture canvas screenshot: ${error.message}`);
  }
}
