import React, { useEffect } from 'react';
import { Meme } from '../types/meme';

interface MetaTagsProps {
  meme?: Meme;
  isHomePage?: boolean;
}

export function MetaTags({ meme, isHomePage = false }: MetaTagsProps) {
  useEffect(() => {
    const defaultTitle = isHomePage ? 'Peppy Memes - Share and Discover Memes' : 'Peppy Memes';

    if (meme) {
      document.title = `${meme.title} - ${defaultTitle}`;
    } else {
      document.title = defaultTitle;
    }

    return () => {
      document.title = defaultTitle;
    };
  }, [meme, isHomePage]);

  return null;
}
