import { supabase } from './supabase';

/**
 * Initializes the database by checking if required tables exist and creates them if needed
 */
export const initializeDatabase = async () => {
  console.log('Checking database initialization status...');
  
  try {
    // Check if profiles table exists by querying for a single record
    const { error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    // If no error, the table exists
    if (!error) {
      console.log('Database tables already exist');
      return true;
    }
    
    // If we got an error related to the table not existing, we need to create it
    if (error.message.includes('relation "public.profiles" does not exist')) {
      console.log('Profiles table does not exist, attempting to create...');
      
      // Create the profiles table
      const { error: createError } = await supabase.rpc('init_database');
      
      if (createError) {
        console.error('Failed to initialize database:', createError);
        
        // Try directly creating the profiles table as a fallback
        const { error: tableError } = await supabase
          .from('profiles')
          .insert({}) // This will fail, but it will create the table if RLS allows
          .select();
        
        if (tableError) {
          console.error('Failed to create profiles table:', tableError);
          return false;
        }
      }
      
      console.log('Database initialization successful');
      return true;
    }
    
    console.error('Unknown database error:', error);
    return false;
  } catch (err) {
    console.error('Database initialization failed:', err);
    return false;
  }
};

/**
 * Checks if the database schema has been properly initialized
 */
export const validateDatabaseSchema = async () => {
  try {
    // Check if the profiles table has the required columns
    const { data, error } = await supabase
      .from('profiles')
      .select('id, type, display_name')
      .limit(1);
    
    if (error) {
      console.error('Database schema validation failed:', error);
      return false;
    }
    
    console.log('Database schema validation successful');
    return true;
  } catch (err) {
    console.error('Database schema validation failed:', err);
    return false;
  }
};
