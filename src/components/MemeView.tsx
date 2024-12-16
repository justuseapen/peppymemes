import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabase';
import { Meme } from '../types/meme';
import { MemeModal } from './MemeModal';
import { MetaTags } from './MetaTags';

export function MemeView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
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
          throw dbError;
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
        setError(err instanceof Error ? err.message : 'Failed to load meme');
      }
    }

    loadMeme();
  }, [id]);

  const handleClose = () => {
    navigate('/');
  };

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
      <MemeModal meme={meme} onClose={handleClose} isOpen={true} />
    </>
  );
}
