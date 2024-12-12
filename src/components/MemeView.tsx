import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMemeStore } from '../store/useMemeStore';
import { MemeModal } from './MemeModal';
import { Meme } from '../types/meme';

export function MemeView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { memes, isLoading } = useMemeStore();
  const [meme, setMeme] = useState<Meme | null>(null);
  const [hasCheckedMeme, setHasCheckedMeme] = useState(false);

  useEffect(() => {
    if (!isLoading && !hasCheckedMeme) {
      const foundMeme = memes.find(m => m.id.toString() === id);
      if (foundMeme) {
        setMeme(foundMeme);
        document.title = `${foundMeme.title} - Peppy Memes`;
      } else {
        navigate('/', { replace: true });
      }
      setHasCheckedMeme(true);
    }
  }, [id, memes, navigate, isLoading, hasCheckedMeme]);

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

  if (!meme) return null;

  return (
    <MemeModal
      meme={meme}
      isOpen={true}
      onClose={() => navigate('/', { replace: true })}
    />
  );
}
