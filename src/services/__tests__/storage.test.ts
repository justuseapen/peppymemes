import { describe, expect, test, vi } from 'vitest';
import { uploadMeme, fetchMemes, StorageError } from '../storage';
import { supabase } from '../../config/supabase';

vi.mock('../../config/supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(() => ({ data: { user: { id: 'user-id' } }, error: null })),
    },
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(),
        getPublicUrl: vi.fn(),
      })),
    },
    from: vi.fn(() => ({
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn(),
      order: vi.fn().mockReturnThis(),
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
        tags: ['test'],
        image_url: 'https://example.com/test.jpg',
        created_at: new Date().toISOString()
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
          tags: ['test'],
          created_at: '2024-03-11T00:00:00Z',
          user_id: 'user-id',
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
        image_url: 'https://example.com/test.jpg',
        title: 'Test Meme',
        tags: ['test'],
        created_at: '2024-03-11T00:00:00Z',
        user_id: 'user-id',
      });
    });

    test('should throw error if file size exceeds limit', async () => {
      const largeFile = new File([''], 'large.jpg', { type: 'image/jpeg' });
      Object.defineProperty(largeFile, 'size', { value: 6 * 1024 * 1024 });

      await expect(uploadMeme(largeFile, {
        title: 'Test',
        tags: [],
        image_url: 'https://example.com/test.jpg',
        created_at: new Date().toISOString()
      })).rejects.toThrow(StorageError);
    });
  });

  describe('fetchMemes', () => {
    test('should fetch and transform memes', async () => {
      const mockResponse = {
        data: [{
          id: '123',
          image_url: 'https://example.com/test.jpg',
          title: 'Test Meme',
          tags: ['funny'],
          created_at: '2024-03-11T00:00:00Z',
          user_id: 'user123',
        }],
        error: null,
      };

      const orderMock = vi.fn().mockResolvedValue(mockResponse);
      const selectMock = vi.fn().mockReturnValue({ order: orderMock });
      const fromMock = vi.fn().mockReturnValue({ select: selectMock });

      vi.mocked(supabase.from).mockImplementation(fromMock);

      const result = await fetchMemes();

      expect(result).toEqual([{
        id: '123',
        image_url: 'https://example.com/test.jpg',
        title: 'Test Meme',
        tags: ['funny'],
        created_at: '2024-03-11T00:00:00Z',
        user_id: 'user123',
      }]);

      expect(fromMock).toHaveBeenCalledWith('memes');
      expect(selectMock).toHaveBeenCalledWith('*');
      expect(orderMock).toHaveBeenCalledWith('created_at', { ascending: false });
    });

    test('should handle empty response', async () => {
      const mockResponse = {
        data: [],
        error: null,
      };

      const orderMock = vi.fn().mockResolvedValue(mockResponse);
      const selectMock = vi.fn().mockReturnValue({ order: orderMock });
      const fromMock = vi.fn().mockReturnValue({ select: selectMock });

      vi.mocked(supabase.from).mockImplementation(fromMock);

      const result = await fetchMemes();
      expect(result).toEqual([]);
      expect(orderMock).toHaveBeenCalledWith('created_at', { ascending: false });
    });

    test('should handle error response', async () => {
      const mockResponse = {
        data: null,
        error: new Error('Failed to fetch memes'),
      };

      const orderMock = vi.fn().mockResolvedValue(mockResponse);
      const selectMock = vi.fn().mockReturnValue({ order: orderMock });
      const fromMock = vi.fn().mockReturnValue({ select: selectMock });

      vi.mocked(supabase.from).mockImplementation(fromMock);

      await expect(fetchMemes()).rejects.toThrow('Failed to fetch memes');
      expect(orderMock).toHaveBeenCalledWith('created_at', { ascending: false });
    });
  });
});
