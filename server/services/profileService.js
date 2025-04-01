const supabase = require('../config/supabase');

/**
 * Service to handle user profile operations using Supabase
 */
const profileService = {
  /**
   * Create or update user profile
   * @param {string} userId - User ID
   * @param {object} profileData - Profile data
   * @returns {Promise} - Promise with profile update result
   */
  async updateProfile(userId, profileData) {
    try {
      // Validate required fields
      const requiredFields = ['full_name', 'address_1', 'city', 'state', 'zip_code'];
      for (const field of requiredFields) {
        if (!profileData[field]) {
          return { data: null, error: `${field.replace('_', ' ')} is required` };
        }
      }
      
      // Validate zip code format (5 digits, optionally followed by dash and 4 more digits)
      const zipCodeRegex = /^\d{5}(-\d{4})?$/;
      if (!zipCodeRegex.test(profileData.zip_code)) {
        return { data: null, error: 'Invalid zip code format. Use 5 digits or 5+4 format (e.g. 12345 or 12345-6789)' };
      }
      
      // Validate state code (must be 2 uppercase letters)
      const stateCodeRegex = /^[A-Z]{2}$/;
      if (!stateCodeRegex.test(profileData.state)) {
        return { data: null, error: 'Invalid state code. Use 2-letter state abbreviation (e.g. CA, NY)' };
      }
      
      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      let result;
      if (existingProfile) {
        // Update existing profile
        result = await supabase
          .from('profiles')
          .update({
            ...profileData,
            updated_at: new Date(),
          })
          .eq('id', userId)
          .select();
      } else {
        // Insert new profile
        result = await supabase
          .from('profiles')
          .insert([
            {
              id: userId,
              ...profileData,
              created_at: new Date(),
              updated_at: new Date(),
            },
          ])
          .select();
      }

      if (result.error) throw result.error;
      return { data: result.data, error: null };
    } catch (error) {
      console.error('Update profile error:', error.message);
      return { data: null, error: error.message };
    }
  },

  /**
   * Get user profile with skills and availability
   * @param {string} userId - User ID
   * @returns {Promise} - Promise with user profile data
   */
  async getProfile(userId) {
    try {
      // Get basic profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        // Handle "no rows returned" error specifically
        if (profileError.code === 'PGRST116') {
          return { data: null, error: 'No rows returned' };
        }
        throw profileError;
      }
      
      // Get skills
      const { data: skills, error: skillsError } = await supabase
        .from('user_skills')
        .select('skill_name, proficiency_level')
        .eq('user_id', userId);

      if (skillsError) throw skillsError;
      
      // Get availability
      const { data: availability, error: availabilityError } = await supabase
        .from('user_availability')
        .select('day_of_week, start_time, end_time')
        .eq('user_id', userId);

      if (availabilityError) throw availabilityError;
      
      // Combine data
      const completeProfile = {
        ...profile,
        skills: skills || [],
        availability: availability || []
      };
      
      return { data: completeProfile, error: null };
    } catch (error) {
      console.error('Get profile error:', error.message);
      return { data: null, error: error.message };
    }
  },

  /**
   * Save user skills
   * @param {string} userId - User ID
   * @param {array} skills - Array of skill objects {name, proficiency}
   * @returns {Promise} - Promise with skills update result
   */
  async saveSkills(userId, skills) {
    try {
      // First, delete existing skills for this user
      await supabase
        .from('user_skills')
        .delete()
        .eq('user_id', userId);

      // Then insert new skills
      if (skills && skills.length > 0) {
        const skillRows = skills.map(skill => ({
          user_id: userId,
          skill_name: skill.name,
          proficiency_level: skill.proficiency || 'Beginner',
          created_at: new Date()
        }));

        const { data, error } = await supabase
          .from('user_skills')
          .insert(skillRows)
          .select();

        if (error) throw error;
        return { data, error: null };
      }
      return { data: [], error: null };
    } catch (error) {
      console.error('Save skills error:', error.message);
      return { data: null, error: error.message };
    }
  },

  /**
   * Save user availability
   * @param {string} userId - User ID
   * @param {array} availabilitySlots - Array of availability objects {day, startTime, endTime}
   * @returns {Promise} - Promise with availability update result
   */
  async saveAvailability(userId, availabilitySlots) {
    try {
      // Delete existing availability
      await supabase
        .from('user_availability')
        .delete()
        .eq('user_id', userId);

      // Insert new availability
      if (availabilitySlots && availabilitySlots.length > 0) {
        const slotRows = availabilitySlots.map(slot => ({
          user_id: userId,
          day_of_week: slot.day,
          start_time: slot.startTime,
          end_time: slot.endTime,
          created_at: new Date()
        }));

        const { data, error } = await supabase
          .from('user_availability')
          .insert(slotRows)
          .select();

        if (error) throw error;
        return { data, error: null };
      }
      return { data: [], error: null };
    } catch (error) {
      console.error('Save availability error:', error.message);
      return { data: null, error: error.message };
    }
  },
  
  /**
   * Get states list for form dropdown
   * @returns {Promise} - Promise with states data
   */
  async getStatesList() {
    try {
      const { data, error } = await supabase
        .from('states')
        .select('code, name')
        .order('name');

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Get states list error:', error.message);
      return { data: [], error: error.message };
    }
  },
  
  /**
   * Get user skills
   * @param {string} userId - User ID
   * @returns {Promise} - Promise with user skills
   */
  async getSkills(userId) {
    try {
      const { data, error } = await supabase
        .from('user_skills')
        .select('skill_name, proficiency_level')
        .eq('user_id', userId);

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.error('Get skills error:', error.message);
      return { data: [], error: error.message };
    }
  },

  /**
   * Get user availability 
   * @param {string} userId - User ID
   * @returns {Promise} - Promise with user availability
   */
  async getAvailability(userId) {
    try {
      const { data, error } = await supabase
        .from('user_availability')
        .select('day_of_week, start_time, end_time')
        .eq('user_id', userId);

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.error('Get availability error:', error.message);
      return { data: [], error: error.message };
    }
  },

  /**
   * Get user preferences
   * @param {string} userId - User ID 
   * @returns {Promise} - Promise with user preferences
   */
  async getUserPreferences(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('preferences')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return { data: data.preferences || [], error: null };
    } catch (error) {
      console.error('Get user preferences error:', error.message);
      return { data: [], error: error.message };
    }
  },
  
  /**
   * Update user preferences
   * @param {string} userId - User ID
   * @param {array} preferences - Array of preference strings
   * @returns {Promise} - Promise with update result
   */
  async updatePreferences(userId, preferences) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ 
          preferences,
          updated_at: new Date()
        })
        .eq('id', userId)
        .select('preferences');

      if (error) throw error;
      return { data: data[0].preferences, error: null };
    } catch (error) {
      console.error('Update preferences error:', error.message);
      return { data: null, error: error.message };
    }
  },
  
  /**
   * Search users by name or email
   * @param {string} query - Search query
   * @returns {Promise} - Promise with search results
   */
  async searchUsers(query) {
    try {
      console.log('Searching for users with query:', query);
      
      // First try with exact match
      let { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('full_name', query)
        .limit(10);
        
      console.log('Exact match results:', data);
      
      // If no results, try with case-insensitive partial match
      if (!data || data.length === 0) {
        const { data: likeData, error: likeError } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .ilike('full_name', `%${query}%`)
          .limit(10);
          
        data = likeData;
        error = likeError;
        console.log('ILIKE match results:', data);
      }
      
      // If still no results, try with email
      if (!data || data.length === 0) {
        const { data: emailData, error: emailError } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .ilike('email', `%${query}%`)
          .limit(10);
          
        data = emailData;
        error = emailError;
        console.log('Email match results:', data);
      }

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.error('Search users error:', error.message);
      return { data: [], error: error.message };
    }
  }
};

module.exports = profileService;