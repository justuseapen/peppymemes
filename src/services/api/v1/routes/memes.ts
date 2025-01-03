import { Router, Request, Response } from 'express';
import { supabase } from '../../../../config/server';
import { authenticateApiKey, authenticateJWT } from '../middleware/auth';
import { RequestHandler } from 'express';

// Export handlers for testing
export const handlers = {
  async listMemes(req: Request, res: Response) {
    try {
      // Check rate limit
      if (req.apiKey) {
        if (req.apiKey.requestCount >= req.apiKey.requestsPerDay) {
          return res.status(403).json({ error: 'Rate limit exceeded' });
        }
      }

      // Set rate limit headers
      const limit = req.apiKey?.tier === 'developer' ? '10000' : '100';
      res.setHeader('X-RateLimit-Limit', limit);

      const page = parseInt(req.query.page as string) || 1;
      const per_page = parseInt(req.query.per_page as string) || 20;
      const sort_by = req.query.sort_by || 'newest';

      let query = supabase
        .from('memes')
        .select('*', { count: 'exact' });

      // Apply sorting
      switch (sort_by) {
        case 'oldest':
          query = query.order('created_at', { ascending: true });
          break;
        case 'most_viewed':
          query = query.order('view_count', { ascending: false });
          break;
        case 'most_favorited':
          query = query.order('favorite_count', { ascending: false });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }

      // Apply pagination
      const start = (page - 1) * per_page;
      query = query.range(start, start + per_page - 1);

      const { data: memes, error, count } = await query;

      if (error) throw error;

      res.json({
        data: memes,
        metadata: {
          page,
          per_page,
          total: count
        }
      });
    } catch (error) {
      console.error('Error fetching memes:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async getMeme(req: Request, res: Response) {
    try {
      const { data: meme, error } = await supabase
        .from('memes')
        .select('*')
        .eq('id', req.params.id)
        .single();

      if (error) throw error;
      if (!meme) {
        return res.status(404).json({ error: 'Meme not found' });
      }

      // Increment view count
      await supabase
        .from('memes')
        .update({ view_count: (meme.view_count || 0) + 1 })
        .eq('id', req.params.id);

      res.json({ data: meme });
    } catch (error) {
      console.error('Error fetching meme:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async searchMemes(req: Request, res: Response) {
    try {
      const { query, tags } = req.query;
      const page = parseInt(req.query.page as string) || 1;
      const per_page = parseInt(req.query.per_page as string) || 20;

      let dbQuery = supabase
        .from('memes')
        .select('*', { count: 'exact' });

      if (query) {
        dbQuery = dbQuery.ilike('title', `%${query}%`);
      }

      if (tags) {
        const tagList = (tags as string).split(',');
        dbQuery = dbQuery.contains('tags', tagList);
      }

      // Apply pagination
      const start = (page - 1) * per_page;
      dbQuery = dbQuery.range(start, start + per_page - 1);

      const { data: memes, error, count } = await dbQuery;

      if (error) throw error;

      res.json({
        data: memes,
        metadata: {
          page,
          per_page,
          total: count,
          query: query || null,
          tags: tags ? (tags as string).split(',') : null
        }
      });
    } catch (error) {
      console.error('Error searching memes:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async addFavorite(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { data: favorite, error } = await supabase
        .from('favorites')
        .insert({
          user_id: req.user.id,
          meme_id: req.params.id
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          return res.status(400).json({ error: 'Meme already favorited' });
        }
        throw error;
      }

      res.json({ data: favorite });
    } catch (error) {
      console.error('Error adding favorite:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async removeFavorite(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // First check if the favorite exists
      const { count } = await supabase
        .from('favorites')
        .select('*', { count: 'exact' })
        .eq('meme_id', req.params.id)
        .eq('user_id', req.user.id);

      if (count === 0) {
        return res.status(404).json({ error: 'Favorite not found' });
      }

      // If it exists, delete it
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('meme_id', req.params.id)
        .eq('user_id', req.user.id);

      if (error) throw error;

      res.json({ message: 'Favorite removed successfully' });
    } catch (error) {
      console.error('Error removing favorite:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateApiKey as RequestHandler);

// Routes
router.get('/search', handlers.searchMemes as RequestHandler);
router.get('/:id', handlers.getMeme as RequestHandler);
router.get('/', handlers.listMemes as RequestHandler);

// Favorite routes (require JWT auth)
router.post('/:id/favorite', authenticateJWT as RequestHandler, handlers.addFavorite as RequestHandler);
router.delete('/:id/favorite', authenticateJWT as RequestHandler, handlers.removeFavorite as RequestHandler);

export default router;
