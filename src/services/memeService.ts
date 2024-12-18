import { supabase } from '../config/supabase';
import { Meme } from '../types/meme';
import { SortOption } from '../store/useSortStore';
import { User } from '@supabase/supabase-js';

export async function getMemes(sortBy: SortOption = 'newest'): Promise<Meme[]> {
  console.log('Getting memes with sort option:', sortBy);

  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();

    // Build query to get memes
    let query = supabase
      .from('memes')
      .select('*');

    // Apply sorting
    switch (sortBy) {
      case 'oldest':
        query = query.order('created_at', { ascending: true });
        break;
      case 'most_viewed':
        query = query.order('view_count', { ascending: false });
        break;
      case 'most_favorited':
        query = query.order('favorite_count', { ascending: false });
        break;
      case 'most_downloaded':
        query = query.order('download_count', { ascending: false });
        break;
      case 'newest':
      default:
        query = query.order('created_at', { ascending: false });
        break;
    }

    // Get all memes
    let { data: memes, error } = await query;

    if (error) {
      console.error('Error fetching memes:', error);
      throw error;
    }

    if (!memes) {
      console.log('No memes found, returning empty array');
      return [];
    }

    // If user is authenticated, get their favorites
    let favorites = new Set<string>();
    if (user) {
      const { data: userFavorites } = await supabase
        .from('favorites')
        .select('meme_id')
        .eq('user_id', user.id);

      if (userFavorites) {
        favorites = new Set(userFavorites.map(f => f.meme_id));
      }
    }

    // Map memes with favorite status
    const memesWithFavorites = memes.map(meme => ({
      ...meme,
      is_favorited: favorites.has(meme.id),
      favorite_count: meme.favorite_count || 0,
      view_count: meme.view_count || 0,
      share_count: meme.share_count || 0,
      download_count: meme.download_count || 0
    }));

    console.log('Fetched memes:', memesWithFavorites.length);
    return memesWithFavorites;
  } catch (error) {
    console.error('Unexpected error in getMemes:', error);
    throw error;
  }
}

export async function toggleFavorite(meme: Meme, user: User): Promise<void> {
  try {
    const { error: existingError } = await supabase
      .from('favorites')
      .select('*')
      .eq('meme_id', meme.id)
      .eq('user_id', user.id)
      .single();

    if (existingError) {
      // Favorite doesn't exist, create it
      const { error: insertError } = await supabase
        .from('favorites')
        .upsert({
          meme_id: meme.id,
          user_id: user.id,
          created_at: new Date().toISOString()
        });

      if (insertError) throw insertError;
    } else {
      // Favorite exists, remove it
      const { error: deleteError } = await supabase
        .from('favorites')
        .delete()
        .eq('meme_id', meme.id)
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;
    }
  } catch (error) {
    console.error('Error in toggleFavorite:', error);
    throw error;
  }
}

export async function deleteMeme(memeId: string): Promise<void> {
  try {
    // Delete the meme record
    const { error: deleteError } = await supabase
      .from('memes')
      .delete()
      .eq('id', memeId);

    if (deleteError) {
      console.error('Error deleting meme:', deleteError);
      throw new Error('Failed to delete meme');
    }

    // Delete the meme image from storage
    const { error: storageError } = await supabase
      .storage
      .from('memes')
      .remove([`memes/${memeId}`]);

    if (storageError) {
      console.error('Error deleting meme image:', storageError);
      // Don't throw here since the database record is already deleted
    }
  } catch (error) {
    console.error('Error in deleteMeme:', error);
    throw error;
  }
}
