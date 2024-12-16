import React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DuplicateAlert } from '../DuplicateAlert';
import { Meme } from '../../types/meme';

const mockMeme: Meme = {
  id: '123',
  title: 'Test Meme',
  image_url: 'https://example.com/meme.jpg',
  tags: ['funny', 'test'],
  created_at: '2024-03-11T00:00:00Z',
  user_id: 'user1'
};

describe('DuplicateAlert', () => {
  test('renders duplicate alert with meme details', () => {
    const onClose = vi.fn();
    render(<DuplicateAlert duplicateOf={mockMeme} onClose={onClose} />);

    expect(screen.getByText(/This meme has already been uploaded/)).toBeInTheDocument();
    expect(screen.getByText((content) => content.includes(mockMeme.title))).toBeInTheDocument();
    expect(screen.getByAltText('Existing meme')).toHaveAttribute('src', mockMeme.image_url);
  });

  test('calls onClose when clicking close button', () => {
    const onClose = vi.fn();
    render(<DuplicateAlert duplicateOf={mockMeme} onClose={onClose} />);

    fireEvent.click(screen.getByRole('button', { name: /close modal/i }));
    expect(onClose).toHaveBeenCalled();
  });

  test('calls onClose when clicking backdrop', () => {
    const onClose = vi.fn();
    render(<DuplicateAlert duplicateOf={mockMeme} onClose={onClose} />);

    fireEvent.click(screen.getByTestId('modal-backdrop'));
    expect(onClose).toHaveBeenCalled();
  });
});
