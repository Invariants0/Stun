"use client";

import html2canvas from "html2canvas";
import { compressToSizeLimit } from "@/lib/image-compression";

export async function useScreenshot(element: HTMLElement): Promise<string> {
  try {
    const canvas = await html2canvas(element, {
      useCORS: true,
      scale: 1,
      backgroundColor: null,
      logging: false,
    });
    
    // Get initial screenshot
    const screenshot = canvas.toDataURL("image/png", 0.8);
    
    // Compress to ensure it's under 10MB
    const compressed = await compressToSizeLimit(screenshot, 10);
    
    return compressed;
  } catch (error: any) {
    console.error("Screenshot capture failed:", error);
    throw new Error(`Failed to capture canvas screenshot: ${error.message}`);
  }
}
