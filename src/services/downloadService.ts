import { Meme } from '../types/meme';
import { statsService } from './statsService';

interface DownloadResult {
  success: boolean;
  error?: string;
  filename?: string;
}

export const downloadService = {
  async downloadMeme(meme: Meme): Promise<DownloadResult> {
    try {
      const response = await fetch(meme.image_url);

      if (!response.ok) {
        return {
          success: false,
          error: `Failed to download: Server returned ${response.status} ${response.statusText}`
        };
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      // Get file extension from URL or fallback to jpg
      const extension = meme.image_url.split('.').pop()?.toLowerCase() || 'jpg';

      // Sanitize filename
      const sanitizedTitle = meme.title
        .replace(/[^a-z0-9]/gi, '-') // Replace non-alphanumeric chars with dash
        .replace(/-+/g, '-')         // Replace multiple dashes with single dash
        .replace(/^-|-$/g, '')       // Remove leading/trailing dashes
        .substring(0, 100);          // Limit length

      const filename = `${sanitizedTitle}.${extension}`;

      // Create and trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Cleanup
      URL.revokeObjectURL(url);

      // Track download
      await statsService.incrementStat(meme.id, 'download');

      return {
        success: true,
        filename
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to download: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
};
