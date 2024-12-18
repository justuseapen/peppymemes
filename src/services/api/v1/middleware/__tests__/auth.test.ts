import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { supabase } from '../../../../../config/server';
import { authenticateJWT, authenticateApiKey } from '../auth';
import { User, AuthError } from '@supabase/supabase-js';
import { ApiKey, ExtendedRequest } from '../../types';

// Create a mock AuthError class
class MockAuthError extends AuthError {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
    this.status = 401;
    this.code = 'invalid_token';
  }
}

// Mock Supabase
vi.mock('../../../../../config/server', () => ({
  supabase: {
    auth: {
      getUser: vi.fn()
    }
  }
}));

describe('Authentication Middleware', () => {
  let req: Partial<ExtendedRequest>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      headers: {},
      get: vi.fn((name: string) => {
        if (name === 'set-cookie') return undefined;
        return undefined;
      })
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
      setHeader: vi.fn()
    };
    next = vi.fn().mockImplementation((err?: any) => { }) as NextFunction;

    // Reset mocks
    vi.clearAllMocks();
    // Reset global API_KEYS
    (global as any).API_KEYS = {};
  });

  describe('JWT Authentication', () => {
    it('should authenticate valid JWT token', async () => {
      const mockUser: User = {
        id: 'user-123',
        email: 'test@example.com',
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString()
      };

      if (!req.headers) req.headers = {};
      req.headers.authorization = 'Bearer valid-token';

      vi.mocked(supabase.auth.getUser).mockResolvedValueOnce({
        data: { user: mockUser },
        error: null
      });

      await authenticateJWT(req as Request, res as Response, next);

      expect(supabase.auth.getUser).toHaveBeenCalledWith('valid-token');
      expect(req.user).toEqual(mockUser);
      expect(next).toHaveBeenCalled();
    });

    it('should reject missing authorization header', async () => {
      await authenticateJWT(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Authorization header required'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject invalid token format', async () => {
      if (!req.headers) req.headers = {};
      req.headers.authorization = 'InvalidFormat token';

      await authenticateJWT(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid authorization format'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject invalid token', async () => {
      if (!req.headers) req.headers = {};
      req.headers.authorization = 'Bearer invalid-token';

      const mockError = new MockAuthError('Invalid token');

      vi.mocked(supabase.auth.getUser).mockResolvedValueOnce({
        data: { user: null },
        error: mockError
      });

      await authenticateJWT(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid token'
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('API Key Authentication', () => {
    it('should authenticate valid API key', async () => {
      if (!req.headers) req.headers = {};
      req.headers['x-api-key'] = 'valid-api-key';

      const mockApiKey: ApiKey = {
        id: 'key-123',
        key: 'valid-api-key',
        name: 'Test Key',
        user_id: 'user-123',
        tier: 'developer',
        requestsPerDay: 10000,
        requestCount: 0,
        created_at: new Date().toISOString()
      };

      // Mock API key validation
      (global as any).API_KEYS = {
        'valid-api-key': mockApiKey
      };

      await authenticateApiKey(req as Request, res as Response, next);

      expect(req.apiKey).toEqual(mockApiKey);
      expect(next).toHaveBeenCalled();
    });

    it('should reject missing API key', async () => {
      await authenticateApiKey(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'API key is required. Please include it in the X-API-Key header.'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject invalid API key', async () => {
      if (!req.headers) req.headers = {};
      req.headers['x-api-key'] = 'invalid-api-key';
      (global as any).API_KEYS = {};

      await authenticateApiKey(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid API key'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should track API key usage', async () => {
      if (!req.headers) req.headers = {};
      req.headers['x-api-key'] = 'valid-api-key';
      const mockApiKey = {
        tier: 'free',
        requestsPerDay: 100,
        requestCount: 0
      };

      (global as any).API_KEYS = {
        'valid-api-key': mockApiKey
      };

      await authenticateApiKey(req as Request, res as Response, next);

      expect(mockApiKey.requestCount).toBe(1);
      expect(next).toHaveBeenCalled();
    });

    it('should reject when rate limit exceeded', async () => {
      if (!req.headers) req.headers = {};
      req.headers['x-api-key'] = 'valid-api-key';
      const mockApiKey = {
        tier: 'free',
        requestsPerDay: 100,
        requestCount: 100 // Already at limit
      };

      (global as any).API_KEYS = {
        'valid-api-key': mockApiKey
      };

      await authenticateApiKey(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Rate limit exceeded'
      });
      expect(next).not.toHaveBeenCalled();
    });
  });
});
