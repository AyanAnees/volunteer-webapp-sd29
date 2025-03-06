const logsRoutes = require('../../server/routes/logs');
const supabase = require('../../server/config/supabase');
const { mockRequest, mockResponse, mockNext } = require('../mocks/express');

// Mock the supabase client
jest.mock('../../server/config/supabase', () => ({
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis()
}));

// Spy on console.log to verify logging
console.log = jest.fn();
console.error = jest.fn();

describe('Logs Routes', () => {
  let req, res;
  
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Create fresh request and response objects
    req = mockRequest();
    res = mockResponse();
  });

  describe('GET /api/logs', () => {
    it('should return all logs', async () => {
      // Find the route handler
      const getLogsRoute = findRouteHandler(logsRoutes.stack, 'get', '/');
      
      // Act
      await getLogsRoute(req, res);
      
      // Assert
      expect(res.json).toHaveBeenCalled();
      // The logs array starts empty in our test environment
      expect(res.json.mock.calls[0][0]).toEqual([]);
    });
  });

  describe('POST /api/logs', () => {
    it('should add a log', async () => {
      // Arrange
      req.body = {
        message: 'Test log message',
        data: { test: 'data' }
      };
      
      // Find the route handler
      const addLogRoute = findRouteHandler(logsRoutes.stack, 'post', '/');
      
      // Act
      await addLogRoute(req, res);
      
      // Assert
      expect(console.log).toHaveBeenCalledWith('[CLIENT LOG] Test log message', { test: 'data' });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ success: true });
      
      // Check that log was stored by getting logs again
      const getLogsRoute = findRouteHandler(logsRoutes.stack, 'get', '/');
      await getLogsRoute(req, res);
      
      // Now logs array should have our test log
      const returnedLogs = res.json.mock.calls[1][0];
      expect(returnedLogs.length).toBe(1);
      expect(returnedLogs[0].message).toBe('Test log message');
      expect(returnedLogs[0].data).toEqual({ test: 'data' });
    });

    it('should limit logs to the latest 100', async () => {
      // Arrange - mock route handler
      const addLogRoute = findRouteHandler(logsRoutes.stack, 'post', '/');
      
      // Add 101 logs
      for (let i = 0; i < 101; i++) {
        req.body = {
          message: `Log ${i}`,
          data: { index: i }
        };
        await addLogRoute(req, res);
      }
      
      // Get logs
      const getLogsRoute = findRouteHandler(logsRoutes.stack, 'get', '/');
      await getLogsRoute(req, res);
      
      // Assert
      const returnedLogs = res.json.mock.calls[101][0];
      expect(returnedLogs.length).toBe(100); // Should be capped at 100
      expect(returnedLogs[0].message).toBe('Log 1'); // First log (Log 0) should be removed
      expect(returnedLogs[99].message).toBe('Log 100'); // Last log should be Log 100
    });
  });

  describe('DELETE /api/logs', () => {
    it('should clear all logs', async () => {
      // Arrange - add a log first
      const addLogRoute = findRouteHandler(logsRoutes.stack, 'post', '/');
      req.body = {
        message: 'Test log',
        data: { test: true }
      };
      await addLogRoute(req, res);
      
      // Clear logs
      const clearLogsRoute = findRouteHandler(logsRoutes.stack, 'delete', '/');
      await clearLogsRoute(req, res);
      
      // Assert
      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Logs cleared' });
      
      // Verify logs are cleared
      const getLogsRoute = findRouteHandler(logsRoutes.stack, 'get', '/');
      await getLogsRoute(req, res);
      
      const returnedLogs = res.json.mock.calls[2][0];
      expect(returnedLogs.length).toBe(0);
    });
  });

  describe('GET /api/logs/all-events', () => {
    it('should get all events from database', async () => {
      // Arrange
      const mockEvents = [
        { id: 'event-1', event_name: 'Event 1' },
        { id: 'event-2', event_name: 'Event 2' }
      ];
      
      // Mock Supabase response
      supabase.from.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: mockEvents,
          error: null
        })
      }));
      
      // Find the route handler
      const getAllEventsRoute = findRouteHandler(logsRoutes.stack, 'get', '/all-events');
      
      // Act
      await getAllEventsRoute(req, res);
      
      // Assert
      expect(supabase.from).toHaveBeenCalledWith('events');
      expect(res.json).toHaveBeenCalledWith(mockEvents);
    });

    it('should handle database errors', async () => {
      // Arrange
      // Mock Supabase error response
      supabase.from.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database error' }
        })
      }));
      
      // Find the route handler
      const getAllEventsRoute = findRouteHandler(logsRoutes.stack, 'get', '/all-events');
      
      // Act
      await getAllEventsRoute(req, res);
      
      // Assert
      expect(supabase.from).toHaveBeenCalledWith('events');
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Database error' });
    });

    it('should handle server errors', async () => {
      // Arrange
      // Mock Supabase to throw error
      supabase.from.mockImplementationOnce(() => {
        throw new Error('Server error');
      });
      
      // Find the route handler
      const getAllEventsRoute = findRouteHandler(logsRoutes.stack, 'get', '/all-events');
      
      // Act
      await getAllEventsRoute(req, res);
      
      // Assert
      expect(supabase.from).toHaveBeenCalledWith('events');
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Server error' });
    });
  });

  describe('GET /api/logs/check-profile/:userId', () => {
    it('should get user profile', async () => {
      // Arrange
      req.params = { userId: 'user-123' };
      
      const mockProfile = {
        id: 'user-123',
        full_name: 'Test User',
        email: 'test@example.com'
      };
      
      // Mock Supabase response
      supabase.from.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: [mockProfile],
          error: null
        })
      }));
      
      // Find the route handler
      const checkProfileRoute = findRouteHandler(logsRoutes.stack, 'get', '/check-profile/:userId');
      
      // Act
      await checkProfileRoute(req, res);
      
      // Assert
      expect(supabase.from).toHaveBeenCalledWith('profiles');
      expect(res.json).toHaveBeenCalledWith(mockProfile);
    });

    it('should return 404 if profile not found', async () => {
      // Arrange
      req.params = { userId: 'non-existent-user' };
      
      // Mock Supabase response - empty data
      supabase.from.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: [],
          error: null
        })
      }));
      
      // Find the route handler
      const checkProfileRoute = findRouteHandler(logsRoutes.stack, 'get', '/check-profile/:userId');
      
      // Act
      await checkProfileRoute(req, res);
      
      // Assert
      expect(supabase.from).toHaveBeenCalledWith('profiles');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Profile not found' });
    });

    it('should handle database errors', async () => {
      // Arrange
      req.params = { userId: 'user-123' };
      
      // Mock Supabase error response
      supabase.from.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database error' }
        })
      }));
      
      // Find the route handler
      const checkProfileRoute = findRouteHandler(logsRoutes.stack, 'get', '/check-profile/:userId');
      
      // Act
      await checkProfileRoute(req, res);
      
      // Assert
      expect(supabase.from).toHaveBeenCalledWith('profiles');
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Database error' });
    });

    it('should handle server errors', async () => {
      // Arrange
      req.params = { userId: 'user-123' };
      
      // Mock Supabase to throw error
      supabase.from.mockImplementationOnce(() => {
        throw new Error('Server error');
      });
      
      // Find the route handler
      const checkProfileRoute = findRouteHandler(logsRoutes.stack, 'get', '/check-profile/:userId');
      
      // Act
      await checkProfileRoute(req, res);
      
      // Assert
      expect(supabase.from).toHaveBeenCalledWith('profiles');
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Server error' });
    });
  });
});

// Helper function to find a specific route handler in the routes stack
function findRouteHandler(stack, method, path) {
  const route = stack.find(layer => {
    if (!layer.route) return false;
    return layer.route.path === path && layer.route.methods[method.toLowerCase()];
  });
  
  if (!route) {
    throw new Error(`Route handler not found for ${method} ${path}`);
  }
  
  return route.route.stack[0].handle;
}
