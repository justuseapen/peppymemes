import { describe, expect, test, vi } from 'vitest';
import { checkDuplicate } from '../memeService';
import { getImageData, compareImageData } from '../../utils/imageUtils';
import { imageCache } from '../imageCache';
import { Meme } from '../../types/meme';

// Mock ImageData class
class MockImageData {
  data: Uint8ClampedArray;
  width: number;
  height: number;

  constructor(width: number, height: number, data?: Uint8ClampedArray) {
    this.width = width;
    this.height = height;
    this.data = data || new Uint8ClampedArray(width * height * 4);
  }
}

// Mock dependencies
vi.mock('../../utils/imageUtils');
vi.mock('../imageCache');

// Replace global ImageData
global.ImageData = MockImageData as any;

describe('memeService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockMemes: Meme[] = [
    {
      id: '1',
      title: 'Test Meme 1',
      image_url: 'https://example.com/meme1.jpg',
      tags: ['funny'],
      created_at: '2024-03-11T00:00:00Z',
      user_id: 'user1',
    },
    {
      id: '2',
      title: 'Test Meme 2',
      image_url: 'https://example.com/meme2.jpg',
      tags: ['cats'],
      created_at: '2024-03-11T00:00:00Z',
      user_id: 'user2',
    },
  ];

  test('should detect duplicate meme', async () => {
    const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
    const mockImageData = new MockImageData(1, 1);

    // Mock getImageData to return same data for both images
    vi.mocked(getImageData).mockResolvedValue(mockImageData as any);
    vi.mocked(compareImageData).mockReturnValue(true);
    vi.mocked(imageCache.get).mockResolvedValue(mockImageData as any);

    const result = await checkDuplicate(mockFile, mockMemes);

    expect(result.isDuplicate).toBe(true);
    expect(result.duplicateOf).toBeDefined();
    expect(result.duplicateOf?.id).toBe('1');
  });

  test('should not detect duplicate for unique meme', async () => {
    const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
    const mockImageData1 = new MockImageData(1, 1);
    const mockImageData2 = new MockImageData(2, 2);

    vi.mocked(getImageData).mockResolvedValue(mockImageData1 as any);
    vi.mocked(compareImageData).mockReturnValue(false);
    vi.mocked(imageCache.get).mockResolvedValue(mockImageData2 as any);

    const result = await checkDuplicate(mockFile, mockMemes);

    expect(result.isDuplicate).toBe(false);
    expect(result.duplicateOf).toBeUndefined();
  });

  test('should handle errors gracefully', async () => {
    const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' });

    vi.mocked(getImageData).mockRejectedValue(new Error('Failed to process image'));

    const result = await checkDuplicate(mockFile, mockMemes);

    expect(result.isDuplicate).toBe(false);
    expect(result.duplicateOf).toBeUndefined();
  });

  test('should process memes in chunks', async () => {
    const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
    const mockImageData = new MockImageData(1, 1);

    vi.mocked(getImageData).mockResolvedValue(mockImageData as any);
    vi.mocked(compareImageData).mockReturnValue(false);
    vi.mocked(imageCache.get).mockResolvedValue(mockImageData as any);

    // Create array of 10 memes
    const manyMemes = Array(10).fill(null).map((_, i) => ({
      ...mockMemes[0],
      id: i.toString(),
    }));

    await checkDuplicate(mockFile, manyMemes);

    // Should be called in chunks (10 memes / 5 chunk size = 2 chunks)
    expect(imageCache.get).toHaveBeenCalledTimes(10);
  });
});
