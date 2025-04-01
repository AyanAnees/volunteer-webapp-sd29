const eventsRoutes = require('../../server/routes/events');
const eventService = require('../../server/services/eventService');
const { mockRequest, mockResponse, mockNext } = require('../mocks/express');

// Mock the eventService
jest.mock('../../server/services/eventService');

describe('Events Routes', () => {
  let req, res;
  
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Create fresh request and response objects
    req = mockRequest();
    res = mockResponse();
  });

  describe('GET /api/events', () => {
    it('should return 200 with all events', async () => {
      // Arrange
      const mockEvents = [
        {
          id: 'event-1',
          event_name: 'Community Cleanup',
          description: 'Cleaning the local park',
          location: 'Central Park',
          required_skills: ['Cleaning', 'Organizing'],
          urgency: 'Medium',
          start_date: '2025-04-01T10:00:00Z',
          end_date: '2025-04-01T14:00:00Z'
        },
        {
          id: 'event-2',
          event_name: 'Food Drive',
          description: 'Collecting food for the local food bank',
          location: 'Community Center',
          required_skills: ['Lifting', 'Organizing'],
          urgency: 'High',
          start_date: '2025-04-15T09:00:00Z',
          end_date: '2025-04-15T17:00:00Z'
        }
      ];
      
      // Mock the eventService.getAllEvents method to return events
      eventService.getAllEvents.mockResolvedValueOnce({
        data: mockEvents,
        error: null
      });
      
      // Find the route handler for get all events
      const getAllEventsRoute = findRouteHandler(eventsRoutes.stack, 'get', '/');
      
      // Act
      await getAllEventsRoute(req, res);
      
      // Assert
      expect(eventService.getAllEvents).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(mockEvents);
    });

    it('should return 500 if there is a server error', async () => {
      // Arrange
      // Mock the eventService.getAllEvents method to return an error
      eventService.getAllEvents.mockResolvedValueOnce({
        data: null,
        error: 'Database error'
      });
      
      // Find the route handler for get all events
      const getAllEventsRoute = findRouteHandler(eventsRoutes.stack, 'get', '/');
      
      // Act
      await getAllEventsRoute(req, res);
      
      // Assert
      expect(eventService.getAllEvents).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: expect.any(String) });
    });
  });

  describe('GET /api/events/:id', () => {
    it('should return 200 with event details if event is found', async () => {
      // Arrange
      req.params = { id: 'event-1' };
      
      const mockEvent = {
        id: 'event-1',
        event_name: 'Community Cleanup',
        description: 'Cleaning the local park',
        location: 'Central Park',
        required_skills: ['Cleaning', 'Organizing'],
        urgency: 'Medium',
        start_date: '2025-04-01T10:00:00Z',
        end_date: '2025-04-01T14:00:00Z'
      };
      
      // Mock the eventService.getEventById method to return an event
      eventService.getEventById.mockResolvedValueOnce({
        data: mockEvent,
        error: null
      });
      
      // Find the route handler for get event by id
      const getEventByIdRoute = findRouteHandler(eventsRoutes.stack, 'get', '/:id');
      
      // Act
      await getEventByIdRoute(req, res);
      
      // Assert
      expect(eventService.getEventById).toHaveBeenCalledWith('event-1');
      expect(res.json).toHaveBeenCalledWith(mockEvent);
    });

    it('should return 404 if event is not found', async () => {
      // Arrange
      req.params = { id: 'non-existent-event' };
      
      // Mock the eventService.getEventById method to return no event
      eventService.getEventById.mockResolvedValueOnce({
        data: null,
        error: 'Event not found'
      });
      
      // Find the route handler for get event by id
      const getEventByIdRoute = findRouteHandler(eventsRoutes.stack, 'get', '/:id');
      
      // Act
      await getEventByIdRoute(req, res);
      
      // Assert
      expect(eventService.getEventById).toHaveBeenCalledWith('non-existent-event');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: expect.any(String) });
    });
  });

  describe('POST /api/events', () => {
    it('should return 400 if required event data is missing', async () => {
      // Arrange
      req.body = {
        // Missing required fields like event_name, location, etc.
        description: 'Incomplete event data'
      };
      
      // Find the route handler for create event
      const createEventRoute = findRouteHandler(eventsRoutes.stack, 'post', '/');
      
      // Act
      await createEventRoute(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: expect.any(String) });
    });

    it('should return 201 with created event data on successful creation', async () => {
      // Arrange
      req.body = {
        eventName: 'New Event',
        eventDescription: 'A new volunteer event',
        location: 'Downtown Community Center',
        requiredSkills: ['Teaching', 'Communication'],
        urgency: 'Low',
        startDate: '2025-05-01T10:00:00Z',
        endDate: '2025-05-01T14:00:00Z',
        userId: 'mock-user-id'
      };
      
      // Mock the eventService.createEvent method to return success
      eventService.createEvent.mockResolvedValueOnce({
        data: [{
          id: 'new-event-id',
          event_name: 'New Event',
          description: 'A new volunteer event',
          location: 'Downtown Community Center',
          required_skills: ['Teaching', 'Communication'],
          urgency: 'Low',
          start_date: '2025-05-01T10:00:00Z',
          end_date: '2025-05-01T14:00:00Z'
        }],
        error: null
      });
      
      // Find the route handler for create event
      const createEventRoute = findRouteHandler(eventsRoutes.stack, 'post', '/');
      
      // Act
      await createEventRoute(req, res);
      
      // Assert
      expect(eventService.createEvent).toHaveBeenCalledWith(expect.objectContaining({
        event_name: 'New Event',
        description: 'A new volunteer event',
        location: 'Downtown Community Center'
      }));
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.any(String),
        event: expect.objectContaining({
          id: expect.any(String),
          eventName: 'New Event'
        })
      }));
    });

    it('should return 400 if event creation fails', async () => {
      // Arrange
      req.body = {
        eventName: 'Invalid Event',
        eventDescription: 'An event with invalid data',
        location: 'Downtown Community Center',
        requiredSkills: ['Teaching', 'Communication'],
        urgency: 'Invalid', // Invalid urgency value
        startDate: '2025-05-01T10:00:00Z',
        endDate: '2025-05-01T14:00:00Z'
      };
      
      // Mock the eventService.createEvent method to return an error
      eventService.createEvent.mockResolvedValueOnce({
        data: null,
        error: 'Invalid urgency value'
      });
      
      // Find the route handler for create event
      const createEventRoute = findRouteHandler(eventsRoutes.stack, 'post', '/');
      
      // Act
      await createEventRoute(req, res);
      
      // Assert
      expect(eventService.createEvent).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: expect.any(String) });
    });
  });

  // Note: We're removing the PUT tests since the route doesn't exist
  describe('DELETE /api/events/:id', () => {
    it('should return 200 on successful deletion', async () => {
      // Arrange
      req.params = { id: 'event-1' };
      
      // Mock the eventService.deleteEvent method to return success
      eventService.deleteEvent.mockResolvedValueOnce({
        data: { id: 'event-1' },
        error: null
      });
      
      // Find the route handler for delete event
      const deleteEventRoute = findRouteHandler(eventsRoutes.stack, 'delete', '/:id');
      
      // Act
      await deleteEventRoute(req, res);
      
      // Assert
      expect(eventService.deleteEvent).toHaveBeenCalledWith('event-1');
      expect(res.json).toHaveBeenCalledWith({ message: expect.any(String) });
    });

    it('should return 404 if event is not found', async () => {
      // Arrange
      req.params = { id: 'non-existent-event' };
      
      // Mock the eventService.deleteEvent method to return not found
      eventService.deleteEvent.mockResolvedValueOnce({
        data: null,
        error: 'Event not found'
      });
      
      // Find the route handler for delete event
      const deleteEventRoute = findRouteHandler(eventsRoutes.stack, 'delete', '/:id');
      
      // Act
      await deleteEventRoute(req, res);
      
      // Assert
      expect(eventService.deleteEvent).toHaveBeenCalledWith('non-existent-event');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: expect.any(String) });
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
