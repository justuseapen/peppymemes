import React from 'react';
import { render } from '@testing-library/react';
import { vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

// Mock Supabase
vi.mock('../config/supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null })
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      delete: vi.fn().mockResolvedValue({ error: null }),
      insert: vi.fn().mockResolvedValue({ error: null }),
      order: vi.fn().mockReturnThis()
    }),
    rpc: vi.fn().mockResolvedValue({ error: null })
  }
}));

// Mock app initialization hook
vi.mock('../hooks/useAppInitialization', () => ({
  useAppInitialization: vi.fn().mockReturnValue({
    isInitialized: true,
    error: null
  })
}));

// Create mock store state
const createMockStore = () => ({
  memes: [],
  isLoading: false,
  error: null,
  searchTerm: '',
  selectedTags: [],
  favoriteIds: new Set(),
  loadMemes: vi.fn(),
  setSearchTerm: vi.fn(),
  toggleTag: vi.fn(),
  updateMemeIsFavorited: vi.fn(),
  initializeFavorites: vi.fn(),
  getState: vi.fn().mockReturnThis()
});

// Mock auth store
vi.mock('../store/useAuthStore', () => ({
  useAuthStore: vi.fn().mockReturnValue({
    isAuthenticated: false,
    user: null,
    signIn: vi.fn(),
    signOut: vi.fn(),
    signUp: vi.fn(),
    resetPassword: vi.fn(),
    openAuthModal: vi.fn(),
    closeAuthModal: vi.fn(),
    isAuthModalOpen: false,
    error: null,
    setError: vi.fn(),
    setState: vi.fn()
  })
}));

// Mock meme store
const mockStore = createMockStore();
vi.mock('../store/useMemeStore', () => ({
  useMemeStore: vi.fn().mockImplementation((selector) => {
    if (typeof selector === 'function') {
      return selector(mockStore);
    }
    return mockStore;
  }),
  getState: vi.fn().mockReturnValue(mockStore)
}));

// Mock react-router hooks
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(),
    useParams: vi.fn().mockReturnValue({ id: '123' })
  };
});

// Mock components
vi.mock('../components/Header', () => ({
  Header: vi.fn().mockImplementation(() => (
    <div data-testid="mock-header">Mock Header</div>
  ))
}));

vi.mock('../components/MemeGrid', () => ({
  MemeGrid: vi.fn().mockImplementation(() => (
    <div data-testid="mock-meme-grid">Mock MemeGrid</div>
  ))
}));

vi.mock('../components/auth/ResetPasswordForm', () => ({
  ResetPasswordForm: vi.fn().mockImplementation(() => (
    <div data-testid="mock-reset-password-form">Mock Reset Password Form</div>
  ))
}));

vi.mock('../components/profile/ProfilePage', () => ({
  ProfilePage: vi.fn().mockImplementation(() => (
    <div data-testid="mock-profile-page">Mock Profile Page</div>
  ))
}));

// Custom render function that includes providers
function customRender(ui: React.ReactElement, { initialEntries = ['/'], ...options } = {}) {
  return render(ui, {
    wrapper: ({ children }) => (
      <HelmetProvider>
        <MemoryRouter initialEntries={initialEntries}>
          {children}
        </MemoryRouter>
      </HelmetProvider>
    ),
    ...options,
  });
}

export * from '@testing-library/react';
export { customRender as render, createMockStore, mockStore };
