import { supabase } from './supabase';

// Function to create a profile with direct database access
export const createProfile = async (
  userId: string,
  userType: 'volunteer' | 'organization' | 'admin',
  displayName: string
) => {
  try {
    // Add status field and make all fields explicit
    const profileData = {
      id: userId,
      type: userType,
      display_name: displayName,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: 'active'
    };
    
    console.log('Attempting to create profile with data:', profileData);
    
    // Insert the profile
    const { data, error } = await supabase
      .from('profiles')
      .insert(profileData)
      .select();
    
    if (error) {
      console.error('Error creating profile via insert:', error);
      
      // If the profile might already exist, try to update it instead
      console.log('Trying update as fallback...');
      const { data: updateData, error: updateError } = await supabase
        .from('profiles')
        .update({
          type: userType,
          display_name: displayName,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select();
      
      if (updateError) {
        console.error('Error updating existing profile:', updateError);
        throw updateError;
      }
      
      return { success: true, data: updateData };
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('Profile creation failed completely:', error);
    throw error;
  }
};
