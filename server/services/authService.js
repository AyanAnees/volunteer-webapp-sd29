const supabase = require('../config/supabase');

/**
 * Service to handle all authentication-related operations using Supabase
 */
const authService = {
  /**
   * Register a new user
   * @param {string} email - User's email address
   * @param {string} password - User's password
   * @param {object} userData - Additional user data
   * @returns {Promise} - Promise with registration result
   */
  async register(email, password, userData = {}) {
    try {
      // Combine first name and last name into full_name
      const fullName = userData.firstName && userData.lastName 
        ? `${userData.firstName} ${userData.lastName}`
        : userData.firstName || userData.lastName || email.split('@')[0];
      
      // Register user with Supabase Auth - only create the auth user, not the profile
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            first_name: userData.firstName || '',
            last_name: userData.lastName || ''
          }
        }
      });

      if (authError) throw authError;

      // Make sure we have a user before continuing
      if (!authData.user || !authData.user.id) {
        throw new Error('User creation failed or returned no user ID');
      }

      console.log("User created with ID:", authData.user.id);
      console.log("Auth status:", authData.session ? "Session created" : "No session yet");

      // Note: We don't create a profile here anymore - it will be created on first login
      
      return { data: authData, error: null };
    } catch (error) {
      console.error('Registration error:', error.message);
      return { data: null, error: error.message };
    }
  },

  /**
   * Log in a user
   * @param {string} email - User's email address
   * @param {string} password - User's password
   * @returns {Promise} - Promise with login result
   */
  async login(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      // After successful login, check if profile exists and create if needed
      if (data?.user) {
        await this._ensureProfileExists(data.user);
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Login error:', error.message);
      return { data: null, error: error.message };
    }
  },

  /**
   * Ensure user has a profile record
   * @private
   * @param {object} user - User object from auth
   * @returns {Promise} - Promise resolving when profile check is complete
   */
  async _ensureProfileExists(user) {
    try {
      if (!user || !user.id) return;
      
      // Check if profile exists
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();
        
      if (checkError) {
        console.error('Error checking for profile:', checkError);
        return;
      }
      
      // If profile doesn't exist, create it now (user is authenticated with session)
      if (!existingProfile) {
        console.log('Creating profile for user:', user.id);
        
        // Get metadata from user object
        const fullName = user.user_metadata?.full_name || 
                        (user.user_metadata?.first_name && user.user_metadata?.last_name ? 
                        `${user.user_metadata.first_name} ${user.user_metadata.last_name}` : 
                        user.email?.split('@')[0] || 'User');
        
        const { error: createError } = await supabase
          .from('profiles')
          .insert([
            {
              id: user.id,
              email: user.email,
              full_name: fullName,
              // Use placeholder values for required fields
              address_1: "Please update",
              city: "Please update",
              state: "XX",
              zip_code: "00000",
              created_at: new Date(),
              updated_at: new Date()
            }
          ]);
          
        if (createError) {
          console.error('Error creating profile during login:', createError);
        } else {
          console.log('Profile created successfully during login');
        }
      } else {
        console.log('Profile already exists for user:', user.id);
      }
    } catch (error) {
      console.error('Error in ensureProfileExists:', error);
    }
  },

  /**
   * Log out the current user
   * @returns {Promise} - Promise with logout result
   */
  async logout() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Logout error:', error.message);
      return { error: error.message };
    }
  },

  /**
   * Get the current logged-in user
   * @returns {Promise} - Promise with current user data
   */
  async getCurrentUser() {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) throw error;
      
      // If user is logged in, ensure they have a profile (but don't create twice)
      // Note: We've moved this to the login method only
      
      return { data, error: null };
    } catch (error) {
      console.error('Get current user error:', error.message);
      return { data: null, error: error.message };
    }
  },

  /**
   * Update user profile
   * @param {string} userId - User ID
   * @param {object} profileData - Profile data to update
   * @returns {Promise} - Promise with update result
   */
  async updateProfile(userId, profileData) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', userId);

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Update profile error:', error.message);
      return { data: null, error: error.message };
    }
  },

  /**
   * Get user profile
   * @param {string} userId - User ID
   * @returns {Promise} - Promise with user profile data
   */
  async getProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Get profile error:', error.message);
      return { data: null, error: error.message };
    }
  },
};

module.exports = authService;