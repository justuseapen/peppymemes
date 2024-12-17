import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { Request, Response } from 'express';
import { supabase } from '../../../../../config/server';
import memeRoutes, { handlers } from '../memes';
import { PostgrestQueryBuilder } from '@supabase/postgrest-js';

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
} & Partial<Response>;

describe('Meme Routes', () => {
  let req: Partial<Request>;
  let res: MockResponse;

  beforeEach(() => {
    req = {
      query: {},
      params: {},
      headers: { 'x-api-key': 'test-key' }
    };
    res = {
      json: vi.fn(),
      status: vi.fn().mockReturnThis()
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
});
