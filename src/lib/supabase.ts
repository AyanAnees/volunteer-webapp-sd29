import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase.types';

// Initialize the Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:', { supabaseUrl, supabaseAnonKey });
}

// Create the Supabase client
export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);

// Initialize the database if needed
export const initApp = async () => {
  try {
    console.log('Initializing app and checking connection to Supabase...');
    
    // Test connection to Supabase
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error connecting to Supabase:', error);
      return false;
    }
    
    console.log('Successfully connected to Supabase');
    return true;
  } catch (err) {
    console.error('Error initializing app:', err);
    return false;
  }
};

// Cache for profiles to reduce database queries
const profileCache = new Map<string, any>();
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

/**
 * Check if a user is authenticated
 */
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
    
    // Ensure we have an active session with a valid user
    return !!session && 
           !!session.user && 
           (session.expires_at === undefined || 
            (session.expires_at * 1000 > Date.now()));
  } catch (error) {
    console.error('Exception in isAuthenticated:', error);
    return false;
  }
};

/**
 * Get the current authenticated user
 */
export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('Error getting current user:', error);
      return null;
    }
    
    return user;
  } catch (error) {
    console.error('Exception in getCurrentUser:', error);
    return null;
  }
};

/**
 * Get the current user's profile with type information
 */
export const getCurrentProfile = async () => {
  try {
    // Get the current user
    const user = await getCurrentUser();
    if (!user) return null;
    
    // Check cache first - but skip cache if last fetch was very recent
    // to ensure critical operations always get latest data
    const cachedProfile = profileCache.get(user.id);
    const now = Date.now();
    if (cachedProfile && cachedProfile.timestamp > now - CACHE_EXPIRY) {
      // If the cache is less than 10 seconds old, always use it
      // Otherwise use it except for critical operations that need fresh data
      if (cachedProfile.timestamp > now - 10000) {
        // Make sure email is included in the cached profile data
        return { ...cachedProfile.data, email: user.email };
      }
    }
    
    // Fetch profile from database
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
      
    if (error) {
      console.error('Error fetching profile:', error);
      
      // If the profile doesn't exist yet but we have a user,
      // create a default profile
      if (error.code === 'PGRST116') {
        try {
          // Default to volunteer if no profile exists
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              type: 'volunteer',
              display_name: user.email?.split('@')[0] || 'User',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select('*')
            .single();
            
          if (createError) {
            console.error('Error creating default profile:', createError);
            return null;
          }
          
          // Add email to the profile object from auth user
          const profileWithEmail = { ...newProfile, email: user.email };
          
          // Update cache
          profileCache.set(user.id, {
            data: profileWithEmail,
            timestamp: Date.now()
          });
          
          return profileWithEmail;
        } catch (createError) {
          console.error('Exception creating default profile:', createError);
          return null;
        }
      }
      
      return null;
    }
    
    // Add email to the profile object from auth user
    const profileWithEmail = { ...data, email: user.email };
    
    // Update cache and return profile
    profileCache.set(user.id, {
      data: profileWithEmail,
      timestamp: Date.now()
    });
    
    return profileWithEmail;
  } catch (error) {
    console.error('Exception in getCurrentProfile:', error);
    return null;
  }
};

/**
 * Check if current user has a specific role
 */
export const hasRole = async (role: 'organization' | 'volunteer'): Promise<boolean> => {
  try {
    // First ensure the user is authenticated
    const isAuth = await isAuthenticated();
    if (!isAuth) return false;
    
    // Get the current profile and check the role
    const profile = await getCurrentProfile();
    
    // Log for debugging
    console.log('Checking role:', role, 'Current profile type:', profile?.type);
    
    if (!profile) return false;
    
    // If checking for organization role, also return true for admin users
    if (role === 'organization') {
      return profile.type === 'organization' || profile.type === 'admin';
    }
    
    // Otherwise check for the specific role
    return profile.type === role;
  } catch (error) {
    console.error('Error checking role:', error);
    return false;
  }
};

/**
 * Clear profile cache, useful after updates
 */
export const clearProfileCache = (userId?: string) => {
  if (userId) {
    profileCache.delete(userId);
  } else {
    profileCache.clear();
  }
};

/**
 * Update user profile and clear cache
 */
export const updateProfile = async (profileData: any) => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('Not authenticated');
    
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...profileData,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select('*')
      .single();
      
    if (error) throw error;
    
    // Clear cache for this user
    clearProfileCache(user.id);
    
    return data;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};
