import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import Login from '../../pages/auth/Login';
import * as supabaseModule from '../../lib/supabase';

// Mock the supabase module
vi.mock('../../lib/supabase', () => {
  return {
    supabase: {
      auth: {
        signInWithPassword: vi.fn().mockResolvedValue({
          data: { 
            user: { 
              id: 'test-user-id',
              app_metadata: {},
              user_metadata: {},
              aud: 'authenticated',
              created_at: new Date().toISOString()
            },
            session: null 
          },
          error: null
        }),
        getSession: vi.fn().mockResolvedValue({
          data: { session: null },
          error: null
        }),
        signOut: vi.fn().mockResolvedValue({ error: null })
      }
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
    useLocation: () => ({ state: null }),
  };
});

describe('Login Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockReset();
    // Reset any mocks we created within test cases
    if (vi.isMockFunction(setTimeout)) {
      vi.useRealTimers();
    }
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('renders login form', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    
    // Check for the correct heading text
    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    expect(screen.getByText('Sign in to continue to Volunteer Connect')).toBeInTheDocument();
    
    // Check for form elements
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveTextContent(/sign in/i);
  });

  test('validates form fields before submission', async () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    
    // Submit form without filling in fields
    fireEvent.click(screen.getByRole('button'));
    
    // Expect validation errors to appear
    expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/password is required/i)).toBeInTheDocument();
    
    // Should not call sign in function
    expect(supabaseModule.supabase.auth.signInWithPassword).not.toHaveBeenCalled();
  });

  test('handles successful login', async () => {
    // Mock for a successful login with complete User and Session objects
    vi.mocked(supabaseModule.supabase.auth.signInWithPassword).mockResolvedValueOnce({
      data: { 
        user: { 
          id: 'test-user-id',
          app_metadata: {},
          user_metadata: {},
          aud: 'authenticated',
          created_at: new Date().toISOString(),
          email: 'test@example.com',
          phone: '',
          confirmed_at: new Date().toISOString(),
          email_confirmed_at: new Date().toISOString(),
          last_sign_in_at: new Date().toISOString(),
          role: 'authenticated',
          updated_at: new Date().toISOString()
        },
        session: {
          access_token: 'test-token',
          refresh_token: 'test-refresh-token',
          expires_in: 3600,
          expires_at: new Date().getTime() + 3600000,
          token_type: 'bearer',
          user: {
            id: 'test-user-id',
            app_metadata: {},
            user_metadata: {},
            aud: 'authenticated',
            created_at: new Date().toISOString(),
            email: 'test@example.com',
            phone: '',
            confirmed_at: new Date().toISOString(),
            email_confirmed_at: new Date().toISOString(),
            last_sign_in_at: new Date().toISOString(),
            role: 'authenticated',
            updated_at: new Date().toISOString()
          }
        }
      },
      error: null
    } as any);

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    
    // Fill in form fields
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'test@example.com' }
    });
    
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' }
    });
    
    // Submit form
    fireEvent.click(screen.getByRole('button'));
    
    // Verify loading state
    expect(await screen.findByText(/signing in/i)).toBeInTheDocument();
    
    // Verify supabase methods were called
    await waitFor(() => {
      expect(supabaseModule.supabase.auth.signOut).toHaveBeenCalled();
      expect(supabaseModule.supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
    }, { timeout: 6000 });
    
    // Wait for the navigation hook to be triggered
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
    }, { timeout: 6000 });
  });

  test('handles login error', async () => {
    // Mock sign in to return an error
    vi.mocked(supabaseModule.supabase.auth.signInWithPassword).mockResolvedValueOnce({
      data: null,
      error: { message: 'Invalid login credentials' }
    } as any);
    
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    
    // Fill in form fields
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'test@example.com' }
    });
    
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'wrong-password' }
    });
    
    // Submit form
    fireEvent.click(screen.getByRole('button'));
    
    // Check for error message
    expect(await screen.findByText(/invalid login credentials/i)).toBeInTheDocument();
    
    // Also wait for the loading state to finish
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /sign in/i })).not.toHaveTextContent(/signing in/i);
    });
    
    // Should not navigate
    await waitFor(() => {
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});
