import { vi, describe, it, expect } from 'vitest';
import { render, screen } from '../../test/testUtils';
import { DuplicateAlert } from '../DuplicateAlert';
import { createMockMeme } from '../../test/factories';

const mockMeme = createMockMeme();

describe('DuplicateAlert', () => {
  it('renders duplicate alert with meme details', () => {
    render(<DuplicateAlert duplicateOf={mockMeme} onClose={() => { }} />);
    expect(screen.getByText(/duplicate meme found/i)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(mockMeme.title))).toBeInTheDocument();
  });

  it('calls onClose when clicking close button', () => {
    const onClose = vi.fn();
    render(<DuplicateAlert duplicateOf={mockMeme} onClose={onClose} />);
    screen.getByRole('button', { name: /close/i }).click();
    expect(onClose).toHaveBeenCalled();
  });
});
