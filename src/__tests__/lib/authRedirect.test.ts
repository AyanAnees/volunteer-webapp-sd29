import { describe, test, expect, vi, beforeEach } from 'vitest';
import { handleAuthRedirect } from '../../lib/authRedirect';
import * as supabaseModule from '../../lib/supabase';

// Mock the supabase module
vi.mock('../../lib/supabase', () => {
  return {
    supabase: {
      auth: {
        getSession: vi.fn().mockResolvedValue({
          data: { session: { user: { id: 'test-user-id' } } },
          error: null
        })
      }
    },
    getCurrentProfile: vi.fn().mockResolvedValue({ id: 'test-user-id', display_name: 'Test User' })
  };
});

describe('Auth Redirect Utility', () => {
  const mockNavigate = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  test('allows authenticated users to access the route', async () => {
    const result = await handleAuthRedirect(mockNavigate);
    
    expect(result).toBe(true);
    expect(mockNavigate).not.toHaveBeenCalled();
  });
  
  test('redirects unauthenticated users to login page', async () => {
    // Mock auth error
    vi.mocked(supabaseModule.getCurrentProfile).mockRejectedValueOnce(new Error('Not authenticated'));
    
    // Also mock getSession to return null session to ensure authentication fails
    vi.mocked(supabaseModule.supabase.auth.getSession).mockResolvedValueOnce({
      data: { session: null },
      error: null
    } as any);
    
    const result = await handleAuthRedirect(mockNavigate);
    
    expect(result).toBe(false);
    expect(mockNavigate).toHaveBeenCalledWith('/auth/login', { replace: true });
  });
  
  test('redirects to login page when getSession returns no session', async () => {
    // Mock no active session
    vi.mocked(supabaseModule.supabase.auth.getSession).mockResolvedValueOnce({
      data: { session: null },
      error: null
    } as any);
    
    const result = await handleAuthRedirect(mockNavigate);
    
    expect(result).toBe(false);
    expect(mockNavigate).toHaveBeenCalledWith('/auth/login', { replace: true });
  });
  
  test('handles redirect with custom path', async () => {
    // Mock auth error
    vi.mocked(supabaseModule.getCurrentProfile).mockRejectedValueOnce(new Error('Not authenticated'));
    
    // Also mock getSession to return null session
    vi.mocked(supabaseModule.supabase.auth.getSession).mockResolvedValueOnce({
      data: { session: null },
      error: null
    } as any);
    
    const result = await handleAuthRedirect(mockNavigate, '/custom/login');
    
    expect(result).toBe(false);
    expect(mockNavigate).toHaveBeenCalledWith('/custom/login', { replace: true });
  });
  
  test('handles error from getSession', async () => {
    // Mock error from getSession
    vi.mocked(supabaseModule.supabase.auth.getSession).mockResolvedValueOnce({
      data: { session: null },
      error: { message: 'Server error' }
    } as any);
    
    const result = await handleAuthRedirect(mockNavigate);
    
    expect(result).toBe(false);
    expect(mockNavigate).toHaveBeenCalledWith('/auth/login', { replace: true });
  });
});
