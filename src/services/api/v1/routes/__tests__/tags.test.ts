import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Request, Response } from 'express';
import { supabase } from '../../../../../config/server';
import tagRoutes, { handlers } from '../tags';

// Mock data
const mockTags = [
  { name: 'funny', meme_count: 100 },
  { name: 'cats', meme_count: 50 }
];

const mockMemes = [
  {
    id: 'fdd61c84-0b35-467a-ac95-6d346e4f157a',
    title: 'Funny Cat Meme',
    tags: ['funny', 'cats'],
    created_at: '2024-12-16T22:35:14.736+00:00',
    user_id: '2a212770-0505-4131-9fce-4a11a7d37822',
    favorite_count: 1,
    view_count: 1,
    share_count: 0,
    download_count: 0,
    image_url: 'https://example.com/test.jpg'
  }
];

// Mock Supabase
vi.mock('../../../../../config/server', () => ({
  supabase: {
    from: vi.fn()
  }
}));

describe('Tag Routes', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    req = {
      query: {},
      params: {},
      headers: { 'x-api-key': 'test-key' }
    } as Partial<Request>;
    res = {
      json: vi.fn(),
      status: vi.fn().mockReturnThis()
    } as Partial<Response>;

    // Reset mocks
    vi.clearAllMocks();
  });

  describe('GET /api/v1/tags', () => {
    const setupTagQuery = (responseData: any) => {
      const mockResult = {
        data: responseData.data,
        error: responseData.error
      };

      const mockOrder = vi.fn().mockReturnValue(mockResult);
      const mockSelect = vi.fn().mockReturnValue({ order: mockOrder });
      const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });

      vi.mocked(supabase.from).mockImplementation(mockFrom);

      return { mockFrom, mockSelect, mockOrder };
    };

    it('should return all tags with counts', async () => {
      const { mockFrom } = setupTagQuery({
        data: mockTags,
        error: null
      });

      await handlers.listTags(req as Request, res as Response);

      expect(mockFrom).toHaveBeenCalledWith('tags');
      expect(res.json).toHaveBeenCalledWith({
        data: mockTags,
        metadata: {
          total: mockTags.length
        }
      });
    });

    it('should handle database errors', async () => {
      const { mockFrom } = setupTagQuery({
        data: null,
        error: { message: 'Database error' }
      });

      await handlers.listTags(req as Request, res as Response);

      expect(mockFrom).toHaveBeenCalledWith('tags');
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Internal server error'
      });
    });
  });

  describe('GET /api/v1/tags/:tag/memes', () => {
    const setupMemeQuery = (responseData: any) => {
      const mockResult = {
        data: responseData.data,
        error: responseData.error,
        count: responseData.count
      };

      const mockRange = vi.fn().mockReturnValue(mockResult);
      const mockContains = vi.fn().mockReturnValue({ range: mockRange });
      const mockSelect = vi.fn().mockReturnValue({ contains: mockContains });
      const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });

      vi.mocked(supabase.from).mockImplementation(mockFrom);

      return { mockFrom, mockSelect, mockContains, mockRange };
    };

    it('should return memes for a specific tag', async () => {
      const { mockFrom } = setupMemeQuery({
        data: mockMemes,
        error: null,
        count: mockMemes.length
      });

      req.params = { tag: 'funny' };
      await handlers.getMemesByTag(req as Request, res as Response);

      expect(mockFrom).toHaveBeenCalledWith('memes');
      expect(res.json).toHaveBeenCalledWith({
        data: mockMemes,
        metadata: {
          page: 1,
          per_page: 20,
          total: mockMemes.length,
          tag: 'funny'
        }
      });
    });

    it('should handle empty results', async () => {
      const { mockFrom } = setupMemeQuery({
        data: [],
        error: null,
        count: 0
      });

      req.params = { tag: 'nonexistent' };
      await handlers.getMemesByTag(req as Request, res as Response);

      expect(mockFrom).toHaveBeenCalledWith('memes');
      expect(res.json).toHaveBeenCalledWith({
        data: [],
        metadata: {
          page: 1,
          per_page: 20,
          total: 0,
          tag: 'nonexistent'
        }
      });
    });

    it('should handle database errors', async () => {
      const { mockFrom } = setupMemeQuery({
        data: null,
        error: { message: 'Database error' },
        count: null
      });

      req.params = { tag: 'funny' };
      await handlers.getMemesByTag(req as Request, res as Response);

      expect(mockFrom).toHaveBeenCalledWith('memes');
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Internal server error'
      });
    });

    it('should handle pagination', async () => {
      const paginatedMemes = [
        {
          id: '86af58b6-6b12-44ad-bae8-26a677b0906d',
          title: 'Third Meme',
          tags: ['funny'],
          created_at: '2024-12-16T22:22:37.399+00:00',
          user_id: '2a212770-0505-4131-9fce-4a11a7d37822',
          favorite_count: 0,
          view_count: 0,
          share_count: 0,
          download_count: 0,
          image_url: 'https://example.com/third.jpg'
        },
        {
          id: '05c7e31f-b901-4e9a-809b-5a5e4759ecc8',
          title: 'Fourth Meme',
          tags: ['funny'],
          created_at: '2024-12-16T22:20:09.364+00:00',
          user_id: '2a212770-0505-4131-9fce-4a11a7d37822',
          favorite_count: 0,
          view_count: 0,
          share_count: 0,
          download_count: 0,
          image_url: 'https://example.com/fourth.jpg'
        }
      ];

      const { mockFrom } = setupMemeQuery({
        data: paginatedMemes,
        error: null,
        count: 4
      });

      req.params = { tag: 'funny' };
      req.query = { page: '2', per_page: '2' };
      await handlers.getMemesByTag(req as Request, res as Response);

      expect(mockFrom).toHaveBeenCalledWith('memes');
      expect(res.json).toHaveBeenCalledWith({
        data: paginatedMemes,
        metadata: {
          page: 2,
          per_page: 2,
          total: 4,
          tag: 'funny'
        }
      });
    });
  });
});
