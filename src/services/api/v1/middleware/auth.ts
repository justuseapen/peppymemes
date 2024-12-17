import { Request, Response, NextFunction } from 'express';
import { supabase } from '../../../../config/server';
import { ApiKey } from '../types';

export async function authenticateApiKey(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const apiKey = req.headers['x-api-key'];
  console.log('Authenticating API key:', apiKey);

  if (!apiKey) {
    console.log('No API key provided');
    return res.status(401).json({
      error: 'API key is required. Please include it in the X-API-Key header.'
    });
  }

  try {
    console.log('Querying database for API key');
    // Get API key from database
    const { data: apiKeyData, error } = await supabase
      .from('api_keys')
      .select('*')
      .eq('key', apiKey)
      .single();

    console.log('Database response:', { data: apiKeyData, error });

    if (error || !apiKeyData) {
      console.log('API key not found or error:', error);
      return res.status(401).json({
        error: 'Invalid API key'
      });
    }

    if (!apiKeyData.is_active) {
      console.log('API key is inactive');
      return res.status(401).json({
        error: 'API key is inactive'
      });
    }

    console.log('API key is valid, updating last_used timestamp');
    // Update last used timestamp
    await supabase
      .from('api_keys')
      .update({ last_used: new Date().toISOString() })
      .eq('id', apiKeyData.id);

    // Attach API key data to request
    req.apiKey = apiKeyData as ApiKey;
    console.log('Authentication successful');

    next();
  } catch (error) {
    console.error('Error authenticating API key:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
}
