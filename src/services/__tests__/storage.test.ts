import { vi } from 'vitest';

// Mock Supabase client
vi.mock('../../config/supabase', () => ({
  supabase: {
    storage: {
      from: vi.fn().mockReturnValue({
        upload: vi.fn().mockResolvedValue({ data: { path: 'test.jpg' }, error: null }),
        getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://example.com/test.jpg' } })
      })
    },
    from: vi.fn().mockReturnValue({
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: {
          id: '123',
          title: 'Test Meme',
          image_url: 'https://example.com/test.jpg',
          tags: ['test'],
          created_at: '2023-01-01',
          user_id: 'user1',
          favorite_count: 0,
          view_count: 0,
          share_count: 0,
          download_count: 0
        },
        error: null
      })
    })
  }
}));

import { describe, it, expect, beforeEach } from 'vitest';
import { uploadMeme, StorageError } from '../storage';
import { supabase } from '../../config/supabase';

describe('storage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('uploads meme successfully', async () => {
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const mockMetadata = {
      title: 'Test Meme',
      tags: ['test'],
      image_url: '',
      created_at: '',
      user_id: 'user1',
      favorite_count: 0,
      view_count: 0,
      share_count: 0,
      download_count: 0
    };

    const result = await uploadMeme(mockFile, mockMetadata);
    expect(result).toEqual(expect.objectContaining({
      title: 'Test Meme',
      tags: expect.arrayContaining(['test'])
    }));
  });

  it('handles storage upload error', async () => {
    // Mock storage upload error
    vi.mocked(supabase.storage.from).mockReturnValue({
      upload: vi.fn().mockResolvedValue({ data: null, error: new Error('Upload failed') }),
      getPublicUrl: vi.fn()
    } as any);

    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const mockMetadata = {
      title: 'Test Meme',
      tags: ['test'],
      image_url: '',
      created_at: '',
      user_id: 'user1',
      favorite_count: 0,
      view_count: 0,
      share_count: 0,
      download_count: 0
    };

    await expect(uploadMeme(mockFile, mockMetadata)).rejects.toThrow(StorageError);
  });

  it('handles database error', async () => {
    // Mock successful storage upload but database error
    vi.mocked(supabase.from).mockReturnValue({
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: new Error('Database error') })
    } as any);

    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const mockMetadata = {
      title: 'Test Meme',
      tags: ['test'],
      image_url: '',
      created_at: '',
      user_id: 'user1',
      favorite_count: 0,
      view_count: 0,
      share_count: 0,
      download_count: 0
    };

    await expect(uploadMeme(mockFile, mockMetadata)).rejects.toThrow(StorageError);
  });
});
