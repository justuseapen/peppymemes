import axios from 'axios';

/**
 * Converts a File object to ImageData for comparison
 */
export async function getImageData(file: File): Promise<ImageData> {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement('canvas');
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  ctx.drawImage(bitmap, 0, 0);
  return ctx.getImageData(0, 0, bitmap.width, bitmap.height);
}

/**
 * Compares two ImageData objects to determine if they represent the same image
 * Uses a simple pixel comparison with a threshold for minor differences
 */
export function compareImageData(data1: ImageData, data2: ImageData): boolean {
  // If dimensions don't match, images are different
  if (data1.width !== data2.width || data1.height !== data2.height) {
    return false;
  }

  const pixels1 = data1.data;
  const pixels2 = data2.data;
  const totalPixels = pixels1.length;
  const threshold = 0.95; // 95% similarity required
  let matchingPixels = 0;

  // Compare each pixel's RGBA values
  for (let i = 0; i < totalPixels; i += 4) {
    const isPixelSimilar =
      Math.abs(pixels1[i] - pixels2[i]) < 10 && // R
      Math.abs(pixels1[i + 1] - pixels2[i + 1]) < 10 && // G
      Math.abs(pixels1[i + 2] - pixels2[i + 2]) < 10; // B
    // Ignore alpha channel for comparison

    if (isPixelSimilar) {
      matchingPixels++;
    }
  }

  const similarity = matchingPixels / (totalPixels / 4);
  return similarity >= threshold;
}

export interface AnalysisResult {
  success: boolean;
  text?: string;
  error?: string;
}

export async function analyzeImage(imageUrl: string): Promise<AnalysisResult> {
  try {
    // Verify the image URL is accessible
    await axios.head(imageUrl);

    return {
      success: true,
      text: 'Image URL verified'
    };
  } catch (error) {
    console.error('Error analyzing image:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}
