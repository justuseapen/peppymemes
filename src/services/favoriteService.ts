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
  async toggleFavorite(memeId: string): Promise<{ isFavorited: boolean; memeId: string }> {
    console.log('Toggling favorite for meme:', memeId);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log('No user found');
      throw new FavoriteError('You must be logged in to favorite memes');
    }
    console.log('User:', user.id);

    try {
      // Check if meme is already favorited
      const { data: existingFavorite } = await supabase
        .from('favorites')
        .select()
        .eq('user_id', user.id)
        .eq('meme_id', memeId)
        .single();

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
        return { isFavorited: false, memeId };
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
        return { isFavorited: true, memeId };
      }
    } catch (error) {
      console.error('Toggle favorite error:', error);
      if (error instanceof FavoriteError) throw error;
      throw new FavoriteError('An unexpected error occurred');
    }
  },

  async getFavorites(): Promise<string[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data: favorites, error } = await supabase
      .from('favorites')
      .select('meme_id')
      .eq('user_id', user.id);

    if (error) throw new FavoriteError('Failed to fetch favorites');
    if (!favorites) return [];

    return favorites.map(f => f.meme_id);
  }
};
