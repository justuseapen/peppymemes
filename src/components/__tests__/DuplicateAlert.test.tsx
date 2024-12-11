import { describe, expect, test } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DuplicateAlert } from '../DuplicateAlert';

describe('DuplicateAlert', () => {
  const mockMeme = {
    id: '1',
    imageUrl: 'https://example.com/meme.jpg',
    title: 'Test Meme',
    tags: ['funny'],
    createdAt: new Date(),
    creator: 'TestUser',
  };

  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders duplicate alert with correct information', () => {
    render(<DuplicateAlert duplicateOf={mockMeme} onClose={mockOnClose} />);

    expect(screen.getByText(/Duplicate Detected/i)).toBeInTheDocument();
    expect(screen.getByText(/Test Meme/i)).toBeInTheDocument();
    expect(screen.getByText(/TestUser/i)).toBeInTheDocument();
    expect(screen.getByAltText('Existing meme')).toHaveAttribute('src', mockMeme.imageUrl);
  });

  test('calls onClose when close button is clicked', () => {
    render(<DuplicateAlert duplicateOf={mockMeme} onClose={mockOnClose} />);

    fireEvent.click(screen.getByRole('button', { name: /close/i }));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('calls onClose when X button is clicked', () => {
    render(<DuplicateAlert duplicateOf={mockMeme} onClose={mockOnClose} />);

    // Find and click the X button (it might not have text content)
    const closeButton = screen.getAllByRole('button')[0]; // First button should be the X
    fireEvent.click(closeButton);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});