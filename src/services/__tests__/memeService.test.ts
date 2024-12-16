import { describe, it, expect, vi } from 'vitest';
import { supabase } from '../../config/supabase';
import { getMemes, toggleFavorite } from '../memeService';
import { createMockMeme } from '../../test/factories';
import { User } from '@supabase/supabase-js';

interface MockChain {
  select: ReturnType<typeof vi.fn>;
  order: ReturnType<typeof vi.fn>;
  eq: ReturnType<typeof vi.fn>;
  single: ReturnType<typeof vi.fn>;
  upsert: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
}

// Create a chainable mock
const createChainableMock = (): MockChain => {
  const mock: MockChain = {
    select: vi.fn(),
    order: vi.fn(),
    eq: vi.fn(),
    single: vi.fn(),
    upsert: vi.fn(),
    delete: vi.fn()
  };

  mock.select.mockReturnValue(mock);
  mock.order.mockReturnValue(mock);
  mock.eq.mockReturnValue(mock);
  mock.single.mockReturnValue(mock);
  mock.upsert.mockReturnValue(mock);
  mock.delete.mockReturnValue(mock);

  return mock;
};

vi.mock('../../config/supabase', () => ({
  supabase: {
    from: vi.fn(() => createChainableMock())
  }
}));

describe('memeService', () => {
  const mockMemes = [
    createMockMeme({ id: '1' }),
    createMockMeme({ id: '2' })
  ];

  const mockUser = {
    id: 'user1',
    email: 'test@example.com',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: new Date().toISOString()
  } as User;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches memes successfully', async () => {
    const mockChain = createChainableMock();
    mockChain.order.mockResolvedValue({ data: mockMemes, error: null });
    vi.mocked(supabase.from).mockReturnValue(mockChain as any);

    const result = await getMemes();
    expect(result).toEqual(mockMemes);
  });

  it('handles error when fetching memes', async () => {
    const mockChain = createChainableMock();
    mockChain.order.mockResolvedValue({ data: null, error: new Error('Database error') });
    vi.mocked(supabase.from).mockReturnValue(mockChain as any);

    await expect(getMemes()).rejects.toThrow('Database error');
  });

  it('toggles favorite status successfully', async () => {
    const mockMeme = createMockMeme();
    const mockChain = createChainableMock();
    mockChain.single.mockResolvedValue({ data: null, error: new Error('Not found') });
    mockChain.upsert.mockResolvedValue({ data: null, error: null });
    vi.mocked(supabase.from).mockReturnValue(mockChain as any);

    await expect(toggleFavorite(mockMeme, mockUser)).resolves.not.toThrow();

    expect(mockChain.select).toHaveBeenCalled();
    expect(mockChain.eq).toHaveBeenCalledWith('meme_id', mockMeme.id);
    expect(mockChain.eq).toHaveBeenCalledWith('user_id', mockUser.id);
  });

  it('handles error when toggling favorite', async () => {
    const mockMeme = createMockMeme();
    const mockChain = createChainableMock();
    mockChain.single.mockResolvedValue({ data: null, error: new Error('Not found') });
    mockChain.upsert.mockResolvedValue({ data: null, error: new Error('Database error') });
    vi.mocked(supabase.from).mockReturnValue(mockChain as any);

    await expect(toggleFavorite(mockMeme, mockUser)).rejects.toThrow('Database error');
  });
});
