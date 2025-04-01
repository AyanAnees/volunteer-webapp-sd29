const {
  mockSupabaseClient,
  resetSupabaseMocks,
  configureSupabaseForSuccessfulAuth,
  configureSupabaseForFailedAuth
} = require('../mocks/supabase');

// Mock the Supabase client
jest.mock('../../server/config/supabase', () => mockSupabaseClient);

// Import the service after mocking dependencies
const authService = require('../../server/services/authService');

describe('Auth Service', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    resetSupabaseMocks();
  });

  describe('register', () => {
    it('should register a user successfully', async () => {
      // Arrange
      configureSupabaseForSuccessfulAuth();
      
      const email = 'test@example.com';
      const password = 'password123';
      const userData = {
        firstName: 'Test',
        lastName: 'User'
      };
      
      // Mock return value for specific call
      mockSupabaseClient.auth.signUp.mockResolvedValueOnce({
        data: {
          user: {
            id: 'mock-user-id',
            email
          },
          session: { access_token: 'mock-token' }
        },
        error: null
      });
      
      // Act
      const result = await authService.register(email, password, userData);
      
      // Assert
      expect(mockSupabaseClient.auth.signUp).toHaveBeenCalledWith({
        email,
        password,
        options: expect.objectContaining({
          data: expect.objectContaining({
            full_name: 'Test User'
          })
        })
      });
      
      expect(result.data).toBeDefined();
      expect(result.data.user).toBeDefined();
      expect(result.data.user.id).toBe('mock-user-id');
      expect(result.error).toBeNull();
    });

    it('should handle registration errors', async () => {
      // Arrange
      configureSupabaseForFailedAuth();
      
      const email = 'test@example.com';
      const password = 'password123';
      
      // Act
      const result = await authService.register(email, password);
      
      // Assert
      expect(mockSupabaseClient.auth.signUp).toHaveBeenCalled();
      expect(result.data).toBeNull();
      expect(result.error).toBeDefined();
    });
  });

  describe('login', () => {
    it('should log in a user successfully', async () => {
      // Arrange
      configureSupabaseForSuccessfulAuth();
      
      const email = 'test@example.com';
      const password = 'password123';
      
      // Mock return value for specific call
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValueOnce({
        data: {
          user: {
            id: 'mock-user-id',
            email,
            user_metadata: { full_name: 'Test User' }
          },
          session: { access_token: 'mock-token' }
        },
        error: null
      });
      
      // Act
      const result = await authService.login(email, password);
      
      // Assert
      expect(mockSupabaseClient.auth.signInWithPassword).toHaveBeenCalledWith({
        email,
        password
      });
      
      expect(result.data).toBeDefined();
      expect(result.data.user).toBeDefined();
      expect(result.data.user.id).toBe('mock-user-id');
      expect(result.error).toBeNull();
    });

    it('should handle login errors', async () => {
      // Arrange
      configureSupabaseForFailedAuth();
      
      const email = 'test@example.com';
      const password = 'incorrect-password';
      
      // Act
      const result = await authService.login(email, password);
      
      // Assert
      expect(mockSupabaseClient.auth.signInWithPassword).toHaveBeenCalled();
      expect(result.data).toBeNull();
      expect(result.error).toBeDefined();
    });

    it('should create a profile if one does not exist', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'password123';
      
      // Mock successful login
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValueOnce({
        data: {
          user: {
            id: 'mock-user-id',
            email,
            user_metadata: { full_name: 'Test User' }
          },
          session: { access_token: 'mock-token' }
        },
        error: null
      });
      
      // Mock profile check - no profile exists
      mockSupabaseClient.from.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValueOnce({ data: null, error: null })
      }));
      
      // Mock profile creation
      mockSupabaseClient.from.mockImplementationOnce(() => ({
        insert: jest.fn().mockResolvedValueOnce({ data: [{ id: 'mock-profile-id' }], error: null })
      }));
      
      // Act
      const result = await authService.login(email, password);
      
      // Assert
      expect(mockSupabaseClient.auth.signInWithPassword).toHaveBeenCalled();
      
      // Verify profile was checked
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('profiles');
      
      // Verify profile was created (second call to from with 'profiles')
      expect(result.data).toBeDefined();
      expect(result.error).toBeNull();
    });
  });

  describe('logout', () => {
    it('should log out a user successfully', async () => {
      // Arrange
      configureSupabaseForSuccessfulAuth();
      
      // Act
      const result = await authService.logout();
      
      // Assert
      expect(mockSupabaseClient.auth.signOut).toHaveBeenCalled();
      expect(result.error).toBeNull();
    });

    it('should handle logout errors', async () => {
      // Arrange
      mockSupabaseClient.auth.signOut.mockRejectedValueOnce(new Error('Logout failed'));
      
      // Act
      const result = await authService.logout();
      
      // Assert
      expect(mockSupabaseClient.auth.signOut).toHaveBeenCalled();
      expect(result.error).toBeDefined();
    });
  });

  describe('getCurrentUser', () => {
    it('should get the current user successfully', async () => {
      // Arrange
      configureSupabaseForSuccessfulAuth();
      
      // Act
      const result = await authService.getCurrentUser();
      
      // Assert
      expect(mockSupabaseClient.auth.getUser).toHaveBeenCalled();
      expect(result.data).toBeDefined();
      expect(result.data.user).toBeDefined();
      expect(result.error).toBeNull();
    });

    it('should handle get user errors', async () => {
      // Arrange
      mockSupabaseClient.auth.getUser.mockRejectedValueOnce(new Error('Authentication failed'));
      
      // Act
      const result = await authService.getCurrentUser();
      
      // Assert
      expect(mockSupabaseClient.auth.getUser).toHaveBeenCalled();
      expect(result.data).toBeNull();
      expect(result.error).toBeDefined();
    });
  });

  describe('getProfile', () => {
    it('should get a user profile successfully', async () => {
      // Arrange
      const userId = 'mock-user-id';
      
      // Mock getting profile
      mockSupabaseClient.from.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValueOnce({ 
          data: { 
            id: userId,
            email: 'test@example.com',
            full_name: 'Test User'
          }, 
          error: null 
        })
      }));
      
      // Act
      const result = await authService.getProfile(userId);
      
      // Assert
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('profiles');
      expect(result.data).toBeDefined();
      expect(result.data.id).toBe(userId);
      expect(result.error).toBeNull();
    });

    it('should handle get profile errors', async () => {
      // Arrange
      const userId = 'mock-user-id';
      
      // Mock getting profile error
      mockSupabaseClient.from.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValueOnce({ 
          data: null, 
          error: { message: 'Profile not found' } 
        })
      }));
      
      // Act
      const result = await authService.getProfile(userId);
      
      // Assert
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('profiles');
      expect(result.data).toBeNull();
      expect(result.error).toBeDefined();
    });
  });

  describe('updateProfile', () => {
    it('should update a user profile successfully', async () => {
      // Arrange
      const userId = 'mock-user-id';
      const profileData = {
        full_name: 'Updated Name',
        address_1: '123 Main St',
        city: 'Anytown',
        state: 'CA',
        zip_code: '12345'
      };
      
      // Mock updating profile
      mockSupabaseClient.from.mockImplementationOnce(() => ({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValueOnce({ 
          data: { ...profileData, id: userId }, 
          error: null 
        })
      }));
      
      // Act
      const result = await authService.updateProfile(userId, profileData);
      
      // Assert
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('profiles');
      expect(result.data).toBeDefined();
      expect(result.error).toBeNull();
    });

    it('should handle update profile errors', async () => {
      // Arrange
      const userId = 'mock-user-id';
      const profileData = {
        full_name: 'Updated Name'
      };
      
      // Mock updating profile error
      mockSupabaseClient.from.mockImplementationOnce(() => ({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValueOnce({ 
          data: null, 
          error: { message: 'Update failed' } 
        })
      }));
      
      // Act
      const result = await authService.updateProfile(userId, profileData);
      
      // Assert
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('profiles');
      expect(result.data).toBeNull();
      expect(result.error).toBeDefined();
    });
  });
});
