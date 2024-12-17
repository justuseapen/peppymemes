import { Request } from 'express';

export interface ApiKey {
  id: string;
  key: string;
  name: string;
  user_id: string;
  tier: 'free' | 'developer' | 'enterprise';
  created_at: string;
  last_used: string | null;
  is_active: boolean;
}

declare global {
  namespace Express {
    interface Request {
      apiKey?: ApiKey;
    }
  }
}
