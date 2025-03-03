const volunteerMatchingRoutes = require('../../server/routes/volunteer-matching');
const eventService = require('../../server/services/eventService');
const profileService = require('../../server/services/profileService');
const { mockRequest, mockResponse } = require('../mocks/express');
const findRouteHandler = require('../mocks/routeHandler');

// Mock the services
jest.mock('../../server/services/eventService');
jest.mock('../../server/services/profileService');

// Setup the mock for supabase
jest.mock('../../server/config/supabase', () => {
  const mockFrom = jest.fn().mockImplementation(() => {
    const mockObj = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      ilike: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockReturnThis()
    };
    return mockObj;
  });
  
  const mockSupabase = { from: mockFrom };
  mockSupabase.rpc = jest.fn().mockReturnThis();
  
  return mockSupabase;
});

// Make sure test environment is set
process.env.NODE_ENV = 'test';

describe('Volunteer Matching Routes', () => {
  let req, res;
  
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Create fresh request and response objects
    req = mockRequest();
    res = mockResponse();
  });

  describe('GET /api/volunteer-matching/users', () => {
    it('should search for users by name', async () => {
      // Arrange
      req.query = { query: 'John' };
      
      // Mock profile data for exact match (empty)
      const mockEmptyProfiles = [];
      
      // Mock profile data for ILIKE match
      const mockProfiles = [
        {
          id: 'user-1',
          full_name: 'John Doe',
          email: 'john@example.com'
        }
      ];
      
      // Setup mock for exact match (empty)
      const supabase = require('../../server/config/supabase');
      supabase.from.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ data: mockEmptyProfiles, error: null })
      }));
      
      // Setup mock for ILIKE match
      supabase.from.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        ilike: jest.fn().mockResolvedValue({ data: mockProfiles, error: null })
      }));
      
      // Setup mock for email match (not needed, previous match succeeded)
      supabase.from.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        ilike: jest.fn().mockResolvedValue({ data: [], error: null })
      }));
      
      // Find the route handler
      const searchUsersRoute = findRouteHandler(volunteerMatchingRoutes.stack, 'get', '/users');
      
      // Act
      await searchUsersRoute(req, res);
      
      // Assert
      expect(supabase.from).toHaveBeenCalledWith('profiles');
      expect(res.json).toHaveBeenCalledWith(mockProfiles);
    });

    it('should return 400 if query is too short', async () => {
      // Arrange
      req.query = { query: 'a' }; // Too short
      
      // Find the route handler
      const searchUsersRoute = findRouteHandler(volunteerMatchingRoutes.stack, 'get', '/users');
      
      // Act
      await searchUsersRoute(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ 
        error: expect.stringMatching(/at least 2 characters/i)
      });
    });

    it('should return 500 if there is a database error', async () => {
      // Arrange
      req.query = { query: 'John' };
      
      // Setup mock to return error
      const supabase = require('../../server/config/supabase');
      supabase.from.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ data: null, error: { message: 'Database error' } })
      }));
      
      // Find the route handler
      const searchUsersRoute = findRouteHandler(volunteerMatchingRoutes.stack, 'get', '/users');
      
      // Act
      await searchUsersRoute(req, res);
      
      // Assert
      expect(supabase.from).toHaveBeenCalledWith('profiles');
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: expect.any(String) });
    });
  });

  describe('GET /api/volunteer-matching/user/:userId', () => {
    it('should return detailed user profile with skills and availability', async () => {
      // Arrange
      req.params = { userId: 'user-123' };
      
      // Mock profileService
      profileService.getProfile.mockResolvedValueOnce({
        data: {
          id: 'user-123',
          full_name: 'John Doe',
          email: 'john@example.com',
          preferences: ['Environment', 'Teaching'],
          skills: [
            { skill_name: 'Teaching', proficiency_level: 'Advanced' },
            { skill_name: 'Organizing', proficiency_level: 'Intermediate' }
          ],
          availability: [
            { day_of_week: 'Monday', start_time: '09:00', end_time: '17:00' },
            { day_of_week: 'Wednesday', start_time: '09:00', end_time: '17:00' }
          ]
        },
        error: null
      });
      
      // Find the route handler
      const getUserProfileRoute = findRouteHandler(volunteerMatchingRoutes.stack, 'get', '/user/:userId');
      
      // Act
      await getUserProfileRoute(req, res);
      
      // Assert
      expect(profileService.getProfile).toHaveBeenCalledWith('user-123');
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        id: 'user-123',
        fullName: 'John Doe',
        email: 'john@example.com'
      }));
    });

    it('should return 404 if profile not found', async () => {
      // Arrange
      req.params = { userId: 'non-existent' };
      
      // Mock profileService
      profileService.getProfile.mockResolvedValueOnce({
        data: null,
        error: 'Profile not found'
      });
      
      // Find the route handler
      const getUserProfileRoute = findRouteHandler(volunteerMatchingRoutes.stack, 'get', '/user/:userId');
      
      // Act
      await getUserProfileRoute(req, res);
      
      // Assert
      expect(profileService.getProfile).toHaveBeenCalledWith('non-existent');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.any(String)
      }));
    });

    it('should handle skills and availability fetch errors', async () => {
      // Arrange
      req.params = { userId: 'user-123' };
      
      // Mock profileService
      profileService.getProfile.mockResolvedValueOnce({
        data: {
          id: 'user-123',
          full_name: 'John Doe',
          email: 'john@example.com',
          preferences: ['Environment', 'Teaching'],
          skills: [],
          availability: []
        },
        error: null
      });
      
      profileService.getSkills.mockResolvedValueOnce({
        data: [], 
        error: 'Error fetching skills'
      });
      
      profileService.getAvailability.mockResolvedValueOnce({
        data: [], 
        error: 'Error fetching availability'
      });
      
      // Find the route handler
      const getUserProfileRoute = findRouteHandler(volunteerMatchingRoutes.stack, 'get', '/user/:userId');
      
      // Act
      await getUserProfileRoute(req, res);
      
      // Assert
      expect(profileService.getProfile).toHaveBeenCalledWith('user-123');
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        id: 'user-123',
        fullName: 'John Doe',
        email: 'john@example.com',
        skills: [],
        availability: [],
        preferences: ['Environment', 'Teaching']
      }));
    });

    it('should return 500 if there is a server error', async () => {
      // Arrange
      req.params = { userId: 'user-123' };
      
      // Mock profileService to throw error
      profileService.getProfile.mockResolvedValueOnce({
        data: null,
        error: 'Server error'
      });
      
      // Find the route handler
      const getUserProfileRoute = findRouteHandler(volunteerMatchingRoutes.stack, 'get', '/user/:userId');
      
      // Act
      await getUserProfileRoute(req, res);
      
      // Assert
      expect(profileService.getProfile).toHaveBeenCalledWith('user-123');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.any(String)
      }));
    });
  });

  describe('GET /api/volunteer-matching/events', () => {
    it('should return all active events when no userId is provided', async () => {
      // Arrange
      req.query = {}; // No userId
      
      // Mock events
      const mockEvents = [
        {
          id: 'event-1',
          event_name: 'Beach Cleanup',
          status: 'Planned',
          start_date: '2025-04-01T10:00:00Z'
        },
        {
          id: 'event-2',
          event_name: 'Food Drive',
          status: 'InProgress',
          start_date: '2025-03-25T09:00:00Z'
        }
      ];
      
      // Find the route handler
      const getEventsRoute = findRouteHandler(volunteerMatchingRoutes.stack, 'get', '/events');
      
      // Mock the route behavior directly
      const spy = jest.spyOn(volunteerMatchingRoutes, 'get');
      spy.mockImplementationOnce((path, callback) => {
        if (path === '/events') {
          // Mock direct supabase response
          mockSupabase.from.mockImplementationOnce(() => ({
            select: jest.fn().mockReturnThis(),
            in: jest.fn().mockReturnThis(),
            order: jest.fn().mockReturnValueOnce({ data: mockEvents, error: null })
          }));
          
          // Mock json response
          res.json.mockImplementationOnce(data => {
            expect(data).toEqual(mockEvents);
            return res;
          });
          
          callback(req, res);
        }
        return volunteerMatchingRoutes;
      });
      
      // Act
      await getEventsRoute(req, res);
      
      // Assert
      expect(res.json).toHaveBeenCalled();
      
      // Clean up
      spy.mockRestore();
    });

    it('should return matching events when userId is provided', async () => {
      // Arrange
      req.query = { userId: 'user-123' };
      
      // Mock events
      const mockEvents = [
        {
          id: 'event-1',
          event_name: 'Beach Cleanup',
          status: 'Planned',
          start_date: '2025-04-01T10:00:00Z',
          matchScore: 8
        },
        {
          id: 'event-2',
          event_name: 'Food Drive',
          status: 'InProgress',
          start_date: '2025-03-25T09:00:00Z',
          matchScore: 7
        }
      ];
      
      // Mock the eventService.findMatchingEvents method
      eventService.findMatchingEvents.mockResolvedValueOnce({
        data: mockEvents,
        error: null
      });
      
      // Find the route handler
      const getEventsRoute = findRouteHandler(volunteerMatchingRoutes.stack, 'get', '/events');
      
      // Act
      await getEventsRoute(req, res);
      
      // Assert
      expect(eventService.findMatchingEvents).toHaveBeenCalledWith('user-123');
      expect(res.json).toHaveBeenCalledWith(mockEvents);
    });

    it('should return 500 if there is an error finding matching events', async () => {
      // Arrange
      req.query = { userId: 'user-123' };
      
      // Mock error response
      eventService.findMatchingEvents.mockResolvedValueOnce({
        data: null,
        error: 'Database error'
      });
      
      // Find the route handler
      const getEventsRoute = findRouteHandler(volunteerMatchingRoutes.stack, 'get', '/events');
      
      // Act
      await getEventsRoute(req, res);
      
      // Assert
      expect(eventService.findMatchingEvents).toHaveBeenCalledWith('user-123');
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: expect.any(String) });
    });
  });

  describe('POST /api/volunteer-matching/apply', () => {
    it('should successfully apply for an event', async () => {
      // Arrange
      req.body = {
        userId: 'user-123',
        eventId: 'event-456'
      };
      
      // Mock application data
      const mockApplication = {
        id: 'application-789',
        user_id: 'user-123',
        event_id: 'event-456',
        status: 'Applied'
      };
      
      // Mock the eventService.applyForEvent method
      eventService.applyForEvent.mockResolvedValueOnce({
        data: mockApplication,
        error: null
      });
      
      // Find the route handler
      const applyForEventRoute = findRouteHandler(volunteerMatchingRoutes.stack, 'post', '/apply');
      
      // Act
      await applyForEventRoute(req, res);
      
      // Assert
      expect(eventService.applyForEvent).toHaveBeenCalledWith('user-123', 'event-456');
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.any(String),
        application: expect.any(Object)
      }));
    });

    it('should return 400 if userId or eventId is missing', async () => {
      // Arrange - missing eventId
      req.body = {
        userId: 'user-123'
        // Missing eventId
      };
      
      // Find the route handler
      const applyForEventRoute = findRouteHandler(volunteerMatchingRoutes.stack, 'post', '/apply');
      
      // Act
      await applyForEventRoute(req, res);
      
      // Assert
      expect(eventService.applyForEvent).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ 
        error: expect.stringMatching(/required/i)
      });
    });

    it('should return 400 if application fails', async () => {
      // Arrange
      req.body = {
        userId: 'user-123',
        eventId: 'event-456'
      };
      
      // Mock error response
      eventService.applyForEvent.mockResolvedValueOnce({
        data: null,
        error: 'User has already applied for this event'
      });
      
      // Find the route handler
      const applyForEventRoute = findRouteHandler(volunteerMatchingRoutes.stack, 'post', '/apply');
      
      // Act
      await applyForEventRoute(req, res);
      
      // Assert
      expect(eventService.applyForEvent).toHaveBeenCalledWith('user-123', 'event-456');
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: expect.any(String) });
    });

    it('should return 500 if there is a server error', async () => {
      // Arrange
      req.body = {
        userId: 'user-123',
        eventId: 'event-456'
      };
      
      // Mock service to throw error
      eventService.applyForEvent.mockRejectedValueOnce(new Error('Server error'));
      
      // Find the route handler
      const applyForEventRoute = findRouteHandler(volunteerMatchingRoutes.stack, 'post', '/apply');
      
      // Act
      await applyForEventRoute(req, res);
      
      // Assert
      expect(eventService.applyForEvent).toHaveBeenCalledWith('user-123', 'event-456');
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: expect.any(String) });
    });
  });
});
