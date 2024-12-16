import React from 'react';
import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { MemeEmbed } from '../MemeEmbed';
import { useMemeStore } from '../../store/useMemeStore';

// Mock Supabase client
vi.mock('../../config/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => ({
            data: null,
            error: new Error('Failed to load meme')
          }))
        }))
      }))
    }))
  }
}));

const TEST_MEME_ID = '2ae1d9f9-44e2-4e79-96d2-be555cc0a5c3';

// Create a mock store with loading state
const createMockStore = (isLoading = false, memes = []) => ({
  isLoading,
  memes: memes.length > 0 ? memes : [
    {
      id: TEST_MEME_ID,
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

describe('MemeEmbed', () => {
  beforeEach(() => {
    mockUseMemeStore.mockClear();
    document.title = 'Peppy Memes'; // Reset title
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test('renders meme content when meme is found', async () => {
    mockUseMemeStore.mockReturnValue(createMockStore(false));

    render(
      <MemoryRouter initialEntries={[`/meme/${TEST_MEME_ID}/embed`]}>
        <Routes>
          <Route path="/meme/:id/embed" element={<MemeEmbed />} />
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

  test('shows error when meme does not exist', async () => {
    mockUseMemeStore.mockReturnValue(createMockStore(false, []));

    render(
      <MemoryRouter initialEntries={['/meme/non-existent-id/embed']}>
        <Routes>
          <Route path="/meme/:id/embed" element={<MemeEmbed />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Error: Failed to load meme')).toBeInTheDocument();
    });
  });

  test('updates document title when meme is found', async () => {
    mockUseMemeStore.mockReturnValue(createMockStore(false));

    render(
      <MemoryRouter initialEntries={[`/meme/${TEST_MEME_ID}/embed`]}>
        <Routes>
          <Route path="/meme/:id/embed" element={<MemeEmbed />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(document.title).toBe('Test Meme - Peppy Memes Embed');
    });
  });
});
