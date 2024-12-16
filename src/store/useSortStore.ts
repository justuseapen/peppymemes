import { create } from 'zustand';

export type SortOption = 'newest' | 'oldest' | 'most_viewed' | 'most_favorited' | 'most_downloaded';

interface SortState {
  sortBy: SortOption;
  setSortBy: (option: SortOption) => void;
}

export const useSortStore = create<SortState>((set) => ({
  sortBy: 'newest',
  setSortBy: (option) => set({ sortBy: option })
}));
