import React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { App } from '../../App';
import { MemoryRouter } from 'react-router-dom';

// Mock the components
vi.mock('../../components/Header', () => ({
  Header: () => <div data-testid="mock-header">Header</div>,
}));

vi.mock('../../components/MemeGrid', () => ({
  MemeGrid: () => <div data-testid="mock-meme-grid">MemeGrid</div>,
}));

vi.mock('../../components/UploadModal', () => ({
  UploadModal: () => <div data-testid="mock-upload-modal">UploadModal</div>,
}));

vi.mock('../../components/auth/ResetPasswordForm', () => ({
  ResetPasswordForm: () => <div data-testid="mock-reset-password-form">ResetPasswordForm</div>,
}));

vi.mock('../../components/profile/ProfilePage', () => ({
  ProfilePage: () => <div data-testid="mock-profile-page">ProfilePage</div>,
}));

// Mock the store
const mockStore = {
  loadMemes: vi.fn(),
  isLoading: false,
  error: null,
};

vi.mock('../../store/useMemeStore', () => ({
  useMemeStore: () => mockStore,
}));

describe('App', () => {
  test('renders main content on root path', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByTestId('mock-header')).toBeInTheDocument();
    expect(screen.getByTestId('mock-meme-grid')).toBeInTheDocument();
  });

  test('renders reset password form on /auth/reset-password path', () => {
    render(
      <MemoryRouter initialEntries={['/auth/reset-password']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByTestId('mock-reset-password-form')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-header')).not.toBeInTheDocument();
    expect(screen.queryByTestId('mock-meme-grid')).not.toBeInTheDocument();
  });

  test('renders profile page on /profile path', () => {
    render(
      <MemoryRouter initialEntries={['/profile']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByTestId('mock-profile-page')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-header')).not.toBeInTheDocument();
    expect(screen.queryByTestId('mock-meme-grid')).not.toBeInTheDocument();
  });

  test('renders error state when there is an error', () => {
    mockStore.error = 'Test error message';
    mockStore.isLoading = false;

    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText('Error Loading Memes')).toBeInTheDocument();
    expect(screen.getByText('Test error message')).toBeInTheDocument();

    // Reset mock store
    mockStore.error = null;
  });

  test('renders loading state when loading memes', () => {
    mockStore.isLoading = true;
    mockStore.error = null;

    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByTestId('mock-header')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-meme-grid')).not.toBeInTheDocument();
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();

    // Reset mock store
    mockStore.isLoading = false;
  });
});
