import { describe, it, expect } from 'vitest';
import { render, waitFor } from '../../test/testUtils';
import { MetaTags } from '../MetaTags';

const mockMeme = {
  id: '123',
  title: 'Test Meme',
  image_url: 'https://example.com/meme.jpg',
  tags: ['funny', 'test'],
  created_at: '2023-01-01',
  user_id: 'user123',
  favorite_count: 0,
  view_count: 0,
  share_count: 0,
  download_count: 0
};

describe('MetaTags', () => {
  it('sets document title when meme is provided', async () => {
    render(<MetaTags meme={mockMeme} />);
    await waitFor(() => {
      const title = document.querySelector('title');
      expect(title?.textContent).toBe(`${mockMeme.title} - Peppy Memes`);
    });
  });

  it('sets default title when no meme is provided', async () => {
    render(<MetaTags />);
    await waitFor(() => {
      const title = document.querySelector('title');
      expect(title?.textContent).toBe('Peppy Memes');
    });
  });

  it('sets homepage title when isHomePage is true', async () => {
    render(<MetaTags isHomePage={true} />);
    await waitFor(() => {
      const title = document.querySelector('title');
      expect(title?.textContent).toBe('Peppy Memes - Share and Discover Memes');
    });
  });

  it('sets proper meta tags for meme', async () => {
    render(<MetaTags meme={mockMeme} />);
    await waitFor(() => {
      // Check Open Graph tags
      expect(document.querySelector('meta[property="og:title"]')?.getAttribute('content'))
        .toBe(`${mockMeme.title} - Peppy Memes`);
      expect(document.querySelector('meta[property="og:image"]')?.getAttribute('content'))
        .toBe(mockMeme.image_url);
      expect(document.querySelector('meta[property="og:description"]')?.getAttribute('content'))
        .toBe(`${mockMeme.title} - Tagged with: funny, test`);

      // Check Twitter Card tags
      expect(document.querySelector('meta[name="twitter:title"]')?.getAttribute('content'))
        .toBe(`${mockMeme.title} - Peppy Memes`);
      expect(document.querySelector('meta[name="twitter:image"]')?.getAttribute('content'))
        .toBe(mockMeme.image_url);
    });
  });
});
