import { describe, expect, test, vi } from 'vitest';
import { uploadMeme, fetchMemes, StorageError } from '../storage';
import { supabase } from '../../config/supabase';

vi.mock('../../config/supabase', () => ({
  supabase: {
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(),
        getPublicUrl: vi.fn(),
      })),
    },
    from: vi.fn(() => ({
      insert: vi.fn(),
      select: vi.fn(),
      single: vi.fn(),
    })),
  },
}));

describe('storage service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('uploadMeme', () => {
    test('should upload file and store metadata', async () => {
      const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
      const mockMetadata = {
        title: 'Test Meme',
        tags: ['funny'],
        creator: 'Test User',
      };

      const mockStorageResponse = {
        data: { path: 'test.jpg' },
        error: null,
      };

      const mockPublicUrlResponse = {
        data: { publicUrl: 'https://example.com/test.jpg' },
      };

      const mockDbResponse = {
        data: {
          id: '123',
          image_url: 'https://example.com/test.jpg',
          title: 'Test Meme',
          tags: ['funny'],
          created_at: '2024-03-11T00:00:00Z',
          creator: 'Test User',
        },
        error: null,
      };

      vi.mocked(supabase.storage.from).mockReturnValue({
        upload: vi.fn().mockResolvedValue(mockStorageResponse),
        getPublicUrl: vi.fn().mockReturnValue(mockPublicUrlResponse),
      } as any);

      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue(mockDbResponse),
      } as any);

      const result = await uploadMeme(mockFile, mockMetadata);

      expect(result).toEqual({
        id: '123',
        imageUrl: 'https://example.com/test.jpg',
        title: 'Test Meme',
        tags: ['funny'],
        createdAt: expect.any(Date),
        creator: 'Test User',
      });
    });

    test('should throw error if file size exceeds limit', async () => {
      const largeFile = new File([''], 'large.jpg', { type: 'image/jpeg' });
      Object.defineProperty(largeFile, 'size', { value: 6 * 1024 * 1024 });

      await expect(uploadMeme(largeFile, {
        title: 'Test',
        tags: [],
        creator: 'Test',
      })).rejects.toThrow(StorageError);
    });
  });

  describe('fetchMemes', () => {
    test('should fetch and transform memes', async () => {
      const mockDbResponse = {
        data: [{
          id: '123',
          image_url: 'https://example.com/test.jpg',
          title: 'Test Meme',
          tags: ['funny'],
          created_at: '2024-03-11T00:00:00Z',
          creator: 'Test User',
        }],
        error: null,
      };

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue(mockDbResponse),
      } as any);

      const result = await fetchMemes();

      expect(result).toEqual([{
        id: '123',
        imageUrl: 'https://example.com/test.jpg',
        title: 'Test Meme',
        tags: ['funny'],
        createdAt: expect.any(Date),
        creator: 'Test User',
      }]);
    });
  });
});