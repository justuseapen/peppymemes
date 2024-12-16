import React from 'react';
import { Link } from 'react-router-dom';
import { Meme } from '../types/meme';
import { FavoriteButton } from './FavoriteButton';
import { formatDate } from '../utils/dateUtils';
import { useAuthStore } from '../store/useAuthStore';
import { useMemeStore } from '../store/useMemeStore';

interface MemeCardProps {
  meme: Meme;
}

export function MemeCard({ meme }: MemeCardProps) {
  const toggleTag = useMemeStore(state => state.toggleTag);

  const handleTagClick = (tag: string, e: React.MouseEvent) => {
    e.preventDefault();
    toggleTag(tag);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <Link to={`/meme/${meme.id}`} className="block relative" data-discover="true">
        <img
          src={meme.image_url}
          alt={meme.title}
          className="w-full h-48 object-cover"
          loading="lazy"
        />
      </Link>
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <Link
            to={`/meme/${meme.id}`}
            className="text-lg font-semibold text-gray-900 hover:text-green-600 truncate"
            data-discover="true"
          >
            {meme.title}
          </Link>
          <FavoriteButton
            memeId={meme.id}
            isFavorited={meme.is_favorited}
            requireAuth
          />
        </div>
        <div className="text-sm text-gray-600">
          {formatDate(meme.created_at)}
        </div>
        {meme.tags && meme.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {meme.tags.map(tag => (
              <button
                key={tag}
                onClick={(e) => handleTagClick(tag, e)}
                className="text-sm bg-gray-100 hover:bg-gray-200 rounded-full px-3 py-1"
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
