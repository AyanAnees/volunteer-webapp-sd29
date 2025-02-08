import { supabase } from './supabase';
import { NavigateFunction } from 'react-router-dom';

/**
 * A utility function to safely handle authentication redirects
 * This ensures that protected pages redirect unauthenticated users
 */
export const handleAuthRedirect = async (
  navigate: NavigateFunction,
  targetPath: string = '/auth/login'
) => {
  try {
    // Check if there is a session
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Auth session error:', error);
      navigate(targetPath, { replace: true });
      return false;
    }
    
    // Redirect if no session
    if (!data.session) {
      console.log('No active session, redirecting to login');
      navigate(targetPath, { replace: true });
      return false;
    }
    
    // Session exists, check if it's expired
    const expiryTime = data.session.expires_at;
    if (expiryTime && expiryTime * 1000 < Date.now()) {
      console.log('Session expired, redirecting to login');
      await supabase.auth.signOut();
      navigate(targetPath, { replace: true });
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Auth redirect error:', error);
    navigate(targetPath, { replace: true });
    return false;
  }
};
