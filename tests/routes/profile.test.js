const profileRoutes = require('../../server/routes/profile');
const profileService = require('../../server/services/profileService');
const { mockRequest, mockResponse, mockNext } = require('../mocks/express');

// Mock the profileService
jest.mock('../../server/services/profileService');

describe('Profile Routes', () => {
  let req, res;
  
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Create fresh request and response objects
    req = mockRequest();
    res = mockResponse();
  });

  describe('GET /api/profile/:userId', () => {
    it('should return 404 if profile is not found', async () => {
      // Arrange
      req.params = { userId: 'non-existent-user' };
      
      // Mock the profileService.getProfile method to return no profile
      profileService.getProfile.mockResolvedValueOnce({
        data: null,
        error: 'Profile not found'
      });
      
      // Also mock the other profileService methods that are called
      profileService.getSkills.mockResolvedValueOnce({
        data: [],
        error: null
      });
      
      profileService.getAvailability.mockResolvedValueOnce({
        data: [],
        error: null
      });
      
      // Find the route handler for get profile
      const getProfileRoute = findRouteHandler(profileRoutes.stack, 'get', '/:userId');
      
      // Act
      await getProfileRoute(req, res);
      
      // Assert
      expect(profileService.getProfile).toHaveBeenCalledWith('non-existent-user');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: expect.any(String) });
    });

    it('should return 200 with profile data if profile is found', async () => {
      // Arrange
      req.params = { userId: 'mock-user-id' };
      
      // Mock the profileService.getProfile method to return a profile
      profileService.getProfile.mockResolvedValueOnce({
        data: {
          id: 'mock-user-id',
          email: 'test@example.com',
          full_name: 'Test User',
          address_1: '123 Main St',
          city: 'Anytown',
          state: 'CA',
          zip_code: '12345'
        },
        error: null
      });
      
      // Mock the other profileService methods that are called
      profileService.getSkills.mockResolvedValueOnce({
        data: [{ skill_name: 'Coding', proficiency_level: 'Advanced' }],
        error: null
      });
      
      profileService.getAvailability.mockResolvedValueOnce({
        data: [{ day_of_week: 'Monday', start_time: '09:00:00', end_time: '17:00:00' }],
        error: null
      });
      
      // Find the route handler for get profile
      const getProfileRoute = findRouteHandler(profileRoutes.stack, 'get', '/:userId');
      
      // Act
      await getProfileRoute(req, res);
      
      // Assert
      expect(profileService.getProfile).toHaveBeenCalledWith('mock-user-id');
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'mock-user-id',
          email: 'test@example.com',
          skills: expect.any(Array),
          availability: expect.any(Array)
        })
      );
    });

    it('should return 500 if there is a server error', async () => {
      // Arrange
      req.params = { userId: 'mock-user-id' };
      
      // Mock the profileService.getProfile method to throw an error
      profileService.getProfile.mockRejectedValueOnce(new Error('Server error'));
      
      // Find the route handler for get profile
      const getProfileRoute = findRouteHandler(profileRoutes.stack, 'get', '/:userId');
      
      // Act
      await getProfileRoute(req, res);
      
      // Assert
      expect(profileService.getProfile).toHaveBeenCalledWith('mock-user-id');
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: expect.any(String) });
    });
  });

  describe('POST /api/profile/:userId', () => {
    it('should return 500 if profile data is missing', async () => {
      // Arrange
      req.params = { userId: 'mock-user-id' };
      req.body = {}; // Empty body
      
      // Find the route handler for update profile
      const updateProfileRoute = findRouteHandler(profileRoutes.stack, 'post', '/:userId');
      
      // Act
      await updateProfileRoute(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: expect.any(String) });
    });

    it('should return 200 with updated profile data on successful update', async () => {
      // Arrange
      req.params = { userId: 'mock-user-id' };
      req.body = {
        fullName: 'Updated Name',
        address1: '456 New St',
        city: 'Newtown',
        state: 'TX',
        zipCode: '54321'
      };
      
      // Mock the profileService.updateProfile method to return success
      profileService.updateProfile.mockResolvedValueOnce({
        data: {
          id: 'mock-user-id',
          full_name: 'Updated Name',
          address_1: '456 New St',
          address_2: null,
          city: 'Newtown',
          state: 'TX',
          zip_code: '54321'
        },
        error: null
      });
      
      // Also mock the skills and availability update methods
      profileService.saveSkills.mockResolvedValueOnce({
        data: [],
        error: null
      });
      
      profileService.saveAvailability.mockResolvedValueOnce({
        data: [],
        error: null
      });
      
      // Find the route handler for update profile
      const updateProfileRoute = findRouteHandler(profileRoutes.stack, 'post', '/:userId');
      
      // Act
      await updateProfileRoute(req, res);
      
      // Assert
      expect(profileService.updateProfile).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
        full_name: 'Updated Name',
        address_1: '456 New St',
        city: 'Newtown',
        state: 'TX',
        zip_code: '54321'
      }));
      expect(res.json).toHaveBeenCalledWith({
        message: expect.any(String)
      });
    });

    it('should return 400 if update fails', async () => {
      // Arrange
      req.params = { userId: 'mock-user-id' };
      req.body = {
        fullName: 'Updated Name',
        address1: '456 New St',
        city: 'Newtown',
        state: 'TX',
        zipCode: '54321'
      };
      
      // Mock the profileService.updateProfile method to return an error
      profileService.updateProfile.mockResolvedValueOnce({
        data: null,
        error: 'Update failed'
      });
      
      // Find the route handler for update profile
      const updateProfileRoute = findRouteHandler(profileRoutes.stack, 'post', '/:userId');
      
      // Act
      await updateProfileRoute(req, res);
      
      // Assert
      expect(profileService.updateProfile).toHaveBeenCalledWith(expect.any(String), expect.any(Object));
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: expect.any(String) });
    });

    it('should return 500 if there is a server error', async () => {
      // Arrange
      req.params = { userId: 'mock-user-id' };
      req.body = {
        fullName: 'Updated Name',
        address1: '456 New St',
        city: 'Newtown',
        state: 'TX',
        zipCode: '54321'
      };
      
      // Mock the profileService.updateProfile method to throw an error
      profileService.updateProfile.mockRejectedValueOnce(new Error('Server error'));
      
      // Find the route handler for update profile
      const updateProfileRoute = findRouteHandler(profileRoutes.stack, 'post', '/:userId');
      
      // Act
      await updateProfileRoute(req, res);
      
      // Assert
      expect(profileService.updateProfile).toHaveBeenCalledWith(expect.any(String), expect.any(Object));
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
