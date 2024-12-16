import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../config/supabase';
import { Meme } from '../types/meme';
import { MetaTags } from './MetaTags';

export function MemeEmbed() {
  const { id } = useParams<{ id: string }>();
  const [meme, setMeme] = useState<Meme | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadMeme() {
      if (!id) {
        setError('No meme ID provided');
        return;
      }

      try {
        const { data: memeData, error: dbError } = await supabase
          .from('memes')
          .select('*')
          .eq('id', id)
          .single();

        if (dbError) {
          throw new Error(dbError.message);
        }

        if (!memeData) {
          throw new Error('Meme not found');
        }

        const loadedMeme = {
          id: memeData.id,
          title: memeData.title,
          image_url: memeData.image_url,
          tags: memeData.tags,
          created_at: memeData.created_at,
          user_id: memeData.user_id,
          favorite_count: memeData.favorite_count ?? 0,
          view_count: memeData.view_count ?? 0,
          share_count: memeData.share_count ?? 0,
          download_count: memeData.download_count ?? 0
        };

        setMeme(loadedMeme);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load meme';
        setError(`Error: ${errorMessage}`);
      }
    }

    loadMeme();
  }, [id]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!meme) {
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

  return (
    <>
      <MetaTags meme={meme} />
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden max-w-2xl w-full">
          <img
            src={meme.image_url}
            alt={meme.title}
            className="w-full object-contain max-h-[60vh]"
          />
          <div className="p-4">
            <h1 className="text-xl font-semibold mb-2">{meme.title}</h1>
            <div className="flex flex-wrap gap-2">
              {meme.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
