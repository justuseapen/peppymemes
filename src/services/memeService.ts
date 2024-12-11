import { Meme } from '../types/meme';
import { getImageData, compareImageData } from '../utils/imageUtils';
import { imageCache } from './imageCache';

async function fetchAndProcessImage(url: string): Promise<ImageData> {
  // Try to get from cache first
  const cached = await imageCache.get(url);
  if (cached) return cached;

  // If not in cache, fetch and process
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`);
  }
  
  const blob = await response.blob();
  const imageData = await getImageData(new File([blob], 'existing.jpg'));
  
  // Cache the result
  imageCache.set(url, imageData);
  
  return imageData;
}

export async function checkDuplicate(
  file: File,
  existingMemes: Meme[]
): Promise<{ isDuplicate: boolean; duplicateOf?: Meme }> {
  try {
    const newImageData = await getImageData(file);
    
    // Process memes in chunks to avoid blocking the main thread
    const CHUNK_SIZE = 5;
    for (let i = 0; i < existingMemes.length; i += CHUNK_SIZE) {
      const chunk = existingMemes.slice(i, i + CHUNK_SIZE);
      
      // Process chunk in parallel
      const results = await Promise.all(
        chunk.map(async (meme) => {
          try {
            const existingImageData = await fetchAndProcessImage(meme.imageUrl);
            return {
              meme,
              isDuplicate: compareImageData(newImageData, existingImageData),
            };
          } catch (error) {
            console.error(`Error processing meme ${meme.id}:`, error);
            return { meme, isDuplicate: false };
          }
        })
      );
      
      // Check results
      const duplicate = results.find((result) => result.isDuplicate);
      if (duplicate) {
        return { isDuplicate: true, duplicateOf: duplicate.meme };
      }
    }
    
    return { isDuplicate: false };
  } catch (error) {
    console.error('Error checking for duplicates:', error);
    return { isDuplicate: false };
  }
}