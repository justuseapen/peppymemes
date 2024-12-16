import { supabase } from '../config/supabase';
import { Meme } from '../types/meme';

export class StorageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StorageError';
  }
}

export async function uploadMeme(file: File, metadata: Omit<Meme, 'id'>): Promise<Meme> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `memes/${fileName}`;

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('memes')
    .upload(filePath, file);

  if (uploadError) {
    throw new StorageError(`Failed to upload meme: ${uploadError.message}`);
  }

  const { data: { publicUrl } } = supabase.storage
    .from('memes')
    .getPublicUrl(uploadData.path);

  const memeData = {
    ...metadata,
    image_url: publicUrl
  };

  const { data: insertedMeme, error: insertError } = await supabase
    .from('memes')
    .insert(memeData)
    .select()
    .single();

  if (insertError) {
    throw new StorageError(`Failed to save meme metadata: ${insertError.message}`);
  }

  return insertedMeme;
}

export async function fetchMemes(): Promise<Meme[]> {
  const { data, error } = await supabase
    .from('memes')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new StorageError(`Failed to fetch memes: ${error.message}`);
  }

  return data || [];
}
