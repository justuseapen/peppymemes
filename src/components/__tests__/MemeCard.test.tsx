import React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemeCard } from '../MemeCard';
import { Meme } from '../../types/meme';

const mockMeme: Meme = {
  id: '123',
  title: 'Test Meme',
  image_url: 'https://example.com/meme.jpg',
  tags: ['funny', 'test'],
  created_at: '2024-03-11T00:00:00Z',
  user_id: 'user1'
};

// Mock the store
const mockToggleTag = vi.fn();
vi.mock('../../store/useMemeStore', () => ({
  useMemeStore: () => ({
    toggleTag: mockToggleTag,
    selectedTags: []
  })
}));

describe('MemeCard', () => {
  test('renders meme content correctly', () => {
    render(<MemeCard meme={mockMeme} />);

    expect(screen.getByText('Test Meme')).toBeInTheDocument();
    expect(screen.getByAltText('Test Meme')).toBeInTheDocument();
    expect(screen.getByText('funny')).toBeInTheDocument();
    expect(screen.getByText('test')).toBeInTheDocument();
  });

  test('opens modal when clicking the meme', () => {
    render(<MemeCard meme={mockMeme} />);

    // Initially, modal content should not be visible
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    // Click the meme
    fireEvent.click(screen.getByAltText('Test Meme'));

    // Modal should now be visible
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  test('closes modal when clicking close button', () => {
    render(<MemeCard meme={mockMeme} />);

    // Open the modal
    fireEvent.click(screen.getByAltText('Test Meme'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    // Click the close button
    fireEvent.click(screen.getByLabelText('Close modal'));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  test('toggles tag when clicking a tag', () => {
    render(<MemeCard meme={mockMeme} />);

    // Click a tag
    fireEvent.click(screen.getByText('funny'));
    expect(mockToggleTag).toHaveBeenCalledWith('funny');
  });

  test('prevents modal from opening when clicking a tag', () => {
    const { container } = render(<MemeCard meme={mockMeme} />);

    // Click a tag
    fireEvent.click(screen.getByText('funny'));

    // Modal should not be visible
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
