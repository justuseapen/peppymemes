import { describe, expect, test, vi, beforeEach } from 'vitest';
import { getImageData, compareImageData } from '../imageUtils';

// Mock ImageData class
class MockImageData {
  data: Uint8ClampedArray;
  width: number;
  height: number;

  constructor(width: number, height: number, data?: Uint8ClampedArray) {
    this.width = width;
    this.height = height;
    this.data = data || new Uint8ClampedArray(width * height * 4);
  }
}

// Mock browser APIs
const mockDrawImage = vi.fn();
const mockGetImageData = vi.fn();
const mockContext = {
  drawImage: mockDrawImage,
  getImageData: mockGetImageData,
  canvas: document.createElement('canvas'),
} as unknown as CanvasRenderingContext2D;

const mockGetContext = vi.fn(() => mockContext);

// Replace global objects
global.ImageData = MockImageData as any;
global.HTMLCanvasElement.prototype.getContext = mockGetContext as any;
global.createImageBitmap = vi.fn() as unknown as typeof createImageBitmap;

vi.mock('axios', () => ({
  default: {
    head: vi.fn(),
    get: vi.fn()
  }
}));

describe('imageUtils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetImageData.mockReturnValue(new MockImageData(1, 1));
  });

  describe('getImageData', () => {
    test('should convert file to ImageData', async () => {
      const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
      const mockBitmap = { width: 100, height: 100 };

      vi.mocked(createImageBitmap).mockResolvedValue(mockBitmap as any);

      const result = await getImageData(mockFile);

      expect(createImageBitmap).toHaveBeenCalledWith(mockFile);
      expect(mockDrawImage).toHaveBeenCalledWith(mockBitmap, 0, 0);
      expect(result).toBeInstanceOf(MockImageData);
    });

    test('should handle image load error', async () => {
      const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' });

      vi.mocked(createImageBitmap).mockRejectedValue(new Error('Failed to load image'));

      await expect(getImageData(mockFile)).rejects.toThrow('Failed to load image');
    });

    test('should handle canvas context error', async () => {
      const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
      const mockBitmap = { width: 100, height: 100 };

      vi.mocked(createImageBitmap).mockResolvedValue(mockBitmap as any);
      mockGetContext.mockReturnValue(null as unknown as CanvasRenderingContext2D);

      await expect(getImageData(mockFile)).rejects.toThrow('Failed to get canvas context');
    });
  });

  describe('compareImageData', () => {
    test('should return true for identical images', () => {
      const data = new Uint8ClampedArray([255, 0, 0, 255]); // Red pixel
      const data1 = new MockImageData(1, 1, data.slice());
      const data2 = new MockImageData(1, 1, data.slice());

      expect(compareImageData(data1 as any, data2 as any)).toBe(true);
    });

    test('should return false for different dimensions', () => {
      const data1 = new MockImageData(1, 1);
      const data2 = new MockImageData(2, 2);

      expect(compareImageData(data1 as any, data2 as any)).toBe(false);
    });

    test('should return false for different images', () => {
      const data1 = new MockImageData(1, 1, new Uint8ClampedArray([255, 0, 0, 255])); // Red
      const data2 = new MockImageData(1, 1, new Uint8ClampedArray([0, 255, 0, 255])); // Green

      expect(compareImageData(data1 as any, data2 as any)).toBe(false);
    });

    test('should handle similar but not identical images', () => {
      const data1 = new MockImageData(1, 1, new Uint8ClampedArray([255, 0, 0, 255]));
      const data2 = new MockImageData(1, 1, new Uint8ClampedArray([250, 5, 5, 255]));

      expect(compareImageData(data1 as any, data2 as any)).toBe(true);
    });
  });
});
