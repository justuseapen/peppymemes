import { supabase } from '../config/supabase';
import { Meme } from '../types/meme';
import { User } from '@supabase/supabase-js';

export async function getMemes(): Promise<Meme[]> {
  const { data, error } = await supabase
    .from('memes')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
}

export async function toggleFavorite(meme: Meme, user: User): Promise<void> {
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
}
