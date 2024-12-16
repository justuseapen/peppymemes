import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useMemeStore } from '../store/useMemeStore';
import { Meme } from '../types/meme';
import { supabase } from '../config/supabase';

export function MemeEmbed() {
  const { id } = useParams<{ id: string }>();
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
            document.title = `${foundMeme.title} - Peppy Memes Embed`;
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
          document.title = `${loadedMeme.title} - Peppy Memes Embed`;
        }
      } catch (err) {
        console.error('Error loading meme:', err);
        setError(err instanceof Error ? err.message : 'Failed to load meme');
      } finally {
        setIsLoading(false);
      }
    }

    loadMeme();
  }, [id, memes, isStoreLoading]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
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
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  if (!meme) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-gray-500">Meme not found</p>
      </div>
    );
  }

  return (
    <div className="w-full h-screen flex items-center justify-center bg-white p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <img
            src={meme.image_url}
            alt={meme.title}
            className="w-full object-contain max-h-[70vh]"
          />
          <div className="p-4">
            <h1 className="text-lg font-semibold mb-2">{meme.title}</h1>
            <div className="flex flex-wrap gap-2">
              {meme.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
