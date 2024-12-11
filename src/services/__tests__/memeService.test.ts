import { describe, expect, test, vi } from 'vitest';
import { checkDuplicate } from '../memeService';
import { getImageData, compareImageData } from '../utils/imageUtils';
import { imageCache } from '../imageCache';
import { Meme } from '../types/meme';

// Mock dependencies
vi.mock('../utils/imageUtils');
vi.mock('../imageCache');

describe('memeService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockMemes: Meme[] = [
    {
      id: '1',
      imageUrl: 'https://example.com/meme1.jpg',
      title: 'Test Meme 1',
      tags: ['funny'],
      createdAt: new Date(),
      creator: 'User1',
    },
    {
      id: '2',
      imageUrl: 'https://example.com/meme2.jpg',
      title: 'Test Meme 2',
      tags: ['cats'],
      createdAt: new Date(),
      creator: 'User2',
    },
  ];

  test('should detect duplicate meme', async () => {
    const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
    const mockImageData = new ImageData(1, 1);
    
    // Mock getImageData to return same data for both images
    vi.mocked(getImageData).mockResolvedValue(mockImageData);
    vi.mocked(compareImageData).mockReturnValue(true);
    vi.mocked(imageCache.get).mockResolvedValue(mockImageData);

    const result = await checkDuplicate(mockFile, mockMemes);

    expect(result.isDuplicate).toBe(true);
    expect(result.duplicateOf).toBeDefined();
    expect(result.duplicateOf?.id).toBe('1');
  });

  test('should not detect duplicate for unique meme', async () => {
    const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
    const mockImageData1 = new ImageData(1, 1);
    const mockImageData2 = new ImageData(2, 2);
    
    vi.mocked(getImageData).mockResolvedValue(mockImageData1);
    vi.mocked(compareImageData).mockReturnValue(false);
    vi.mocked(imageCache.get).mockResolvedValue(mockImageData2);

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
    const mockImageData = new ImageData(1, 1);
    
    vi.mocked(getImageData).mockResolvedValue(mockImageData);
    vi.mocked(compareImageData).mockReturnValue(false);
    vi.mocked(imageCache.get).mockResolvedValue(mockImageData);

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