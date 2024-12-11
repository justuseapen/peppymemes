import { create } from 'zustand';
import { Meme } from '../types/meme';
import { fetchMemes } from '../services/storage';

interface MemeStore {
  memes: Meme[];
  searchTerm: string;
  selectedTags: string[];
  isLoading: boolean;
  error: string | null;
  addMeme: (meme: Meme) => void;
  setSearchTerm: (term: string) => void;
  toggleTag: (tag: string) => void;
  loadMemes: () => Promise<void>;
  setError: (error: string | null) => void;
}

export const useMemeStore = create<MemeStore>((set, get) => ({
  memes: [],
  searchTerm: '',
  selectedTags: [],
  isLoading: false,
  error: null,
  addMeme: (meme) => set((state) => ({ memes: [meme, ...state.memes] })),
  setSearchTerm: (term) => set({ searchTerm: term }),
  toggleTag: (tag) =>
    set((state) => ({
      selectedTags: state.selectedTags.includes(tag)
        ? state.selectedTags.filter((t) => t !== tag)
        : [...state.selectedTags, tag],
    })),
  loadMemes: async () => {
    set({ isLoading: true, error: null });
    try {
      console.log('Loading memes...');
      const memes = await fetchMemes();
      console.log('Memes loaded:', memes);
      set({ memes, isLoading: false });
    } catch (error) {
      console.error('Error loading memes:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load memes',
        isLoading: false,
        memes: [] // Clear memes on error to avoid showing stale data
      });
    }
  },
  setError: (error) => set({ error }),
}));