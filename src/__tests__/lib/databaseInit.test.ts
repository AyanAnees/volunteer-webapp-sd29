import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { initializeDatabase, validateDatabaseSchema } from '../../lib/databaseInit';
import { supabase } from '../../lib/supabase';

// Mock console methods to avoid cluttering test output
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

// Mock the supabase client
vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
    rpc: vi.fn(),
  },
}));

describe('Database Initialization', () => {
  beforeEach(() => {
    // Silence console output
    console.log = vi.fn();
    console.error = vi.fn();
    
    // Setup the mock chains
    vi.mocked(supabase.from).mockReset();
    vi.mocked(supabase.rpc).mockReset();
  });
  
  afterEach(() => {
    // Restore console methods
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    
    // Clear all mocks
    vi.clearAllMocks();
  });

  describe('initializeDatabase', () => {
    it('returns true when database tables already exist', async () => {
      // Setup mock for checking profiles table - no error means table exists
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue({
            data: [{ id: 'some-profile' }],
            error: null
          })
        })
      } as any);
      
      const result = await initializeDatabase();
      
      expect(result).toBe(true);
      expect(supabase.from).toHaveBeenCalledWith('profiles');
      expect(console.log).toHaveBeenCalledWith('Database tables already exist');
    });

    it('attempts to create tables when profiles table does not exist', async () => {
      // First query returns error that table doesn't exist
      vi.mocked(supabase.from).mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'relation "public.profiles" does not exist' }
          })
        })
      } as any);
      
      // Mock the RPC call to succeed
      vi.mocked(supabase.rpc).mockReturnValueOnce({
        data: null,
        error: null
      } as any);
      
      const result = await initializeDatabase();
      
      expect(result).toBe(true);
      expect(supabase.from).toHaveBeenCalledWith('profiles');
      expect(supabase.rpc).toHaveBeenCalledWith('init_database');
      expect(console.log).toHaveBeenCalledWith('Profiles table does not exist, attempting to create...');
      expect(console.log).toHaveBeenCalledWith('Database initialization successful');
    });

    it('falls back to direct table creation when RPC fails', async () => {
      // First query returns error that table doesn't exist
      vi.mocked(supabase.from).mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'relation "public.profiles" does not exist' }
          })
        })
      } as any);
      
      // RPC call fails
      vi.mocked(supabase.rpc).mockReturnValueOnce({
        data: null,
        error: { message: 'RPC function not found' }
      } as any);
      
      // Setup fallback insert attempt (should fail but create table)
      vi.mocked(supabase.from).mockReturnValueOnce({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockResolvedValue({
            data: null,
            error: null // No error means table was created
          })
        })
      } as any);
      
      const result = await initializeDatabase();
      
      expect(result).toBe(true);
      expect(supabase.rpc).toHaveBeenCalledWith('init_database');
      expect(console.error).toHaveBeenCalledWith('Failed to initialize database:', expect.any(Object));
      expect(supabase.from).toHaveBeenCalledTimes(2); // Once to check, once to create
    });

    it('returns false when all initialization attempts fail', async () => {
      // First query returns error that table doesn't exist
      vi.mocked(supabase.from).mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'relation "public.profiles" does not exist' }
          })
        })
      } as any);
      
      // RPC call fails
      vi.mocked(supabase.rpc).mockReturnValueOnce({
        data: null,
        error: { message: 'RPC function not found' }
      } as any);
      
      // Fallback insert attempt also fails
      vi.mocked(supabase.from).mockReturnValueOnce({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Permission denied' }
          })
        })
      } as any);
      
      const result = await initializeDatabase();
      
      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalledWith('Failed to initialize database:', expect.any(Object));
      expect(console.error).toHaveBeenCalledWith('Failed to create profiles table:', expect.any(Object));
    });

    it('returns false for unknown database errors', async () => {
      // First query returns an unknown error
      vi.mocked(supabase.from).mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Unknown database error' }
          })
        })
      } as any);
      
      const result = await initializeDatabase();
      
      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalledWith('Unknown database error:', expect.any(Object));
    });

    it('handles unexpected exceptions', async () => {
      // Mock to throw an unexpected error
      vi.mocked(supabase.from).mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          limit: vi.fn().mockRejectedValue(new Error('Connection failed'))
        })
      } as any);
      
      const result = await initializeDatabase();
      
      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalledWith('Database initialization failed:', expect.any(Error));
    });
  });

  describe('validateDatabaseSchema', () => {
    it('returns true when schema validation passes', async () => {
      // Mock successful schema validation
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue({
            data: [{ id: 'profile-1', type: 'volunteer', display_name: 'Test User' }],
            error: null
          })
        })
      } as any);
      
      const result = await validateDatabaseSchema();
      
      expect(result).toBe(true);
      expect(supabase.from).toHaveBeenCalledWith('profiles');
      expect(console.log).toHaveBeenCalledWith('Database schema validation successful');
    });

    it('returns false when schema validation fails', async () => {
      // Mock failed schema validation
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'column "type" does not exist' }
          })
        })
      } as any);
      
      const result = await validateDatabaseSchema();
      
      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalledWith('Database schema validation failed:', expect.any(Object));
    });

    it('handles unexpected exceptions during validation', async () => {
      // Mock unexpected error
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          limit: vi.fn().mockRejectedValue(new Error('Validation failed'))
        })
      } as any);
      
      const result = await validateDatabaseSchema();
      
      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalledWith('Database schema validation failed:', expect.any(Error));
    });
  });
});
