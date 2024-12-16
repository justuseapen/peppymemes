import { vi, describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '../../test/testUtils';
import { MemeView } from '../MemeView';
import { supabase } from '../../config/supabase';
import { useMemeStore } from '../../store/useMemeStore';

// Mock useMemeStore
vi.mock('../../store/useMemeStore', () => ({
  useMemeStore: vi.fn()
}));

const mockMeme = {
  id: '123',
  title: 'Test Meme',
  image_url: 'https://example.com/meme.jpg',
  tags: ['funny', 'test'],
  created_at: '2023-01-01',
  view_count: 0,
  favorite_count: 0,
  share_count: 0,
  download_count: 0
};

describe('MemeView', () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Setup default store state
    (useMemeStore as any).mockReturnValue({
      memes: [],
      isLoading: false
    });
  });

  it('renders loading state initially', () => {
    (useMemeStore as any).mockReturnValue({
      memes: [],
      isLoading: true
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
      expect(screen.getByText('Test Meme')).toBeInTheDocument();
      expect(screen.getByAltText('Test Meme')).toBeInTheDocument();
    });
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
