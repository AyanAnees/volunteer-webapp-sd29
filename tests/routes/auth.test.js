const authRoutes = require('../../server/routes/auth');
const authService = require('../../server/services/authService');
const { mockRequest, mockResponse, mockNext } = require('../mocks/express');

// Mock the authService methods
jest.mock('../../server/services/authService');

describe('Auth Routes', () => {
  let req, res;
  
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Create fresh request and response objects
    req = mockRequest();
    res = mockResponse();
  });

  describe('POST /api/auth/register', () => {
    it('should return 400 if email is missing', async () => {
      // Arrange
      req.body = { password: 'password123' };
      
      // Find the route handler for register
      const registerRoute = findRouteHandler(authRoutes.stack, 'post', '/register');
      
      // Act
      await registerRoute(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: expect.any(String) });
    });

    it('should return 400 if password is missing', async () => {
      // Arrange
      req.body = { email: 'test@example.com' };
      
      // Find the route handler for register
      const registerRoute = findRouteHandler(authRoutes.stack, 'post', '/register');
      
      // Act
      await registerRoute(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: expect.any(String) });
    });

    it('should return 400 if address information is missing', async () => {
      // Arrange
      req.body = { 
        email: 'test@example.com', 
        password: 'password123',
        firstName: 'Test',
        lastName: 'User'
      };
      
      // Find the route handler for register
      const registerRoute = findRouteHandler(authRoutes.stack, 'post', '/register');
      
      // Act
      await registerRoute(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: expect.any(String) });
    });

    it('should return 201 with user data on successful registration', async () => {
      // Arrange
      req.body = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        address1: '123 Main St',
        city: 'Anytown',
        state: 'CA',
        zipCode: '12345'
      };
      
      // Mock the authService.register method to return success
      authService.register.mockResolvedValueOnce({
        data: {
          user: {
            id: 'mock-user-id',
            email: 'test@example.com'
          }
        },
        error: null
      });
      
      // Find the route handler for register
      const registerRoute = findRouteHandler(authRoutes.stack, 'post', '/register');
      
      // Act
      await registerRoute(req, res);
      
      // Assert
      expect(authService.register).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: expect.any(String),
        user: expect.objectContaining({
          id: expect.any(String),
          email: expect.any(String)
        })
      });
    });

    it('should return 400 if registration fails', async () => {
      // Arrange
      req.body = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        address1: '123 Main St',
        city: 'Anytown',
        state: 'CA',
        zipCode: '12345'
      };
      
      // Mock the authService.register method to return an error
      authService.register.mockResolvedValueOnce({
        data: null,
        error: 'Registration failed'
      });
      
      // Find the route handler for register
      const registerRoute = findRouteHandler(authRoutes.stack, 'post', '/register');
      
      // Act
      await registerRoute(req, res);
      
      // Assert
      expect(authService.register).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: expect.any(String) });
    });
  });

  describe('POST /api/auth/login', () => {
    it('should return 400 if email is missing', async () => {
      // Arrange
      req.body = { password: 'password123' };
      
      // Find the route handler for login
      const loginRoute = findRouteHandler(authRoutes.stack, 'post', '/login');
      
      // Act
      await loginRoute(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: expect.any(String) });
    });

    it('should return 400 if password is missing', async () => {
      // Arrange
      req.body = { email: 'test@example.com' };
      
      // Find the route handler for login
      const loginRoute = findRouteHandler(authRoutes.stack, 'post', '/login');
      
      // Act
      await loginRoute(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: expect.any(String) });
    });

    it('should return 200 with user data and session on successful login', async () => {
      // Arrange
      req.body = {
        email: 'test@example.com',
        password: 'password123'
      };
      
      // Mock the authService.login method to return success
      authService.login.mockResolvedValueOnce({
        data: {
          user: {
            id: 'mock-user-id',
            email: 'test@example.com'
          },
          session: { access_token: 'mock-token' }
        },
        error: null
      });
      
      // Find the route handler for login
      const loginRoute = findRouteHandler(authRoutes.stack, 'post', '/login');
      
      // Act
      await loginRoute(req, res);
      
      // Assert
      expect(authService.login).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: expect.any(String),
        user: expect.objectContaining({
          id: expect.any(String),
          email: expect.any(String)
        }),
        session: expect.any(Object)
      });
    });

    it('should return 401 if login fails', async () => {
      // Arrange
      req.body = {
        email: 'test@example.com',
        password: 'password123'
      };
      
      // Mock the authService.login method to return an error
      authService.login.mockResolvedValueOnce({
        data: null,
        error: 'Invalid login credentials'
      });
      
      // Find the route handler for login
      const loginRoute = findRouteHandler(authRoutes.stack, 'post', '/login');
      
      // Act
      await loginRoute(req, res);
      
      // Assert
      expect(authService.login).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: expect.any(String) });
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should return 200 on successful logout', async () => {
      // Mock the authService.logout method to return success
      authService.logout.mockResolvedValueOnce({ error: null });
      
      // Find the route handler for logout
      const logoutRoute = findRouteHandler(authRoutes.stack, 'post', '/logout');
      
      // Act
      await logoutRoute(req, res);
      
      // Assert
      expect(authService.logout).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: expect.any(String) });
    });

    it('should return 400 if logout fails', async () => {
      // Mock the authService.logout method to return an error
      authService.logout.mockResolvedValueOnce({ error: 'Logout failed' });
      
      // Find the route handler for logout
      const logoutRoute = findRouteHandler(authRoutes.stack, 'post', '/logout');
      
      // Act
      await logoutRoute(req, res);
      
      // Assert
      expect(authService.logout).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: expect.any(String) });
    });
  });

  describe('GET /api/auth/user', () => {
    it('should return 200 with user data on successful auth check', async () => {
      // Mock the authService.getCurrentUser method to return success
      authService.getCurrentUser.mockResolvedValueOnce({
        data: {
          user: {
            id: 'mock-user-id',
            email: 'test@example.com'
          }
        },
        error: null
      });
      
      // Find the route handler for user
      const userRoute = findRouteHandler(authRoutes.stack, 'get', '/user');
      
      // Act
      await userRoute(req, res);
      
      // Assert
      expect(authService.getCurrentUser).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        user: expect.objectContaining({
          id: expect.any(String),
          email: expect.any(String)
        })
      });
    });

    it('should return 401 if not authenticated', async () => {
      // Mock the authService.getCurrentUser method to return no user
      authService.getCurrentUser.mockResolvedValueOnce({
        data: { user: null },
        error: null
      });
      
      // Find the route handler for user
      const userRoute = findRouteHandler(authRoutes.stack, 'get', '/user');
      
      // Act
      await userRoute(req, res);
      
      // Assert
      expect(authService.getCurrentUser).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: expect.any(String) });
    });

    it('should return 401 if get user fails', async () => {
      // Mock the authService.getCurrentUser method to return an error
      authService.getCurrentUser.mockResolvedValueOnce({
        data: null,
        error: 'Authentication error'
      });
      
      // Find the route handler for user
      const userRoute = findRouteHandler(authRoutes.stack, 'get', '/user');
      
      // Act
      await userRoute(req, res);
      
      // Assert
      expect(authService.getCurrentUser).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
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
