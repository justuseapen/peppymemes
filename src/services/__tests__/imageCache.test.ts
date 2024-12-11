import { describe, expect, test, vi } from 'vitest';
import { imageCache } from '../imageCache';

describe('ImageCache', () => {
  beforeEach(() => {
    imageCache.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('should store and retrieve image data', async () => {
    const url = 'https://example.com/image.jpg';
    const mockImageData = new ImageData(1, 1);
    
    imageCache.set(url, mockImageData);
    const retrieved = await imageCache.get(url);
    
    expect(retrieved).toBe(mockImageData);
  });

  test('should return null for non-existent entries', async () => {
    const result = await imageCache.get('nonexistent.jpg');
    expect(result).toBeNull();
  });

  test('should expire old entries', async () => {
    const url = 'https://example.com/image.jpg';
    const mockImageData = new ImageData(1, 1);
    
    imageCache.set(url, mockImageData);
    
    // Advance time by 31 minutes (beyond the default 30-minute cache)
    vi.advanceTimersByTime(31 * 60 * 1000);
    
    const retrieved = await imageCache.get(url);
    expect(retrieved).toBeNull();
  });

  test('should clear all entries', async () => {
    const url1 = 'https://example.com/image1.jpg';
    const url2 = 'https://example.com/image2.jpg';
    const mockImageData = new ImageData(1, 1);
    
    imageCache.set(url1, mockImageData);
    imageCache.set(url2, mockImageData);
    
    imageCache.clear();
    
    const retrieved1 = await imageCache.get(url1);
    const retrieved2 = await imageCache.get(url2);
    
    expect(retrieved1).toBeNull();
    expect(retrieved2).toBeNull();
  });
});