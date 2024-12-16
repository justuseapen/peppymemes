import React from 'react';
import { describe, expect, test, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { supabase } from '../../../config/supabase';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock useAuthStore
const mockSetError = vi.fn();
const mockUser = {
  id: '1',
  email: 'test@example.com',
  username: 'testuser',
};

const mockUseAuthStore = vi.fn(() => ({
  user: mockUser as { id: string; email: string; username: string; } | null,
  setError: mockSetError,
}));

vi.mock('../../../store/useAuthStore', () => ({
  useAuthStore: () => mockUseAuthStore(),
}));

// Mock the supabase client
vi.mock('../../../config/supabase', () => ({
  supabase: {
    auth: {
      updateUser: vi.fn(),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockResolvedValue({ data: [], error: null }),
    }),
  },
}));

// Now import the component
import { ProfilePage } from '../ProfilePage';

describe('ProfilePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuthStore.mockReturnValue({
      user: mockUser,
      setError: mockSetError,
    });
  });

  const renderComponent = () => render(<ProfilePage />);

  test('renders profile page with user information', () => {
    renderComponent();

    expect(screen.getByText('Profile Settings')).toBeInTheDocument();
    expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('testuser')).toBeInTheDocument();
  });

  test('handles successful profile update', async () => {
    vi.mocked(supabase.auth.updateUser).mockResolvedValueOnce({
      data: {
        user: {
          id: '123',
          app_metadata: {},
          user_metadata: {},
          aud: 'authenticated',
          created_at: '2024-03-11T00:00:00Z'
        }
      },
      error: null
    });
    renderComponent();

    const displayNameInput = screen.getByLabelText('Display Name');
    fireEvent.change(displayNameInput, { target: { value: 'newusername' } });
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(screen.getByText('Profile updated successfully!')).toBeInTheDocument();
    });

    expect(supabase.auth.updateUser).toHaveBeenCalledWith({
      data: { username: 'newusername' }
    });
  });

  test('shows loading state during submission', async () => {
    vi.mocked(supabase.auth.updateUser).mockImplementationOnce(
      () => new Promise((resolve) => setTimeout(resolve, 100)),
    );

    renderComponent();

    const displayNameInput = screen.getByLabelText('Display Name');
    fireEvent.change(displayNameInput, { target: { value: 'newusername' } });
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

    expect(screen.getByText('Saving...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled();
  });

  test('redirects to home if user is not authenticated', async () => {
    // Set up the mock before rendering
    mockUseAuthStore.mockReturnValue({
      user: null,
      setError: mockSetError,
    });

    renderComponent();

    // Wait for the navigation to occur
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });
});
