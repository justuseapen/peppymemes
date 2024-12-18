import { Request, Response, NextFunction } from 'express';
import { supabase } from '../../../../config/server';
import { ApiKey } from '../types';

declare global {
  var API_KEYS: {
    [key: string]: ApiKey;
  };
}

export const authenticateJWT = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        error: 'Authorization header required'
      });
    }

    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Invalid authorization format'
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        error: 'Invalid token'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Error authenticating JWT:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const authenticateApiKey = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const apiKey = req.headers['x-api-key'] as string;

    if (!apiKey) {
      return res.status(401).json({
        error: 'API key is required. Please include it in the X-API-Key header.'
      });
    }

    const keyData = global.API_KEYS[apiKey];
    if (!keyData) {
      return res.status(500).json({
        error: 'Invalid API key'
      });
    }

    // Track API key usage
    keyData.requestCount = (keyData.requestCount || 0) + 1;

    // Check rate limit
    if (keyData.requestCount >= keyData.requestsPerDay) {
      return res.status(403).json({
        error: 'Rate limit exceeded'
      });
    }

    req.apiKey = keyData;
    next();
  } catch (error) {
    console.error('Error authenticating API key:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
