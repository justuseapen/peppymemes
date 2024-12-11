import React from 'react';
import { describe, expect, test, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ResetPasswordForm } from '../ResetPasswordForm';
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

describe('ResetPasswordForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = () => {
    return render(
      <MemoryRouter>
        <ResetPasswordForm />
      </MemoryRouter>
    );
  };

  test('renders reset password form with all required fields', () => {
    renderComponent();

    expect(screen.getByText('Reset Your Password')).toBeInTheDocument();
    expect(screen.getByLabelText('New Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm New Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reset password/i })).toBeInTheDocument();
  });

  test('shows error when passwords do not match', async () => {
    renderComponent();

    fireEvent.change(screen.getByLabelText('New Password'), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByLabelText('Confirm New Password'), {
      target: { value: 'password456' },
    });

    fireEvent.click(screen.getByRole('button', { name: /reset password/i }));

    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    });
  });

  test('shows error when password is too short', async () => {
    renderComponent();

    fireEvent.change(screen.getByLabelText('New Password'), {
      target: { value: '12345' },
    });
    fireEvent.change(screen.getByLabelText('Confirm New Password'), {
      target: { value: '12345' },
    });

    fireEvent.click(screen.getByRole('button', { name: /reset password/i }));

    await waitFor(() => {
      expect(screen.getByText('Password must be at least 6 characters long')).toBeInTheDocument();
    });
  });

  test('handles successful password reset', async () => {
    vi.mocked(supabase.auth.updateUser).mockResolvedValueOnce({ data: {}, error: null });
    renderComponent();

    fireEvent.change(screen.getByLabelText('New Password'), {
      target: { value: 'newpassword123' },
    });
    fireEvent.change(screen.getByLabelText('Confirm New Password'), {
      target: { value: 'newpassword123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /reset password/i }));

    await waitFor(() => {
      expect(screen.getByText('Password Reset Successful')).toBeInTheDocument();
    });

    // Verify Supabase was called with correct parameters
    expect(supabase.auth.updateUser).toHaveBeenCalledWith({
      password: 'newpassword123',
    });

    // Wait for navigation after success
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    }, { timeout: 3000 });
  });

  test('handles password reset error from Supabase', async () => {
    const errorMessage = 'Failed to update password';
    vi.mocked(supabase.auth.updateUser).mockResolvedValueOnce({
      data: {},
      error: new Error(errorMessage),
    });

    renderComponent();

    fireEvent.change(screen.getByLabelText('New Password'), {
      target: { value: 'newpassword123' },
    });
    fireEvent.change(screen.getByLabelText('Confirm New Password'), {
      target: { value: 'newpassword123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /reset password/i }));

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  test('disables form submission while processing', async () => {
    vi.mocked(supabase.auth.updateUser).mockImplementationOnce(() =>
      new Promise(resolve => setTimeout(resolve, 100))
    );

    renderComponent();

    fireEvent.change(screen.getByLabelText('New Password'), {
      target: { value: 'newpassword123' },
    });
    fireEvent.change(screen.getByLabelText('Confirm New Password'), {
      target: { value: 'newpassword123' },
    });

    const submitButton = screen.getByRole('button', { name: /reset password/i });
    fireEvent.click(submitButton);

    expect(submitButton).toBeDisabled();
    expect(screen.getByText('Resetting Password...')).toBeInTheDocument();
  });
});
