import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, useParams, useNavigate } from 'react-router-dom';
import EventApplications from '../../pages/EventApplications';
import { supabase, getCurrentProfile } from '../../lib/supabase';

// Mock the router hooks
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: vi.fn(),
    useNavigate: vi.fn(),
  };
});

// Mock the supabase module
vi.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      single: vi.fn(),
    }),
  },
  getCurrentProfile: vi.fn(),
}));

describe('EventApplications Component', () => {
  const mockNavigate = vi.fn();
  const mockEventId = 'event-123';
  
  // Setup mock data
  const mockEvent = {
    id: mockEventId,
    title: 'Test Event',
    description: 'A test event',
    location: 'Test Location',
    start_datetime: '2025-05-01T10:00:00Z',
    end_datetime: '2025-05-01T12:00:00Z',
    status: 'active',
    creator_id: 'org-123',
    min_volunteers: 5,
    max_volunteers: 10,
    event_skills: [
      {
        id: 'es-1',
        skill_id: 'skill-1',
        importance_level: 1,
        skills: {
          id: 'skill-1',
          name: 'Coding',
          category: 'Technical'
        }
      }
    ]
  };
  
  const mockApplications = [
    {
      id: 'app-1',
      event_id: mockEventId,
      volunteer_id: 'vol-1',
      status: 'pending',
      message: 'I would like to volunteer',
      match_score: 85,
      created_at: '2025-04-15T10:00:00Z',
      updated_at: '2025-04-15T10:00:00Z',
      volunteer: {
        id: 'vol-1',
        display_name: 'Test Volunteer',
        phone: '123-456-7890',
        profile_image_url: null,
        skills: [
          {
            id: 'ps-1',
            proficiency_level: 3,
            skills: {
              id: 'skill-1',
              name: 'Coding',
              category: 'Technical'
            }
          }
        ]
      }
    },
    {
      id: 'app-2',
      event_id: mockEventId,
      volunteer_id: 'vol-2',
      status: 'accepted',
      message: 'Looking forward to helping',
      match_score: 70,
      created_at: '2025-04-14T10:00:00Z',
      updated_at: '2025-04-15T11:00:00Z',
      volunteer: {
        id: 'vol-2',
        display_name: 'Another Volunteer',
        phone: null,
        profile_image_url: null,
        skills: []
      }
    }
  ];
  
  const mockProfile = {
    id: 'org-123',
    type: 'organization',
    display_name: 'Test Organization'
  };
  
  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();
    
    // Setup router mocks
    vi.mocked(useParams).mockReturnValue({ id: mockEventId });
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);
    
    // Setup auth mock
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: { id: 'org-123' } },
      error: null
    });
    
    // Setup profile mock
    const profileMock = vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: mockProfile,
        error: null
      })
    } as any);
    
    // Setup event mock
    const eventMock = vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: mockEvent,
        error: null
      })
    } as any);
    
    // Setup applications mock
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: mockApplications,
        error: null
      })
    } as any);
    
    // Mock getCurrentProfile
    vi.mocked(getCurrentProfile).mockResolvedValue(mockProfile);
  });

  it('redirects unauthorized users', async () => {
    // Mock unauthorized user (non-organization type)
    vi.mocked(supabase.from).mockReturnValueOnce({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { ...mockProfile, type: 'volunteer' },
        error: null
      })
    } as any);
    
    render(
      <BrowserRouter>
        <EventApplications />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('renders loading state initially', () => {
    render(
      <BrowserRouter>
        <EventApplications />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Loading applications...')).toBeInTheDocument();
  });

  it.skip('renders event info and applications', async () => {
    // Setup mock data with properly resolved promises
    vi.mocked(supabase.from).mockImplementation((table) => {
      if (table === 'profiles') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: mockProfile,
            error: null
          })
        } as any;
      }
      
      if (table === 'events') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: mockEvent,
            error: null
          })
        } as any;
      }
      
      if (table === 'applications') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnThis(),
          in: vi.fn().mockReturnThis(),
          single: vi.fn(),
          mockResolvedValue: vi.fn().mockResolvedValue({
            data: mockApplications,
            error: null
          })
        } as any;
      }
      
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        single: vi.fn()
      } as any;
    });
    
    render(
      <BrowserRouter>
        <EventApplications />
      </BrowserRouter>
    );
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByText('Loading applications...')).not.toBeInTheDocument();
    });
    
    // Check event title
    expect(screen.getByText(/Applications for "Test Event"/i)).toBeInTheDocument();
    
    // Check for event date
    const formattedDate = new Date(mockEvent.start_datetime).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    expect(screen.getByText(formattedDate)).toBeInTheDocument();
    
    // Check for filter options
    expect(screen.getByText('Filter by Status')).toBeInTheDocument();
    
    // Check for volunteer names in applications
    expect(screen.getByText('Test Volunteer')).toBeInTheDocument();
    expect(screen.getByText('Another Volunteer')).toBeInTheDocument();
    
    // Check for application statuses
    expect(screen.getByText('pending')).toBeInTheDocument();
    expect(screen.getByText('accepted')).toBeInTheDocument();
  });

  it.skip('handles filter and sort changes', async () => {
    render(
      <BrowserRouter>
        <EventApplications />
      </BrowserRouter>
    );
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByText('Loading applications...')).not.toBeInTheDocument();
    });
    
    // Find filter dropdowns
    const statusFilter = screen.getByRole('combobox', { name: /Filter by Status/i });
    const sortBy = screen.getAllByRole('combobox')[1];
    
    // Change filter to 'accepted'
    fireEvent.change(statusFilter, { target: { value: 'accepted' } });
    
    // Change sort to 'match'
    fireEvent.change(sortBy, { target: { value: 'match' } });
    
    // Verify that supabase calls were made with the new filtering
    await waitFor(() => {
      expect(vi.mocked(supabase.from)).toHaveBeenCalled();
    });
  });

  it.skip('opens accept application modal', async () => {
    render(
      <BrowserRouter>
        <EventApplications />
      </BrowserRouter>
    );
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByText('Loading applications...')).not.toBeInTheDocument();
    });
    
    // Find and click the Accept button on the pending application
    const acceptButtons = screen.getAllByRole('button', { name: /Accept/i });
    fireEvent.click(acceptButtons[0]);
    
    // Check if the modal is open
    await waitFor(() => {
      expect(screen.getByText('Accept Application')).toBeInTheDocument();
      expect(screen.getByText(/You are about to accept/i)).toBeInTheDocument();
    });
    
    // Check for response textarea
    expect(screen.getByLabelText('Message to Applicant (Optional)')).toBeInTheDocument();
  });

  it.skip('handles event completion button', async () => {
    render(
      <BrowserRouter>
        <EventApplications />
      </BrowserRouter>
    );
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByText('Loading applications...')).not.toBeInTheDocument();
    });
    
    // Find and click the complete event button
    const completeButton = screen.getByRole('button', { name: /Mark Event as Complete/i });
    fireEvent.click(completeButton);
    
    // Check if confirmation modal appears
    await waitFor(() => {
      expect(screen.getByText('Mark Event as Complete')).toBeInTheDocument();
      expect(screen.getByText('Are you sure you want to mark this event as complete?')).toBeInTheDocument();
    });
    
    // Confirm completion
    const confirmButton = screen.getByRole('button', { name: /Confirm Completion/i });
    
    // Mock the update responses
    vi.mocked(supabase.from).mockImplementation((table) => {
      if (table === 'events') {
        return {
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              data: { ...mockEvent, status: 'completed' },
              error: null
            })
          })
        } as any;
      }
      
      if (table === 'applications') {
        return {
          select: vi.fn().mockReturnThis(),
          update: vi.fn().mockReturnValue({
            in: vi.fn().mockResolvedValue({
              data: null,
              error: null
            })
          }),
          eq: vi.fn().mockReturnThis(),
          in: vi.fn().mockReturnThis()
        } as any;
      }
      
      return {
        select: vi.fn().mockReturnThis(),
        insert: vi.fn().mockResolvedValue({
          data: null,
          error: null
        }),
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis()
      } as any;
    });
    
    // Click confirm button
    fireEvent.click(confirmButton);
    
    // Check that appropriate supabase calls were made
    await waitFor(() => {
      expect(vi.mocked(supabase.from)).toHaveBeenCalledWith('events');
    });
  });
});
