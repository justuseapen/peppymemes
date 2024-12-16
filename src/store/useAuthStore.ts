import { create } from 'zustand';
import { supabase } from '../config/supabase';

interface AuthState {
  user: any | null;
  isAuthenticated: boolean;
  error: string | null;
  isAuthModalOpen: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  setError: (error: string | null) => void;
  openAuthModal: () => void;
  closeAuthModal: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  error: null,
  isAuthModalOpen: false,

  signUp: async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      set({
        user: data.user,
        isAuthenticated: !!data.user,
        error: null,
        isAuthModalOpen: false
      });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  signIn: async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      set({
        user: data.user,
        isAuthenticated: !!data.user,
        error: null,
        isAuthModalOpen: false
      });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      set({
        user: null,
        isAuthenticated: false,
        error: null
      });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  resetPassword: async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
      set({ error: null });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  setError: (error: string | null) => set({ error }),
  openAuthModal: () => {
    console.log('Opening auth modal');
    set((state) => {
      console.log('Current state:', state);
      console.log('Setting isAuthModalOpen to true');
      return { isAuthModalOpen: true };
    });
  },
  closeAuthModal: () => {
    console.log('Closing auth modal');
    set({ isAuthModalOpen: false });
  }
}));

// Initialize auth state
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth state changed:', event, session?.user?.id);
  if (session?.user) {
    useAuthStore.setState({
      user: session.user,
      isAuthenticated: true,
      error: null
    });
  } else {
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      error: null
    });
  }
});
