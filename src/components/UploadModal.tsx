import React, { useState } from 'react';
import { X } from 'lucide-react';
import { DuplicateAlert } from './DuplicateAlert';
import { useMemeStore } from '../store/useMemeStore';
import { useAuthStore } from '../store/useAuthStore';
import { Meme } from '../types/meme';
import { uploadMeme } from '../services/storage';
import { supabase } from '../config/supabase';
import { MemeUploadService } from '../services/memeUploadService';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UploadModal({ isOpen, onClose }: UploadModalProps) {
  const [tags, setTags] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [duplicateOf, setDuplicateOf] = useState<Meme | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { memes, loadMemes } = useMemeStore();
  const { user } = useAuthStore();
  const uploadService = new MemeUploadService(memes);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Check for duplicates and get preview
      const result = await uploadService.uploadMeme(file);

      if (!result.success) {
        if (result.isDuplicate && result.duplicateOf) {
          setDuplicateOf(result.duplicateOf as Meme);
          e.target.value = '';
        } else {
          setError(result.error || 'Failed to process image');
        }
        return;
      }

      // Set preview URL
      if (result.previewUrl) {
        setPreviewUrl(result.previewUrl);
      }

      setError(null);
    } catch (err) {
      console.error('Failed during upload process:', err);
      setError('Failed to process image. Please try again.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsUploading(true);

    try {
      if (!user) {
        throw new Error('You must be logged in to upload memes');
      }

      const form = e.target as HTMLFormElement;
      const fileInput = form.querySelector('input[name="image"]') as HTMLInputElement;
      const titleInput = form.querySelector('input[name="title"]') as HTMLInputElement;
      const file = fileInput?.files?.[0];
      const titleValue = titleInput?.value;

      if (!file || !titleValue) {
        throw new Error('Please fill in all required fields');
      }

      const metadata = {
        title,
        tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
        user_id: user?.id,
        image_url: '',
        created_at: new Date().toISOString(),
        favorite_count: 0,
        view_count: 0,
        share_count: 0,
        download_count: 0
      };

      await uploadMeme(file, metadata);
      await loadMemes();
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload meme');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    onClose();
    setTags('');
    setTitle('');
    setDuplicateOf(null);
    setError(null);
    if (previewUrl) {
      uploadService.cleanup(previewUrl);
      setPreviewUrl(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">Upload Meme</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={isUploading}
          >
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              type="text"
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={isUploading}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Image
            </label>
            <input
              type="file"
              name="image"
              accept="image/*"
              required
              disabled={isUploading}
              onChange={handleFileChange}
              className="mt-1 block w-full"
            />
            {previewUrl && (
              <div className="mt-2">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-h-48 rounded-lg object-contain"
                />
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              disabled={isUploading}
              placeholder="funny, meme, cats"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            />
          </div>
          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}
          <button
            type="submit"
            disabled={isUploading}
            className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition-colors disabled:bg-green-300 disabled:cursor-not-allowed"
          >
            {isUploading ? 'Uploading...' : 'Upload'}
          </button>
        </form>
      </div>

      {duplicateOf && (
        <DuplicateAlert
          duplicateOf={duplicateOf}
          onClose={() => setDuplicateOf(null)}
        />
      )}
    </div>
  );
}
