import { vi } from "vitest"

// Mock next/server
vi.mock("next/server", () => ({
  NextResponse: {
    json: (data: any, init?: ResponseInit) => {
      return new Response(JSON.stringify(data), {
        status: init?.status || 200,
        headers: { "Content-Type": "application/json", ...init?.headers },
      })
    },
  },
  NextRequest: class MockNextRequest extends Request {
    constructor(url: string, init?: RequestInit) {
      super(url, init)
    }
  },
}))

// Mock next/headers
vi.mock("next/headers", () => ({
  cookies: () => ({
    get: () => ({ value: "mock-cookie" }),
    set: () => {},
    delete: () => {},
  }),
  headers: () => new Headers(),
}))

// Mock @/lib/supabase/server
vi.mock("@/lib/supabase/server", () => {
  const mockFrom = (table: string) => {
    const chain: any = {
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      neq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      single: vi.fn(() =>
        Promise.resolve({
          data: { id: "mock-doc-id-" + Date.now() },
          error: null,
        })
      ),
      order: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      count: null,
      data: [],
      error: null,
    }
    return chain
  }

  return {
    createServerSupabaseClient: vi.fn(() => ({
      auth: {
        getUser: vi.fn(() =>
          Promise.resolve({
            data: { user: { id: "test-user-id", email: "test@example.com" } },
            error: null,
          })
        ),
      },
      from: mockFrom,
      storage: {
        from: vi.fn(() => ({
          createSignedUploadUrl: vi.fn(() =>
            Promise.resolve({
              data: { signedUrl: "https://example.com/signed", path: "test/path", token: "token" },
              error: null,
            })
          ),
          getPublicUrl: vi.fn(() => ({
            data: { publicUrl: "https://example.com/public" },
          })),
          remove: vi.fn(() => Promise.resolve({ error: null })),
        })),
      },
    })),
  }
})

// Mock @/lib/supabase/admin
vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(() => ({
    storage: {
      from: vi.fn(() => ({
        createSignedUploadUrl: vi.fn(() =>
          Promise.resolve({
            data: { signedUrl: "https://example.com/signed", path: "test/path", token: "token" },
            error: null,
          })
        ),
        remove: vi.fn(() => Promise.resolve({ error: null })),
      })),
    },
  })),
}))

// Mock @/lib/rate-limit
vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: vi.fn(() => ({ allowed: true, remaining: 59, resetAt: Date.now() + 60000 })),
  API_RATE_LIMIT: { windowMs: 60000, max: 60 },
  AUTH_RATE_LIMIT: { windowMs: 900000, max: 5 },
  SEARCH_RATE_LIMIT: { windowMs: 60000, max: 20 },
  SUGGESTION_RATE_LIMIT: { windowMs: 60000, max: 60 },
  SUMMARY_RATE_LIMIT: { windowMs: 60000, max: 10 },
}))

// Mock OpenAI/Groq
vi.mock("openai", () => ({
  default: vi.fn(() => ({
    embeddings: {
      create: vi.fn(() =>
        Promise.resolve({
          data: [{ embedding: new Array(1536).fill(0.1) }],
        })
      ),
    },
    chat: {
      completions: {
        create: vi.fn(() =>
          Promise.resolve({
            choices: [{ message: { content: "Test summary" } }],
          })
        ),
      },
    },
  })),
}))
