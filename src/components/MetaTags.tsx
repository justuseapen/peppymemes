import React, { useEffect } from 'react';
import { Meme } from '../types/meme';
import { Helmet } from 'react-helmet-async';

interface MetaTagsProps {
  meme?: Meme;
  isHomePage?: boolean;
}

export function MetaTags({ meme, isHomePage = false }: MetaTagsProps) {
  const defaultTitle = isHomePage ? 'Peppy Memes - Share and Discover Memes' : 'Peppy Memes';
  const defaultDescription = 'Discover and share the best memes on the internet.';
  const defaultImage = '/og-image.jpg'; // Default social media image
  const siteUrl = window.location.origin;

  const title = meme ? `${meme.title} - ${defaultTitle}` : defaultTitle;
  const description = meme?.tags ? `${meme.title} - Tagged with: ${meme.tags.join(', ')}` : defaultDescription;
  const image = meme?.image_url || `${siteUrl}${defaultImage}`;
  const canonicalUrl = meme ? `${siteUrl}/meme/${meme.id}` : siteUrl;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph Meta Tags */}
      <meta property="og:site_name" content="Peppy Memes" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:image:alt" content={meme?.title || 'Peppy Memes'} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content={meme ? 'article' : 'website'} />

      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:image:alt" content={meme?.title || 'Peppy Memes'} />
    </Helmet>
  );
}
