import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import EventCreate from '../../pages/EventCreate';
import { supabase, getCurrentProfile } from '../../lib/supabase';

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

// Mock supabase
vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
    storage: {
      from: vi.fn().mockReturnValue({
        upload: vi.fn().mockResolvedValue({ data: { path: 'test-image.jpg' }, error: null }),
        getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://example.com/test-image.jpg' } }),
      }),
    },
  },
  getCurrentProfile: vi.fn(),
}));

describe('EventCreate Component', () => {
  // Setup mocks and variables needed for testing
  const mockNavigate = vi.fn();
  
  const mockSkills = [
    { id: 'skill-1', name: 'Coding', category: 'Technical' },
    { id: 'skill-2', name: 'Teaching', category: 'Education' },
    { id: 'skill-3', name: 'Cleaning', category: 'Manual Labor' },
  ];
  
  const mockOrganizationProfile = {
    id: 'org-123',
    type: 'organization',
    display_name: 'Test Organization',
  };
  
  const mockVolunteerProfile = {
    id: 'vol-123',
    type: 'volunteer',
    display_name: 'Test Volunteer',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup useNavigate mock
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);
    
    // Setup supabase mocks for the basic case (organization user)
    vi.mocked(getCurrentProfile).mockResolvedValue(mockOrganizationProfile);
    
    // Mock skills fetching
    vi.mocked(supabase.from).mockImplementation((table) => {
      if (table === 'skills') {
        return {
          select: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnThis(),
          mockResolvedValue: vi.fn().mockResolvedValue({
            data: mockSkills,
            error: null,
          }),
        } as any;
      }
      
      return {
        select: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { id: 'event-123' },
          error: null,
        }),
      } as any;
    });
  });

  it('renders loading state initially', () => {
    render(
      <BrowserRouter>
        <EventCreate />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('redirects volunteer users to home page', async () => {
    // Mock volunteer profile (not allowed to create events)
    vi.mocked(getCurrentProfile).mockResolvedValue(mockVolunteerProfile);
    
    render(
      <BrowserRouter>
        <EventCreate />
      </BrowserRouter>
    );
    
    // Wait for access check to complete
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('allows organization users to create events', async () => {
    render(
      <BrowserRouter>
        <EventCreate />
      </BrowserRouter>
    );
    
    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
    
    // Check if the form is rendered
    expect(screen.getByText('Create New Volunteer Opportunity')).toBeInTheDocument();
    expect(screen.getByLabelText('Event Title')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(screen.getByLabelText(/Location/)).toBeInTheDocument();
  });

  it('shows validation errors when submitting an empty form', async () => {
    render(
      <BrowserRouter>
        <EventCreate />
      </BrowserRouter>
    );
    
    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
    
    // Submit without filling the form
    const submitButton = screen.getByRole('button', { name: /Create Event/i });
    fireEvent.click(submitButton);
    
    // Check for validation errors
    await waitFor(() => {
      expect(screen.getByText('Title is required')).toBeInTheDocument();
      expect(screen.getByText('Description is required')).toBeInTheDocument();
      expect(screen.getByText('Start date/time is required')).toBeInTheDocument();
      expect(screen.getByText('End date/time is required')).toBeInTheDocument();
    });
  });

  it('successfully submits a valid event form as draft', async () => {
    // Mock event creation
    vi.mocked(supabase.from).mockImplementation((table) => {
      if (table === 'skills') {
        return {
          select: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnThis(),
          mockResolvedValue: vi.fn().mockResolvedValue({
            data: mockSkills,
            error: null,
          }),
        } as any;
      }
      
      if (table === 'events') {
        return {
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: { id: 'event-123', status: 'draft' },
              error: null,
            }),
          }),
        } as any;
      }
      
      if (table === 'event_skills') {
        return {
          insert: vi.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
        } as any;
      }
      
      return {
        select: vi.fn().mockReturnThis(),
      } as any;
    });

    // Spy on window.alert
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    
    render(
      <BrowserRouter>
        <EventCreate />
      </BrowserRouter>
    );
    
    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
    
    // Fill in the form with valid data
    fireEvent.change(screen.getByLabelText('Event Title'), { 
      target: { value: 'Beach Cleanup' } 
    });
    
    fireEvent.change(screen.getByLabelText('Description'), { 
      target: { value: 'Help clean up the beach' } 
    });
    
    fireEvent.change(screen.getByLabelText(/Location/), { 
      target: { value: 'Miami Beach' } 
    });
    
    fireEvent.change(screen.getByLabelText(/Start Date & Time/), { 
      target: { value: '2025-05-01T10:00' } 
    });
    
    fireEvent.change(screen.getByLabelText(/End Date & Time/), { 
      target: { value: '2025-05-01T12:00' } 
    });
    
    // Set status to draft
    fireEvent.change(screen.getByLabelText(/Event Status/), {
      target: { value: 'draft' }
    });
    
    // Submit the form as draft
    const draftButton = screen.getByRole('button', { name: /Create Event/i });
    fireEvent.click(draftButton);
    
    // Check if the event was created and navigation occurred
    await waitFor(() => {
      expect(vi.mocked(supabase.from)).toHaveBeenCalledWith('events');
      expect(alertSpy).toHaveBeenCalledWith('Your event has been saved as a draft.');
      expect(mockNavigate).toHaveBeenCalledWith('/opportunities/event-123');
    });
  });

  it('successfully submits a valid event form as published', async () => {
    // Mock event creation
    vi.mocked(supabase.from).mockImplementation((table) => {
      if (table === 'skills') {
        return {
          select: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnThis(),
          mockResolvedValue: vi.fn().mockResolvedValue({
            data: mockSkills,
            error: null,
          }),
        } as any;
      }
      
      if (table === 'events') {
        return {
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: { id: 'event-123', status: 'published' },
              error: null,
            }),
          }),
        } as any;
      }
      
      if (table === 'event_skills') {
        return {
          insert: vi.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
        } as any;
      }
      
      return {
        select: vi.fn().mockReturnThis(),
      } as any;
    });
    
    // Spy on window.alert
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    
    render(
      <BrowserRouter>
        <EventCreate />
      </BrowserRouter>
    );
    
    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
    
    // Fill in the form with valid data
    fireEvent.change(screen.getByLabelText('Event Title'), { 
      target: { value: 'Beach Cleanup' } 
    });
    
    fireEvent.change(screen.getByLabelText('Description'), { 
      target: { value: 'Help clean up the beach' } 
    });
    
    fireEvent.change(screen.getByLabelText(/Location/), { 
      target: { value: 'Miami Beach' } 
    });
    
    fireEvent.change(screen.getByLabelText(/Start Date & Time/), { 
      target: { value: '2025-05-01T10:00' } 
    });
    
    fireEvent.change(screen.getByLabelText(/End Date & Time/), { 
      target: { value: '2025-05-01T12:00' } 
    });
    
    // Set status to published
    fireEvent.change(screen.getByLabelText(/Event Status/), {
      target: { value: 'published' }
    });
    
    // Submit the form as published
    const publishButton = screen.getByRole('button', { name: /Create Event/i });
    fireEvent.click(publishButton);
    
    // Check if the event was created and navigation occurred
    await waitFor(() => {
      expect(vi.mocked(supabase.from)).toHaveBeenCalledWith('events');
      expect(alertSpy).toHaveBeenCalledWith('Your event has been published successfully!');
      expect(mockNavigate).toHaveBeenCalledWith('/opportunities/event-123');
    });
  });

  it('shows error when event creation fails', async () => {
    // Mock event creation failure
    vi.mocked(supabase.from).mockImplementation((table) => {
      if (table === 'skills') {
        return {
          select: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnThis(),
          mockResolvedValue: vi.fn().mockResolvedValue({
            data: mockSkills,
            error: null,
          }),
        } as any;
      }
      
      if (table === 'events') {
        return {
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'Database error' },
            }),
          }),
        } as any;
      }
      
      return {
        select: vi.fn().mockReturnThis(),
      } as any;
    });
    
    // Spy on window.alert and console.error
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    render(
      <BrowserRouter>
        <EventCreate />
      </BrowserRouter>
    );
    
    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
    
    // Fill in the form with valid data
    fireEvent.change(screen.getByLabelText('Event Title'), { 
      target: { value: 'Beach Cleanup' } 
    });
    
    fireEvent.change(screen.getByLabelText('Description'), { 
      target: { value: 'Help clean up the beach' } 
    });
    
    fireEvent.change(screen.getByLabelText(/Start Date & Time/), { 
      target: { value: '2025-05-01T10:00' } 
    });
    
    fireEvent.change(screen.getByLabelText(/End Date & Time/), { 
      target: { value: '2025-05-01T12:00' } 
    });
    
    // Set status to draft
    fireEvent.change(screen.getByLabelText(/Event Status/), {
      target: { value: 'draft' }
    });
    
    // Submit the form
    const draftButton = screen.getByRole('button', { name: /Create Event/i });
    fireEvent.click(draftButton);
    
    // Check if error was handled properly
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
      expect(alertSpy).toHaveBeenCalledWith('Failed to create event: Database error');
    });
  });

  it('allows adding and removing skills', async () => {
    render(
      <BrowserRouter>
        <EventCreate />
      </BrowserRouter>
    );
    
    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
    
    // Open the skill modal
    const addSkillButton = screen.getByRole('button', { name: /Add Required Skills/i });
    fireEvent.click(addSkillButton);
    
    // Wait for the modal to appear
    await waitFor(() => {
      expect(screen.getByText('Add Skill Requirement')).toBeInTheDocument();
    });
    
    // Select a skill
    const skillSelect = screen.getByLabelText('Skill');
    fireEvent.change(skillSelect, { target: { value: 'skill-1' } });
    
    // Select an importance level
    const importanceRadio = screen.getByLabelText('Preferred (Nice to have)');
    fireEvent.click(importanceRadio);
    
    // Add the skill
    const addButton = screen.getByRole('button', { name: /Add Skill/i });
    fireEvent.click(addButton);
    
    // Check if the skill was added
    await waitFor(() => {
      expect(screen.getByText('Coding')).toBeInTheDocument();
    });
    
    // Remove the skill
    const removeButton = screen.getByRole('button', { name: /remove/i });
    fireEvent.click(removeButton);
    
    // Check if the skill was removed
    await waitFor(() => {
      expect(screen.queryByText('Coding')).not.toBeInTheDocument();
    });
  });
});
