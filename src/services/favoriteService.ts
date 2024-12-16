import { supabase } from '../config/supabase';
import { Favorite, Meme } from '../types/meme';

interface FavoriteWithMeme {
  meme_id: string;
  memes: Meme;
}

class FavoriteError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FavoriteError';
  }
}

export const favoriteService = {
  async toggleFavorite(memeId: string): Promise<boolean> {
    console.log('Toggling favorite for meme:', memeId);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log('No user found');
      throw new FavoriteError('You must be logged in to favorite memes');
    }
    console.log('User:', user.id);

    try {
      console.log('Checking if already favorited...');
      const { data: existingFavorite, error: fetchError } = await supabase
        .from('favorites')
        .select()
        .eq('user_id', user.id)
        .eq('meme_id', memeId)
        .single();

      console.log('Existing favorite:', existingFavorite);
      console.log('Fetch error:', fetchError);

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error checking favorite status:', fetchError);
        throw new FavoriteError('Failed to check favorite status');
      }

      if (existingFavorite) {
        console.log('Removing existing favorite...');
        const { error: deleteError } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('meme_id', memeId);

        if (deleteError) {
          console.error('Delete error:', deleteError);
          throw new FavoriteError('Failed to remove favorite');
        }
        console.log('Favorite removed successfully');
        return false;
      } else {
        console.log('Adding new favorite...');
        const { error: insertError } = await supabase
          .from('favorites')
          .insert({
            user_id: user.id,
            meme_id: memeId,
          });

        if (insertError) {
          console.error('Insert error:', insertError);
          if (insertError.code === '23505') {
            throw new FavoriteError('You have already favorited this meme');
          }
          throw new FavoriteError('Failed to add favorite');
        }
        console.log('Favorite added successfully');
        return true;
      }
    } catch (error) {
      console.error('Toggle favorite error:', error);
      if (error instanceof FavoriteError) throw error;
      throw new FavoriteError('An unexpected error occurred');
    }
  },

  async getFavorites(): Promise<Meme[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new FavoriteError('You must be logged in to view favorites');

    const { data: favorites, error } = await supabase
      .from('favorites')
      .select(`
        meme_id,
        memes (*)
      `)
      .eq('user_id', user.id) as { data: FavoriteWithMeme[] | null, error: any };

    if (error) throw new FavoriteError('Failed to fetch favorites');
    if (!favorites) return [];

    return favorites.map(f => ({
      ...f.memes,
      is_favorited: true
    }));
  },

  async isFavorited(memeId: string): Promise<boolean> {
    console.log('Checking if meme is favorited:', memeId);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log('No user found, returning false');
      return false;
    }
    console.log('User:', user.id);

    const { data: favorite, error } = await supabase
      .from('favorites')
      .select()
      .eq('user_id', user.id)
      .eq('meme_id', memeId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking favorite status:', error);
    }

    console.log('Is favorited:', !!favorite);
    return !!favorite;
  }
};
