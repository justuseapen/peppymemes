import { vi, describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '../../test/testUtils';
import { MemeCard } from '../MemeCard';
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

describe('MemeCard', () => {
  beforeEach(() => {
    (useMemeStore as any).mockReturnValue({
      toggleTag: vi.fn(),
      selectedTags: []
    });
  });

  it('renders meme content correctly', () => {
    render(<MemeCard meme={mockMeme} />);
    expect(screen.getByText('Test Meme')).toBeInTheDocument();
    expect(screen.getByAltText('Test Meme')).toBeInTheDocument();
    expect(screen.getByText('funny')).toBeInTheDocument();
    expect(screen.getByText('test')).toBeInTheDocument();
  });

  it('opens modal when clicking the meme', () => {
    render(<MemeCard meme={mockMeme} />);
    fireEvent.click(screen.getByText('Test Meme'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('closes modal when clicking close button', () => {
    render(<MemeCard meme={mockMeme} />);
    fireEvent.click(screen.getByText('Test Meme'));
    fireEvent.click(screen.getByLabelText('Close modal'));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('toggles tag when clicking a tag', () => {
    const toggleTag = vi.fn();
    (useMemeStore as any).mockReturnValue({
      toggleTag,
      selectedTags: []
    });

    render(<MemeCard meme={mockMeme} />);
    fireEvent.click(screen.getByText('funny'));
    expect(toggleTag).toHaveBeenCalledWith('funny');
  });

  it('prevents modal from opening when clicking a tag', () => {
    render(<MemeCard meme={mockMeme} />);
    fireEvent.click(screen.getByText('funny'));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
