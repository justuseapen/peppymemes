import React from 'react';
import { useMemeStore } from '../store/useMemeStore';
import { MemeCard } from './MemeCard';
import { Meme } from '../types/meme';

function calculateRelevanceScore(meme: Meme, searchTerms: string[]): number {
  if (!searchTerms.length) return 1;

  let score = 0;
  const titleLower = meme.title.toLowerCase();
  const tagsLower = meme.tags.map(tag => tag.toLowerCase());

  for (const term of searchTerms) {
    // Title matches (weighted higher)
    if (titleLower.includes(term)) {
      score += 3;
    }
    // Exact title word matches (weighted highest)
    if (titleLower.split(/\s+/).includes(term)) {
      score += 5;
    }
    // Tag matches
    if (tagsLower.some(tag => tag.includes(term))) {
      score += 2;
    }
    // Exact tag matches (weighted higher)
    if (tagsLower.includes(term)) {
      score += 4;
    }
  }

  return score;
}

export function MemeGrid() {
  const { memes, searchTerm, selectedTags } = useMemeStore();

  // Tokenize search term and filter out empty strings
  const searchTerms = searchTerm.toLowerCase().split(/\s+/).filter(Boolean);

  const filteredAndScoredMemes = memes
    .map(meme => ({
      meme,
      score: calculateRelevanceScore(meme, searchTerms)
    }))
    .filter(({ meme, score }) => {
      const hasSearchMatch = !searchTerms.length || score > 0;
      const hasTagMatch = selectedTags.length === 0 ||
        selectedTags.some(tag => meme.tags.includes(tag));
      return hasSearchMatch && hasTagMatch;
    })
    .sort((a, b) => b.score - a.score);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {filteredAndScoredMemes.map(({ meme }) => (
        <MemeCard key={meme.id} meme={meme} />
      ))}
    </div>
  );
}
