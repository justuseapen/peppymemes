import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMemeStore } from '../store/useMemeStore';
import { MemeModal } from './MemeModal';
import { Meme } from '../types/meme';
import { supabase } from '../config/supabase';

export function MemeView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { memes, isLoading: isStoreLoading } = useMemeStore();
  const [meme, setMeme] = useState<Meme | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadMeme() {
      try {
        // First try to find the meme in the store
        if (!isStoreLoading) {
          const foundMeme = memes.find(m => m.id.toString() === id);
          if (foundMeme) {
            setMeme(foundMeme);
            document.title = `${foundMeme.title} - Peppy Memes`;
            setIsLoading(false);
            return;
          }
        }

        // If not found in store, fetch directly from the database
        const { data: memeData, error: dbError } = await supabase
          .from('memes')
          .select('*')
          .eq('id', id)
          .single();

        if (dbError) {
          throw dbError;
        }

        if (memeData) {
          const loadedMeme: Meme = {
            id: memeData.id,
            title: memeData.title,
            image_url: memeData.image_url,
            tags: memeData.tags || [],
            created_at: memeData.created_at,
            user_id: memeData.user_id
          };
          setMeme(loadedMeme);
          document.title = `${loadedMeme.title} - Peppy Memes`;
        } else {
          navigate('/', { replace: true });
        }
      } catch (err) {
        console.error('Error loading meme:', err);
        setError(err instanceof Error ? err.message : 'Failed to load meme');
      } finally {
        setIsLoading(false);
      }
    }

    loadMeme();
  }, [id, memes, navigate, isStoreLoading]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div
          role="status"
          aria-label="Loading meme"
          className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  if (!meme) return null;

  return (
    <MemeModal
      meme={meme}
      isOpen={true}
      onClose={() => navigate('/', { replace: true })}
    />
  );
}
