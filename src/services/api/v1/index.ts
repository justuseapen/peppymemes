import { Router, Request, Response } from 'express';
import memeRoutes from './routes/memes';
import tagRoutes from './routes/tags';
import { ApiKey } from './types';

const router = Router();

// API Info endpoint
router.get('/', (req: Request, res: Response) => {
  res.json({
    version: '1.0.0',
    endpoints: ['/memes', '/tags']
  });
});

// Rate limit headers
router.use((req: Request, res: Response, next) => {
  const tier = (req.apiKey as ApiKey)?.tier || 'free';
  const limit = tier === 'free' ? '100' :
    tier === 'developer' ? '10000' : 'unlimited';

  res.setHeader('X-RateLimit-Limit', limit);
  next();
});

// Routes
router.use('/memes', memeRoutes);
router.use('/tags', tagRoutes);

export default router;
