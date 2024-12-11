import React from 'react';
import { describe, expect, test, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProfilePage } from '../ProfilePage';
import { supabase } from '../../../config/supabase';
import { MemoryRouter } from 'react-router-dom';

// Mock the supabase client
vi.mock('../../../config/supabase', () => ({
  supabase: {
    auth: {
      updateUser: vi.fn(),
    },
  },
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
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

vi.mock('../../../store/useAuthStore', () => ({
  useAuthStore: () => ({
    user: mockUser,
    setError: mockSetError,
  }),
}));

describe('ProfilePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = () => {
    return render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>
    );
  };

  test('renders profile page with user information', () => {
    renderComponent();

    expect(screen.getByText('Profile Settings')).toBeInTheDocument();
    expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('testuser')).toBeInTheDocument();
  });

  test('handles successful profile update', async () => {
    vi.mocked(supabase.auth.updateUser).mockResolvedValueOnce({ data: {}, error: null });
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

  test('handles profile update error', async () => {
    const errorMessage = 'Failed to update profile';
    vi.mocked(supabase.auth.updateUser).mockResolvedValueOnce({
      data: {},
      error: new Error(errorMessage),
    });

    renderComponent();

    const displayNameInput = screen.getByLabelText('Display Name');
    fireEvent.change(displayNameInput, { target: { value: 'newusername' } });
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(mockSetError).toHaveBeenCalledWith(errorMessage);
    });
  });

  test('redirects to home if user is not authenticated', () => {
    vi.mock('../../../store/useAuthStore', () => ({
      useAuthStore: () => ({
        user: null,
        setError: mockSetError,
      }),
    }));

    renderComponent();

    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  test('shows loading state during submission', async () => {
    vi.mocked(supabase.auth.updateUser).mockImplementationOnce(() =>
      new Promise(resolve => setTimeout(resolve, 100))
    );

    renderComponent();

    const displayNameInput = screen.getByLabelText('Display Name');
    fireEvent.change(displayNameInput, { target: { value: 'newusername' } });
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

    expect(screen.getByText('Saving...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled();
  });
});
