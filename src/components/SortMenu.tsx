import React from 'react';
import { ArrowDownAZ, ArrowUpAZ, Eye, Heart, Download } from 'lucide-react';
import { useSortStore, SortOption } from '../store/useSortStore';

const sortOptions: { value: SortOption; label: string; icon: React.ReactNode }[] = [
  { value: 'newest', label: 'Newest First', icon: <ArrowDownAZ className="w-4 h-4" /> },
  { value: 'oldest', label: 'Oldest First', icon: <ArrowUpAZ className="w-4 h-4" /> },
  { value: 'most_viewed', label: 'Most Viewed', icon: <Eye className="w-4 h-4" /> },
  { value: 'most_favorited', label: 'Most Favorited', icon: <Heart className="w-4 h-4" /> },
  { value: 'most_downloaded', label: 'Most Downloaded', icon: <Download className="w-4 h-4" /> }
];

export function SortMenu() {
  const { sortBy, setSortBy } = useSortStore();

  return (
    <div className="relative inline-block">
      <select
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value as SortOption)}
        className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 hover:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent cursor-pointer"
        aria-label="Sort memes"
      >
        {sortOptions.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
        <ArrowDownAZ className="w-4 h-4 text-gray-500" />
      </div>
    </div>
  );
}
