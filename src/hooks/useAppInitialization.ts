import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { useAuthStore } from '../store/useAuthStore';
import { useMemeStore } from '../store/useMemeStore';

export function useAppInitialization() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Set up auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        useAuthStore.setState({ user: session.user, isAuthenticated: true, error: null });
      } else {
        useAuthStore.setState({ user: null, isAuthenticated: false, error: null });
      }
    });

    // Load memes
    useMemeStore.getState()
      .loadMemes()
      .then(() => setIsInitialized(true))
      .catch(err => setError(err.message));

    return () => subscription.unsubscribe();
  }, []);

  return { isInitialized, error };
}
