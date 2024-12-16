import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import { favoriteService } from '../services/favoriteService';
import { useAuthStore } from '../store/useAuthStore';
import { useMemeStore } from '../store/useMemeStore';

interface FavoriteButtonProps {
  memeId: string;
  className?: string;
  isFavorited?: boolean;
  onClick?: () => Promise<void>;
  requireAuth?: boolean;
}

export function FavoriteButton({
  memeId,
  className = '',
  isFavorited: propIsFavorited,
  onClick,
  requireAuth = false
}: FavoriteButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, openAuthModal } = useAuthStore();
  const updateMemeIsFavorited = useMemeStore(state => state.updateMemeIsFavorited);

  // Use prop if provided, otherwise use store state
  const isFavorited = propIsFavorited ?? useMemeStore(state => state.favoriteIds.has(memeId));

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (requireAuth && !isAuthenticated) {
      openAuthModal();
      return;
    }

    if (onClick) {
      onClick();
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { isFavorited: newIsFavorited } = await favoriteService.toggleFavorite(memeId);
      updateMemeIsFavorited(memeId, newIsFavorited);
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
      title={error || (requireAuth && !isAuthenticated ? 'Sign in to favorite memes' : undefined)}
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
