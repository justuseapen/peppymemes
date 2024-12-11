import { describe, expect, test, vi } from 'vitest';
import { getImageData, compareImageData } from '../imageUtils';

// Mock canvas and context
const mockGetContext = vi.fn();
const mockDrawImage = vi.fn();
const mockGetImageData = vi.fn();

// Helper to create mock ImageData
function createMockImageData(width: number, height: number, data: Uint8ClampedArray): ImageData {
  return {
    width,
    height,
    data,
    colorSpace: 'srgb',
  };
}

describe('imageUtils', () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Setup canvas mock
    global.HTMLCanvasElement.prototype.getContext = mockGetContext;
    mockGetContext.mockReturnValue({
      drawImage: mockDrawImage,
      getImageData: mockGetImageData,
    });
  });

  describe('getImageData', () => {
    test('should process image file correctly', async () => {
      const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
      const mockImageData = createMockImageData(100, 100, new Uint8ClampedArray(40000));
      
      mockGetImageData.mockReturnValue(mockImageData);
      
      const result = await getImageData(mockFile);
      
      expect(result).toBeDefined();
      expect(result.width).toBe(100);
      expect(result.height).toBe(100);
      expect(mockDrawImage).toHaveBeenCalled();
    });

    test('should handle image load error', async () => {
      const mockFile = new File([''], 'invalid.jpg', { type: 'image/jpeg' });
      
      await expect(getImageData(mockFile)).rejects.toThrow('Failed to load image');
    });
  });

  describe('compareImageData', () => {
    test('should return true for identical images', () => {
      const data = new Uint8ClampedArray([255, 0, 0, 255]); // Single red pixel
      const image1 = createMockImageData(1, 1, data);
      const image2 = createMockImageData(1, 1, data);

      const result = compareImageData(image1, image2);
      expect(result).toBe(true);
    });

    test('should return false for different sized images', () => {
      const data1 = new Uint8ClampedArray([255, 0, 0, 255]);
      const data2 = new Uint8ClampedArray([255, 0, 0, 255, 255, 0, 0, 255]);
      
      const image1 = createMockImageData(1, 1, data1);
      const image2 = createMockImageData(2, 1, data2);

      const result = compareImageData(image1, image2);
      expect(result).toBe(false);
    });

    test('should handle slight variations within threshold', () => {
      const data1 = new Uint8ClampedArray([255, 0, 0, 255]);
      const data2 = new Uint8ClampedArray([252, 2, 1, 255]); // Slightly different red
      
      const image1 = createMockImageData(1, 1, data1);
      const image2 = createMockImageData(1, 1, data2);

      const result = compareImageData(image1, image2);
      expect(result).toBe(true);
    });

    test('should return false for significantly different images', () => {
      const data1 = new Uint8ClampedArray([255, 0, 0, 255]); // Red
      const data2 = new Uint8ClampedArray([0, 255, 0, 255]); // Green
      
      const image1 = createMockImageData(1, 1, data1);
      const image2 = createMockImageData(1, 1, data2);

      const result = compareImageData(image1, image2);
      expect(result).toBe(false);
    });
  });
});