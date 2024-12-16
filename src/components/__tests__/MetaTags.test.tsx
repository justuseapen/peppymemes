import React from 'react';
import { describe, expect, test, beforeEach, afterEach, vi } from 'vitest';
import { render } from '@testing-library/react';
import { MetaTags } from '../MetaTags';

describe('MetaTags', () => {
  const mockMeme = {
    id: '123',
    title: 'Test Meme',
    image_url: 'https://example.com/meme.jpg',
    tags: ['funny', 'test'],
    created_at: '2024-03-11T00:00:00Z',
    user_id: 'user1'
  };

  // Mock window.location
  const originalLocation = window.location;
  beforeEach(() => {
    // Clear all meta tags before each test
    document.head.innerHTML = '';
    document.title = '';

    // Mock window.location
    delete (window as any).location;
    window.location = {
      ...originalLocation,
      origin: 'https://peppymemes.com'
    };
  });

  afterEach(() => {
    // Restore window.location
    window.location = originalLocation;
  });

  test('sets default meta tags for homepage', () => {
    render(<MetaTags isHomePage={true} />);

    // Check title
    expect(document.title).toBe('Peppy Memes - Share and Discover Memes');

    // Check OpenGraph tags
    expect(getMetaContent('og:title')).toBe('Peppy Memes - Share and Discover Memes');
    expect(getMetaContent('og:description')).toBe('Discover and share the best memes on the internet.');
    expect(getMetaContent('og:image')).toBe('https://peppymemes.com/og-default.jpg');
    expect(getMetaContent('og:url')).toBe('https://peppymemes.com');
    expect(getMetaContent('og:type')).toBe('website');
    expect(getMetaContent('og:site_name')).toBe('Peppy Memes');

    // Check Twitter Card tags
    expect(getMetaContent('twitter:card')).toBe('summary_large_image');
    expect(getMetaContent('twitter:title')).toBe('Peppy Memes - Share and Discover Memes');
    expect(getMetaContent('twitter:description')).toBe('Discover and share the best memes on the internet.');
    expect(getMetaContent('twitter:image')).toBe('https://peppymemes.com/og-default.jpg');
  });

  test('sets meme-specific meta tags when viewing a meme', () => {
    render(<MetaTags meme={mockMeme} />);

    // Check title
    expect(document.title).toBe('Test Meme - Peppy Memes');

    // Check OpenGraph tags
    expect(getMetaContent('og:title')).toBe('Test Meme - Peppy Memes');
    expect(getMetaContent('og:description')).toBe('Check out "Test Meme" and more memes on Peppy Memes! Tags: funny, test');
    expect(getMetaContent('og:image')).toBe('https://example.com/meme.jpg');
    expect(getMetaContent('og:url')).toBe('https://peppymemes.com/meme/123');
    expect(getMetaContent('og:type')).toBe('website');
    expect(getMetaContent('og:site_name')).toBe('Peppy Memes');

    // Check Twitter Card tags
    expect(getMetaContent('twitter:card')).toBe('summary_large_image');
    expect(getMetaContent('twitter:title')).toBe('Test Meme - Peppy Memes');
    expect(getMetaContent('twitter:description')).toBe('Check out "Test Meme" and more memes on Peppy Memes! Tags: funny, test');
    expect(getMetaContent('twitter:image')).toBe('https://example.com/meme.jpg');
  });

  test('updates existing meta tags instead of creating duplicates', () => {
    // Add an existing meta tag
    const existingTag = document.createElement('meta');
    existingTag.setAttribute('property', 'og:title');
    existingTag.setAttribute('content', 'Old Title');
    document.head.appendChild(existingTag);

    render(<MetaTags isHomePage={true} />);

    // Check that we still only have one og:title tag
    const titleTags = document.querySelectorAll('meta[property="og:title"]');
    expect(titleTags.length).toBe(1);
    expect(titleTags[0].getAttribute('content')).toBe('Peppy Memes - Share and Discover Memes');
  });

  test('resets meta tags to default values on unmount when not homepage', () => {
    const { unmount } = render(<MetaTags meme={mockMeme} />);

    // First verify meme-specific tags are set
    expect(document.title).toBe('Test Meme - Peppy Memes');
    expect(getMetaContent('og:title')).toBe('Test Meme - Peppy Memes');

    // Unmount the component
    unmount();

    // Verify tags are reset to default values
    expect(document.title).toBe('Peppy Memes - Share and Discover Memes');
    expect(getMetaContent('og:title')).toBe('Peppy Memes - Share and Discover Memes');
  });

  test('does not reset meta tags on unmount when on homepage', () => {
    const { unmount } = render(<MetaTags isHomePage={true} />);

    // First verify homepage tags are set
    expect(document.title).toBe('Peppy Memes - Share and Discover Memes');
    expect(getMetaContent('og:title')).toBe('Peppy Memes - Share and Discover Memes');

    // Unmount the component
    unmount();

    // Verify tags remain unchanged
    expect(document.title).toBe('Peppy Memes - Share and Discover Memes');
    expect(getMetaContent('og:title')).toBe('Peppy Memes - Share and Discover Memes');
  });
});

// Helper function to get meta tag content
function getMetaContent(property: string): string | null {
  const element = document.querySelector(`meta[property="${property}"]`);
  return element ? element.getAttribute('content') : null;
}
