import { vi, describe, it, expect } from 'vitest';
import { render } from '../../test/testUtils';
import { MetaTags } from '../MetaTags';
import { createMockMeme } from '../../test/factories';

const mockMeme = createMockMeme();

describe('MetaTags', () => {
  it('sets document title when meme is provided', () => {
    render(<MetaTags meme={mockMeme} />);
    expect(document.title).toBe(`${mockMeme.title} - Peppy Memes`);
  });

  it('sets default title when no meme is provided', () => {
    render(<MetaTags />);
    expect(document.title).toBe('Peppy Memes');
  });

  it('cleans up title on unmount', () => {
    const { unmount } = render(<MetaTags meme={mockMeme} />);
    unmount();
    expect(document.title).toBe('Peppy Memes');
  });
});
