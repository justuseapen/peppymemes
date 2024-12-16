import { supabase } from '../../config/supabase';
import { Meme } from '../../types/meme';

export async function createMeme(meme: Omit<Meme, 'id'>): Promise<Meme> {
  const { data: memeData, error: dbError } = await supabase
    .from('memes')
    .insert([meme])
    .select()
    .single();

  if (dbError) {
    console.error('Database error:', dbError);
    throw new Error('Failed to create meme');
  }

  return memeData;
}

export async function getMemeById(id: string): Promise<Meme> {
  const { data: memeData, error: dbError } = await supabase
    .from('memes')
    .select('*')
    .eq('id', id)
    .single();

  if (dbError) {
    console.error('Database error:', dbError);
    throw new Error('Failed to fetch meme');
  }

  if (!memeData) {
    throw new Error('Meme not found');
  }

  return {
    id: memeData.id,
    title: memeData.title,
    image_url: memeData.image_url,
    tags: memeData.tags,
    created_at: memeData.created_at,
    user_id: memeData.user_id,
    favorite_count: memeData.favorite_count ?? 0,
    view_count: memeData.view_count ?? 0,
    share_count: memeData.share_count ?? 0,
    download_count: memeData.download_count ?? 0
  };
}

export async function searchMemes(query: string): Promise<Meme[]> {
  const { data, error } = await supabase
    .from('memes')
    .select('*')
    .textSearch('title', query);

  if (error) {
    console.error('Database error:', error);
    throw new Error('Failed to search memes');
  }

  return data.map(meme => ({
    id: meme.id,
    title: meme.title,
    image_url: meme.image_url,
    tags: meme.tags,
    created_at: meme.created_at,
    user_id: meme.user_id,
    favorite_count: meme.favorite_count ?? 0,
    view_count: meme.view_count ?? 0,
    share_count: meme.share_count ?? 0,
    download_count: meme.download_count ?? 0
  }));
}
