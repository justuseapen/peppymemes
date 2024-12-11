import React from 'react';
import { ImageInput } from './ImageInput';
import { TagInput } from './TagInput';

interface UploadFormProps {
  isUploading: boolean;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  tags: string;
  onTagsChange: (tags: string) => void;
  error: string | null;
}

export function UploadForm({ 
  isUploading, 
  onSubmit, 
  onFileChange, 
  tags, 
  onTagsChange,
  error 
}: UploadFormProps) {
  return (
    <form onSubmit={onSubmit} className="p-4 space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Title
        </label>
        <input
          type="text"
          name="title"
          required
          disabled={isUploading}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
        />
      </div>
      
      <ImageInput 
        disabled={isUploading}
        onChange={onFileChange}
      />
      
      <TagInput
        value={tags}
        onChange={onTagsChange}
        disabled={isUploading}
      />
      
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
  );
}