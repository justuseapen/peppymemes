import React from 'react';
import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { MemeEmbed } from '../MemeEmbed';
import { createMockMeme } from '../../test/factories';
import { Meme } from '../../types/meme';

const TEST_MEME_ID = '2ae1d9f9-44e2-4e79-96d2-be555cc0a5c3';
const mockMeme = createMockMeme({
  id: TEST_MEME_ID,
  title: 'Test Meme',
  image_url: 'https://example.com/meme.jpg',
  tags: ['funny', 'test']
});

interface MockResponse {
  data: Meme | null;
  error: Error | null;
}

// Mock Supabase client
const mockSupabaseResponse: Record<string, MockResponse> = {
  success: { data: mockMeme, error: null },
  error: { data: null, error: new Error('Failed to load meme') }
};

let currentMockResponse = mockSupabaseResponse.success;

vi.mock('../../config/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => currentMockResponse)
        }))
      }))
    }))
  }
}));

describe('MemeEmbed', () => {
  beforeEach(() => {
    document.title = 'Peppy Memes'; // Reset title
    currentMockResponse = mockSupabaseResponse.success; // Default to success
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test('renders meme content when meme is found', async () => {
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
    currentMockResponse = mockSupabaseResponse.error;

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
