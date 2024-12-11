import { create } from 'zustand';
import { supabase } from '../config/supabase';
import { AuthState } from '../types/auth';

export const useAuthStore = create<AuthState & {
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  setError: (error: string | null) => void;
}>((set) => ({
  user: null,
  isLoading: true,
  error: null,

  signUp: async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      
      if (error) throw error;
      
      set({ error: 'Please check your email to confirm your account.' });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to sign up' });
    }
  },

  signIn: async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      set({ 
        user: {
          id: data.user.id,
          email: data.user.email!,
          username: data.user.user_metadata.username,
        },
        error: null 
      });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to sign in' });
    }
  },

  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      set({ user: null, error: null });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to sign out' });
    }
  },

  setError: (error) => set({ error }),
}));

// Initialize auth state
supabase.auth.onAuthStateChange((event, session) => {
  if (session?.user) {
    useAuthStore.setState({
      user: {
        id: session.user.id,
        email: session.user.email!,
        username: session.user.user_metadata.username,
      },
      isLoading: false,
    });
  } else {
    useAuthStore.setState({ user: null, isLoading: false });
  }
});