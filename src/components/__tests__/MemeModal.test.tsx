import React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemeModal } from '../MemeModal';
import { Meme } from '../../types/meme';

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

describe('MemeModal', () => {
  const mockMeme: Meme = {
    id: '123',
    title: 'Test Meme',
    image_url: 'https://example.com/meme.jpg',
    tags: ['funny', 'test'],
    created_at: '2024-03-11T00:00:00Z',
    user_id: 'user1'
  };

  beforeEach(() => {
    mockClipboard.writeText.mockClear();
    mockOpen.mockClear();
  });

  test('renders modal content when open', () => {
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
  });

  test('does not render when closed', () => {
    render(
      <MemeModal
        meme={mockMeme}
        isOpen={false}
        onClose={() => { }}
      />
    );

    expect(screen.queryByText('Test Meme')).not.toBeInTheDocument();
  });

  test('calls onClose when clicking close button', () => {
    const onClose = vi.fn();
    render(
      <MemeModal
        meme={mockMeme}
        isOpen={true}
        onClose={onClose}
      />
    );

    fireEvent.click(screen.getByLabelText('Close modal'));
    expect(onClose).toHaveBeenCalled();
  });

  test('calls onClose when clicking backdrop', () => {
    const onClose = vi.fn();
    render(
      <MemeModal
        meme={mockMeme}
        isOpen={true}
        onClose={onClose}
      />
    );

    // Click the backdrop (the outer div)
    fireEvent.click(screen.getByRole('dialog'));
    expect(onClose).toHaveBeenCalled();
  });

  test('copies link when clicking Copy Link button', async () => {
    render(
      <MemeModal
        meme={mockMeme}
        isOpen={true}
        onClose={() => { }}
      />
    );

    fireEvent.click(screen.getByText('Copy Link'));

    expect(mockClipboard.writeText).toHaveBeenCalledWith(
      `${window.location.origin}/meme/${mockMeme.id}`
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

    const embedCode = `<iframe src="${window.location.origin}/meme/${mockMeme.id}/embed" width="500" height="400" frameborder="0" allowfullscreen></iframe>`;

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

    const expectedUrl = `https://truthsocial.com/share?title=${encodeURIComponent('Test Meme')}&url=${encodeURIComponent(`${window.location.origin}/meme/${mockMeme.id}`)}`;
    expect(mockOpen).toHaveBeenCalledWith(
      expectedUrl,
      '_blank',
      'width=600,height=400'
    );
  });
});
