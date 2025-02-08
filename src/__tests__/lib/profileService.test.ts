import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createProfile } from '../../lib/profileService';
import { supabase } from '../../lib/supabase';

// Mock console methods to avoid cluttering test output
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

// Mock the supabase client
vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe('Profile Service', () => {
  let mockInsert: any;
  let mockUpdate: any;
  let mockSelect: any;
  let mockEq: any;
  
  beforeEach(() => {
    // Silence console output
    console.log = vi.fn();
    console.error = vi.fn();
    
    // Setup the mock chain
    mockSelect = vi.fn();
    mockEq = vi.fn().mockReturnValue({ select: mockSelect });
    mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });
    mockInsert = vi.fn().mockReturnValue({ select: mockSelect });
    
    // Reset the mock implementation for each test
    vi.mocked(supabase.from).mockReturnValue({
      insert: mockInsert,
      update: mockUpdate,
      select: vi.fn(),
    } as any);
  });
  
  afterEach(() => {
    // Restore console methods
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    
    // Clear all mocks
    vi.clearAllMocks();
  });

  it('creates a new profile successfully', async () => {
    // Setup mock response for successful profile creation
    mockSelect.mockResolvedValueOnce({
      data: [{ id: 'test-user-id', type: 'volunteer', display_name: 'Test User' }],
      error: null,
    });
    
    // Call the function
    const result = await createProfile('test-user-id', 'volunteer', 'Test User');
    
    // Verify supabase interaction
    expect(supabase.from).toHaveBeenCalledWith('profiles');
    expect(mockInsert).toHaveBeenCalledWith({
      id: 'test-user-id',
      type: 'volunteer',
      display_name: 'Test User',
      created_at: expect.any(String),
      updated_at: expect.any(String),
      status: 'active'
    });
    expect(mockSelect).toHaveBeenCalled();
    
    // Verify function returns correct result
    expect(result).toEqual({
      success: true,
      data: [{ id: 'test-user-id', type: 'volunteer', display_name: 'Test User' }]
    });
  });

  it('falls back to updating when insert fails', async () => {
    // Setup mock response for failed insert
    mockSelect.mockResolvedValueOnce({
      data: null,
      error: { message: 'Duplicate key violation' }
    });
    
    // Setup mock response for successful update
    mockSelect.mockResolvedValueOnce({
      data: [{ id: 'test-user-id', type: 'volunteer', display_name: 'Test User' }],
      error: null,
    });
    
    // Call the function
    const result = await createProfile('test-user-id', 'volunteer', 'Test User');
    
    // Verify insert was attempted
    expect(mockInsert).toHaveBeenCalled();
    
    // Verify update was attempted as fallback
    expect(mockUpdate).toHaveBeenCalledWith({
      type: 'volunteer',
      display_name: 'Test User',
      updated_at: expect.any(String)
    });
    expect(mockEq).toHaveBeenCalledWith('id', 'test-user-id');
    expect(mockSelect).toHaveBeenCalledTimes(2); // Once for insert, once for update
    
    // Verify function returns correct result
    expect(result).toEqual({
      success: true,
      data: [{ id: 'test-user-id', type: 'volunteer', display_name: 'Test User' }]
    });
  });

  it('throws an error when both insert and update fail', async () => {
    // Setup mock response for failed insert
    mockSelect.mockResolvedValueOnce({
      data: null,
      error: { message: 'Duplicate key violation' }
    });
    
    // Setup mock response for failed update
    mockSelect.mockResolvedValueOnce({
      data: null,
      error: { message: 'Database error' }
    });
    
    // Call the function and expect it to throw
    await expect(createProfile('test-user-id', 'volunteer', 'Test User')).rejects.toEqual({
      message: 'Database error'
    });
    
    // Verify both insert and update were attempted
    expect(mockInsert).toHaveBeenCalled();
    expect(mockUpdate).toHaveBeenCalled();
    expect(mockSelect).toHaveBeenCalledTimes(2); // Once for insert, once for update
    
    // Verify errors were logged
    expect(console.error).toHaveBeenCalledTimes(3);
  });

  it('handles unexpected errors during profile creation', async () => {
    // Setup mock to throw an unexpected error
    mockSelect.mockRejectedValueOnce(new Error('Unexpected error'));
    
    // Call the function and expect it to throw
    await expect(createProfile('test-user-id', 'volunteer', 'Test User')).rejects.toThrow('Unexpected error');
    
    // Verify attempt was made but error was thrown
    expect(mockInsert).toHaveBeenCalled();
    expect(mockSelect).toHaveBeenCalledTimes(1);
    
    // Verify error was logged
    expect(console.error).toHaveBeenCalledWith(
      'Profile creation failed completely:', 
      expect.any(Error)
    );
  });

  it('correctly formats the profile data', async () => {
    // Setup mock for successful operation
    mockSelect.mockResolvedValueOnce({
      data: [{ id: 'test-user-id', type: 'organization', display_name: 'Org Name' }],
      error: null,
    });
    
    // Call for different user type
    await createProfile('test-user-id', 'organization', 'Org Name');
    
    // Verify the profile data format
    expect(mockInsert).toHaveBeenCalledWith({
      id: 'test-user-id',
      type: 'organization', // Should be organization, not volunteer
      display_name: 'Org Name',
      created_at: expect.any(String),
      updated_at: expect.any(String),
      status: 'active'
    });
  });
});
