import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { favoriteService } from '../services/favoriteService';
import { useAuthStore } from '../store/useAuthStore';

interface FavoriteButtonProps {
  memeId: string;
  initialFavorited?: boolean;
  onFavoriteChange?: (isFavorited: boolean) => void;
  className?: string;
}

export function FavoriteButton({
  memeId,
  initialFavorited = false,
  onFavoriteChange,
  className = ''
}: FavoriteButtonProps) {
  const [isFavorited, setIsFavorited] = useState(initialFavorited);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, openAuthModal } = useAuthStore();

  useEffect(() => {
    let mounted = true;
    console.log('FavoriteButton mounted for meme:', memeId);
    console.log('Initial favorite state:', initialFavorited);
    console.log('Is authenticated:', isAuthenticated);

    if (isAuthenticated) {
      favoriteService.isFavorited(memeId).then(favorited => {
        console.log('Checked favorite status:', favorited);
        if (mounted) setIsFavorited(favorited);
      });
    }

    return () => {
      console.log('FavoriteButton unmounted');
      mounted = false;
    };
  }, [memeId, isAuthenticated]);

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Favorite button clicked for meme:', memeId);
    console.log('Current favorite state:', isFavorited);

    if (!isAuthenticated) {
      console.log('User not authenticated, opening auth modal');
      openAuthModal();
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('Attempting to toggle favorite...');
      const newFavorited = await favoriteService.toggleFavorite(memeId);
      console.log('Toggle result:', newFavorited);
      setIsFavorited(newFavorited);
      onFavoriteChange?.(newFavorited);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update favorite';
      console.error('Error in handleClick:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`relative transition-transform ${isLoading ? 'cursor-wait' : ''} ${className}`}
      aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
      disabled={isLoading}
      title={error || (isAuthenticated ? undefined : 'Sign in to favorite memes')}
    >
      <Heart
        className={`w-6 h-6 transition-colors ${isLoading ? 'opacity-50' : ''
          } ${isFavorited
            ? 'fill-red-500 text-red-500'
            : 'fill-none text-gray-500 hover:text-red-500'
          }`}
      />
      {error && (
        <span className="absolute -top-2 -right-2 w-2 h-2 bg-red-500 rounded-full" />
      )}
    </button>
  );
}
