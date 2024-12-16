import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemeUploadService, type MemeMetadata } from '../memeUploadService';
import { getImageData, compareImageData } from '../../utils/imageUtils';

// Mock the image utilities
vi.mock('../../utils/imageUtils');

describe('MemeUploadService', () => {
  let service: MemeUploadService;
  const mockMeme: MemeMetadata = {
    id: '1',
    title: 'Test Meme',
    tags: ['funny', 'test'],
    image_url: 'https://example.com/meme.jpg',
    created_at: new Date().toISOString()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Initialize service with a mock meme
    service = new MemeUploadService([mockMeme]);

    // Mock URL.createObjectURL
    global.URL.createObjectURL = vi.fn(() => 'blob:test');
    global.URL.revokeObjectURL = vi.fn();

    // Mock fetch and Image
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        blob: () => Promise.resolve(new Blob(['test'], { type: 'image/jpeg' }))
      })
    ) as any;

    // Mock canvas and context
    const mockContext = {
      drawImage: vi.fn(),
      getImageData: vi.fn(() => ({ data: new Uint8ClampedArray(4), width: 1, height: 1 }))
    };
    const mockCanvas = {
      getContext: vi.fn(() => mockContext),
      width: 0,
      height: 0
    };
    vi.spyOn(document, 'createElement').mockImplementation((tag) => {
      if (tag === 'canvas') return mockCanvas as any;
      return document.createElement(tag);
    });

    // Mock Image
    global.Image = class {
      onload: (() => void) | null = null;
      onerror: ((err: Error) => void) | null = null;
      src: string = '';
      width: number = 100;
      height: number = 100;

      constructor() {
        setTimeout(() => this.onload?.(), 0);
      }
    } as any;
  });

  describe('checkForDuplicates', () => {
    it('should return false for non-duplicate images', async () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      vi.mocked(getImageData).mockResolvedValue({} as ImageData);
      vi.mocked(compareImageData).mockReturnValue(false);

      const result = await service.checkForDuplicates(file);
      expect(result.isDuplicate).toBe(false);
      expect(result.duplicateOf).toBeUndefined();
    });

    it('should return true with matching meme for duplicates', async () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      vi.mocked(getImageData).mockResolvedValue({} as ImageData);
      vi.mocked(compareImageData).mockReturnValue(true);

      const result = await service.checkForDuplicates(file);
      expect(result.isDuplicate).toBe(true);
      expect(result.duplicateOf).toBe(mockMeme);
    });

    it('should handle fetch errors gracefully', async () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
      vi.mocked(getImageData).mockResolvedValue({} as ImageData);

      const result = await service.checkForDuplicates(file);
      expect(result.isDuplicate).toBe(false);
    });

    it('should handle image processing errors', async () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      vi.mocked(getImageData).mockRejectedValue(new Error('Processing error'));

      await expect(service.checkForDuplicates(file)).rejects.toThrow('Failed to check for duplicate images');
    });
  });

  describe('uploadMeme', () => {
    it('should successfully upload a new meme', async () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      vi.mocked(getImageData).mockResolvedValue({} as ImageData);
      vi.mocked(compareImageData).mockReturnValue(false);

      const result = await service.uploadMeme(file);

      expect(result.success).toBe(true);
      expect(result.previewUrl).toBe('blob:test');
      expect(URL.createObjectURL).toHaveBeenCalledWith(file);
    });

    it('should detect duplicate memes', async () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      vi.mocked(getImageData).mockResolvedValue({} as ImageData);
      vi.mocked(compareImageData).mockReturnValue(true);

      const result = await service.uploadMeme(file);

      expect(result.success).toBe(false);
      expect(result.isDuplicate).toBe(true);
      expect(result.duplicateOf).toBe(mockMeme);
      expect(result.error).toBe('This meme has already been uploaded');
    });

    it('should handle invalid file types', async () => {
      const file = new File(['test'], 'test.txt', { type: 'text/plain' });
      const result = await service.uploadMeme(file);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid file type. Only images are allowed.');
    });

    it('should handle empty files', async () => {
      const file = new File([], 'empty.jpg', { type: 'image/jpeg' });
      const result = await service.uploadMeme(file);

      expect(result.success).toBe(false);
      expect(result.error).toBe('File is empty');
    });

    it('should handle image loading errors', async () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      vi.mocked(getImageData).mockRejectedValue(new Error('Failed to load image'));

      const result = await service.uploadMeme(file);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to upload meme');
    });
  });

  describe('cleanup', () => {
    it('should revoke object URL', () => {
      const previewUrl = 'blob:test';
      service.cleanup(previewUrl);
      expect(URL.revokeObjectURL).toHaveBeenCalledWith(previewUrl);
    });

    it('should handle invalid URLs gracefully', () => {
      const invalidUrl = 'not-a-blob-url';
      service.cleanup(invalidUrl);
      expect(URL.revokeObjectURL).toHaveBeenCalledWith(invalidUrl);
    });
  });
});
