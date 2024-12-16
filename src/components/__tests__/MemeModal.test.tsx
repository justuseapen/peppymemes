import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '../../test/testUtils';
import { MemeModal } from '../MemeModal';
import { statsService } from '../../services/statsService';

// Mock statsService
vi.mock('../../services/statsService', () => ({
  statsService: {
    incrementStat: vi.fn(),
    getStats: vi.fn().mockResolvedValue({
      view_count: 0,
      favorite_count: 0,
      share_count: 0,
      download_count: 0
    })
  }
}));

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn()
  }
});

// Mock window.open
const windowOpen = vi.fn();
window.open = windowOpen;

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

describe('MemeModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders modal content when open', () => {
    render(<MemeModal meme={mockMeme} isOpen={true} onClose={() => { }} />);
    expect(screen.getByText('Test Meme')).toBeInTheDocument();
    expect(screen.getByText('0 views')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<MemeModal meme={mockMeme} isOpen={false} onClose={() => { }} />);
    expect(screen.queryByText('Test Meme')).not.toBeInTheDocument();
  });

  it('calls onClose when clicking close button', () => {
    const onClose = vi.fn();
    render(<MemeModal meme={mockMeme} isOpen={true} onClose={onClose} />);
    fireEvent.click(screen.getByLabelText('Close modal'));
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onClose when clicking backdrop', () => {
    const onClose = vi.fn();
    const { container } = render(<MemeModal meme={mockMeme} isOpen={true} onClose={onClose} />);
    fireEvent.click(container.firstChild as Element);
    expect(onClose).toHaveBeenCalled();
  });

  it('copies link when clicking Copy Link button', async () => {
    render(<MemeModal meme={mockMeme} isOpen={true} onClose={() => { }} />);

    // Clear any previous calls to incrementStat
    vi.mocked(statsService.incrementStat).mockClear();

    fireEvent.click(screen.getByText('Copy Link'));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(expect.stringContaining('/meme/123'));

    // Wait for all state updates to complete
    await vi.waitFor(() => {
      expect(statsService.incrementStat).toHaveBeenCalledWith('123', 'share');
    });
  });

  it('copies embed code when clicking Copy button in embed section', async () => {
    render(<MemeModal meme={mockMeme} isOpen={true} onClose={() => { }} />);

    // Clear any previous calls to incrementStat
    vi.mocked(statsService.incrementStat).mockClear();

    // Use a more specific selector to find the embed copy button
    const embedCopyButton = screen.getByRole('button', { name: /^Copy$/ });
    fireEvent.click(embedCopyButton);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(expect.stringContaining('<iframe'));

    // Wait for all state updates to complete
    await vi.waitFor(() => {
      expect(statsService.incrementStat).toHaveBeenCalledWith('123', 'share');
    });
  });

  it('opens Truth Social share dialog when clicking Share on Truth Social', async () => {
    render(<MemeModal meme={mockMeme} isOpen={true} onClose={() => { }} />);
    fireEvent.click(screen.getByText('Share on Truth Social'));
    expect(windowOpen).toHaveBeenCalledWith(
      expect.stringContaining('truthsocial.com/share'),
      '_blank',
      expect.any(String)
    );
    expect(statsService.incrementStat).toHaveBeenCalledWith('123', 'share');
  });
});
