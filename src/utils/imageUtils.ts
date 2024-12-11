// Constants for image processing
const COMPARISON_THRESHOLD = 0.99; // 99% similarity threshold
const MAX_DIMENSION = 100; // Max dimension for thumbnail comparison

interface ImageDimensions {
  width: number;
  height: number;
}

// Get scaled dimensions maintaining aspect ratio
function getScaledDimensions(width: number, height: number): ImageDimensions {
  if (width <= MAX_DIMENSION && height <= MAX_DIMENSION) {
    return { width, height };
  }

  const ratio = width / height;
  if (width > height) {
    return {
      width: MAX_DIMENSION,
      height: Math.round(MAX_DIMENSION / ratio),
    };
  }
  return {
    width: Math.round(MAX_DIMENSION * ratio),
    height: MAX_DIMENSION,
  };
}

// Create a thumbnail for faster comparison
async function createThumbnail(img: HTMLImageElement): Promise<ImageData> {
  const { width, height } = getScaledDimensions(img.width, img.height);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not get canvas context');
  }
  
  ctx.drawImage(img, 0, 0, width, height);
  return ctx.getImageData(0, 0, width, height);
}

export async function getImageData(file: File): Promise<ImageData> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = async () => {
      try {
        const thumbnail = await createThumbnail(img);
        resolve(thumbnail);
      } catch (error) {
        reject(error);
      } finally {
        URL.revokeObjectURL(url);
      }
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    
    img.src = url;
  });
}

export function compareImageData(data1: ImageData, data2: ImageData): boolean {
  if (data1.width !== data2.width || data1.height !== data2.height) {
    return false;
  }

  const pixels1 = data1.data;
  const pixels2 = data2.data;
  let matchingPixels = 0;
  const totalPixels = pixels1.length / 4;
  
  for (let i = 0; i < pixels1.length; i += 4) {
    // Compare RGB values (ignore alpha)
    if (
      Math.abs(pixels1[i] - pixels2[i]) <= 5 && // R
      Math.abs(pixels1[i + 1] - pixels2[i + 1]) <= 5 && // G
      Math.abs(pixels1[i + 2] - pixels2[i + 2]) <= 5 // B
    ) {
      matchingPixels++;
    }
  }
  
  const similarity = matchingPixels / totalPixels;
  return similarity >= COMPARISON_THRESHOLD;
}