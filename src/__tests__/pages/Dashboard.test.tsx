import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import Dashboard from '../../pages/Dashboard';
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
      },
      from: vi.fn().mockImplementation((table) => {
        const mockChain = {
          select: vi.fn().mockReturnValue(mockChain),
          eq: vi.fn().mockReturnValue(mockChain),
          in: vi.fn().mockReturnValue(mockChain),
          or: vi.fn().mockReturnValue(mockChain),
          order: vi.fn().mockReturnValue(mockChain),
          limit: vi.fn().mockReturnValue(mockChain),
          gt: vi.fn().mockReturnValue(mockChain),
          lt: vi.fn().mockReturnValue(mockChain),
          gte: vi.fn().mockReturnValue(mockChain),
          lte: vi.fn().mockReturnValue(mockChain),
          then: vi.fn().mockImplementation(callback => {
            // Default successful response with empty data
            const response = {
              data: [],
              error: null
            };
            
            // Different responses based on table
            if (table === 'profiles') {
              response.data = [
                { id: 'test-user-id', display_name: 'Test User', type: 'volunteer', bio: 'Test bio' }
              ];
            } else if (table === 'events') {
              response.data = [
                { 
                  id: '1', 
                  title: 'Upcoming Event', 
                  status: 'published', 
                  start_datetime: new Date(Date.now() + 86400000).toISOString(),
                  location: 'Test Location'
                }
              ];
            } else if (table === 'applications') {
              response.data = [
                { 
                  id: '1', 
                  event_id: '1', 
                  volunteer_id: 'test-user-id', 
                  status: 'approved', 
                  created_at: new Date().toISOString(),
                  events: { 
                    title: 'Upcoming Event', 
                    location: 'Test Location',
                    start_datetime: new Date(Date.now() + 86400000).toISOString() 
                  }
                }
              ];
            } else if (table === 'notifications') {
              response.data = [
                { 
                  id: '1', 
                  user_id: 'test-user-id', 
                  title: 'New notification', 
                  message: 'Test message', 
                  read: false, 
                  created_at: new Date().toISOString() 
                }
              ];
            }
            
            return Promise.resolve(callback(response));
          })
        };
        
        return mockChain;
      })
    },
    getCurrentProfile: vi.fn().mockResolvedValue({ 
      id: 'test-user-id', 
      display_name: 'Test User', 
      type: 'volunteer' 
    }),
    isAuthenticated: vi.fn().mockResolvedValue(true),
    handleAuthRedirect: vi.fn()
  };
});

// Mock window.alert
const alertMock = vi.fn();
global.alert = alertMock;

// Mock navigate function
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Dashboard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    alertMock.mockReset();
  });

  afterEach(() => {
    // Clean up any mocks
    if (vi.isMockFunction(setTimeout)) {
      vi.useRealTimers();
    }
  });

  test('renders volunteer dashboard with user profile', async () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );
    
    // Check for loading state
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    
    // Wait for profile to load
    await waitFor(() => {
      expect(supabaseModule.getCurrentProfile).toHaveBeenCalled();
    });
  });

  test('redirects unauthenticated user', async () => {
    // Mock auth error
    vi.mocked(supabaseModule.getCurrentProfile).mockRejectedValueOnce(new Error('Not authenticated'));
    vi.mocked(supabaseModule.isAuthenticated).mockResolvedValueOnce(false);
    
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );
    
    // Wait for auth check and redirect
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalled();
    });
  });

  test('displays organization dashboard for organization users', async () => {
    // Mock organization user profile
    vi.mocked(supabaseModule.getCurrentProfile).mockResolvedValueOnce({ 
      id: 'org-id', 
      display_name: 'Test Org', 
      type: 'organization' 
    });
    
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );
    
    // Check for loading state
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    
    // Wait for profile to load
    await waitFor(() => {
      expect(supabaseModule.getCurrentProfile).toHaveBeenCalled();
    });
  });
});
