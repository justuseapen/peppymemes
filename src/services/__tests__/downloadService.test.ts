import { describe, it, expect, vi, beforeEach } from 'vitest';
import { downloadService } from '../downloadService';
import { createMockMeme } from '../../test/factories';
import { statsService } from '../statsService';

// Mock fetch
global.fetch = vi.fn();
// Mock URL.createObjectURL and revokeObjectURL
global.URL.createObjectURL = vi.fn();
global.URL.revokeObjectURL = vi.fn();

// Mock statsService
vi.mock('../statsService', () => ({
  statsService: {
    incrementStat: vi.fn()
  }
}));

describe('downloadService', () => {
  const mockMeme = createMockMeme({
    title: 'Test Meme',
    image_url: 'https://example.com/meme.jpg'
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('downloads meme successfully', async () => {
    const mockBlob = new Blob(['test'], { type: 'image/jpeg' });
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      blob: () => Promise.resolve(mockBlob)
    });
    (global.URL.createObjectURL as ReturnType<typeof vi.fn>).mockReturnValueOnce('blob:test');

    const result = await downloadService.downloadMeme(mockMeme);

    expect(result.success).toBe(true);
    expect(global.fetch).toHaveBeenCalledWith(mockMeme.image_url);
    expect(statsService.incrementStat).toHaveBeenCalledWith(mockMeme.id, 'download');
    expect(global.URL.createObjectURL).toHaveBeenCalledWith(mockBlob);
    expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('blob:test');
  });

  it('handles network errors', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('Network error'));

    const result = await downloadService.downloadMeme(mockMeme);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Failed to download: Network error');
    expect(statsService.incrementStat).not.toHaveBeenCalled();
  });

  it('handles non-ok response', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found'
    });

    const result = await downloadService.downloadMeme(mockMeme);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Failed to download: Server returned 404 Not Found');
    expect(statsService.incrementStat).not.toHaveBeenCalled();
  });

  it('sanitizes filename', async () => {
    const mockBlob = new Blob(['test'], { type: 'image/jpeg' });
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      blob: () => Promise.resolve(mockBlob)
    });

    const mockMemeWithSpecialChars = createMockMeme({
      title: 'Test/Meme\\With:Invalid*Chars',
      image_url: 'https://example.com/meme.jpg'
    });

    const result = await downloadService.downloadMeme(mockMemeWithSpecialChars);

    expect(result.success).toBe(true);
    expect(result.filename).toBe('Test-Meme-With-Invalid-Chars.jpg');
  });

  it('preserves file extension from URL', async () => {
    const mockBlob = new Blob(['test'], { type: 'image/png' });
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      blob: () => Promise.resolve(mockBlob)
    });

    const mockMemeWithPNG = createMockMeme({
      title: 'Test Meme',
      image_url: 'https://example.com/meme.png'
    });

    const result = await downloadService.downloadMeme(mockMemeWithPNG);

    expect(result.success).toBe(true);
    expect(result.filename).toMatch(/\.png$/);
  });
});
