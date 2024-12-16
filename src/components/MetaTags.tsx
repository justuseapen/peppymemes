import React, { useEffect } from 'react';
import { Meme } from '../types/meme';

interface MetaTagsProps {
  meme?: Meme;
  isHomePage?: boolean;
}

// Default values as constants to ensure consistency
const DEFAULT_TITLE = 'Peppy Memes - Share and Discover Memes';
const DEFAULT_DESCRIPTION = 'Discover and share the best memes on the internet.';

export function MetaTags({ meme, isHomePage = false }: MetaTagsProps) {
  useEffect(() => {
    const updateMetaTag = (property: string, content: string) => {
      let element = document.querySelector(`meta[property="${property}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute('property', property);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    const updateMetaTags = (title: string, description: string, imageUrl: string, url: string) => {
      // Update title
      document.title = title;

      // OpenGraph tags
      updateMetaTag('og:title', title);
      updateMetaTag('og:description', description);
      updateMetaTag('og:image', imageUrl);
      updateMetaTag('og:url', url);
      updateMetaTag('og:type', 'website');
      updateMetaTag('og:site_name', 'Peppy Memes');

      // Twitter Card tags
      updateMetaTag('twitter:card', 'summary_large_image');
      updateMetaTag('twitter:title', title);
      updateMetaTag('twitter:description', description);
      updateMetaTag('twitter:image', imageUrl);
    };

    // Set meta tags based on current view
    if (meme) {
      updateMetaTags(
        `${meme.title} - Peppy Memes`,
        `Check out "${meme.title}" and more memes on Peppy Memes! Tags: ${meme.tags.join(', ')}`,
        meme.image_url,
        `${window.location.origin}/meme/${meme.id}`
      );
    } else {
      updateMetaTags(
        DEFAULT_TITLE,
        DEFAULT_DESCRIPTION,
        `${window.location.origin}/og-default.jpg`,
        window.location.origin
      );
    }

    // Cleanup function
    return () => {
      if (!isHomePage) {
        // Reset to default values on unmount for non-homepage views
        updateMetaTags(
          DEFAULT_TITLE,
          DEFAULT_DESCRIPTION,
          `${window.location.origin}/og-default.jpg`,
          window.location.origin
        );
      }
    };
  }, [meme, isHomePage]);

  return null; // This component doesn't render anything
}
