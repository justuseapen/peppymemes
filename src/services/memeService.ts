import { Meme } from '../types/meme';
import { getImageData, compareImageData } from '../utils/imageUtils';
import { imageCache } from './imageCache';

interface DuplicateCheckResult {
  isDuplicate: boolean;
  duplicateOf?: Meme;
}

export async function checkDuplicate(
  file: File,
  existingMemes: Meme[]
): Promise<DuplicateCheckResult> {
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
            // Try to get from cache first
            let existingImageData = await imageCache.get(meme.image_url);

            // If not in cache, fetch and process
            if (!existingImageData) {
              const response = await fetch(meme.image_url);
              const blob = await response.blob();
              existingImageData = await getImageData(new File([blob], 'existing.jpg'));
              imageCache.set(meme.image_url, existingImageData);
            }

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
