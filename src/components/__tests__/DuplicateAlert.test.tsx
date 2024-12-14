import React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DuplicateAlert } from '../DuplicateAlert';
import { Meme } from '../../types/meme';

describe('DuplicateAlert', () => {
  const mockMeme: Meme = {
    id: 123,
    title: 'Test Meme',
    image_url: 'https://example.com/test.jpg',
    tags: ['funny'],
    created_at: '2024-03-11T00:00:00Z',
    user_id: 'user123',
  };

  const mockOnClose = vi.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  test('displays duplicate meme information', () => {
    render(<DuplicateAlert duplicateOf={mockMeme} onClose={mockOnClose} />);

    expect(screen.getByText('Duplicate Detected')).toBeDefined();
    expect(screen.getByText((content) => content.includes(mockMeme.title))).toBeDefined();
    expect(screen.getByAltText('Existing meme')).toHaveAttribute('src', mockMeme.image_url);
  });

  test('calls onClose when X button is clicked', () => {
    render(<DuplicateAlert duplicateOf={mockMeme} onClose={mockOnClose} />);

    // Find and click the close button (the X icon button)
    const closeButton = screen.getByRole('button', {
      name: /close/i
    });
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('calls onClose when backdrop is clicked', () => {
    render(<DuplicateAlert duplicateOf={mockMeme} onClose={mockOnClose} />);

    // Find and click the outer div (backdrop)
    const backdrop = screen.getByTestId('modal-backdrop');
    fireEvent.click(backdrop);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
