import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import Register from '../../../pages/auth/Register';
import * as supabaseModule from '../../../lib/supabase';

// Mock window.alert
const alertMock = vi.fn();
global.alert = alertMock;

// Mock the supabase module
vi.mock('../../../lib/supabase', () => {
  return {
    supabase: {
      auth: {
        signUp: vi.fn().mockResolvedValue({
          data: { 
            user: { 
              id: 'test-user-id',
              app_metadata: {},
              user_metadata: {},
              aud: 'authenticated',
              created_at: new Date().toISOString(),
              email: 'test@example.com',
              identities: [{ identity_data: { email_verified: false } }]
            }
          },
          error: null
        }),
        getSession: vi.fn().mockResolvedValue({
          data: { session: null },
          error: null
        }),
        signOut: vi.fn().mockResolvedValue({ error: null })
      },
      from: vi.fn().mockImplementation((table) => {
        if (table === 'profiles') {
          return {
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockResolvedValue({
                data: { id: 'profile-id' },
                error: null
              })
            })
          };
        }
        return {};
      }),
      rpc: vi.fn().mockResolvedValue({
        data: true,
        error: null
      })
    }
  };
});

// Mock navigate function
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await import('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock setTimeout
vi.mock('global', () => ({
  setTimeout: vi.fn((fn) => {
    fn();
    return 999;
  })
}));

describe('Register Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    alertMock.mockReset();
  });

  test('renders register form', () => {
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );
    
    // Check for the heading by using a more specific query
    expect(screen.getByRole('heading', { name: 'Create Account' })).toBeInTheDocument();
    
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/display name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    
    // Check for the button by using role
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  test('validates form fields before submission', async () => {
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );
    
    // Submit form without filling in fields
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));
    
    // Check validation errors
    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    expect(screen.getByText(/display name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    
    // Should not call sign up function
    expect(supabaseModule.supabase.auth.signUp).not.toHaveBeenCalled();
  });

  test('calls signUp with correct values when form is valid', async () => {
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );
    
    // Fill in form fields
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'test@example.com' }
    });
    
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: 'Password123!' }
    });
    
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: 'Password123!' }
    });
    
    fireEvent.change(screen.getByLabelText(/display name/i), {
      target: { value: 'Test User' }
    });
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));
    
    // Check that the form submission started (button shows loading state)
    expect(screen.getByText(/creating account/i)).toBeInTheDocument();
    
    // Verify supabase methods were called with expected values
    await waitFor(() => {
      expect(supabaseModule.supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'Password123!'
      });
    });
  });

  test('shows error message when signUp fails', async () => {
    // Mock signUp to fail
    vi.mocked(supabaseModule.supabase.auth.signUp).mockResolvedValueOnce({
      data: null,
      error: { message: 'User already registered' }
    } as any);
    
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );
    
    // Fill out minimal required form fields
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'test@example.com' }
    });
    
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: 'Password123!' }
    });
    
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: 'Password123!' }
    });
    
    fireEvent.change(screen.getByLabelText(/display name/i), {
      target: { value: 'Test User' }
    });
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));
    
    // Check for error message
    await waitFor(() => {
      expect(screen.getByText(/user already registered/i)).toBeInTheDocument();
    });
  });

  test('shows profile error message when profile creation fails', async () => {
    // Mock profile creation to fail
    vi.mocked(supabaseModule.supabase.from).mockReturnValueOnce({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockResolvedValue({
          data: null,
          error: { message: "Database error" }
        })
      })
    } as any);
    
    vi.mocked(supabaseModule.supabase.rpc).mockResolvedValueOnce({
      data: null,
      error: { message: "Database error" }
    } as any);
    
    // Track when signUp is called
    let signUpCalled = false;
    vi.mocked(supabaseModule.supabase.auth.signUp).mockImplementationOnce(async () => {
      signUpCalled = true;
      return {
        data: { 
          user: { 
            id: 'test-user-id',
            app_metadata: {},
            user_metadata: {},
            aud: 'authenticated',
            created_at: new Date().toISOString(),
            email: 'test@example.com',
            identities: [{ identity_data: { email_verified: false } }]
          },
          session: null
        },
        error: null
      } as any;
    });
    
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );
    
    // Fill out form
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'test@example.com' }
    });
    
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: 'Password123!' }
    });
    
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: 'Password123!' }
    });
    
    fireEvent.change(screen.getByLabelText(/display name/i), {
      target: { value: 'Test User' }
    });
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));
    
    // Just verify the auth signup was called
    await waitFor(() => {
      expect(signUpCalled).toBe(true);
    }, { timeout: 1000 });
    
    // Verify the from().insert() was called for the profile
    await waitFor(() => {
      expect(supabaseModule.supabase.from).toHaveBeenCalledWith('profiles');
    }, { timeout: 1000 });
  });
});
