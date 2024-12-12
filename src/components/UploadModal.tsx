import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { checkDuplicate } from '../services/memeService';
import { DuplicateAlert } from './DuplicateAlert';
import { useMemeStore } from '../store/useMemeStore';
import { useAuthStore } from '../store/useAuthStore';
import { Meme } from '../types/meme';
import { uploadMeme } from '../services/storage';
import { useImageAnalysis } from '../hooks/useImageAnalysis';
import { supabase } from '../config/supabase';

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
  const { memes, loadMemes } = useMemeStore();
  const { user } = useAuthStore();
  const { isAnalyzing, analysis, error: analysisError, analyzeImage } = useImageAnalysis();

  useEffect(() => {
    if (analysis) {
      setTitle(analysis.suggestedTitle);
      setTags(analysis.suggestedTags.join(', '));
    }
  }, [analysis]);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check for duplicates
    const { isDuplicate, duplicateOf: duplicate } = await checkDuplicate(file, memes);
    if (isDuplicate && duplicate) {
      setDuplicateOf(duplicate);
      e.target.value = '';
      return;
    }

    try {
      // First upload to Supabase to get public URL
      const fileExt = file.name.split('.').pop();
      const fileName = `temp/${Math.random()}.${fileExt}`;

      console.log('Uploading to Supabase for analysis:', fileName);
      const { error: uploadError, data } = await supabase.storage
        .from('memes')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('memes')
        .getPublicUrl(fileName);

      console.log('Got public URL for analysis:', publicUrl);

      // Now analyze with OpenAI using the public URL
      await analyzeImage(publicUrl);

      // Clean up temporary upload after analysis
      await supabase.storage
        .from('memes')
        .remove([fileName]);

    } catch (err) {
      console.error('Failed during analysis process:', err);
      setError('Failed to analyze image. Please try again.');
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
      const file = form.image.files[0];
      const title = form.title.value;

      if (!file || !title) {
        throw new Error('Please fill in all required fields');
      }

      // Double-check for duplicates before upload
      const { isDuplicate } = await checkDuplicate(file, memes);
      if (isDuplicate) {
        throw new Error('Duplicate meme detected');
      }

      const metadata = {
        title,
        tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
        user_id: user.id
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
          {isAnalyzing && (
            <div className="text-blue-600 text-sm">Analyzing image for suggestions...</div>
          )}
          {analysisError && (
            <div className="text-orange-600 text-sm">
              Failed to get suggestions, but you can still upload
            </div>
          )}
          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}
          <button
            type="submit"
            disabled={isUploading || isAnalyzing}
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
