import { supabase } from '../config/supabase';
import { Meme } from '../types/meme';
import { createMeme, fetchMemesFromApi } from './api/memeApi';
import { uploadFileToStorage } from './api/uploadApi';

const BUCKET_NAME = 'memes';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export class StorageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StorageError';
  }
}

export async function uploadMeme(
  file: File, 
  metadata: Omit<Meme, 'id' | 'imageUrl' | 'creator'>
): Promise<Meme> {
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('Auth error:', userError);
      throw new StorageError('Failed to get user information');
    }
    
    if (!user) {
      throw new StorageError('Must be logged in to upload memes');
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new StorageError('File size exceeds 5MB limit');
    }

    // Upload file to storage
    const { publicUrl } = await uploadFileToStorage(file, user.id, BUCKET_NAME);

    // Create meme record in database
    return await createMeme({
      title: metadata.title,
      tags: metadata.tags,
      imageUrl: publicUrl,
      userId: user.id,
      creator: user.email || 'Anonymous'
    });
  } catch (error) {
    console.error('Error in uploadMeme:', error);
    if (error instanceof StorageError) {
      throw error;
    }
    throw new StorageError(
      error instanceof Error ? error.message : 'Failed to upload meme'
    );
  }
}

export async function fetchMemes(): Promise<Meme[]> {
  try {
    return await fetchMemesFromApi();
  } catch (error) {
    console.error('Error in fetchMemes:', error);
    throw new StorageError(
      error instanceof Error ? error.message : 'Failed to fetch memes'
    );
  }
}