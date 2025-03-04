const {
  mockSupabaseClient,
  resetSupabaseMocks,
  configureSupabaseForSuccessfulAuth
} = require('../mocks/supabase');

// Mock the Supabase client
jest.mock('../../server/config/supabase', () => mockSupabaseClient);

// Import the service after mocking dependencies
const eventService = require('../../server/services/eventService');

describe('Event Service', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    resetSupabaseMocks();

    // Set up default successful responses
    mockSupabaseClient.from.mockImplementation((tableName) => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis(),
      contains: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      lte: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
      match: jest.fn().mockReturnThis(),
      or: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      ilike: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockReturnThis()
    }));
  });

  describe('getAllEvents', () => {
    it('should return all events without filters', async () => {
      // Mock data
      const mockEvents = [
        {
          id: 'event-1',
          event_name: 'Beach Cleanup',
          description: 'Cleaning up the local beach',
          location: 'Main Beach',
          required_skills: ['Environmental'],
          urgency: 'Medium',
          start_date: '2025-04-01T09:00:00Z',
          end_date: '2025-04-01T12:00:00Z',
          max_volunteers: 20,
          current_volunteers: 5,
          status: 'Planned'
        },
        {
          id: 'event-2',
          event_name: 'Food Drive',
          description: 'Collecting food donations',
          location: 'Community Center',
          required_skills: ['Organization'],
          urgency: 'High',
          start_date: '2025-04-15T10:00:00Z',
          end_date: '2025-04-15T16:00:00Z',
          max_volunteers: 10,
          current_volunteers: 2,
          status: 'Planned'
        }
      ];

      // Setup mock return values
      const selectMock = jest.fn().mockReturnThis();
      const orderMock = jest.fn().mockResolvedValue({ data: mockEvents, error: null });

      mockSupabaseClient.from.mockImplementationOnce(() => ({
        select: selectMock,
        order: orderMock
      }));

      // Call the function
      const result = await eventService.getAllEvents();

      // Assertions
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('events');
      expect(selectMock).toHaveBeenCalled();
      expect(orderMock).toHaveBeenCalledWith('start_date', { ascending: true });
      expect(result.data).toEqual(mockEvents);
      expect(result.error).toBeNull();
    });

    it('should apply filters when provided', async () => {
      // Mock filters
      const filters = {
        status: 'Planned',
        urgency: 'High',
        skill: 'Organization',
        startDate: '2025-04-01',
        endDate: '2025-04-30'
      };

      // Mock data
      const mockEvents = [
        {
          id: 'event-2',
          event_name: 'Food Drive',
          description: 'Collecting food donations',
          location: 'Community Center',
          required_skills: ['Organization'],
          urgency: 'High',
          start_date: '2025-04-15T10:00:00Z',
          end_date: '2025-04-15T16:00:00Z',
          max_volunteers: 10,
          current_volunteers: 2,
          status: 'Planned'
        }
      ];

      // Setup mock chain with proper method chaining
      const selectMock = jest.fn().mockReturnThis();
      const eqStatusMock = jest.fn().mockReturnThis();
      const eqUrgencyMock = jest.fn().mockReturnThis();
      const containsMock = jest.fn().mockReturnThis();
      const gteMock = jest.fn().mockReturnThis();
      const lteMock = jest.fn().mockReturnThis();
      const orderMock = jest.fn().mockResolvedValue({ data: mockEvents, error: null });

      // Create mock chain that properly handles filter methods
      mockSupabaseClient.from.mockImplementationOnce(() => {
        const mock = {
          select: selectMock,
          eq: jest.fn().mockImplementation((field, value) => {
            if (field === 'status') {
              expect(value).toBe('Planned');
              return mock;
            }
            if (field === 'urgency') {
              expect(value).toBe('High');
              return mock;
            }
            return mock;
          }),
          contains: jest.fn().mockImplementation((field, value) => {
            expect(field).toBe('required_skills');
            expect(value).toEqual(['Organization']);
            return mock;
          }),
          gte: jest.fn().mockImplementation((field, value) => {
            expect(field).toBe('start_date');
            expect(value).toBe('2025-04-01');
            return mock;
          }),
          lte: jest.fn().mockImplementation((field, value) => {
            expect(field).toBe('end_date');
            expect(value).toBe('2025-04-30');
            return mock;
          }),
          order: orderMock
        };
        return mock;
      });

      // Call the function
      const result = await eventService.getAllEvents(filters);

      // Assertions
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('events');
      expect(selectMock).toHaveBeenCalled();
      expect(result.data).toEqual(mockEvents);
      expect(result.error).toBeNull();
    });

    it('should handle errors', async () => {
      // Setup mock to throw error
      mockSupabaseClient.from.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockImplementation(() => {
          throw new Error('Database error');
        })
      }));

      // Call the function
      const result = await eventService.getAllEvents();

      // Assertions
      expect(result.data).toBeNull();
      expect(result.error).toBe('Database error');
    });
  });

  describe('getUserEvents', () => {
    it('should return events created by a specific user', async () => {
      // Mock userId
      const userId = 'user-123';

      // Mock data
      const mockEvents = [
        {
          id: 'event-1',
          event_name: 'Beach Cleanup',
          created_by: userId
        }
      ];

      // Setup mock chain
      mockSupabaseClient.from.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: mockEvents, error: null })
      }));

      // Call the function
      const result = await eventService.getUserEvents(userId);

      // Assertions
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('events');
      expect(result.data).toEqual(mockEvents);
      expect(result.error).toBeNull();
    });

    it('should handle errors', async () => {
      // Setup mock to throw error
      mockSupabaseClient.from.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockImplementation(() => {
          throw new Error('Database error');
        })
      }));

      // Call the function
      const result = await eventService.getUserEvents('user-123');

      // Assertions
      expect(result.data).toBeNull();
      expect(result.error).toBe('Database error');
    });
  });

  describe('getEventById', () => {
    it('should return event details by id with volunteers', async () => {
      // Mock eventId
      const eventId = 'event-123';

      // Mock data
      const mockEvent = {
        id: eventId,
        event_name: 'Beach Cleanup',
        description: 'Cleaning up the local beach'
      };

      const mockVolunteers = [
        {
          id: 'volunteer-1',
          status: 'Applied',
          profiles: {
            id: 'user-1',
            full_name: 'John Doe'
          }
        }
      ];

      // Setup mock for events query
      mockSupabaseClient.from.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockEvent, error: null })
      }));

      // Setup mock for volunteers query
      mockSupabaseClient.from.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        in: jest.fn().mockResolvedValue({ data: mockVolunteers, error: null })
      }));

      // Call the function
      const result = await eventService.getEventById(eventId);

      // Assertions
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('events');
      expect(result.data).toEqual({
        ...mockEvent,
        volunteers: mockVolunteers
      });
      expect(result.error).toBeNull();
    });

    it('should handle event not found', async () => {
      // Setup mock to return null
      mockSupabaseClient.from.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockImplementation(() => {
          throw new Error('Event not found');
        })
      }));

      // Call the function
      const result = await eventService.getEventById('non-existent');

      // Assertions
      expect(result.data).toBeNull();
      expect(result.error).toBe('Event not found');
    });
  });

  describe('createEvent', () => {
    it('should create an event with valid data', async () => {
      // Mock event data
      const eventData = {
        event_name: 'New Event',
        description: 'Event description',
        location: 'Event location',
        required_skills: ['Skill 1', 'Skill 2'],
        urgency: 'Medium',
        start_date: '2025-05-01T10:00:00Z',
        end_date: '2025-05-01T14:00:00Z',
        created_by: 'user-123'
      };

      // Mock created event
      const createdEvent = [
        {
          id: 'event-new',
          ...eventData,
          status: 'Planned',
          created_at: '2025-03-22T12:00:00Z',
          updated_at: '2025-03-22T12:00:00Z'
        }
      ];

      // Setup mock chain
      mockSupabaseClient.from.mockImplementationOnce(() => ({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue({ data: createdEvent, error: null })
      }));

      // Call the function
      const result = await eventService.createEvent(eventData);

      // Assertions
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('events');
      expect(result.data).toEqual(createdEvent);
      expect(result.error).toBeNull();
    });

    it('should validate required fields', async () => {
      // Missing required fields
      const invalidData = {
        event_name: 'Missing Fields Event'
        // missing description, location, etc.
      };

      // Call the function
      const result = await eventService.createEvent(invalidData);

      // Assertions
      expect(mockSupabaseClient.from).not.toHaveBeenCalled(); // Validation should fail before DB call
      expect(result.data).toBeNull();
      expect(result.error).toContain('required');
    });

    it('should validate event name length', async () => {
      // Event name too long
      const invalidData = {
        event_name: 'X'.repeat(101), // Over 100 characters
        description: 'Event description',
        location: 'Event location',
        urgency: 'Medium',
        start_date: '2025-05-01T10:00:00Z',
        end_date: '2025-05-01T14:00:00Z'
      };

      // Call the function
      const result = await eventService.createEvent(invalidData);

      // Assertions
      expect(mockSupabaseClient.from).not.toHaveBeenCalled();
      expect(result.data).toBeNull();
      expect(result.error).toContain('cannot exceed 100 characters');
    });

    it('should validate date range', async () => {
      // End date before start date
      const invalidData = {
        event_name: 'Invalid Date Range',
        description: 'Event description',
        location: 'Event location',
        urgency: 'Medium',
        start_date: '2025-05-01T14:00:00Z', // Later
        end_date: '2025-05-01T10:00:00Z'    // Earlier
      };

      // Call the function
      const result = await eventService.createEvent(invalidData);

      // Assertions
      expect(mockSupabaseClient.from).not.toHaveBeenCalled();
      expect(result.data).toBeNull();
      expect(result.error).toContain('End date must be after start date');
    });

    it('should validate urgency value', async () => {
      // Invalid urgency
      const invalidData = {
        event_name: 'Invalid Urgency',
        description: 'Event description',
        location: 'Event location',
        urgency: 'SuperHigh', // Not a valid option
        start_date: '2025-05-01T10:00:00Z',
        end_date: '2025-05-01T14:00:00Z'
      };

      // Call the function
      const result = await eventService.createEvent(invalidData);

      // Assertions
      expect(mockSupabaseClient.from).not.toHaveBeenCalled();
      expect(result.data).toBeNull();
      expect(result.error).toContain('Urgency must be Low, Medium, or High');
    });

    it('should handle database errors', async () => {
      // Valid event data
      const eventData = {
        event_name: 'New Event',
        description: 'Event description',
        location: 'Event location',
        required_skills: ['Skill 1', 'Skill 2'],
        urgency: 'Medium',
        start_date: '2025-05-01T10:00:00Z',
        end_date: '2025-05-01T14:00:00Z'
      };

      // Setup mock to throw error
      mockSupabaseClient.from.mockImplementationOnce(() => ({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockImplementation(() => {
          throw new Error('Database error');
        })
      }));

      // Call the function
      const result = await eventService.createEvent(eventData);

      // Assertions
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('events');
      expect(result.data).toBeNull();
      expect(result.error).toBe('Database error');
    });
  });

  describe('updateEvent', () => {
    it('should update an event with valid data', async () => {
      // Mock event ID and update data
      const eventId = 'event-123';
      const updateData = {
        event_name: 'Updated Event Name',
        description: 'Updated description'
      };

      // Mock updated event
      const updatedEvent = {
        id: eventId,
        event_name: 'Updated Event Name',
        description: 'Updated description',
        location: 'Original location',
        required_skills: ['Original skill'],
        urgency: 'Medium',
        start_date: '2025-05-01T10:00:00Z',
        end_date: '2025-05-01T14:00:00Z',
        updated_at: '2025-03-22T14:00:00Z'
      };

      // Setup mock chain
      mockSupabaseClient.from.mockImplementationOnce(() => ({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue({ data: updatedEvent, error: null })
      }));

      // Call the function
      const result = await eventService.updateEvent(eventId, updateData);

      // Assertions
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('events');
      expect(result.data).toEqual(updatedEvent);
      expect(result.error).toBeNull();
    });

    it('should validate event name length when updating', async () => {
      // Event name too long
      const eventId = 'event-123';
      const updateData = {
        event_name: 'X'.repeat(101) // Over 100 characters
      };

      // Call the function
      const result = await eventService.updateEvent(eventId, updateData);

      // Assertions
      expect(mockSupabaseClient.from).not.toHaveBeenCalled();
      expect(result.data).toBeNull();
      expect(result.error).toContain('cannot exceed 100 characters');
    });

    it('should validate date range when updating', async () => {
      // End date before start date
      const eventId = 'event-123';
      const updateData = {
        start_date: '2025-05-01T14:00:00Z', // Later
        end_date: '2025-05-01T10:00:00Z'    // Earlier
      };

      // Call the function
      const result = await eventService.updateEvent(eventId, updateData);

      // Assertions
      expect(mockSupabaseClient.from).not.toHaveBeenCalled();
      expect(result.data).toBeNull();
      expect(result.error).toContain('End date must be after start date');
    });

    it('should handle database errors when updating', async () => {
      // Valid update data
      const eventId = 'event-123';
      const updateData = {
        description: 'Updated description'
      };

      // Setup mock to throw error
      mockSupabaseClient.from.mockImplementationOnce(() => ({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockImplementation(() => {
          throw new Error('Database error');
        })
      }));

      // Call the function
      const result = await eventService.updateEvent(eventId, updateData);

      // Assertions
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('events');
      expect(result.data).toBeNull();
      expect(result.error).toBe('Database error');
    });
  });

  describe('deleteEvent', () => {
    it('should delete an event', async () => {
      // Mock event ID
      const eventId = 'event-123';

      // Setup mock for volunteer history deletion
      mockSupabaseClient.from.mockImplementationOnce(() => ({
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ data: null, error: null })
      }));

      // Setup mock for event deletion
      mockSupabaseClient.from.mockImplementationOnce(() => ({
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ data: null, error: null })
      }));

      // Call the function
      const result = await eventService.deleteEvent(eventId);

      // Assertions
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('volunteer_history');
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('events');
      expect(result.error).toBeNull();
    });

    it('should handle errors when deleting', async () => {
      // Mock event ID
      const eventId = 'event-123';

      // Setup mock to throw error during volunteer history deletion
      mockSupabaseClient.from.mockImplementationOnce(() => ({
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockImplementation(() => {
          throw new Error('Database error');
        })
      }));

      // Call the function
      const result = await eventService.deleteEvent(eventId);

      // Assertions
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('volunteer_history');
      expect(result.error).toBe('Database error');
    });
  });

  describe('updateEventStatus', () => {
    it('should update event status', async () => {
      // Mock event ID and status
      const eventId = 'event-123';
      const newStatus = 'InProgress';

      // Mock updated event
      const updatedEvent = {
        id: eventId,
        event_name: 'Event Name',
        status: 'InProgress',
        updated_at: '2025-03-22T14:00:00Z'
      };

      // Setup mock chain
      mockSupabaseClient.from.mockImplementationOnce(() => ({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue({ data: updatedEvent, error: null })
      }));

      // Call the function
      const result = await eventService.updateEventStatus(eventId, newStatus);

      // Assertions
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('events');
      expect(result.data).toEqual(updatedEvent);
      expect(result.error).toBeNull();
    });

    it('should validate status value', async () => {
      // Invalid status
      const eventId = 'event-123';
      const invalidStatus = 'NotAValidStatus';

      // Call the function
      const result = await eventService.updateEventStatus(eventId, invalidStatus);

      // Assertions
      expect(mockSupabaseClient.from).not.toHaveBeenCalled();
      expect(result.data).toBeNull();
      expect(result.error).toContain('Invalid status value');
    });
  });

  describe('findMatchingEvents', () => {
    it('should find and score events matching user skills', async () => {
      // Mock user ID
      const userId = 'user-123';

      // Mock user profile and skills
      const mockProfile = {
        preferences: ['Education', 'Environment']
      };

      const mockSkills = [
        { skill_name: 'Teaching' },
        { skill_name: 'Organizing' }
      ];

      // Mock events
      const mockEvents = [
        {
          id: 'event-1',
          event_name: 'Beach Cleanup',
          description: 'Help with Environment cleanup',
          required_skills: ['Organizing'],
          urgency: 'High',
          start_date: '2025-04-01T10:00:00Z',
          status: 'Planned'
        },
        {
          id: 'event-2',
          event_name: 'Tutoring',
          description: 'Teaching children',
          required_skills: ['Teaching'],
          urgency: 'Medium',
          start_date: '2025-04-15T14:00:00Z',
          status: 'Planned'
        }
      ];

      // Setup mock for profile query
      mockSupabaseClient.from.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockProfile, error: null })
      }));

      // Setup mock for skills query
      mockSupabaseClient.from.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ data: mockSkills, error: null })
      }));

      // Setup mock for events query
      mockSupabaseClient.from.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        in: jest.fn().mockReturnThis(),
        contains: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: mockEvents, error: null })
      }));

      // Call the function
      const result = await eventService.findMatchingEvents(userId);

      // Assertions
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('profiles');
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('user_skills');
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('events');
      
      // Expect scored events
      expect(result.data.length).toBe(2);
      expect(result.data[0]).toHaveProperty('matchScore');
      expect(result.data[1]).toHaveProperty('matchScore');
      expect(result.error).toBeNull();
    });

    it('should handle errors when finding matching events', async () => {
      // Mock user ID
      const userId = 'user-123';

      // Setup mock to throw error during profile query
      mockSupabaseClient.from.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockImplementation(() => {
          throw new Error('Profile not found');
        })
      }));

      // Call the function
      const result = await eventService.findMatchingEvents(userId);

      // Assertions
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('profiles');
      expect(result.data).toEqual([]);
      expect(result.error).toBe('Profile not found');
    });
  });

  describe('applyForEvent', () => {
    it('should apply for an event successfully', async () => {
      // Mock user ID and event ID
      const userId = 'user-123';
      const eventId = 'event-456';

      // Mock existing application check
      mockSupabaseClient.from.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null })
      }));

      // Mock event check
      mockSupabaseClient.from.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ 
          data: {
            id: eventId,
            event_name: 'Test Event',
            max_volunteers: 10,
            current_volunteers: 5,
            status: 'Planned'
          }, 
          error: null 
        })
      }));

      // Mock application creation
      mockSupabaseClient.from.mockImplementationOnce(() => ({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue({ 
          data: [{
            id: 'application-123',
            user_id: userId,
            event_id: eventId,
            status: 'Applied'
          }], 
          error: null 
        })
      }));

      // Mock event update (volunteer count)
      mockSupabaseClient.from.mockImplementationOnce(() => ({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ error: null })
      }));

      // Call the function
      const result = await eventService.applyForEvent(userId, eventId);

      // Assertions
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('volunteer_history');
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('events');
      expect(result.data).toBeDefined();
      expect(result.error).toBeNull();
    });

    it('should detect if user already applied', async () => {
      // Mock user ID and event ID
      const userId = 'user-123';
      const eventId = 'event-456';

      // Mock existing application
      mockSupabaseClient.from.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({ 
          data: {
            id: 'application-123',
            user_id: userId,
            event_id: eventId,
            status: 'Applied'
          }, 
          error: null 
        })
      }));

      // Call the function
      const result = await eventService.applyForEvent(userId, eventId);

      // Assertions
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('volunteer_history');
      expect(result.data).toBeDefined();
      expect(result.error).toContain('already applied');
    });

    it('should check if event exists', async () => {
      // Mock user ID and event ID
      const userId = 'user-123';
      const eventId = 'event-456';

      // Mock existing application check (none found)
      mockSupabaseClient.from.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null })
      }));

      // Mock event check - not found
      mockSupabaseClient.from.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: 'Event not found' })
      }));

      // Call the function
      const result = await eventService.applyForEvent(userId, eventId);

      // Assertions
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('volunteer_history');
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('events');
      expect(result.data).toBeNull();
      expect(result.error).toBe('Event not found');
    });

    it('should check event status before applying', async () => {
      // Mock user ID and event ID
      const userId = 'user-123';
      const eventId = 'event-456';

      // Mock existing application check (none found)
      mockSupabaseClient.from.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null })
      }));

      // Mock event check with Completed status
      mockSupabaseClient.from.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ 
          data: {
            id: eventId,
            event_name: 'Test Event',
            status: 'Completed' // Event has already happened
          }, 
          error: null 
        })
      }));

      // Call the function
      const result = await eventService.applyForEvent(userId, eventId);

      // Assertions
      expect(result.data).toBeNull();
      expect(result.error).toContain('no longer accepting volunteers');
    });

    it('should check volunteer capacity', async () => {
      // Mock user ID and event ID
      const userId = 'user-123';
      const eventId = 'event-456';

      // Mock existing application check (none found)
      mockSupabaseClient.from.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null })
      }));

      // Mock event check at capacity
      mockSupabaseClient.from.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ 
          data: {
            id: eventId,
            event_name: 'Test Event',
            max_volunteers: 10,
            current_volunteers: 10, // At capacity
            status: 'Planned'
          }, 
          error: null 
        })
      }));

      // Call the function
      const result = await eventService.applyForEvent(userId, eventId);

      // Assertions
      expect(result.data).toBeNull();
      expect(result.error).toContain('maximum volunteer capacity');
    });
  });
});
