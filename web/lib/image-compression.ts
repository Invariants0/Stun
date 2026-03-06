/**
 * Image Compression Utility
 * 
 * Compresses screenshots before sending to AI backend
 * - Max width: 1280px
 * - Format: JPEG
 * - Quality: 0.6
 * - Target: < 10MB payload
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: "jpeg" | "png" | "webp";
}

const DEFAULT_OPTIONS: Required<CompressionOptions> = {
  maxWidth: 1280,
  maxHeight: 1280,
  quality: 0.6,
  format: "jpeg",
};

/**
 * Compress a base64 image string
 */
export async function compressImage(
  base64Image: string,
  options: CompressionOptions = {}
): Promise<string> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      try {
        // Calculate new dimensions while maintaining aspect ratio
        let { width, height } = img;
        
        if (width > opts.maxWidth || height > opts.maxHeight) {
          const aspectRatio = width / height;
          
          if (width > height) {
            width = opts.maxWidth;
            height = Math.round(width / aspectRatio);
          } else {
            height = opts.maxHeight;
            width = Math.round(height * aspectRatio);
          }
        }

        // Create canvas and draw resized image
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Failed to get canvas context"));
          return;
        }

        // Use better image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        // Draw image
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to compressed format
        const mimeType = `image/${opts.format}`;
        const compressed = canvas.toDataURL(mimeType, opts.quality);

        resolve(compressed);
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error("Failed to load image"));
    };

    img.src = base64Image;
  });
}

/**
 * Get the size of a base64 string in bytes
 */
export function getBase64Size(base64: string): number {
  // Remove data URL prefix if present
  const base64Data = base64.split(",")[1] || base64;
  
  // Calculate size (base64 is ~33% larger than binary)
  const padding = (base64Data.match(/=/g) || []).length;
  return (base64Data.length * 3) / 4 - padding;
}

/**
 * Get the size of a base64 string in megabytes
 */
export function getBase64SizeMB(base64: string): number {
  return getBase64Size(base64) / (1024 * 1024);
}

/**
 * Check if a base64 image is within size limit
 */
export function isWithinSizeLimit(base64: string, limitMB: number = 10): boolean {
  return getBase64SizeMB(base64) <= limitMB;
}

/**
 * Compress image until it's within size limit
 */
export async function compressToSizeLimit(
  base64Image: string,
  limitMB: number = 10,
  maxAttempts: number = 5
): Promise<string> {
  let compressed = base64Image;
  let quality = 0.6;
  let maxWidth = 1280;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    if (isWithinSizeLimit(compressed, limitMB)) {
      return compressed;
    }

    // Reduce quality and size for next attempt
    quality = Math.max(0.3, quality - 0.1);
    maxWidth = Math.max(640, maxWidth - 160);

    compressed = await compressImage(base64Image, {
      maxWidth,
      quality,
      format: "jpeg",
    });
  }

  // If still too large after max attempts, return best effort
  console.warn(
    `Image still ${getBase64SizeMB(compressed).toFixed(2)}MB after ${maxAttempts} compression attempts`
  );
  return compressed;
}
