// Set up environment variables for testing
process.env.SUPABASE_URL = 'https://test.supabase.co'
process.env.SUPABASE_KEY = 'test-key'
process.env.VITE_SUPABASE_URL = 'https://test.supabase.co'
process.env.VITE_SUPABASE_ANON_KEY = 'test-key'

import { handler } from '../api-v1-memes'
import { Handler, HandlerEvent, HandlerResponse } from '@netlify/functions'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type { Context } from '@netlify/functions'
import { describe, test, expect, beforeEach, vi } from 'vitest'

interface MockSupabaseClient extends SupabaseClient {
  auth: {
    getUser: ReturnType<typeof vi.fn>
  }
  storage: {
    from: ReturnType<typeof vi.fn>
    upload: ReturnType<typeof vi.fn>
  }
  from: ReturnType<typeof vi.fn>
  insert: ReturnType<typeof vi.fn>
  select: ReturnType<typeof vi.fn>
  single: ReturnType<typeof vi.fn>
}

// Mock Supabase client
vi.mock('@supabase/supabase-js', () => {
  const mockSupabaseInstance: MockSupabaseClient = {
    auth: {
      getUser: vi.fn()
    },
    storage: {
      from: vi.fn().mockReturnThis(),
      upload: vi.fn()
    },
    from: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    single: vi.fn()
  } as MockSupabaseClient

  return {
    createClient: vi.fn(() => mockSupabaseInstance)
  }
})

const mockCreateClient = createClient as unknown as ReturnType<typeof vi.fn<[], MockSupabaseClient>>

describe('POST /api/v1/memes', () => {
  const context = {} as Context

  beforeEach(() => {
    vi.clearAllMocks()
  })

  const mockValidEvent: HandlerEvent = {
    httpMethod: 'POST',
    path: '/api/v1/memes',
    headers: {
      authorization: 'Bearer valid-token'
    },
    body: JSON.stringify({
      title: 'Test Meme',
      imageData: 'base64string',
      contentType: 'image/jpeg'
    }),
    rawUrl: 'http://localhost:8888/api/v1/memes',
    rawQuery: '',
    queryStringParameters: {},
    multiValueQueryStringParameters: {},
    isBase64Encoded: false,
    multiValueHeaders: {}
  }

  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com'
  }

  test('rejects non-POST requests', async () => {
    const event: HandlerEvent = {
      ...mockValidEvent,
      httpMethod: 'GET'
    }
    const response = await handler(event, context)
    const typedResponse = response as HandlerResponse

    expect(typedResponse.statusCode).toBe(405)
    expect(JSON.parse(typedResponse.body)).toEqual({
      error: 'Method not allowed'
    })
  })

  test('rejects requests without authorization', async () => {
    const event: HandlerEvent = {
      ...mockValidEvent,
      headers: {}
    }
    const response = await handler(event, context)
    const typedResponse = response as HandlerResponse

    expect(typedResponse.statusCode).toBe(401)
    expect(JSON.parse(typedResponse.body)).toEqual({
      error: 'Unauthorized'
    })
  })

  test('rejects invalid tokens', async () => {
    const supabase = mockCreateClient()
    supabase.auth.getUser.mockResolvedValueOnce({
      data: { user: null },
      error: new Error('Invalid token')
    })

    const response = await handler(mockValidEvent, context)
    const typedResponse = response as HandlerResponse

    expect(typedResponse.statusCode).toBe(401)
    expect(JSON.parse(typedResponse.body)).toEqual({
      error: 'Invalid token'
    })
  })

  test('rejects missing required fields', async () => {
    const supabase = mockCreateClient()
    supabase.auth.getUser.mockResolvedValueOnce({
      data: { user: mockUser },
      error: null
    })

    const event: HandlerEvent = {
      ...mockValidEvent,
      body: JSON.stringify({
        title: 'Test Meme'
        // Missing imageData and contentType
      })
    }

    const response = await handler(event, context)
    const typedResponse = response as HandlerResponse

    expect(typedResponse.statusCode).toBe(400)
    expect(JSON.parse(typedResponse.body)).toEqual({
      error: 'Missing required fields'
    })
  })

  test('rejects invalid content types', async () => {
    const supabase = mockCreateClient()
    supabase.auth.getUser.mockResolvedValueOnce({
      data: { user: mockUser },
      error: null
    })

    const event: HandlerEvent = {
      ...mockValidEvent,
      body: JSON.stringify({
        title: 'Test Meme',
        imageData: 'base64string',
        contentType: 'application/pdf'
      })
    }

    const response = await handler(event, context)
    const typedResponse = response as HandlerResponse

    expect(typedResponse.statusCode).toBe(400)
    expect(JSON.parse(typedResponse.body)).toEqual({
      error: 'Invalid file type'
    })
  })

  test('handles storage upload errors', async () => {
    const supabase = mockCreateClient()
    supabase.auth.getUser.mockResolvedValueOnce({
      data: { user: mockUser },
      error: null
    })

    supabase.storage.upload.mockResolvedValueOnce({
      data: null,
      error: new Error('Upload failed')
    })

    const response = await handler(mockValidEvent, context)
    const typedResponse = response as HandlerResponse

    expect(typedResponse.statusCode).toBe(500)
    expect(JSON.parse(typedResponse.body)).toEqual({
      error: 'Failed to upload file'
    })
  })

  test('handles database insert errors', async () => {
    const supabase = mockCreateClient()
    supabase.auth.getUser.mockResolvedValueOnce({
      data: { user: mockUser },
      error: null
    })

    supabase.storage.upload.mockResolvedValueOnce({
      data: { path: 'memes/test.jpg' },
      error: null
    })

    // Mock the chained database operations
    const mockChain = {
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValueOnce({
        data: null,
        error: new Error('Insert failed')
      })
    }
    supabase.from.mockReturnValueOnce({
      insert: vi.fn().mockReturnValue(mockChain)
    })

    const response = await handler(mockValidEvent, context)
    const typedResponse = response as HandlerResponse

    expect(typedResponse.statusCode).toBe(500)
    expect(JSON.parse(typedResponse.body)).toEqual({
      error: 'Failed to create meme record'
    })
  })

  test('successfully uploads meme and creates record', async () => {
    const supabase = mockCreateClient()
    supabase.auth.getUser.mockResolvedValueOnce({
      data: { user: mockUser },
      error: null
    })

    supabase.storage.upload.mockResolvedValueOnce({
      data: { path: 'memes/test.jpg' },
      error: null
    })

    const mockMemeRecord = {
      id: 1,
      title: 'Test Meme',
      file_path: 'memes/test.jpg',
      user_id: mockUser.id,
      content_type: 'image/jpeg'
    }

    // Mock the chained database operations
    const mockChain = {
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValueOnce({
        data: mockMemeRecord,
        error: null
      })
    }
    supabase.from.mockReturnValueOnce({
      insert: vi.fn().mockReturnValue(mockChain)
    })

    const response = await handler(mockValidEvent, context)
    const typedResponse = response as HandlerResponse

    expect(typedResponse.statusCode).toBe(201)
    expect(JSON.parse(typedResponse.body)).toEqual({
      message: 'Meme uploaded successfully',
      meme: mockMemeRecord
    })
  })
})
