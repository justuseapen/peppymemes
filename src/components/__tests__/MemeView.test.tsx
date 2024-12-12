import React from 'react';
import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { MemeView } from '../MemeView';
import { useMemeStore } from '../../store/useMemeStore';

// Mock react-router-dom's useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

// Create a mock store with loading state
const createMockStore = (isLoading = false, memes = []) => ({
  isLoading,
  memes: memes.length > 0 ? memes : [
    {
      id: 1,
      title: 'Test Meme',
      image_url: 'https://example.com/meme.jpg',
      tags: ['funny', 'test'],
      created_at: '2024-03-11T00:00:00Z',
      user_id: 'user1'
    }
  ]
});

// Mock the store with a default implementation
const mockUseMemeStore = vi.fn(() => createMockStore(false));
vi.mock('../../store/useMemeStore', () => ({
  useMemeStore: () => mockUseMemeStore()
}));

describe('MemeView', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockUseMemeStore.mockClear();
    document.title = 'Peppy Memes'; // Reset title
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test('shows loading state', () => {
    mockUseMemeStore.mockReturnValue(createMockStore(true));

    render(
      <MemoryRouter initialEntries={['/meme/1']}>
        <Routes>
          <Route path="/meme/:id" element={<MemeView />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  test('renders meme modal when meme is found', async () => {
    mockUseMemeStore.mockReturnValue(createMockStore(false));

    render(
      <MemoryRouter initialEntries={['/meme/1']}>
        <Routes>
          <Route path="/meme/:id" element={<MemeView />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Meme')).toBeInTheDocument();
    });
    expect(screen.getByAltText('Test Meme')).toBeInTheDocument();
    expect(screen.getByText('funny')).toBeInTheDocument();
    expect(screen.getByText('test')).toBeInTheDocument();
  });

  test('navigates to home when meme is not found', async () => {
    mockUseMemeStore.mockReturnValue(createMockStore(false, []));

    render(
      <MemoryRouter initialEntries={['/meme/999']}>
        <Routes>
          <Route path="/meme/:id" element={<MemeView />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
    });
  });

  test('updates document title when meme is found', async () => {
    mockUseMemeStore.mockReturnValue(createMockStore(false));

    render(
      <MemoryRouter initialEntries={['/meme/1']}>
        <Routes>
          <Route path="/meme/:id" element={<MemeView />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(document.title).toBe('Test Meme - Peppy Memes');
    });
  });
});
