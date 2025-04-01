const historyRoutes = require('../../server/routes/history');
const volunteerHistoryService = require('../../server/services/volunteerHistoryService');
const { mockRequest, mockResponse } = require('../mocks/express');
const findRouteHandler = require('../mocks/routeHandler');

// Mock the volunteerHistoryService
jest.mock('../../server/services/volunteerHistoryService');

describe('History Routes', () => {
  let req, res;
  
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Create fresh request and response objects
    req = mockRequest();
    res = mockResponse();
  });

  describe('GET /api/history/user/:userId', () => {
    it('should return volunteer history for a user', async () => {
      // Arrange
      req.params = { userId: 'user-123' };
      
      // Mock history data
      const mockHistory = [
        {
          id: 'history-1',
          event_id: 'event-1',
          user_id: 'user-123',
          status: 'Participated',
          hours_logged: 4.5,
          events: {
            event_name: 'Beach Cleanup',
            start_date: '2025-03-15T09:00:00Z'
          }
        },
        {
          id: 'history-2',
          event_id: 'event-2',
          user_id: 'user-123',
          status: 'Applied',
          events: {
            event_name: 'Food Drive',
            start_date: '2025-04-01T10:00:00Z'
          }
        }
      ];
      
      // Mock the volunteerHistoryService.getUserHistory method
      volunteerHistoryService.getUserHistory.mockResolvedValueOnce({
        data: mockHistory,
        error: null
      });
      
      // Find the route handler
      const getUserHistoryRoute = findRouteHandler(historyRoutes.stack, 'get', '/user/:userId');
      
      // Act
      await getUserHistoryRoute(req, res);
      
      // Assert
      expect(volunteerHistoryService.getUserHistory).toHaveBeenCalledWith('user-123');
      expect(res.json).toHaveBeenCalledWith(mockHistory);
    });

    it('should return 400 if there is an error', async () => {
      // Arrange
      req.params = { userId: 'user-123' };
      
      // Mock error response
      volunteerHistoryService.getUserHistory.mockResolvedValueOnce({
        data: null,
        error: 'Database error'
      });
      
      // Find the route handler
      const getUserHistoryRoute = findRouteHandler(historyRoutes.stack, 'get', '/user/:userId');
      
      // Act
      await getUserHistoryRoute(req, res);
      
      // Assert
      expect(volunteerHistoryService.getUserHistory).toHaveBeenCalledWith('user-123');
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Database error' });
    });

    it('should return 500 if there is a server error', async () => {
      // Arrange
      req.params = { userId: 'user-123' };
      
      // Mock service to throw error
      volunteerHistoryService.getUserHistory.mockRejectedValueOnce(new Error('Server error'));
      
      // Find the route handler
      const getUserHistoryRoute = findRouteHandler(historyRoutes.stack, 'get', '/user/:userId');
      
      // Act
      await getUserHistoryRoute(req, res);
      
      // Assert
      expect(volunteerHistoryService.getUserHistory).toHaveBeenCalledWith('user-123');
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: expect.any(String) });
    });
  });

  describe('GET /api/history/event/:eventId', () => {
    it('should return volunteers for an event', async () => {
      // Arrange
      req.params = { eventId: 'event-123' };
      
      // Mock volunteer data
      const mockVolunteers = [
        {
          id: 'history-1',
          user_id: 'user-1',
          status: 'Accepted',
          profiles: {
            full_name: 'John Doe'
          }
        },
        {
          id: 'history-2',
          user_id: 'user-2',
          status: 'Applied',
          profiles: {
            full_name: 'Jane Smith'
          }
        }
      ];
      
      // Mock the volunteerHistoryService.getEventVolunteers method
      volunteerHistoryService.getEventVolunteers.mockResolvedValueOnce({
        data: mockVolunteers,
        error: null
      });
      
      // Find the route handler
      const getEventVolunteersRoute = findRouteHandler(historyRoutes.stack, 'get', '/event/:eventId');
      
      // Act
      await getEventVolunteersRoute(req, res);
      
      // Assert
      expect(volunteerHistoryService.getEventVolunteers).toHaveBeenCalledWith('event-123');
      expect(res.json).toHaveBeenCalledWith(mockVolunteers);
    });

    it('should return 400 if there is an error', async () => {
      // Arrange
      req.params = { eventId: 'event-123' };
      
      // Mock error response
      volunteerHistoryService.getEventVolunteers.mockResolvedValueOnce({
        data: null,
        error: 'Database error'
      });
      
      // Find the route handler
      const getEventVolunteersRoute = findRouteHandler(historyRoutes.stack, 'get', '/event/:eventId');
      
      // Act
      await getEventVolunteersRoute(req, res);
      
      // Assert
      expect(volunteerHistoryService.getEventVolunteers).toHaveBeenCalledWith('event-123');
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Database error' });
    });

    it('should return 500 if there is a server error', async () => {
      // Arrange
      req.params = { eventId: 'event-123' };
      
      // Mock service to throw error
      volunteerHistoryService.getEventVolunteers.mockRejectedValueOnce(new Error('Server error'));
      
      // Find the route handler
      const getEventVolunteersRoute = findRouteHandler(historyRoutes.stack, 'get', '/event/:eventId');
      
      // Act
      await getEventVolunteersRoute(req, res);
      
      // Assert
      expect(volunteerHistoryService.getEventVolunteers).toHaveBeenCalledWith('event-123');
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: expect.any(String) });
    });
  });

  describe('POST /api/history/apply', () => {
    it('should successfully apply for an event', async () => {
      // Arrange
      req.body = {
        userId: 'user-123',
        eventId: 'event-456'
      };
      
      // Mock application data
      const mockApplication = [
        {
          id: 'application-789',
          user_id: 'user-123',
          event_id: 'event-456',
          status: 'Applied'
        }
      ];
      
      // Mock the volunteerHistoryService.applyForEvent method
      volunteerHistoryService.applyForEvent.mockResolvedValueOnce({
        data: mockApplication,
        error: null
      });
      
      // Find the route handler
      const applyForEventRoute = findRouteHandler(historyRoutes.stack, 'post', '/apply');
      
      // Act
      await applyForEventRoute(req, res);
      
      // Assert
      expect(volunteerHistoryService.applyForEvent).toHaveBeenCalledWith('user-123', 'event-456');
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
      const applyForEventRoute = findRouteHandler(historyRoutes.stack, 'post', '/apply');
      
      // Act
      await applyForEventRoute(req, res);
      
      // Assert
      expect(volunteerHistoryService.applyForEvent).not.toHaveBeenCalled();
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
      volunteerHistoryService.applyForEvent.mockResolvedValueOnce({
        data: null,
        error: 'User has already applied for this event'
      });
      
      // Find the route handler
      const applyForEventRoute = findRouteHandler(historyRoutes.stack, 'post', '/apply');
      
      // Act
      await applyForEventRoute(req, res);
      
      // Assert
      expect(volunteerHistoryService.applyForEvent).toHaveBeenCalledWith('user-123', 'event-456');
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
      volunteerHistoryService.applyForEvent.mockRejectedValueOnce(new Error('Server error'));
      
      // Find the route handler
      const applyForEventRoute = findRouteHandler(historyRoutes.stack, 'post', '/apply');
      
      // Act
      await applyForEventRoute(req, res);
      
      // Assert
      expect(volunteerHistoryService.applyForEvent).toHaveBeenCalledWith('user-123', 'event-456');
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: expect.any(String) });
    });
  });

  describe('PUT /api/history/status/:id', () => {
    it('should update application status successfully', async () => {
      // Arrange
      req.params = { id: 'application-123' };
      req.body = {
        status: 'Accepted'
      };
      
      // Mock updated application
      const mockApplication = [
        {
          id: 'application-123',
          status: 'Accepted',
          updated_at: '2025-03-22T14:00:00Z'
        }
      ];
      
      // Mock the volunteerHistoryService.updateVolunteerStatus method
      volunteerHistoryService.updateVolunteerStatus.mockResolvedValueOnce({
        data: mockApplication,
        error: null
      });
      
      // Find the route handler
      const updateStatusRoute = findRouteHandler(historyRoutes.stack, 'put', '/status/:id');
      
      // Act
      await updateStatusRoute(req, res);
      
      // Assert
      expect(volunteerHistoryService.updateVolunteerStatus).toHaveBeenCalledWith('application-123', 'Accepted', undefined);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.any(String),
        application: expect.any(Object)
      }));
    });

    it('should update status with hours logged if provided', async () => {
      // Arrange
      req.params = { id: 'application-123' };
      req.body = {
        status: 'Participated',
        hoursLogged: 4.5
      };
      
      // Mock updated application
      const mockApplication = [
        {
          id: 'application-123',
          status: 'Participated',
          hours_logged: 4.5,
          updated_at: '2025-03-22T14:00:00Z'
        }
      ];
      
      // Mock the volunteerHistoryService.updateVolunteerStatus method
      volunteerHistoryService.updateVolunteerStatus.mockResolvedValueOnce({
        data: mockApplication,
        error: null
      });
      
      // Find the route handler
      const updateStatusRoute = findRouteHandler(historyRoutes.stack, 'put', '/status/:id');
      
      // Act
      await updateStatusRoute(req, res);
      
      // Assert
      expect(volunteerHistoryService.updateVolunteerStatus).toHaveBeenCalledWith('application-123', 'Participated', 4.5);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.any(String),
        application: expect.any(Object)
      }));
    });

    it('should return 400 if status is missing', async () => {
      // Arrange
      req.params = { id: 'application-123' };
      req.body = {}; // Missing status
      
      // Find the route handler
      const updateStatusRoute = findRouteHandler(historyRoutes.stack, 'put', '/status/:id');
      
      // Act
      await updateStatusRoute(req, res);
      
      // Assert
      expect(volunteerHistoryService.updateVolunteerStatus).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ 
        error: expect.stringMatching(/status is required/i)
      });
    });

    it('should return 400 if status is invalid', async () => {
      // Arrange
      req.params = { id: 'application-123' };
      req.body = {
        status: 'InvalidStatus' // Not a valid status
      };
      
      // Find the route handler
      const updateStatusRoute = findRouteHandler(historyRoutes.stack, 'put', '/status/:id');
      
      // Act
      await updateStatusRoute(req, res);
      
      // Assert
      expect(volunteerHistoryService.updateVolunteerStatus).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ 
        error: expect.stringMatching(/invalid status/i)
      });
    });

    it('should return 400 if service returns an error', async () => {
      // Arrange
      req.params = { id: 'application-123' };
      req.body = {
        status: 'Accepted'
      };
      
      // Mock error response
      volunteerHistoryService.updateVolunteerStatus.mockResolvedValueOnce({
        data: null,
        error: 'Application not found'
      });
      
      // Find the route handler
      const updateStatusRoute = findRouteHandler(historyRoutes.stack, 'put', '/status/:id');
      
      // Act
      await updateStatusRoute(req, res);
      
      // Assert
      expect(volunteerHistoryService.updateVolunteerStatus).toHaveBeenCalledWith('application-123', 'Accepted', undefined);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Application not found' });
    });

    it('should return 500 if there is a server error', async () => {
      // Arrange
      req.params = { id: 'application-123' };
      req.body = {
        status: 'Accepted'
      };
      
      // Mock service to throw error
      volunteerHistoryService.updateVolunteerStatus.mockRejectedValueOnce(new Error('Server error'));
      
      // Find the route handler
      const updateStatusRoute = findRouteHandler(historyRoutes.stack, 'put', '/status/:id');
      
      // Act
      await updateStatusRoute(req, res);
      
      // Assert
      expect(volunteerHistoryService.updateVolunteerStatus).toHaveBeenCalledWith('application-123', 'Accepted', undefined);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: expect.any(String) });
    });
  });

  describe('PUT /api/history/feedback/:id', () => {
    it('should provide feedback successfully', async () => {
      // Arrange
      req.params = { id: 'application-123' };
      req.body = {
        feedback: 'Great volunteer',
        rating: 5
      };
      
      // Mock updated application
      const mockApplication = [
        {
          id: 'application-123',
          feedback: 'Great volunteer',
          rating: 5,
          updated_at: '2025-03-22T14:00:00Z'
        }
      ];
      
      // Mock the volunteerHistoryService.provideFeedback method
      volunteerHistoryService.provideFeedback.mockResolvedValueOnce({
        data: mockApplication,
        error: null
      });
      
      // Find the route handler
      const provideFeedbackRoute = findRouteHandler(historyRoutes.stack, 'put', '/feedback/:id');
      
      // Act
      await provideFeedbackRoute(req, res);
      
      // Assert
      expect(volunteerHistoryService.provideFeedback).toHaveBeenCalledWith('application-123', 'Great volunteer', 5);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.any(String),
        application: expect.any(Object)
      }));
    });

    it('should return 400 if feedback is missing', async () => {
      // Arrange
      req.params = { id: 'application-123' };
      req.body = {
        rating: 5 // Missing feedback
      };
      
      // Find the route handler
      const provideFeedbackRoute = findRouteHandler(historyRoutes.stack, 'put', '/feedback/:id');
      
      // Act
      await provideFeedbackRoute(req, res);
      
      // Assert
      expect(volunteerHistoryService.provideFeedback).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ 
        error: expect.stringMatching(/feedback is required/i)
      });
    });

    it('should return 400 if rating is invalid', async () => {
      // Arrange
      req.params = { id: 'application-123' };
      req.body = {
        feedback: 'Good volunteer',
        rating: 6 // Invalid rating (should be 1-5)
      };
      
      // Find the route handler
      const provideFeedbackRoute = findRouteHandler(historyRoutes.stack, 'put', '/feedback/:id');
      
      // Act
      await provideFeedbackRoute(req, res);
      
      // Assert
      expect(volunteerHistoryService.provideFeedback).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ 
        error: expect.stringMatching(/rating must be between 1 and 5/i)
      });
    });

    it('should return 400 if service returns an error', async () => {
      // Arrange
      req.params = { id: 'application-123' };
      req.body = {
        feedback: 'Good volunteer',
        rating: 4
      };
      
      // Mock error response
      volunteerHistoryService.provideFeedback.mockResolvedValueOnce({
        data: null,
        error: 'Application not found'
      });
      
      // Find the route handler
      const provideFeedbackRoute = findRouteHandler(historyRoutes.stack, 'put', '/feedback/:id');
      
      // Act
      await provideFeedbackRoute(req, res);
      
      // Assert
      expect(volunteerHistoryService.provideFeedback).toHaveBeenCalledWith('application-123', 'Good volunteer', 4);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Application not found' });
    });

    it('should return 500 if there is a server error', async () => {
      // Arrange
      req.params = { id: 'application-123' };
      req.body = {
        feedback: 'Good volunteer',
        rating: 4
      };
      
      // Mock service to throw error
      volunteerHistoryService.provideFeedback.mockRejectedValueOnce(new Error('Server error'));
      
      // Find the route handler
      const provideFeedbackRoute = findRouteHandler(historyRoutes.stack, 'put', '/feedback/:id');
      
      // Act
      await provideFeedbackRoute(req, res);
      
      // Assert
      expect(volunteerHistoryService.provideFeedback).toHaveBeenCalledWith('application-123', 'Good volunteer', 4);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: expect.any(String) });
    });
  });
});
