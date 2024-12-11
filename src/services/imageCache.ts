// Simple in-memory cache for image data
interface CacheEntry {
  data: ImageData;
  timestamp: number;
}

class ImageCache {
  private cache: Map<string, CacheEntry>;
  private readonly maxAge: number; // Maximum age in milliseconds

  constructor(maxAgeMinutes: number = 30) {
    this.cache = new Map();
    this.maxAge = maxAgeMinutes * 60 * 1000;
  }

  async get(url: string): Promise<ImageData | null> {
    const entry = this.cache.get(url);
    if (!entry) return null;

    // Check if entry has expired
    if (Date.now() - entry.timestamp > this.maxAge) {
      this.cache.delete(url);
      return null;
    }

    return entry.data;
  }

  set(url: string, data: ImageData): void {
    this.cache.set(url, {
      data,
      timestamp: Date.now(),
    });
  }

  clear(): void {
    this.cache.clear();
  }
}

export const imageCache = new ImageCache();