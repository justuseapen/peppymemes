import { describe, expect, test, beforeEach, vi } from 'vitest';
import { imageCache } from '../imageCache';

// Mock ImageData for Node.js environment
class MockImageData {
  data: Uint8ClampedArray;
  width: number;
  height: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.data = new Uint8ClampedArray(width * height * 4);
  }
}

// Replace global ImageData with our mock
global.ImageData = MockImageData as any;

describe('ImageCache', () => {
  beforeEach(() => {
    imageCache.clear();
  });

  test('should store and retrieve image data', async () => {
    const url = 'https://example.com/image.jpg';
    const mockImageData = new ImageData(1, 1);

    imageCache.set(url, mockImageData);
    const retrieved = await imageCache.get(url);

    expect(retrieved).toBeDefined();
    expect(retrieved).toEqual(mockImageData);
  });

  test('should return null for non-existent entries', async () => {
    const url = 'https://example.com/nonexistent.jpg';
    const result = await imageCache.get(url);
    expect(result).toBeNull();
  });

  test('should clear all entries', async () => {
    const url1 = 'https://example.com/image1.jpg';
    const url2 = 'https://example.com/image2.jpg';
    const mockImageData = new ImageData(1, 1);

    imageCache.set(url1, mockImageData);
    imageCache.set(url2, mockImageData);

    imageCache.clear();

    const result1 = await imageCache.get(url1);
    const result2 = await imageCache.get(url2);

    expect(result1).toBeNull();
    expect(result2).toBeNull();
  });

  test('should handle expired entries', async () => {
    const url = 'https://example.com/image.jpg';
    const mockImageData = new ImageData(1, 1);

    // Set the entry
    imageCache.set(url, mockImageData);

    // Fast-forward time by 31 minutes (beyond the default 30-minute expiry)
    const originalDate = Date.now;
    Date.now = vi.fn(() => originalDate() + 31 * 60 * 1000);

    const result = await imageCache.get(url);
    expect(result).toBeNull();

    // Restore original Date.now
    Date.now = originalDate;
  });
});
