import { User } from '@supabase/supabase-js';
import { Request } from 'express';

export interface ApiKey {
  id: string;
  key: string;
  name: string;
  user_id: string;
  tier: 'free' | 'developer';
  requestsPerDay: number;
  requestCount: number;
  created_at: string;
}

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      user?: User;
      apiKey?: ApiKey;
    }
  }
}

// Export types for use in tests
export type ExtendedRequest = Request;
