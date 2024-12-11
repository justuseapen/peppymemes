import { supabase } from '../../config/supabase';
import { Meme } from '../../types/meme';
import { StorageError } from '../storage';

export class MemeApiError extends Error {
  constructor(message: string, public originalError?: unknown) {
    super(message);
    this.name = 'MemeApiError';
  }
}

export interface MemeMetadata {
  title: string;
  tags: string[];
  imageUrl: string;
  userId: string;
  creator: string;
}

export async function createMeme(metadata: MemeMetadata): Promise<Meme> {
  try {
    const { data: memeData, error: dbError } = await supabase
      .from('memes')
      .insert([{
        title: metadata.title,
        tags: metadata.tags,
        image_url: metadata.imageUrl,
        created_at: new Date().toISOString(),
        user_id: metadata.userId,
        creator: metadata.creator
      }])
      .select('*')
      .single();

    if (dbError) {
      console.error('Database error creating meme:', dbError);
      throw new StorageError(dbError.message);
    }

    if (!memeData) {
      throw new StorageError('No meme data returned from database');
    }

    return {
      id: memeData.id,
      imageUrl: memeData.image_url,
      title: memeData.title,
      tags: memeData.tags || [],
      createdAt: new Date(memeData.created_at),
      creator: memeData.creator,
    };
  } catch (error) {
    console.error('Error in createMeme:', error);
    if (error instanceof StorageError) {
      throw error;
    }
    throw new StorageError('Failed to create meme record');
  }
}

export async function fetchMemesFromApi(): Promise<Meme[]> {
  try {
    const { data, error } = await supabase
      .from('memes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      throw new MemeApiError(error.message);
    }

    if (!data) {
      return [];
    }

    return data.map(meme => ({
      id: meme.id,
      imageUrl: meme.image_url,
      title: meme.title,
      tags: meme.tags || [],
      createdAt: new Date(meme.created_at),
      creator: meme.creator,
    }));
  } catch (error) {
    console.error('Error in fetchMemesFromApi:', error);
    throw error instanceof MemeApiError ? error : new MemeApiError('Failed to fetch memes');
  }
}