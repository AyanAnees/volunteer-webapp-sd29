import { describe, test, expect, vi, beforeEach } from 'vitest';
import * as supabaseModule from '../../lib/supabase';
import { 
  fetchUpcomingVolunteerEvents, 
  fetchPastVolunteerEvents,
  fetchOrganizationEvents,
  generateSampleEvents
} from '../../services/eventService';

// Mock the supabase module
vi.mock('../../lib/supabase', () => {
  return {
    supabase: {
      from: vi.fn().mockImplementation((table) => {
        // Create a chainable mock with better typing
        const mockChain: any = {};
        
        // Define chainable methods
        mockChain.select = vi.fn().mockReturnValue(mockChain);
        mockChain.eq = vi.fn().mockReturnValue(mockChain);
        mockChain.in = vi.fn().mockReturnValue(mockChain);
        mockChain.gt = vi.fn().mockReturnValue(mockChain);
        mockChain.lt = vi.fn().mockReturnValue(mockChain);
        mockChain.gte = vi.fn().mockReturnValue(mockChain);
        mockChain.lte = vi.fn().mockReturnValue(mockChain);
        mockChain.order = vi.fn().mockReturnValue(mockChain);
        mockChain.limit = vi.fn().mockReturnValue(mockChain);
        
        // Define non-chainable terminal methods
        mockChain.then = vi.fn().mockImplementation(callback => {
          // Default successful response
          const response = {
            data: [],
            error: null
          };
          
          // Different responses based on table
          if (table === 'applications') {
            response.data = [
              { 
                id: 'app1', 
                volunteer_id: 'user1', 
                event_id: 'event1', 
                status: 'pending',
                events: { 
                  id: 'event1', 
                  title: 'Beach Cleanup', 
                  start_datetime: new Date().toISOString(),
                  end_datetime: new Date(Date.now() + 3600000).toISOString(),
                  location: 'City Beach',
                  status: 'active'
                }
              }
            ];
          } else if (table === 'events') {
            response.data = [
              { 
                id: 'event1', 
                title: 'Beach Cleanup', 
                description: 'Clean the beach', 
                location: 'City Beach',
                start_datetime: new Date().toISOString(),
                end_datetime: new Date(Date.now() + 3600000).toISOString(),
                creator_id: 'org1',
                status: 'active'
              }
            ];
          }
          
          return Promise.resolve(callback(response));
        });
        
        return mockChain;
      })
    }
  };
});

describe('Event Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('fetchUpcomingVolunteerEvents retrieves upcoming events', async () => {
    const userId = 'user1';
    const result = await fetchUpcomingVolunteerEvents(userId);
    
    expect(supabaseModule.supabase.from).toHaveBeenCalledWith('applications');
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].title).toBe('Beach Cleanup');
  });

  test('fetchUpcomingVolunteerEvents handles errors', async () => {
    // Mock an error response
    vi.mocked(supabaseModule.supabase.from).mockReturnValueOnce({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Database error' }
      })
    } as any);
    
    const userId = 'user1';
    const result = await fetchUpcomingVolunteerEvents(userId);
    
    // Should return an empty array on error
    expect(result).toEqual([]);
  });

  test('fetchPastVolunteerEvents retrieves past events', async () => {
    const userId = 'user1';
    const result = await fetchPastVolunteerEvents(userId);
    
    expect(supabaseModule.supabase.from).toHaveBeenCalledWith('applications');
    // Past events might be empty in our mock, but the function should execute without errors
    expect(Array.isArray(result)).toBeTruthy();
  });

  test('fetchPastVolunteerEvents handles errors', async () => {
    // Mock an error response
    vi.mocked(supabaseModule.supabase.from).mockReturnValueOnce({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      lt: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Database error' }
      })
    } as any);
    
    const userId = 'user1';
    const result = await fetchPastVolunteerEvents(userId);
    
    // Should return an empty array on error
    expect(result).toEqual([]);
  });

  test('fetchOrganizationEvents retrieves events for an organization', async () => {
    const orgId = 'org1';
    const result = await fetchOrganizationEvents(orgId);
    
    expect(supabaseModule.supabase.from).toHaveBeenCalledWith('events');
    expect(Array.isArray(result)).toBeTruthy();
  });

  test('fetchOrganizationEvents handles errors', async () => {
    // Mock an error response
    vi.mocked(supabaseModule.supabase.from).mockReturnValueOnce({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Database error' }
      })
    } as any);
    
    const orgId = 'org1';
    const result = await fetchOrganizationEvents(orgId);
    
    // Should return an empty array on error
    expect(result).toEqual([]);
  });

  test('generateSampleEvents generates random events', () => {
    const count = 5;
    const result = generateSampleEvents(count);
    
    expect(result.length).toBe(count);
    expect(result[0]).toHaveProperty('title');
    expect(result[0]).toHaveProperty('start_datetime');
    expect(result[0]).toHaveProperty('end_datetime');
    expect(result[0]).toHaveProperty('location');
  });
});
