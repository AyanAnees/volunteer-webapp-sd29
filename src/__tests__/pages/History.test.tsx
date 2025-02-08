import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import History from '../../pages/History';
import * as supabaseModule from '../../lib/supabase';

// Mock sample history data
const mockHistoryData = [
  {
    id: 'history-1',
    volunteer_id: 'user-123',
    event_id: 'event-1',
    hours_logged: 5,
    feedback: 'Great volunteer!',
    rating: 5,
    events: {
      id: 'event-1',
      title: 'Beach Cleanup',
      description: 'Help clean up the beach',
      location: 'Miami Beach',
      start_datetime: new Date(Date.now() - 86400000).toISOString(),
      end_datetime: new Date(Date.now() - 82800000).toISOString(),
      status: 'completed',
      profiles: [{ display_name: 'Coastal Conservation Society' }]
    }
  },
  {
    id: 'history-2',
    volunteer_id: 'user-123',
    event_id: 'event-2',
    hours_logged: 3,
    feedback: 'Thanks for your help!',
    rating: 4,
    events: {
      id: 'event-2',
      title: 'Food Bank',
      description: 'Help sort food at the food bank',
      location: 'Downtown',
      start_datetime: new Date(Date.now() - 172800000).toISOString(),
      end_datetime: new Date(Date.now() - 169200000).toISOString(),
      status: 'completed',
      profiles: [{ display_name: 'Community Food Bank' }]
    }
  }
];

// Mock the supabase module
vi.mock('../../lib/supabase', () => {
  return {
    supabase: {
      from: vi.fn().mockImplementation((table) => {
        if (table === 'volunteer_history') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            order: vi.fn().mockResolvedValue({
              data: mockHistoryData,
              error: null
            })
          };
        }
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnThis()
        };
      })
    },
    getCurrentProfile: vi.fn().mockResolvedValue({
      id: 'user-123',
      display_name: 'Test User',
      type: 'volunteer'
    })
  };
});

// Mock console methods to prevent noise in test output
vi.spyOn(console, 'error').mockImplementation(() => {});
vi.spyOn(console, 'log').mockImplementation(() => {});

// Mock navigate function
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('History Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders loading state initially', () => {
    render(
      <BrowserRouter>
        <History />
      </BrowserRouter>
    );
    
    // Check that the loading state is shown initially
    expect(screen.getByText(/Loading your impact and history/i)).toBeInTheDocument();
  });

  test('renders past events after loading', async () => {
    render(
      <BrowserRouter>
        <History />
      </BrowserRouter>
    );
    
    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByText(/Loading your impact and history/i)).not.toBeInTheDocument();
    });
    
    // Check that the page title is displayed
    expect(screen.getByText(/Your Volunteer History & Impact/i)).toBeInTheDocument();
    
    // Check that past events are displayed
    expect(screen.getByText('Beach Cleanup')).toBeInTheDocument();
    expect(screen.getByText('Food Bank')).toBeInTheDocument();
    
    // Check that event details are displayed
    expect(screen.getByText(/miami beach/i)).toBeInTheDocument();
    expect(screen.getByText(/downtown/i)).toBeInTheDocument();
  });

  test('displays impact metrics correctly', async () => {
    render(
      <BrowserRouter>
        <History />
      </BrowserRouter>
    );
    
    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByText(/Loading your impact and history/i)).not.toBeInTheDocument();
    });
    
    // Check that the impact summary section is displayed
    expect(screen.getByText(/Your Impact Summary/i)).toBeInTheDocument();
    
    // Check that impact metrics are calculated and displayed
    expect(screen.getAllByText(/Events Completed/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Total Hours/i)[0]).toBeInTheDocument();
    
    // We should see the correct number of events (2)
    const eventCountElement = screen.getAllByText('2')[0];
    expect(eventCountElement).toBeInTheDocument();
    
    // Total hours should be the sum of hours_logged (5 + 3 = 8)
    const totalHoursElement = screen.getAllByText('8')[0];
    expect(totalHoursElement).toBeInTheDocument();
  });

  test('displays feedback and ratings correctly', async () => {
    render(
      <BrowserRouter>
        <History />
      </BrowserRouter>
    );
    
    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByText(/Loading your impact and history/i)).not.toBeInTheDocument();
    });
    
    // Check for feedback comments
    expect(screen.getByText(/Great volunteer!/i)).toBeInTheDocument();
    expect(screen.getByText(/Thanks for your help!/i)).toBeInTheDocument();
    
    // Check for organizers
    expect(screen.getByText(/Coastal Conservation Society/i)).toBeInTheDocument();
    expect(screen.getByText(/Community Food Bank/i)).toBeInTheDocument();
  });

  test('shows sample event data when no history data is available', async () => {
    // Mock empty history data for this test
    vi.mocked(supabaseModule.supabase.from).mockImplementationOnce((table) => {
      if (table === 'volunteer_history') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({
            data: [],
            error: null
          })
        };
      }
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis()
      };
    });
    
    render(
      <BrowserRouter>
        <History />
      </BrowserRouter>
    );
    
    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByText(/Loading your impact and history/i)).not.toBeInTheDocument();
    });
    
    // Check that some sample event content is shown
    // Use a more specific selector or assertion to avoid matching multiple elements
    await waitFor(() => {
      expect(screen.getByText('This is a sample event.')).toBeInTheDocument();
    });
  });

  test('handles database error gracefully', async () => {
    // Mock database error for this test
    vi.mocked(supabaseModule.supabase.from).mockImplementationOnce((table) => {
      if (table === 'volunteer_history') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Database error' }
          })
        };
      }
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis()
      };
    });
    
    render(
      <BrowserRouter>
        <History />
      </BrowserRouter>
    );
    
    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByText(/Loading your impact and history/i)).not.toBeInTheDocument();
    });
    
    // Verify that the impact sections are still visible - showing that the component didn't crash
    await waitFor(() => {
      expect(screen.getByText('Your Impact Summary')).toBeInTheDocument();
    });
    
    // Verify that console.error was called with the error
    expect(console.error).toHaveBeenCalled();
  });

  test('shows fallback data when user profile is not found', async () => {
    // Mock null user profile for this test
    vi.mocked(supabaseModule.getCurrentProfile).mockResolvedValueOnce(null);
    
    render(
      <BrowserRouter>
        <History />
      </BrowserRouter>
    );
    
    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByText(/Loading your impact and history/i)).not.toBeInTheDocument();
    });
    
    // The component should show sample data when no user profile is found
    await waitFor(() => {
      // Use a more specific test that won't match multiple elements
      expect(screen.getByText('This is a sample event.')).toBeInTheDocument();
    });
  });
});