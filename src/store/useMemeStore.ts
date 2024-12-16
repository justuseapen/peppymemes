import { create } from 'zustand';
import { Meme } from '../types/meme';
import { getMemes } from '../services/memeService';
import { SortOption } from './useSortStore';
import { favoriteService } from '../services/favoriteService';

interface MemeState {
  memes: Meme[];
  isLoading: boolean;
  error: string | null;
  searchTerm: string;
  selectedTags: string[];
  favoriteIds: Set<string>;
  loadMemes: (sortBy?: SortOption) => Promise<void>;
  setSearchTerm: (term: string) => void;
  toggleTag: (tag: string) => void;
  updateMemeIsFavorited: (memeId: string, isFavorited: boolean) => void;
  initializeFavorites: () => Promise<void>;
}

export const useMemeStore = create<MemeState>((set, get) => ({
  memes: [],
  isLoading: false,
  error: null,
  searchTerm: '',
  selectedTags: [],
  favoriteIds: new Set(),

  loadMemes: async (sortBy = 'newest') => {
    console.log('Starting to load memes...');
    set({ isLoading: true, error: null });
    try {
      const memes = await getMemes(sortBy);
      console.log('Successfully loaded memes:', memes.length);

      // Update favoriteIds based on meme.is_favorited
      const favoriteIds = new Set(memes.filter(m => m.is_favorited).map(m => m.id));

      set({
        memes,
        favoriteIds,
        isLoading: false
      });
    } catch (error) {
      console.error('Error in loadMemes:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to load memes',
        isLoading: false
      });
    }
  },

  updateMemeIsFavorited: (memeId: string, isFavorited: boolean) => {
    set(state => {
      const newFavoriteIds = new Set(state.favoriteIds);
      if (isFavorited) {
        newFavoriteIds.add(memeId);
      } else {
        newFavoriteIds.delete(memeId);
      }

      return {
        memes: state.memes.map(meme =>
          meme.id === memeId
            ? { ...meme, is_favorited: isFavorited }
            : meme
        ),
        favoriteIds: newFavoriteIds
      };
    });
  },

  initializeFavorites: async () => {
    try {
      const favoriteIds = await favoriteService.getFavorites();
      set(state => ({
        favoriteIds: new Set(favoriteIds),
        memes: state.memes.map(meme => ({
          ...meme,
          is_favorited: favoriteIds.includes(meme.id)
        }))
      }));
    } catch (error) {
      console.error('Error initializing favorites:', error);
      // Don't update state on error
    }
  },

  setSearchTerm: (term) => set({ searchTerm: term }),

  toggleTag: (tag) => {
    const { selectedTags } = get();
    const isSelected = selectedTags.includes(tag);
    set({
      selectedTags: isSelected
        ? selectedTags.filter(t => t !== tag)
        : [...selectedTags, tag]
    });
  }
}));
