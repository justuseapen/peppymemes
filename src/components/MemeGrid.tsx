import React from 'react';
import { useMemeStore } from '../store/useMemeStore';
import { MemeCard } from './MemeCard';

export function MemeGrid() {
  const { memes, searchTerm, selectedTags } = useMemeStore();

  const filteredMemes = memes.filter((meme) => {
    const matchesSearch = meme.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTags = selectedTags.length === 0 || 
      selectedTags.some(tag => meme.tags.includes(tag));
    return matchesSearch && matchesTags;
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {filteredMemes.map((meme) => (
        <MemeCard key={meme.id} meme={meme} />
      ))}
    </div>
  );
}