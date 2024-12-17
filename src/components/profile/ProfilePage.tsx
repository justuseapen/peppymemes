import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { supabase } from '../../config/supabase';
import { User, Settings, Code2 } from 'lucide-react';
import { Meme } from '../../types/meme';
import { MemeCard } from '../MemeCard';
import { DeveloperSection } from './DeveloperSection';

export function ProfilePage() {
  const { user, setError } = useAuthStore();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [favoritedMemes, setFavoritedMemes] = useState<Meme[]>([]);
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(true);

  // Handle authentication check
  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  // Handle user data and favorites
  useEffect(() => {
    if (!user) return;

    setDisplayName(user.username || '');

    // Fetch favorited memes
    async function loadFavoritedMemes() {
      try {
        console.log('Loading favorites for user:', user.id);
        const { data: favorites, error: favoritesError } = await supabase
          .from('favorites')
          .select('meme_id')
          .eq('user_id', user.id);

        console.log('Favorites response:', { favorites, favoritesError });

        if (favoritesError) throw favoritesError;

        if (favorites && favorites.length > 0) {
          const memeIds = favorites
            .map(f => f.meme_id)
            .filter((id): id is string => id !== null);
          console.log('Found valid meme IDs:', memeIds);

          if (memeIds.length === 0) {
            console.log('No valid meme IDs found after filtering');
            setFavoritedMemes([]);
            return;
          }

          const { data: memes, error: memesError } = await supabase
            .from('memes')
            .select('*')
            .in('id', memeIds);

          console.log('Memes response:', { memes, memesError });

          if (memesError) throw memesError;

          if (memes) {
            const mappedMemes = memes.map(meme => ({
              ...meme,
              is_favorited: true,
              favorite_count: meme.favorite_count || 0,
              view_count: meme.view_count || 0,
              share_count: meme.share_count || 0,
              download_count: meme.download_count || 0
            }));
            console.log('Setting favorited memes:', mappedMemes);
            setFavoritedMemes(mappedMemes);
          }
        } else {
          console.log('No favorites found');
        }
      } catch (error) {
        console.error('Error loading favorited memes:', error);
        setError(error instanceof Error ? error.message : 'Failed to load favorited memes');
      } finally {
        setIsLoadingFavorites(false);
      }
    }

    loadFavoritedMemes();
  }, [user, setError]);

  // Return early if no user
  if (!user) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage('');

    try {
      const { error } = await supabase.auth.updateUser({
        data: { username: displayName }
      });

      if (error) throw error;

      setSuccessMessage('Profile updated successfully!');

      // Update local state
      useAuthStore.setState(state => ({
        ...state,
        user: state.user ? {
          ...state.user,
          username: displayName
        } : null
      }));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Profile Section */}
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5" />
            <h2 className="text-xl font-semibold">Profile</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">
                Display Name
              </label>
              <input
                type="text"
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>

            {successMessage && (
              <div className="text-green-600 text-sm">{successMessage}</div>
            )}
          </form>
        </div>

        {/* Developer Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <Code2 className="w-5 h-5" />
            <h2 className="text-xl font-semibold">Developer</h2>
          </div>
          <DeveloperSection />
        </div>

        {/* Favorites Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Favorites</h2>
          {isLoadingFavorites ? (
            <div className="text-center py-4">Loading favorites...</div>
          ) : favoritedMemes.length === 0 ? (
            <div className="text-center py-4 text-gray-500">No favorites yet</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {favoritedMemes.map((meme) => (
                <MemeCard key={meme.id} meme={meme} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
