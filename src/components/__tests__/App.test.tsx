import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../../test/testUtils';
import { App } from '../../App';
import { useMemeStore } from '../../store/useMemeStore';
import { useAppInitialization } from '../../hooks/useAppInitialization';

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default to initialized state
    vi.mocked(useAppInitialization).mockReturnValue({
      isInitialized: true,
      error: null
    });
  });

  it('renders main content on root path', async () => {
    render(<App />, { initialEntries: ['/'] });
    expect(screen.getByTestId('mock-header')).toBeInTheDocument();
    expect(screen.getByTestId('mock-meme-grid')).toBeInTheDocument();
  });

  it('renders reset password form on /auth/reset-password path', async () => {
    render(<App />, { initialEntries: ['/auth/reset-password'] });
    expect(screen.getByTestId('mock-reset-password-form')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-header')).not.toBeInTheDocument();
    expect(screen.queryByTestId('mock-meme-grid')).not.toBeInTheDocument();
  });

  it('renders profile page on /profile path', () => {
    render(<App />, { initialEntries: ['/profile'] });
    expect(screen.getByTestId('mock-profile-page')).toBeInTheDocument();
    expect(screen.getByTestId('mock-header')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-meme-grid')).not.toBeInTheDocument();
  });

  it('shows loading state when not initialized', () => {
    vi.mocked(useAppInitialization).mockReturnValue({
      isInitialized: false,
      error: null
    });

    render(<App />, { initialEntries: ['/'] });
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-header')).not.toBeInTheDocument();
  });

  it('shows error state when initialization fails', async () => {
    const initError = 'Failed to initialize';
    vi.mocked(useAppInitialization).mockReturnValue({
      isInitialized: false,
      error: initError
    });

    render(<App />, { initialEntries: ['/'] });
    await waitFor(() => {
      expect(screen.getByText(initError)).toBeInTheDocument();
    });
  });

  it('renders error state when there is a meme loading error', () => {
    const errorMessage = 'Test error message';
    vi.mocked(useMemeStore).mockReturnValue({
      ...useMemeStore(),
      error: errorMessage,
      isLoading: false
    } as any);

    render(<App />, { initialEntries: ['/'] });
    expect(screen.getByText(`Error Loading Memes: ${errorMessage}`)).toBeInTheDocument();
  });

  it('renders loading state when loading memes', () => {
    vi.mocked(useMemeStore).mockReturnValue({
      ...useMemeStore(),
      isLoading: true
    } as any);

    render(<App />, { initialEntries: ['/'] });
    expect(screen.getByTestId('mock-header')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-meme-grid')).not.toBeInTheDocument();
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });
});
