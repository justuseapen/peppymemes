import { vi, describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '../../test/testUtils';
import { MemeEmbed } from '../MemeEmbed';
import { supabase } from '../../config/supabase';

const TEST_MEME = {
  id: '123',
  title: 'Test Meme',
  image_url: 'https://example.com/meme.jpg',
  tags: ['funny', 'test'],
  created_at: '2023-01-01',
  user_id: 'user123',
  favorite_count: 0,
  view_count: 0,
  share_count: 0,
  download_count: 0
};

describe('MemeEmbed', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders meme content when meme is found', async () => {
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: TEST_MEME, error: null })
    } as any);

    render(<MemeEmbed />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Test Meme' })).toBeInTheDocument();
    });

    expect(screen.getByAltText('Test Meme')).toBeInTheDocument();
    expect(screen.getByText('funny')).toBeInTheDocument();
    expect(screen.getByText('test')).toBeInTheDocument();
  });

  it('shows error when meme does not exist', async () => {
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Meme not found' } })
    } as any);

    render(<MemeEmbed />);

    await waitFor(() => {
      expect(screen.getByText('Error: Meme not found')).toBeInTheDocument();
    });
  });

  it('updates meta tags when meme is found', async () => {
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: TEST_MEME, error: null })
    } as any);

    render(<MemeEmbed />);

    await waitFor(() => {
      const title = document.querySelector('title');
      expect(title?.textContent).toBe(`${TEST_MEME.title} - Peppy Memes`);
    });
  });
});
