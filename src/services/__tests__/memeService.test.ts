import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabase } from '../../config/supabase';
import { getMemes } from '../memeService';
import { createMockMeme } from '../../test/factories';

vi.mock('../../config/supabase', () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      getUser: vi.fn()
    }
  }
}));

describe('memeService', () => {
  const mockMemes = [
    createMockMeme({ id: '1' }),
    createMockMeme({ id: '2' })
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches memes with favorites for authenticated user', async () => {
    // Mock authenticated user
    (supabase.auth.getUser as any).mockResolvedValue({
      data: { user: { id: 'user1' } },
      error: null
    });

    // Mock favorites query
    const mockFavorites = [{ meme_id: '1' }];
    const mockChain = {
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: mockMemes, error: null }),
      eq: vi.fn().mockResolvedValue({ data: mockFavorites, error: null })
    };

    (supabase.from as any).mockReturnValue(mockChain);

    const result = await getMemes();
    expect(result).toHaveLength(2);
    expect(result[0].is_favorited).toBe(true);
    expect(result[1].is_favorited).toBe(false);
  });

  it('fetches memes without favorites for unauthenticated user', async () => {
    // Mock unauthenticated user
    (supabase.auth.getUser as any).mockResolvedValue({
      data: { user: null },
      error: null
    });

    const mockChain = {
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: mockMemes, error: null })
    };

    (supabase.from as any).mockReturnValue(mockChain);

    const result = await getMemes();
    expect(result).toHaveLength(2);
    expect(result[0].is_favorited).toBe(false);
    expect(result[1].is_favorited).toBe(false);
  });

  it('handles error when fetching memes', async () => {
    const mockChain = {
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: null, error: new Error('Database error') })
    };

    (supabase.from as any).mockReturnValue(mockChain);

    await expect(getMemes()).rejects.toThrow('Database error');
  });
});
