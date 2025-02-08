import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import AdminDashboard from '../../pages/AdminDashboard';
import * as supabaseModule from '../../lib/supabase';

// Mock the entire supabase module
vi.mock('../../lib/supabase', () => {
  return {
    hasRole: vi.fn().mockResolvedValue(true),
    supabase: {
      from: vi.fn().mockImplementation((table: string) => {
        let mockData: any[] = [];
        if (table === 'profiles') {
          mockData = [
            { id: '1', display_name: 'User 1', email: 'user1@example.com', type: 'volunteer', created_at: '2023-01-01', status: 'active' },
            { id: '2', display_name: 'Admin User', email: 'admin@example.com', type: 'admin', created_at: '2023-01-01', status: 'active' }
          ];
        } else if (table === 'events') {
          mockData = [
            { id: '1', title: 'Test Event', status: 'published', start_datetime: '2023-05-01', creator: { display_name: 'Creator' }, applications_count: 5 },
            { id: '2', title: 'Another Event', status: 'draft', start_datetime: '2023-06-01', creator: { display_name: 'Creator' }, applications_count: 0 }
          ];
        }
        
        return {
          select: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              data: mockData,
              error: null
            })
          }),
          count: vi.fn().mockResolvedValue({
            data: { count: mockData.length },
            error: null
          })
        };
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

describe('AdminDashboard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders admin dashboard when authorized', async () => {
    render(
      <BrowserRouter>
        <AdminDashboard />
      </BrowserRouter>
    );
    
    // Wait for the title to appear
    await waitFor(() => {
      expect(screen.getByText(/organization dashboard/i)).toBeInTheDocument();
    });
    
    // Check that all tabs are rendered
    expect(screen.getByText(/user management/i)).toBeInTheDocument();
    expect(screen.getByText(/event management/i)).toBeInTheDocument();
    expect(screen.getByText(/reports/i)).toBeInTheDocument();
    expect(screen.getByText(/send notifications/i)).toBeInTheDocument();
  });

  test('redirects when user is not authorized', async () => {
    vi.mocked(supabaseModule.hasRole).mockResolvedValueOnce(false);

    render(
      <BrowserRouter>
        <AdminDashboard />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });
});
