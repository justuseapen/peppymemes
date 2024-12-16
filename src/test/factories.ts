import { Meme } from '../types/meme';

export function createMockMeme(overrides?: Partial<Meme>): Meme {
  return {
    id: '123',
    title: 'Test Meme',
    image_url: 'https://example.com/meme.jpg',
    tags: ['funny', 'test'],
    created_at: '2023-01-01',
    user_id: 'user1',
    favorite_count: 0,
    view_count: 0,
    share_count: 0,
    download_count: 0,
    is_favorited: false,
    ...overrides
  };
}
