import { supabase } from '../../config/supabase';
import { StorageError } from '../storage';

interface UploadResult {
  path: string;
  publicUrl: string;
}

export async function uploadFileToStorage(
  file: File,
  userId: string,
  bucketName: string
): Promise<UploadResult> {
  try {
    // Create a folder for the user if it doesn't exist
    const fileName = `${userId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

    const { data: fileData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      throw new StorageError(uploadError.message);
    }

    if (!fileData?.path) {
      throw new StorageError('No file path returned from upload');
    }

    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(fileData.path);

    return { path: fileData.path, publicUrl };
  } catch (error) {
    console.error('Error in uploadFileToStorage:', error);
    throw error instanceof StorageError ? error : new StorageError('Failed to upload file');
  }
}