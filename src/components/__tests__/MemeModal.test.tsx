import React from 'react';
import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemeModal } from '../MemeModal';

describe('MemeModal', () => {
  const mockMeme = {
    id: 1,
    title: 'Test Meme',
    image_url: 'https://example.com/meme.jpg',
    tags: ['funny', 'test'],
    created_at: '2024-03-11T00:00:00Z',
    user_id: 'user1'
  };

  // Mock window.location
  const originalLocation = window.location;
  beforeEach(() => {
    delete (window as any).location;
    window.location = {
      ...originalLocation,
      origin: 'https://example.com'
    };
  });

  // Mock clipboard API
  const mockClipboard = {
    writeText: vi.fn()
  };
  Object.assign(navigator, {
    clipboard: mockClipboard
  });

  // Mock window.open
  const mockOpen = vi.fn();
  window.open = mockOpen;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders nothing when isOpen is false', () => {
    render(
      <MemeModal
        meme={mockMeme}
        isOpen={false}
        onClose={() => { }}
      />
    );

    expect(screen.queryByText('Test Meme')).not.toBeInTheDocument();
  });

  test('renders meme content when isOpen is true', () => {
    render(
      <MemeModal
        meme={mockMeme}
        isOpen={true}
        onClose={() => { }}
      />
    );

    expect(screen.getByText('Test Meme')).toBeInTheDocument();
    expect(screen.getByAltText('Test Meme')).toBeInTheDocument();
    expect(screen.getByText('funny')).toBeInTheDocument();
    expect(screen.getByText('test')).toBeInTheDocument();
    expect(screen.getByText('Share & Embed')).toBeInTheDocument();
  });

  test('calls onClose when clicking the close button', () => {
    const onClose = vi.fn();
    render(
      <MemeModal
        meme={mockMeme}
        isOpen={true}
        onClose={onClose}
      />
    );

    fireEvent.click(screen.getByLabelText('Close modal'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('calls onClose when clicking the backdrop', () => {
    const onClose = vi.fn();
    render(
      <MemeModal
        meme={mockMeme}
        isOpen={true}
        onClose={onClose}
      />
    );

    fireEvent.click(screen.getByRole('dialog'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('does not call onClose when clicking the modal content', () => {
    const onClose = vi.fn();
    render(
      <MemeModal
        meme={mockMeme}
        isOpen={true}
        onClose={onClose}
      />
    );

    fireEvent.click(screen.getByText('Test Meme'));
    expect(onClose).not.toHaveBeenCalled();
  });

  test('copies link to clipboard when clicking Copy Link button', async () => {
    render(
      <MemeModal
        meme={mockMeme}
        isOpen={true}
        onClose={() => { }}
      />
    );

    fireEvent.click(screen.getByText('Copy Link'));

    expect(mockClipboard.writeText).toHaveBeenCalledWith(
      'https://example.com/meme/1'
    );

    await waitFor(() => {
      expect(screen.getByText('Copied!')).toBeInTheDocument();
    });
  });

  test('copies embed code when clicking Copy button in embed section', async () => {
    render(
      <MemeModal
        meme={mockMeme}
        isOpen={true}
        onClose={() => { }}
      />
    );

    const embedCode = `<iframe src="https://example.com/meme/1/embed" width="500" height="400" frameborder="0" allowfullscreen></iframe>`;

    fireEvent.click(screen.getByText(/^Copy$/));

    expect(mockClipboard.writeText).toHaveBeenCalledWith(embedCode);

    await waitFor(() => {
      expect(screen.getByText('Copied!')).toBeInTheDocument();
    });
  });

  test('opens Truth Social share dialog when clicking Share on Truth Social', () => {
    render(
      <MemeModal
        meme={mockMeme}
        isOpen={true}
        onClose={() => { }}
      />
    );

    fireEvent.click(screen.getByText('Share on Truth Social'));

    const expectedUrl = `https://truthsocial.com/share?title=${encodeURIComponent('Test Meme')}&url=${encodeURIComponent('https://example.com/meme/1')}`;
    expect(mockOpen).toHaveBeenCalledWith(
      expectedUrl,
      '_blank',
      'width=600,height=400'
    );
  });
});
