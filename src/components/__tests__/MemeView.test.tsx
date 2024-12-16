import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../../test/testUtils';
import { MemeView } from '../MemeView';
import { supabase } from '../../config/supabase';
import { useMemeStore } from '../../store/useMemeStore';
import { createMockMeme } from '../../test/factories';

const mockMeme = createMockMeme({
  id: '123',
  title: 'Test Meme',
  image_url: 'https://example.com/meme.jpg',
  tags: ['funny', 'test']
});

describe('MemeView', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock meme store
    (useMemeStore as any).mockReturnValue({
      memes: [],
      isLoading: false,
      error: null,
      favoriteIds: new Set()
    });
  });

  it('renders loading state initially', () => {
    (useMemeStore as any).mockReturnValue({
      memes: [],
      isLoading: true,
      error: null,
      favoriteIds: new Set()
    });

    render(<MemeView />);
    const loadingSpinner = screen.getByRole('status', { name: /loading meme/i });
    expect(loadingSpinner).toBeInTheDocument();
    expect(loadingSpinner).toHaveClass('animate-spin');
  });

  it('renders meme content after loading', async () => {
    // Mock successful Supabase response
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: mockMeme, error: null })
    } as any);

    render(<MemeView />);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    expect(screen.getByText('Test Meme')).toBeInTheDocument();
    expect(screen.getByAltText('Test Meme')).toBeInTheDocument();
  });

  it('renders error state when meme not found', async () => {
    // Mock error response from Supabase
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: new Error('Not found') })
    } as any);

    render(<MemeView />);

    await waitFor(() => {
      expect(screen.getByText(/not found/i)).toBeInTheDocument();
    });
  });
});
