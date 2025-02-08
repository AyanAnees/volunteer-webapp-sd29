// Mock of the supabase.ts file to handle import.meta.env issues in tests

const mockSupabaseClient = {
  auth: {
    getSession: jest.fn().mockResolvedValue({ 
      data: { session: { user: { id: 'test-user-id' } } },
      error: null
    }),
    signInWithPassword: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
  },
  from: jest.fn().mockReturnValue({
    select: jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: null,
          error: null
        }),
        order: jest.fn().mockResolvedValue({
          data: [],
          error: null
        }),
        in: jest.fn().mockReturnValue({
          gte: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: [],
              error: null
            })
          })
        })
      }),
      order: jest.fn().mockReturnValue({
        data: [],
        error: null
      })
    }),
    insert: jest.fn().mockResolvedValue({
      data: {},
      error: null
    }),
    update: jest.fn().mockResolvedValue({
      data: {},
      error: null
    }),
    delete: jest.fn().mockResolvedValue({
      data: null,
      error: null
    }),
    count: jest.fn().mockReturnValue({
      data: { count: 0 },
      error: null
    })
  }),
};

export const supabase = mockSupabaseClient;

export const hasRole = jest.fn().mockResolvedValue(true);
export const getCurrentProfile = jest.fn().mockResolvedValue({ id: 'test-user-id', type: 'volunteer' });
