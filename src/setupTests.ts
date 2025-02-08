import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock the environment variables used by Vite
global.process.env.VITE_SUPABASE_URL = 'https://mock-supabase-url.com';
global.process.env.VITE_SUPABASE_ANON_KEY = 'mock-anon-key';

// Mock the Supabase client
vi.mock('./lib/supabase', () => {
  return {
    supabase: {
      auth: {
        getSession: vi.fn().mockResolvedValue({ 
          data: { session: { user: { id: 'test-user-id' } } },
          error: null
        }),
        signInWithPassword: vi.fn(),
        signUp: vi.fn(),
        signOut: vi.fn(),
      },
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: null
            }),
            order: vi.fn().mockResolvedValue({
              data: [],
              error: null
            }),
            in: vi.fn().mockReturnValue({
              gte: vi.fn().mockReturnValue({
                order: vi.fn().mockResolvedValue({
                  data: [],
                  error: null
                })
              })
            })
          }),
          order: vi.fn().mockReturnValue({
            data: [],
            error: null
          })
        }),
        insert: vi.fn().mockResolvedValue({
          data: {},
          error: null
        }),
        update: vi.fn().mockResolvedValue({
          data: {},
          error: null
        }),
        delete: vi.fn().mockResolvedValue({
          data: null,
          error: null
        }),
        count: vi.fn().mockReturnValue({
          data: { count: 0 },
          error: null
        })
      }),
    },
    getCurrentProfile: vi.fn().mockResolvedValue({ id: 'test-user-id', type: 'volunteer' }),
    hasRole: vi.fn().mockResolvedValue(true),
  };
});
