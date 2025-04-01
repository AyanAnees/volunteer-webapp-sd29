const statesRoutes = require('../../server/routes/states');
const profileService = require('../../server/services/profileService');
const { mockRequest, mockResponse, mockNext } = require('../mocks/express');

// Mock the profileService
jest.mock('../../server/services/profileService');

describe('States Routes', () => {
  let req, res;
  
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Create fresh request and response objects
    req = mockRequest();
    res = mockResponse();
  });

  describe('GET /api/states', () => {
    it('should return list of states', async () => {
      // Arrange
      const mockStates = [
        { code: 'CA', name: 'California' },
        { code: 'TX', name: 'Texas' },
        { code: 'NY', name: 'New York' }
      ];
      
      // Mock the profileService.getStatesList method
      profileService.getStatesList.mockResolvedValueOnce({
        data: mockStates,
        error: null
      });
      
      // Find the route handler
      const getStatesRoute = findRouteHandler(statesRoutes.stack, 'get', '/');
      
      // Act
      await getStatesRoute(req, res);
      
      // Assert
      expect(profileService.getStatesList).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(mockStates);
    });

    it('should return 500 if there is a service error', async () => {
      // Arrange
      // Mock error response
      profileService.getStatesList.mockResolvedValueOnce({
        data: null,
        error: 'Database error'
      });
      
      // Find the route handler
      const getStatesRoute = findRouteHandler(statesRoutes.stack, 'get', '/');
      
      // Act
      await getStatesRoute(req, res);
      
      // Assert
      expect(profileService.getStatesList).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Database error' });
    });

    it('should return 500 if there is a server error', async () => {
      // Arrange
      // Mock service to throw error
      profileService.getStatesList.mockRejectedValueOnce(new Error('Server error'));
      
      // Find the route handler
      const getStatesRoute = findRouteHandler(statesRoutes.stack, 'get', '/');
      
      // Act
      await getStatesRoute(req, res);
      
      // Assert
      expect(profileService.getStatesList).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
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
