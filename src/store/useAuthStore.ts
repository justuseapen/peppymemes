import { create } from 'zustand';
import { supabase } from '../config/supabase';

interface AuthState {
  user: any | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  error: string | null;
  isAuthModalOpen: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  setError: (error: string | null) => void;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  checkAdminStatus: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isAdmin: false,
  error: null,
  isAuthModalOpen: false,

  checkAdminStatus: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        set({ isAdmin: false });
        return;
      }

      console.log('Checking admin status for user:', user.id);

      const { data: roleData, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching role:', error);
        set({ isAdmin: false });
        return;
      }

      console.log('Role data:', roleData);
      set({ isAdmin: roleData?.role === 'admin' });
    } catch (error) {
      console.error('Error checking admin status:', error);
      set({ isAdmin: false });
    }
  },

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

      // Check admin status after sign up
      useAuthStore.getState().checkAdminStatus();
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

      // Check admin status after sign in
      useAuthStore.getState().checkAdminStatus();
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
        isAdmin: false,
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
  console.log('Auth state changed:', event);
  console.log('Session:', session);
  console.log('User ID:', session?.user?.id);

  if (session?.user) {
    console.log('Setting authenticated state with user:', session.user);
    useAuthStore.setState({
      user: session.user,
      isAuthenticated: true,
      error: null
    });

    console.log('About to check admin status...');
    // Check admin status when auth state changes
    useAuthStore.getState().checkAdminStatus().then(() => {
      console.log('Admin status check completed');
      console.log('Current state:', useAuthStore.getState());
    }).catch(error => {
      console.error('Error during admin status check:', error);
    });
  } else {
    console.log('Clearing auth state - no session');
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isAdmin: false,
      error: null
    });
  }
});
