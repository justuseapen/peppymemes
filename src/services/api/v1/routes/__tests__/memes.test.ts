import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { Request, Response } from 'express';
import { supabase } from '../../../../../config/server';
import memeRoutes, { handlers } from '../memes';
import { PostgrestQueryBuilder } from '@supabase/postgrest-js';
import { User } from '@supabase/supabase-js';
import { ApiKey, ExtendedRequest } from '../../types';

// Extend handlers type to include new methods
declare module '../memes' {
  interface Handlers {
    addFavorite(req: Request, res: Response): Promise<void>;
    removeFavorite(req: Request, res: Response): Promise<void>;
  }
}

// Create reusable mock data
const mockMemes = [
  {
    id: 'fdd61c84-0b35-467a-ac95-6d346e4f157a',
    title: 'Test Meme',
    tags: ['funny', 'cats'],
    created_at: '2024-12-16T22:35:14.736+00:00',
    user_id: '2a212770-0505-4131-9fce-4a11a7d37822',
    favorite_count: 1,
    view_count: 1,
    share_count: 0,
    download_count: 0,
    image_url: 'https://example.com/test.jpg'
  },
  {
    id: '926a21bf-92e0-4518-847b-afb1cb933f36',
    title: 'Another Meme',
    tags: ['dogs'],
    created_at: '2024-12-16T22:30:08.262+00:00',
    user_id: '2a212770-0505-4131-9fce-4a11a7d37822',
    favorite_count: 0,
    view_count: 0,
    share_count: 0,
    download_count: 0,
    image_url: 'https://example.com/another.jpg'
  }
];

// Mock Supabase
vi.mock('../../../../../config/server', () => ({
  supabase: {
    from: vi.fn()
  }
}));

// Define mock response type
type MockResponse = {
  json: Mock;
  status: Mock;
  setHeader: Mock;
} & Partial<Response>;

describe('Meme Routes', () => {
  let req: Partial<ExtendedRequest>;
  let res: MockResponse;
  let mockUser: User;

  beforeEach(() => {
    mockUser = {
      id: '2a212770-0505-4131-9fce-4a11a7d37822',
      email: 'test@example.com',
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated',
      created_at: new Date().toISOString()
    };

    req = {
      query: {},
      params: {},
      headers: { 'x-api-key': 'test-key' }
    };
    res = {
      json: vi.fn(),
      status: vi.fn().mockReturnThis(),
      setHeader: vi.fn()
    } as MockResponse;

    // Reset mocks
    vi.clearAllMocks();
  });

  describe('GET /api/v1/memes', () => {
    const setupMemeQuery = (responseData: any) => {
      const mockResult = {
        data: responseData.data,
        error: responseData.error,
        count: responseData.count
      };

      const mockRange = vi.fn().mockReturnValue(mockResult);
      const mockOrder = vi.fn().mockReturnValue({ range: mockRange });
      const mockSelect = vi.fn().mockReturnValue({ order: mockOrder });

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect
      } as any);

      return { mockSelect, mockOrder, mockRange };
    };

    it('should return paginated memes', async () => {
      setupMemeQuery({
        data: mockMemes,
        error: null,
        count: mockMemes.length
      });

      await handlers.listMemes(req as Request, res as Response);

      expect(supabase.from).toHaveBeenCalledWith('memes');
      expect(res.json).toHaveBeenCalledWith({
        data: mockMemes,
        metadata: {
          page: 1,
          per_page: 20,
          total: mockMemes.length
        }
      });
    });
  });

  describe('GET /api/v1/memes/:id', () => {
    const setupMemeQuery = (responseData: any) => {
      const mockResult = {
        data: responseData.data,
        error: responseData.error
      };

      const mockSingle = vi.fn().mockReturnValue(mockResult);
      const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });

      const mockUpdate = vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({}) });

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
        update: mockUpdate
      } as any);

      return { mockSelect, mockEq, mockSingle, mockUpdate };
    };

    it('should return a meme by ID', async () => {
      const mockMeme = mockMemes[0];
      setupMemeQuery({
        data: mockMeme,
        error: null
      });

      req.params = { id: mockMeme.id };
      await handlers.getMeme(req as Request, res as Response);

      const responseData = (res.json as Mock).mock.calls[0][0];
      console.log('Mocked data:', mockMeme);
      console.log('Response data:', responseData);

      expect(supabase.from).toHaveBeenCalledWith('memes');
      expect(res.json).toHaveBeenCalledWith({
        data: mockMeme
      });
    });

    it('should return 404 for non-existent meme', async () => {
      setupMemeQuery({
        data: null,
        error: null
      });

      req.params = { id: '00000000-0000-0000-0000-000000000000' };
      await handlers.getMeme(req as Request, res as Response);

      const statusCode = (res.status as Mock).mock.calls[0][0];
      const responseData = (res.json as Mock).mock.calls[0][0];
      console.log('Response status:', statusCode);
      console.log('Response error:', responseData);

      expect(supabase.from).toHaveBeenCalledWith('memes');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Meme not found'
      });
    });
  });

  describe('GET /api/v1/memes/search', () => {
    const setupMemeQuery = (responseData: any) => {
      const mockResult = {
        data: responseData.data,
        error: responseData.error,
        count: responseData.count
      };

      const mockRange = vi.fn().mockReturnValue(mockResult);
      const mockContains = vi.fn().mockReturnValue({ range: mockRange });
      const mockIlike = vi.fn().mockReturnValue({ contains: mockContains });
      const mockSelect = vi.fn().mockReturnValue({ ilike: mockIlike });

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect
      } as any);

      return { mockSelect, mockIlike, mockContains, mockRange };
    };

    it('should search memes by title and tags', async () => {
      setupMemeQuery({
        data: [mockMemes[0]],
        error: null,
        count: 1
      });

      req.query = { query: 'test', tags: 'funny,cats' };
      await handlers.searchMemes(req as Request, res as Response);

      expect(supabase.from).toHaveBeenCalledWith('memes');
      expect(res.json).toHaveBeenCalledWith({
        data: [mockMemes[0]],
        metadata: {
          page: 1,
          per_page: 20,
          total: 1,
          query: 'test',
          tags: ['funny', 'cats']
        }
      });
    });
  });

  describe('POST /api/v1/memes/:id/favorite', () => {
    const setupFavoriteQuery = (responseData: any) => {
      const mockResult = {
        data: responseData.data,
        error: responseData.error
      };

      const mockSingle = vi.fn().mockReturnValue(mockResult);
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
      const mockInsert = vi.fn().mockReturnValue({ select: mockSelect });

      vi.mocked(supabase.from).mockReturnValue({
        insert: mockInsert
      } as any);

      return { mockInsert, mockSelect, mockSingle };
    };

    it('should add meme to favorites', async () => {
      const mockFavorite = {
        id: 'fav-uuid',
        user_id: mockUser.id,
        meme_id: mockMemes[0].id,
        created_at: new Date().toISOString()
      };

      setupFavoriteQuery({
        data: mockFavorite,
        error: null
      });

      req.params = { id: mockMemes[0].id };
      req.user = mockUser;
      await handlers.addFavorite(req as Request, res as Response);

      expect(supabase.from).toHaveBeenCalledWith('favorites');
      expect(res.json).toHaveBeenCalledWith({
        data: mockFavorite
      });
    });

    it('should handle duplicate favorites', async () => {
      setupFavoriteQuery({
        data: null,
        error: { code: '23505' }
      });

      req.params = { id: mockMemes[0].id };
      req.user = mockUser;
      await handlers.addFavorite(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Meme already favorited'
      });
    });
  });

  describe('DELETE /api/v1/memes/:id/favorite', () => {
    const setupUnfavoriteQuery = (responseData: any) => {
      // Mock the select query for checking existence
      const mockSelectResult = {
        data: null,
        error: null,
        count: responseData.count
      };

      const mockSelectEq = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue(mockSelectResult)
      });

      const mockSelect = vi.fn().mockReturnValue({
        eq: mockSelectEq
      });

      // Mock the delete query
      const mockDeleteResult = {
        data: responseData.data,
        error: responseData.error
      };

      const mockDeleteEq = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue(mockDeleteResult)
      });

      const mockDelete = vi.fn().mockReturnValue({
        eq: mockDeleteEq
      });

      // Setup the main mock
      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
        delete: mockDelete
      } as any);

      return { mockSelect, mockSelectEq, mockDelete, mockDeleteEq };
    };

    it('should remove meme from favorites', async () => {
      setupUnfavoriteQuery({
        count: 1,
        data: [{ id: 'fav-id' }],
        error: null
      });

      req.params = { id: mockMemes[0].id };
      req.user = mockUser;
      await handlers.removeFavorite(req as Request, res as Response);

      expect(supabase.from).toHaveBeenCalledWith('favorites');
      expect(res.json).toHaveBeenCalledWith({
        message: 'Favorite removed successfully'
      });
    });

    it('should handle non-existent favorite', async () => {
      setupUnfavoriteQuery({
        count: 0,
        data: null,
        error: null
      });

      req.params = { id: mockMemes[0].id };
      req.user = mockUser;
      await handlers.removeFavorite(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Favorite not found'
      });
    });
  });

  describe('Rate Limiting', () => {
    const setupMemeQuery = (responseData: any) => {
      const mockResult = {
        data: responseData.data,
        error: responseData.error,
        count: responseData.count
      };

      const mockRange = vi.fn().mockReturnValue(mockResult);
      const mockOrder = vi.fn().mockReturnValue({ range: mockRange });
      const mockSelect = vi.fn().mockReturnValue({ order: mockOrder });

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect
      } as any);

      return { mockSelect, mockOrder, mockRange };
    };

    it('should include rate limit headers in response', async () => {
      setupMemeQuery({
        data: mockMemes,
        error: null,
        count: mockMemes.length
      });

      const mockApiKey: ApiKey = {
        id: 'key-123',
        key: 'test-key',
        name: 'Test Key',
        user_id: 'user-123',
        tier: 'free',
        requestsPerDay: 100,
        requestCount: 0,
        created_at: new Date().toISOString()
      };

      req.apiKey = mockApiKey;
      await handlers.listMemes(req as Request, res as Response);

      expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Limit', '100');
    });

    it('should handle rate limit exceeded', async () => {
      const mockApiKey: ApiKey = {
        id: 'key-123',
        key: 'test-key',
        name: 'Test Key',
        user_id: 'user-123',
        tier: 'free',
        requestsPerDay: 100,
        requestCount: 100,
        created_at: new Date().toISOString()
      };

      req.apiKey = mockApiKey;
      await handlers.listMemes(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Rate limit exceeded'
      });
    });

    it('should apply correct rate limit for developer tier', async () => {
      setupMemeQuery({
        data: mockMemes,
        error: null,
        count: mockMemes.length
      });

      const mockApiKey: ApiKey = {
        id: 'key-123',
        key: 'test-key',
        name: 'Test Key',
        user_id: 'user-123',
        tier: 'developer',
        requestsPerDay: 10000,
        requestCount: 0,
        created_at: new Date().toISOString()
      };

      req.apiKey = mockApiKey;
      await handlers.listMemes(req as Request, res as Response);

      expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Limit', '10000');
    });
  });
});
