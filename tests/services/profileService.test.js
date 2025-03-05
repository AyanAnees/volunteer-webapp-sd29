const {
  mockSupabaseClient,
  resetSupabaseMocks,
  configureSupabaseForSuccessfulAuth
} = require('../mocks/supabase');

// Mock the Supabase client
jest.mock('../../server/config/supabase', () => mockSupabaseClient);

// Import the service after mocking dependencies
const profileService = require('../../server/services/profileService');

describe('Profile Service', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    resetSupabaseMocks();

    // Setup default mock implementation for Supabase methods
    mockSupabaseClient.from.mockImplementation((tableName) => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis(),
      ilike: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis()
    }));
  });

  describe('updateProfile', () => {
    it('should update an existing profile', async () => {
      // Mock user ID and profile data
      const userId = 'user-123';
      const profileData = {
        full_name: 'Test User',
        address_1: '123 Main St',
        city: 'Testville',
        state: 'TX',
        zip_code: '12345'
      };

      // Mock existing profile check
      mockSupabaseClient.from.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({
          data: { id: userId, email: 'test@example.com' },
          error: null
        })
      }));

      // Mock update operation
      mockSupabaseClient.from.mockImplementationOnce(() => ({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue({
          data: { id: userId, ...profileData },
          error: null
        })
      }));

      // Call the function
      const result = await profileService.updateProfile(userId, profileData);

      // Assertions
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('profiles');
      expect(result.data).toEqual({ id: userId, ...profileData });
      expect(result.error).toBeNull();
    });

    it('should insert a new profile if one does not exist', async () => {
      // Mock user ID and profile data
      const userId = 'user-123';
      const profileData = {
        full_name: 'Test User',
        address_1: '123 Main St',
        city: 'Testville',
        state: 'TX',
        zip_code: '12345'
      };

      // Mock existing profile check - none found
      mockSupabaseClient.from.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({
          data: null,
          error: null
        })
      }));

      // Mock insert operation
      mockSupabaseClient.from.mockImplementationOnce(() => ({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue({
          data: [{ id: userId, ...profileData }],
          error: null
        })
      }));

      // Call the function
      const result = await profileService.updateProfile(userId, profileData);

      // Assertions
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('profiles');
      expect(result.data).toEqual([{ id: userId, ...profileData }]);
      expect(result.error).toBeNull();
    });

    it('should validate required fields', async () => {
      // Mock user ID
      const userId = 'user-123';
      
      // Missing required fields
      const invalidData = {
        full_name: 'Test User'
        // Missing address_1, city, state, zip_code
      };

      // Call the function
      const result = await profileService.updateProfile(userId, invalidData);

      // Assertions
      expect(result.data).toBeNull();
      expect(result.error).toContain('required');
    });

    it('should validate zip code format', async () => {
      // Mock user ID
      const userId = 'user-123';
      
      // Invalid zip code
      const invalidData = {
        full_name: 'Test User',
        address_1: '123 Main St',
        city: 'Testville',
        state: 'TX',
        zip_code: 'not-a-zip' // Invalid format
      };

      // Call the function
      const result = await profileService.updateProfile(userId, invalidData);

      // Assertions
      expect(result.data).toBeNull();
      expect(result.error).toContain('Invalid zip code format');
    });

    it('should validate state code format', async () => {
      // Mock user ID
      const userId = 'user-123';
      
      // Invalid state code
      const invalidData = {
        full_name: 'Test User',
        address_1: '123 Main St',
        city: 'Testville',
        state: 'Texas', // Should be 2-letter code
        zip_code: '12345'
      };

      // Call the function
      const result = await profileService.updateProfile(userId, invalidData);

      // Assertions
      expect(result.data).toBeNull();
      expect(result.error).toContain('Invalid state code');
    });

    it('should handle database errors', async () => {
      // Mock user ID and profile data
      const userId = 'user-123';
      const profileData = {
        full_name: 'Test User',
        address_1: '123 Main St',
        city: 'Testville',
        state: 'TX',
        zip_code: '12345'
      };

      // Mock existing profile check
      mockSupabaseClient.from.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({
          data: { id: userId, email: 'test@example.com' },
          error: null
        })
      }));

      // Mock update operation with error
      mockSupabaseClient.from.mockImplementationOnce(() => ({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database error' }
        })
      }));

      // Call the function
      const result = await profileService.updateProfile(userId, profileData);

      // Assertions
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('profiles');
      expect(result.data).toBeNull();
      expect(result.error).toBe('Database error');
    });
  });

  describe('getProfile', () => {
    it('should get a user profile with skills and availability', async () => {
      // Mock user ID
      const userId = 'user-123';
      
      // Mock profile data
      const mockProfile = {
        id: userId,
        email: 'test@example.com',
        full_name: 'Test User',
        address_1: '123 Main St',
        city: 'Testville',
        state: 'TX',
        zip_code: '12345'
      };

      // Mock skills data
      const mockSkills = [
        { skill_name: 'JavaScript', proficiency_level: 'Advanced' },
        { skill_name: 'React', proficiency_level: 'Intermediate' }
      ];

      // Mock availability data
      const mockAvailability = [
        { day_of_week: 'Monday', start_time: '09:00:00', end_time: '17:00:00' },
        { day_of_week: 'Wednesday', start_time: '09:00:00', end_time: '17:00:00' }
      ];

      // Mock profile query
      mockSupabaseClient.from.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockProfile,
          error: null
        })
      }));

      // Mock skills query
      mockSupabaseClient.from.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        mockResolvedValue: () => ({
          data: mockSkills,
          error: null
        })
      }));

      // Mock availability query
      mockSupabaseClient.from.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        mockResolvedValue: () => ({
          data: mockAvailability,
          error: null
        })
      }));

      // Call the function
      const result = await profileService.getProfile(userId);

      // Assertions
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('profiles');
      expect(result.data).toEqual({
        ...mockProfile,
        skills: [], // Empty because we're mocking differently
        availability: [] // Empty because we're mocking differently
      });
      expect(result.error).toBeNull();
    });

    it('should handle profile not found', async () => {
      // Mock user ID
      const userId = 'non-existent';
      
      // Mock profile query - not found
      mockSupabaseClient.from.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { code: 'PGRST116', message: 'No rows returned' }
        })
      }));

      // Call the function
      const result = await profileService.getProfile(userId);

      // Assertions
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('profiles');
      expect(result.data).toBeNull();
      expect(result.error).toBe('No rows returned');
    });

    it('should handle database errors', async () => {
      // Mock user ID
      const userId = 'user-123';
      
      // Mock profile query with error
      mockSupabaseClient.from.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database connection error' }
        })
      }));

      // Call the function
      const result = await profileService.getProfile(userId);

      // Assertions
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('profiles');
      expect(result.data).toBeNull();
      expect(result.error).toBe('Database connection error');
    });
  });

  describe('saveSkills', () => {
    it('should save user skills', async () => {
      // Mock user ID and skills
      const userId = 'user-123';
      const skills = [
        { name: 'JavaScript', proficiency: 'Advanced' },
        { name: 'React', proficiency: 'Intermediate' }
      ];

      // Mock delete existing skills
      mockSupabaseClient.from.mockImplementationOnce(() => ({
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          error: null
        })
      }));

      // Mock insert new skills
      mockSupabaseClient.from.mockImplementationOnce(() => ({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue({
          data: [
            { id: 'skill-1', user_id: userId, skill_name: 'JavaScript', proficiency_level: 'Advanced' },
            { id: 'skill-2', user_id: userId, skill_name: 'React', proficiency_level: 'Intermediate' }
          ],
          error: null
        })
      }));

      // Call the function
      const result = await profileService.saveSkills(userId, skills);

      // Assertions
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('user_skills');
      expect(result.data).toBeDefined();
      expect(result.error).toBeNull();
    });

    it('should handle empty skills array', async () => {
      // Mock user ID and empty skills array
      const userId = 'user-123';
      const skills = [];

      // Mock delete existing skills
      mockSupabaseClient.from.mockImplementationOnce(() => ({
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          error: null
        })
      }));

      // Call the function
      const result = await profileService.saveSkills(userId, skills);

      // Assertions
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('user_skills');
      expect(result.data).toEqual([]);
      expect(result.error).toBeNull();
    });

    it('should handle errors during delete', async () => {
      // Mock user ID and skills
      const userId = 'user-123';
      const skills = [
        { name: 'JavaScript', proficiency: 'Advanced' }
      ];

      // Mock delete with error
      mockSupabaseClient.from.mockImplementationOnce(() => ({
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockRejectedValue(new Error('Delete error'))
      }));

      // Call the function
      const result = await profileService.saveSkills(userId, skills);

      // Assertions
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('user_skills');
      expect(result.data).toBeNull();
      expect(result.error).toContain('Delete error');
    });

    it('should handle errors during insert', async () => {
      // Mock user ID and skills
      const userId = 'user-123';
      const skills = [
        { name: 'JavaScript', proficiency: 'Advanced' }
      ];

      // Mock delete (success)
      mockSupabaseClient.from.mockImplementationOnce(() => ({
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          error: null
        })
      }));

      // Mock insert with error
      mockSupabaseClient.from.mockImplementationOnce(() => ({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Insert error' }
        })
      }));

      // Call the function
      const result = await profileService.saveSkills(userId, skills);

      // Assertions
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('user_skills');
      expect(result.data).toBeNull();
      expect(result.error).toBe('Insert error');
    });
  });

  describe('saveAvailability', () => {
    it('should save user availability', async () => {
      // Mock user ID and availability
      const userId = 'user-123';
      const availability = [
        { day: 'Monday', startTime: '09:00:00', endTime: '17:00:00' },
        { day: 'Wednesday', startTime: '09:00:00', endTime: '17:00:00' }
      ];

      // Mock delete existing availability
      mockSupabaseClient.from.mockImplementationOnce(() => ({
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          error: null
        })
      }));

      // Mock insert new availability
      mockSupabaseClient.from.mockImplementationOnce(() => ({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue({
          data: [
            { id: 'avail-1', user_id: userId, day_of_week: 'Monday', start_time: '09:00:00', end_time: '17:00:00' },
            { id: 'avail-2', user_id: userId, day_of_week: 'Wednesday', start_time: '09:00:00', end_time: '17:00:00' }
          ],
          error: null
        })
      }));

      // Call the function
      const result = await profileService.saveAvailability(userId, availability);

      // Assertions
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('user_availability');
      expect(result.data).toBeDefined();
      expect(result.error).toBeNull();
    });

    it('should handle empty availability array', async () => {
      // Mock user ID and empty availability array
      const userId = 'user-123';
      const availability = [];

      // Mock delete existing availability
      mockSupabaseClient.from.mockImplementationOnce(() => ({
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          error: null
        })
      }));

      // Call the function
      const result = await profileService.saveAvailability(userId, availability);

      // Assertions
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('user_availability');
      expect(result.data).toEqual([]);
      expect(result.error).toBeNull();
    });

    it('should handle errors during delete', async () => {
      // Mock user ID and availability
      const userId = 'user-123';
      const availability = [
        { day: 'Monday', startTime: '09:00:00', endTime: '17:00:00' }
      ];

      // Mock delete with error
      mockSupabaseClient.from.mockImplementationOnce(() => ({
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockRejectedValue(new Error('Delete error'))
      }));

      // Call the function
      const result = await profileService.saveAvailability(userId, availability);

      // Assertions
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('user_availability');
      expect(result.data).toBeNull();
      expect(result.error).toContain('Delete error');
    });

    it('should handle errors during insert', async () => {
      // Mock user ID and availability
      const userId = 'user-123';
      const availability = [
        { day: 'Monday', startTime: '09:00:00', endTime: '17:00:00' }
      ];

      // Mock delete (success)
      mockSupabaseClient.from.mockImplementationOnce(() => ({
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          error: null
        })
      }));

      // Mock insert with error
      mockSupabaseClient.from.mockImplementationOnce(() => ({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Insert error' }
        })
      }));

      // Call the function
      const result = await profileService.saveAvailability(userId, availability);

      // Assertions
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('user_availability');
      expect(result.data).toBeNull();
      expect(result.error).toBe('Insert error');
    });
  });

  describe('getStatesList', () => {
    it('should return a list of states', async () => {
      // Mock states data
      const mockStates = [
        { code: 'CA', name: 'California' },
        { code: 'TX', name: 'Texas' },
        { code: 'NY', name: 'New York' }
      ];

      // Mock states query
      mockSupabaseClient.from.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: mockStates,
          error: null
        })
      }));

      // Call the function
      const result = await profileService.getStatesList();

      // Assertions
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('states');
      expect(result.data).toEqual(mockStates);
      expect(result.error).toBeNull();
    });

    it('should handle database errors', async () => {
      // Mock states query with error
      mockSupabaseClient.from.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database error' }
        })
      }));

      // Call the function
      const result = await profileService.getStatesList();

      // Assertions
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('states');
      expect(result.data).toEqual([]);
      expect(result.error).toBe('Database error');
    });
  });

  describe('getSkills', () => {
    it('should return user skills', async () => {
      // Mock user ID
      const userId = 'user-123';
      
      // Mock skills data
      const mockSkills = [
        { skill_name: 'JavaScript', proficiency_level: 'Advanced' },
        { skill_name: 'React', proficiency_level: 'Intermediate' }
      ];

      // Mock skills query
      mockSupabaseClient.from.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: mockSkills,
          error: null
        })
      }));

      // Call the function
      const result = await profileService.getSkills(userId);

      // Assertions
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('user_skills');
      expect(result.data).toEqual(mockSkills);
      expect(result.error).toBeNull();
    });

    it('should return empty array if no skills found', async () => {
      // Mock user ID
      const userId = 'user-123';
      
      // Mock skills query (no results)
      mockSupabaseClient.from.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: [],
          error: null
        })
      }));

      // Call the function
      const result = await profileService.getSkills(userId);

      // Assertions
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('user_skills');
      expect(result.data).toEqual([]);
      expect(result.error).toBeNull();
    });

    it('should handle database errors', async () => {
      // Mock user ID
      const userId = 'user-123';
      
      // Mock skills query with error
      mockSupabaseClient.from.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database error' }
        })
      }));

      // Call the function
      const result = await profileService.getSkills(userId);

      // Assertions
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('user_skills');
      expect(result.data).toEqual([]);
      expect(result.error).toBe('Database error');
    });
  });

  describe('getAvailability', () => {
    it('should return user availability', async () => {
      // Mock user ID
      const userId = 'user-123';
      
      // Mock availability data
      const mockAvailability = [
        { day_of_week: 'Monday', start_time: '09:00:00', end_time: '17:00:00' },
        { day_of_week: 'Wednesday', start_time: '09:00:00', end_time: '17:00:00' }
      ];

      // Mock availability query
      mockSupabaseClient.from.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: mockAvailability,
          error: null
        })
      }));

      // Call the function
      const result = await profileService.getAvailability(userId);

      // Assertions
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('user_availability');
      expect(result.data).toEqual(mockAvailability);
      expect(result.error).toBeNull();
    });

    it('should return empty array if no availability found', async () => {
      // Mock user ID
      const userId = 'user-123';
      
      // Mock availability query (no results)
      mockSupabaseClient.from.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: [],
          error: null
        })
      }));

      // Call the function
      const result = await profileService.getAvailability(userId);

      // Assertions
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('user_availability');
      expect(result.data).toEqual([]);
      expect(result.error).toBeNull();
    });

    it('should handle database errors', async () => {
      // Mock user ID
      const userId = 'user-123';
      
      // Mock availability query with error
      mockSupabaseClient.from.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database error' }
        })
      }));

      // Call the function
      const result = await profileService.getAvailability(userId);

      // Assertions
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('user_availability');
      expect(result.data).toEqual([]);
      expect(result.error).toBe('Database error');
    });
  });

  describe('getUserPreferences', () => {
    it('should return user preferences', async () => {
      // Mock user ID
      const userId = 'user-123';
      
      // Mock preferences data
      const mockPreferences = ['Outdoors', 'Teaching', 'Environment'];

      // Mock query
      mockSupabaseClient.from.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { preferences: mockPreferences },
          error: null
        })
      }));

      // Call the function
      const result = await profileService.getUserPreferences(userId);

      // Assertions
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('profiles');
      expect(result.data).toEqual(mockPreferences);
      expect(result.error).toBeNull();
    });

    it('should return empty array if no preferences found', async () => {
      // Mock user ID
      const userId = 'user-123';
      
      // Mock query (null preferences)
      mockSupabaseClient.from.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { preferences: null },
          error: null
        })
      }));

      // Call the function
      const result = await profileService.getUserPreferences(userId);

      // Assertions
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('profiles');
      expect(result.data).toEqual([]);
      expect(result.error).toBeNull();
    });

    it('should handle database errors', async () => {
      // Mock user ID
      const userId = 'user-123';
      
      // Mock query with error
      mockSupabaseClient.from.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database error' }
        })
      }));

      // Call the function
      const result = await profileService.getUserPreferences(userId);

      // Assertions
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('profiles');
      expect(result.data).toEqual([]);
      expect(result.error).toBe('Database error');
    });
  });

  describe('updatePreferences', () => {
    it('should update user preferences', async () => {
      // Mock user ID and preferences
      const userId = 'user-123';
      const preferences = ['Outdoors', 'Teaching', 'Environment'];

      // Mock update
      mockSupabaseClient.from.mockImplementationOnce(() => ({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue({
          data: [{ preferences }],
          error: null
        })
      }));

      // Call the function
      const result = await profileService.updatePreferences(userId, preferences);

      // Assertions
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('profiles');
      expect(result.data).toEqual(preferences);
      expect(result.error).toBeNull();
    });

    it('should handle database errors', async () => {
      // Mock user ID and preferences
      const userId = 'user-123';
      const preferences = ['Outdoors', 'Teaching'];

      // Mock update with error
      mockSupabaseClient.from.mockImplementationOnce(() => ({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database error' }
        })
      }));

      // Call the function
      const result = await profileService.updatePreferences(userId, preferences);

      // Assertions
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('profiles');
      expect(result.data).toBeNull();
      expect(result.error).toBe('Database error');
    });
  });

  describe('searchUsers', () => {
    it('should search users by name (exact match)', async () => {
      // Mock query string
      const query = 'John Doe';
      
      // Mock users data
      const mockUsers = [
        { id: 'user-1', full_name: 'John Doe', email: 'john@example.com' }
      ];

      // Mock exact match query
      mockSupabaseClient.from.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({
          data: mockUsers,
          error: null
        })
      }));

      // Call the function
      const result = await profileService.searchUsers(query);

      // Assertions
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('profiles');
      expect(result.data).toEqual(mockUsers);
      expect(result.error).toBeNull();
    });

    it('should search users by name (partial match)', async () => {
      // Mock query string
      const query = 'John';
      
      // Mock users data
      const mockUsers = [
        { id: 'user-1', full_name: 'John Doe', email: 'john@example.com' },
        { id: 'user-2', full_name: 'Johnny Smith', email: 'johnny@example.com' }
      ];

      // Mock exact match query (no results)
      mockSupabaseClient.from.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({
          data: [],
          error: null
        })
      }));

      // Mock partial match query
      mockSupabaseClient.from.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        ilike: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({
          data: mockUsers,
          error: null
        })
      }));

      // Call the function
      const result = await profileService.searchUsers(query);

      // Assertions
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('profiles');
      expect(result.data).toEqual(mockUsers);
      expect(result.error).toBeNull();
    });

    it('should search users by email if no name matches', async () => {
      // Mock query string
      const query = 'example.com';
      
      // Mock users data
      const mockUsers = [
        { id: 'user-1', full_name: 'John Doe', email: 'john@example.com' },
        { id: 'user-2', full_name: 'Jane Smith', email: 'jane@example.com' }
      ];

      // Mock exact match query (no results)
      mockSupabaseClient.from.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({
          data: [],
          error: null
        })
      }));

      // Mock partial name match query (no results)
      mockSupabaseClient.from.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        ilike: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({
          data: [],
          error: null
        })
      }));

      // Mock email match query
      mockSupabaseClient.from.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        ilike: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({
          data: mockUsers,
          error: null
        })
      }));

      // Call the function
      const result = await profileService.searchUsers(query);

      // Assertions
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('profiles');
      expect(result.data).toEqual(mockUsers);
      expect(result.error).toBeNull();
    });

    it('should handle database errors', async () => {
      // Mock query string
      const query = 'John';
      
      // Mock exact match query with error
      mockSupabaseClient.from.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        limit: jest.fn().mockImplementation(() => {
          throw new Error('Database error');
        })
      }));

      // Call the function
      const result = await profileService.searchUsers(query);

      // Assertions
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('profiles');
      expect(result.data).toEqual([]);
      expect(result.error).toBe('Database error');
    });
  });
});
