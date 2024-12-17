import { Router, Request, Response, RequestHandler } from 'express';
import { supabase } from '../../../../config/server';
import { authenticateApiKey } from '../middleware/auth';

// Export handlers for testing
export const handlers = {
  async listTags(req: Request, res: Response) {
    try {
      const { data: tags, error } = await supabase
        .from('tags')
        .select('name, meme_count')
        .order('meme_count', { ascending: false });

      if (error) throw error;

      res.json({
        data: tags,
        metadata: {
          total: tags.length
        }
      });
    } catch (error) {
      console.error('Error fetching tags:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async getMemesByTag(req: Request, res: Response) {
    try {
      const { tag } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const per_page = parseInt(req.query.per_page as string) || 20;

      const start = (page - 1) * per_page;
      const { data: memes, error, count } = await supabase
        .from('memes')
        .select('*', { count: 'exact' })
        .contains('tags', [tag])
        .range(start, start + per_page - 1);

      if (error) throw error;

      res.json({
        data: memes || [],
        metadata: {
          page,
          per_page,
          total: count || 0,
          tag
        }
      });
    } catch (error) {
      console.error('Error fetching memes by tag:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateApiKey as RequestHandler);

// Routes
router.get('/', handlers.listTags as RequestHandler);
router.get('/:tag/memes', handlers.getMemesByTag as RequestHandler);

export default router;
