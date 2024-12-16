import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { supabase } from '../../config/supabase';
import { User, Settings } from 'lucide-react';
import { Meme } from '../../types/meme';
import { MemeCard } from '../MemeCard';

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
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Profile Settings Section */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-green-500 px-6 py-4">
            <div className="flex items-center space-x-4">
              <div className="bg-white p-2 rounded-full">
                <User className="h-6 w-6 text-green-500" />
              </div>
              <h1 className="text-xl font-semibold text-white">Profile Settings</h1>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                value={user.email}
                disabled
                className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm text-gray-500"
              />
              <p className="mt-1 text-sm text-gray-500">
                Email cannot be changed
              </p>
            </div>

            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">
                Display Name
              </label>
              <input
                type="text"
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your display name"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
              <p className="mt-1 text-sm text-gray-500">
                This name will be displayed to other users
              </p>
            </div>

            {successMessage && (
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <p className="text-green-600">{successMessage}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-300 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </div>
              ) : (
                'Save Changes'
              )}
            </button>
          </form>
        </div>

        {/* Favorited Memes Section */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-green-500 px-6 py-4">
            <div className="flex items-center space-x-4">
              <div className="bg-white p-2 rounded-full">
                <Settings className="h-6 w-6 text-green-500" />
              </div>
              <h2 className="text-xl font-semibold text-white">My Favorite Memes</h2>
            </div>
          </div>

          <div className="p-6">
            {isLoadingFavorites ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
              </div>
            ) : favoritedMemes.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                You haven't favorited any memes yet. Browse the homepage to find memes you like!
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favoritedMemes.map((meme) => (
                  <MemeCard key={meme.id} meme={meme} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
