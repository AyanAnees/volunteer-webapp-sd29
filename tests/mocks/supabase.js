// Mock implementation of the Supabase client
const mockSupabaseClient = {
  auth: {
    signUp: jest.fn(),
    signInWithPassword: jest.fn(),
    signOut: jest.fn(),
    getUser: jest.fn(),
  },
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  in: jest.fn().mockReturnThis(),
  single: jest.fn().mockReturnThis(),
  maybeSingle: jest.fn().mockReturnThis(),
  match: jest.fn().mockReturnThis(),
  or: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis()
};

// Utility function to reset all mocks
const resetSupabaseMocks = () => {
  Object.values(mockSupabaseClient.auth).forEach(mock => mock.mockReset());
  Object.keys(mockSupabaseClient)
    .filter(key => key !== 'auth')
    .forEach(key => {
      if (typeof mockSupabaseClient[key] === 'function') {
        mockSupabaseClient[key].mockClear();
      }
    });
};

// Configure default successful responses
const configureSupabaseForSuccessfulAuth = () => {
  // Mock successful signup
  mockSupabaseClient.auth.signUp.mockResolvedValue({
    data: {
      user: {
        id: 'mock-user-id',
        email: 'test@example.com',
        user_metadata: { full_name: 'Test User' }
      },
      session: { access_token: 'mock-token' }
    },
    error: null
  });

  // Mock successful login
  mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
    data: {
      user: {
        id: 'mock-user-id',
        email: 'test@example.com',
        user_metadata: { full_name: 'Test User' }
      },
      session: { access_token: 'mock-token' }
    },
    error: null
  });

  // Mock successful logout
  mockSupabaseClient.auth.signOut.mockResolvedValue({
    error: null
  });

  // Mock successful get user
  mockSupabaseClient.auth.getUser.mockResolvedValue({
    data: {
      user: {
        id: 'mock-user-id',
        email: 'test@example.com',
        user_metadata: { full_name: 'Test User' }
      }
    },
    error: null
  });

  // Mock successful profile operations
  mockSupabaseClient.from.mockImplementation((tableName) => {
    if (tableName === 'profiles') {
      return {
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockResolvedValue({ data: [{ id: 'mock-profile-id' }], error: null }),
        update: jest.fn().mockResolvedValue({ data: { id: 'mock-profile-id' }, error: null }),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: { id: 'mock-profile-id', full_name: 'Test User' }, error: null }),
        maybeSingle: jest.fn().mockResolvedValue({ data: { id: 'mock-profile-id' }, error: null })
      };
    }
    return mockSupabaseClient;
  });
};

// Configure error responses
const configureSupabaseForFailedAuth = () => {
  // Mock failed signup
  mockSupabaseClient.auth.signUp.mockResolvedValue({
    data: { user: null, session: null },
    error: { message: 'Signup failed' }
  });

  // Mock failed login
  mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
    data: { user: null, session: null },
    error: { message: 'Invalid login credentials' }
  });

  // Mock failed profile operations
  mockSupabaseClient.from.mockImplementation((tableName) => {
    if (tableName === 'profiles') {
      return {
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockResolvedValue({ data: null, error: { message: 'Database error' } }),
        update: jest.fn().mockResolvedValue({ data: null, error: { message: 'Database error' } }),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: { message: 'Profile not found' } }),
        maybeSingle: jest.fn().mockResolvedValue({ data: null, error: { message: 'Profile not found' } })
      };
    }
    return mockSupabaseClient;
  });
};

module.exports = {
  mockSupabaseClient,
  resetSupabaseMocks,
  configureSupabaseForSuccessfulAuth,
  configureSupabaseForFailedAuth
};
