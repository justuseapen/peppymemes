import { getImageData, compareImageData } from '../utils/imageUtils';

export interface MemeMetadata {
  id: string;
  title: string;
  tags: string[];
  image_url: string;
  created_at: string;
}

export interface UploadResult {
  success: boolean;
  error?: string;
  isDuplicate?: boolean;
  duplicateOf?: MemeMetadata;
  previewUrl?: string;
}

export class MemeUploadService {
  private readonly ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 1000; // 1 second

  constructor(private existingMemes: MemeMetadata[] = []) { }

  private async loadImageWithRetry(url: string): Promise<ImageData | null> {
    for (let attempt = 0; attempt < this.MAX_RETRIES; attempt++) {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          console.warn(`Failed to fetch image (attempt ${attempt + 1}/${this.MAX_RETRIES}):`, url);
          continue;
        }

        const blob = await response.blob();
        if (!blob.type.startsWith('image/')) {
          console.warn('Invalid content type:', blob.type);
          return null;
        }

        const img = new Image();
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = URL.createObjectURL(blob);
        });

        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          console.warn('Failed to get canvas context');
          return null;
        }

        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(img.src);
        return ctx.getImageData(0, 0, img.width, img.height);
      } catch (error) {
        console.warn(`Error loading image (attempt ${attempt + 1}/${this.MAX_RETRIES}):`, error);
        if (attempt < this.MAX_RETRIES - 1) {
          await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY));
        }
      }
    }
    return null;
  }

  async checkForDuplicates(newImage: File): Promise<{ isDuplicate: boolean; duplicateOf?: MemeMetadata }> {
    try {
      // Validate file before processing
      if (!this.ALLOWED_MIME_TYPES.includes(newImage.type)) {
        throw new Error('Invalid file type. Only images are allowed.');
      }

      if (newImage.size === 0) {
        throw new Error('File is empty');
      }

      const newImageData = await getImageData(newImage);

      for (const meme of this.existingMemes) {
        try {
          const existingImageData = await this.loadImageWithRetry(meme.image_url);
          if (!existingImageData) {
            console.warn(`Skipping meme ${meme.id}: Could not load image`);
            continue;
          }

          if (compareImageData(newImageData, existingImageData)) {
            return { isDuplicate: true, duplicateOf: meme };
          }
        } catch (error) {
          console.error(`Error processing meme ${meme.id}:`, error);
          // Continue checking other memes even if one fails
          continue;
        }
      }

      return { isDuplicate: false };
    } catch (error) {
      console.error('Error checking for duplicates:', error);
      // Always wrap errors in our standard message for consistency
      throw new Error('Failed to check for duplicate images');
    }
  }

  async uploadMeme(file: File): Promise<UploadResult> {
    try {
      // Validate file
      if (!this.ALLOWED_MIME_TYPES.includes(file.type)) {
        return {
          success: false,
          error: 'Invalid file type. Only images are allowed.'
        };
      }

      if (file.size === 0) {
        return {
          success: false,
          error: 'File is empty'
        };
      }

      // Check for duplicates
      const { isDuplicate, duplicateOf } = await this.checkForDuplicates(file);

      if (isDuplicate) {
        return {
          success: false,
          error: 'This meme has already been uploaded',
          isDuplicate: true,
          duplicateOf
        };
      }

      // Create a preview URL
      const previewUrl = URL.createObjectURL(file);

      return {
        success: true,
        previewUrl
      };
    } catch (error) {
      console.error('Error uploading meme:', error);
      return {
        success: false,
        error: 'Failed to upload meme'
      };
    }
  }

  // Clean up any created object URLs
  cleanup(previewUrl: string) {
    try {
      URL.revokeObjectURL(previewUrl);
    } catch (error) {
      console.error('Error cleaning up URL:', error);
      // Don't throw, as cleanup errors shouldn't affect the user
    }
  }
}
