import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '../../test/testUtils';
import { MemeCard } from '../MemeCard';
import { Meme } from '../../types/meme';
import { useMemeStore } from '../../store/useMemeStore';

const mockMeme: Meme = {
  id: '123',
  title: 'Test Meme',
  image_url: 'https://example.com/meme.jpg',
  created_at: '2022-12-31T00:00:00Z',
  tags: ['funny', 'test'],
  is_favorited: false,
  favorite_count: 0,
  view_count: 0,
  share_count: 0,
  download_count: 0
};

// Mock the store before tests
vi.mock('../../store/useMemeStore');

describe('MemeCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const setupMockStore = (overrides = {}) => {
    const defaultStore = {
      toggleTag: vi.fn(),
      updateMemeIsFavorited: vi.fn(),
      favoriteIds: new Set<string>(),
      memes: [],
      isLoading: false,
      error: null,
      searchTerm: '',
      selectedTags: [],
      loadMemes: vi.fn(),
      setSearchTerm: vi.fn(),
      initializeFavorites: vi.fn()
    };

    const store = { ...defaultStore, ...overrides };

    vi.mocked(useMemeStore).mockImplementation((selector) => {
      if (typeof selector === 'function') {
        return selector(store);
      }
      return store;
    });

    return store;
  };

  it('renders meme content correctly', () => {
    setupMockStore();
    render(<MemeCard meme={mockMeme} />);
    expect(screen.getByText('Test Meme')).toBeInTheDocument();
    expect(screen.getByAltText('Test Meme')).toBeInTheDocument();
    expect(screen.getByText('funny')).toBeInTheDocument();
    expect(screen.getByText('test')).toBeInTheDocument();
  });

  it('navigates to meme page when clicking the meme', () => {
    setupMockStore();
    render(<MemeCard meme={mockMeme} />);
    const links = screen.getAllByRole('link', { name: 'Test Meme' });
    expect(links[0]).toHaveAttribute('href', '/meme/123');
  });

  it('handles tag clicks', async () => {
    const mockStore = setupMockStore();
    render(<MemeCard meme={mockMeme} />);
    const tagButton = screen.getByText('funny');
    await act(async () => {
      fireEvent.click(tagButton);
    });
    expect(mockStore.toggleTag).toHaveBeenCalledWith('funny');
  });

  it('prevents navigation when clicking a tag', async () => {
    const mockStore = setupMockStore();
    render(<MemeCard meme={mockMeme} />);
    const tagButton = screen.getByText('funny');

    await act(async () => {
      fireEvent.click(tagButton);
    });

    expect(mockStore.toggleTag).toHaveBeenCalledWith('funny');
  });
});
