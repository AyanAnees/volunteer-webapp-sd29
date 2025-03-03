const {
  mockSupabaseClient,
  resetSupabaseMocks,
  configureSupabaseForSuccessfulAuth
} = require('../mocks/supabase');

// Mock the Supabase client
jest.mock('../../server/config/supabase', () => mockSupabaseClient);

// Import the service after mocking dependencies
const historyService = require('../../server/services/historyService');

describe('History Service', () => {
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
      order: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockReturnThis()
    }));
  });

  describe('getUserHistory', () => {
    it('should return history for a specific user', async () => {
      // Mock userId
      const userId = 'user-123';

      // Mock history data
      const mockHistory = [
        {
          id: 'history-1',
          status: 'Participated',
          hours_logged: 4.5,
          event: {
            id: 'event-1',
            event_name: 'Beach Cleanup',
            start_date: '2025-03-15T09:00:00Z'
          }
        },
        {
          id: 'history-2',
          status: 'Applied',
          event: {
            id: 'event-2',
            event_name: 'Food Drive',
            start_date: '2025-04-01T10:00:00Z'
          }
        }
      ];

      // Setup mock chain
      mockSupabaseClient.from.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: mockHistory, error: null })
      }));

      // Call the function
      const result = await historyService.getUserHistory(userId);

      // Assertions
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('volunteer_history');
      expect(result.data).toEqual(mockHistory);
      expect(result.error).toBeNull();
    });

    it('should handle database errors', async () => {
      // Setup mock to throw error
      mockSupabaseClient.from.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockImplementation(() => {
          throw new Error('Database error');
        })
      }));

      // Call the function
      const result = await historyService.getUserHistory('user-123');

      // Assertions
      expect(result.data).toBeNull();
      expect(result.error).toBe('Database error');
    });
  });

  describe('getEventVolunteers', () => {
    it('should return volunteers for a specific event', async () => {
      // Mock eventId
      const eventId = 'event-123';

      // Mock volunteers data
      const mockVolunteers = [
        {
          id: 'history-1',
          status: 'Accepted',
          user: {
            id: 'user-1',
            full_name: 'John Doe'
          }
        },
        {
          id: 'history-2',
          status: 'Applied',
          user: {
            id: 'user-2',
            full_name: 'Jane Smith'
          }
        }
      ];

      // Setup mock chain
      mockSupabaseClient.from.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: mockVolunteers, error: null })
      }));

      // Call the function
      const result = await historyService.getEventVolunteers(eventId);

      // Assertions
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('volunteer_history');
      expect(result.data).toEqual(mockVolunteers);
      expect(result.error).toBeNull();
    });

    it('should handle database errors', async () => {
      // Setup mock to throw error
      mockSupabaseClient.from.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockImplementation(() => {
          throw new Error('Database error');
        })
      }));

      // Call the function
      const result = await historyService.getEventVolunteers('event-123');

      // Assertions
      expect(result.data).toBeNull();
      expect(result.error).toBe('Database error');
    });
  });

  describe('applyForEvent', () => {
    it('should apply for an event successfully', async () => {
      // Mock user and event IDs
      const userId = 'user-123';
      const eventId = 'event-456';

      // Mock created application
      const mockApplication = {
        id: 'history-789',
        user_id: userId,
        event_id: eventId,
        status: 'Applied'
      };

      // Setup mocks for checking existing application
      mockSupabaseClient.from.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null })
      }));

      // Setup mock for getting event
      mockSupabaseClient.from.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: {
            id: eventId,
            event_name: 'Test Event',
            status: 'Planned',
            max_volunteers: 10,
            current_volunteers: 5
          },
          error: null
        })
      }));

      // Setup mock for creating application
      mockSupabaseClient.from.mockImplementationOnce(() => ({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue({ data: [mockApplication], error: null })
      }));

      // Setup mock for updating event
      mockSupabaseClient.from.mockImplementationOnce(() => ({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ data: null, error: null })
      }));

      // Call the function
      const result = await historyService.applyForEvent(userId, eventId);

      // Assertions
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('volunteer_history');
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('events');
      expect(result.data).toEqual(mockApplication);
      expect(result.error).toBeNull();
    });

    it('should detect if user already applied', async () => {
      // Mock user and event IDs
      const userId = 'user-123';
      const eventId = 'event-456';

      // Mock existing application
      const existingApplication = {
        id: 'history-789',
        user_id: userId,
        event_id: eventId,
        status: 'Applied'
      };

      // Setup mock for checking existing application
      mockSupabaseClient.from.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({
          data: existingApplication,
          error: null
        })
      }));

      // Call the function
      const result = await historyService.applyForEvent(userId, eventId);

      // Assertions
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('volunteer_history');
      expect(result.data).toEqual(existingApplication);
      expect(result.error).toContain('already applied');
    });

    it('should check if event exists', async () => {
      // Mock user and event IDs
      const userId = 'user-123';
      const eventId = 'non-existent-event';

      // Setup mock for checking existing application
      mockSupabaseClient.from.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null })
      }));

      // Setup mock for getting event - simulate event not found
      mockSupabaseClient.from.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockImplementation(() => {
          throw new Error('Event not found');
        })
      }));

      // Call the function
      const result = await historyService.applyForEvent(userId, eventId);

      // Assertions
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('volunteer_history');
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('events');
      expect(result.data).toBeNull();
      expect(result.error).toBe('Event not found');
    });

    it('should check event status', async () => {
      // Mock user and event IDs
      const userId = 'user-123';
      const eventId = 'completed-event';

      // Setup mock for checking existing application
      mockSupabaseClient.from.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null })
      }));

      // Setup mock for getting event with Completed status
      mockSupabaseClient.from.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: {
            id: eventId,
            event_name: 'Completed Event',
            status: 'Completed',
            max_volunteers: 10,
            current_volunteers: 5
          },
          error: null
        })
      }));

      // Call the function
      const result = await historyService.applyForEvent(userId, eventId);

      // Assertions
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('volunteer_history');
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('events');
      expect(result.data).toBeNull();
      expect(result.error).toContain('no longer accepting volunteers');
    });

    it('should check volunteer capacity', async () => {
      // Mock user and event IDs
      const userId = 'user-123';
      const eventId = 'full-event';

      // Setup mock for checking existing application
      mockSupabaseClient.from.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null })
      }));

      // Setup mock for getting event at capacity
      mockSupabaseClient.from.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: {
            id: eventId,
            event_name: 'Full Event',
            status: 'Planned',
            max_volunteers: 10,
            current_volunteers: 10 // At capacity
          },
          error: null
        })
      }));

      // Call the function
      const result = await historyService.applyForEvent(userId, eventId);

      // Assertions
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('volunteer_history');
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('events');
      expect(result.data).toBeNull();
      expect(result.error).toContain('maximum volunteer capacity');
    });
  });

  describe('updateApplicationStatus', () => {
    it('should update application status', async () => {
      // Mock application ID and status
      const applicationId = 'history-123';
      const newStatus = 'Accepted';

      // Mock updated application
      const updatedApplication = {
        id: applicationId,
        status: newStatus,
        updated_at: '2025-03-22T14:00:00Z'
      };

      // Setup mock chain
      mockSupabaseClient.from.mockImplementationOnce(() => ({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue({ data: [updatedApplication], error: null })
      }));

      // Call the function
      const result = await historyService.updateApplicationStatus(applicationId, newStatus);

      // Assertions
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('volunteer_history');
      expect(result.data).toEqual(updatedApplication);
      expect(result.error).toBeNull();
    });

    it('should validate status value', async () => {
      // Invalid status
      const applicationId = 'history-123';
      const invalidStatus = 'NotAValidStatus';

      // Call the function
      const result = await historyService.updateApplicationStatus(applicationId, invalidStatus);

      // Assertions
      expect(mockSupabaseClient.from).not.toHaveBeenCalled();
      expect(result.data).toBeNull();
      expect(result.error).toContain('Invalid status value');
    });

    it('should handle application not found', async () => {
      // Mock application ID and status
      const applicationId = 'non-existent';
      const newStatus = 'Accepted';

      // Setup mock to return empty data
      mockSupabaseClient.from.mockImplementationOnce(() => ({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue({ data: [], error: null })
      }));

      // Call the function
      const result = await historyService.updateApplicationStatus(applicationId, newStatus);

      // Assertions
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('volunteer_history');
      expect(result.data).toBeNull();
      expect(result.error).toContain('Application not found');
    });

    it('should handle database errors', async () => {
      // Mock application ID and status
      const applicationId = 'history-123';
      const newStatus = 'Accepted';

      // Setup mock to throw error
      mockSupabaseClient.from.mockImplementationOnce(() => ({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockImplementation(() => {
          throw new Error('Database error');
        })
      }));

      // Call the function
      const result = await historyService.updateApplicationStatus(applicationId, newStatus);

      // Assertions
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('volunteer_history');
      expect(result.data).toBeNull();
      expect(result.error).toBe('Database error');
    });
  });

  describe('logVolunteerHours', () => {
    it('should log hours successfully', async () => {
      // Mock application ID and hours
      const applicationId = 'history-123';
      const hours = 4.5;

      // Mock updated application
      const updatedApplication = {
        id: applicationId,
        hours_logged: hours,
        status: 'Participated',
        updated_at: '2025-03-22T14:00:00Z'
      };

      // Setup mock chain
      mockSupabaseClient.from.mockImplementationOnce(() => ({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue({ data: [updatedApplication], error: null })
      }));

      // Call the function
      const result = await historyService.logVolunteerHours(applicationId, hours);

      // Assertions
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('volunteer_history');
      expect(result.data).toEqual(updatedApplication);
      expect(result.error).toBeNull();
    });

    it('should handle application not found', async () => {
      // Mock application ID and hours
      const applicationId = 'non-existent';
      const hours = 4.5;

      // Setup mock to return empty data
      mockSupabaseClient.from.mockImplementationOnce(() => ({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue({ data: [], error: null })
      }));

      // Call the function
      const result = await historyService.logVolunteerHours(applicationId, hours);

      // Assertions
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('volunteer_history');
      expect(result.data).toBeNull();
      expect(result.error).toContain('Application not found');
    });

    it('should handle database errors', async () => {
      // Mock application ID and hours
      const applicationId = 'history-123';
      const hours = 4.5;

      // Setup mock to throw error
      mockSupabaseClient.from.mockImplementationOnce(() => ({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockImplementation(() => {
          throw new Error('Database error');
        })
      }));

      // Call the function
      const result = await historyService.logVolunteerHours(applicationId, hours);

      // Assertions
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('volunteer_history');
      expect(result.data).toBeNull();
      expect(result.error).toBe('Database error');
    });
  });

  describe('addFeedback', () => {
    it('should add feedback and rating successfully', async () => {
      // Mock application ID, feedback, and rating
      const applicationId = 'history-123';
      const feedback = 'Great volunteer experience!';
      const rating = 5;

      // Mock updated application
      const updatedApplication = {
        id: applicationId,
        feedback,
        rating,
        updated_at: '2025-03-22T14:00:00Z'
      };

      // Setup mock chain
      mockSupabaseClient.from.mockImplementationOnce(() => ({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue({ data: [updatedApplication], error: null })
      }));

      // Call the function
      const result = await historyService.addFeedback(applicationId, feedback, rating);

      // Assertions
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('volunteer_history');
      expect(result.data).toEqual(updatedApplication);
      expect(result.error).toBeNull();
    });

    it('should validate rating value', async () => {
      // Invalid rating
      const applicationId = 'history-123';
      const feedback = 'Test feedback';
      const invalidRating = 6; // Rating should be 1-5

      // Call the function
      const result = await historyService.addFeedback(applicationId, feedback, invalidRating);

      // Assertions
      expect(mockSupabaseClient.from).not.toHaveBeenCalled();
      expect(result.data).toBeNull();
      expect(result.error).toContain('Rating must be between 1 and 5');
    });

    it('should handle application not found', async () => {
      // Mock application ID, feedback, and rating
      const applicationId = 'non-existent';
      const feedback = 'Test feedback';
      const rating = 4;

      // Setup mock to return empty data
      mockSupabaseClient.from.mockImplementationOnce(() => ({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue({ data: [], error: null })
      }));

      // Call the function
      const result = await historyService.addFeedback(applicationId, feedback, rating);

      // Assertions
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('volunteer_history');
      expect(result.data).toBeNull();
      expect(result.error).toContain('Application not found');
    });

    it('should handle database errors', async () => {
      // Mock application ID, feedback, and rating
      const applicationId = 'history-123';
      const feedback = 'Test feedback';
      const rating = 4;

      // Setup mock to throw error
      mockSupabaseClient.from.mockImplementationOnce(() => ({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockImplementation(() => {
          throw new Error('Database error');
        })
      }));

      // Call the function
      const result = await historyService.addFeedback(applicationId, feedback, rating);

      // Assertions
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('volunteer_history');
      expect(result.data).toBeNull();
      expect(result.error).toBe('Database error');
    });
  });
});
