import React from 'react';
import { useMemeStore } from '../store/useMemeStore';
import { useSortStore } from '../store/useSortStore';
import { MemeCard } from './MemeCard';
import { Meme } from '../types/meme';
import { SortMenu } from './SortMenu';

function sortMemes(memes: Meme[], sortBy: string): Meme[] {
  switch (sortBy) {
    case 'oldest':
      return [...memes].sort((a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    case 'newest':
      return [...memes].sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    case 'most_viewed':
      return [...memes].sort((a, b) => b.view_count - a.view_count);
    case 'most_favorited':
      return [...memes].sort((a, b) => b.favorite_count - a.favorite_count);
    case 'most_downloaded':
      return [...memes].sort((a, b) => b.download_count - a.download_count);
    default:
      return memes;
  }
}

export function MemeGrid() {
  const { memes, searchTerm, selectedTags, isLoading } = useMemeStore();
  const { sortBy } = useSortStore();

  // Filter and sort memes
  const filteredMemes = memes.filter(meme => {
    const matchesSearch = !searchTerm ||
      meme.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      meme.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesTags = selectedTags.length === 0 ||
      selectedTags.some(tag => meme.tags.includes(tag));

    return matchesSearch && matchesTags;
  });

  const sortedMemes = sortMemes(filteredMemes, sortBy);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-6">
      <div className="flex justify-end px-6 mb-6">
        <SortMenu />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-6">
        {sortedMemes.map(meme => (
          <MemeCard key={meme.id} meme={meme} />
        ))}
      </div>
    </div>
  );
}
