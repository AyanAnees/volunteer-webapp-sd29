const supabase = require('../config/supabase');
const eventService = require('./eventService');

/**
 * Service to handle volunteer history operations using Supabase
 */
const volunteerHistoryService = {
  /**
   * Get volunteer history for a user
   * @param {string} userId - User ID
   * @returns {Promise} - Promise with volunteer history data
   */
  async getUserHistory(userId) {
    try {
      if (!userId) {
        return { data: null, error: 'User ID is required' };
      }

      const { data, error } = await supabase
        .from('volunteer_history')
        .select(`
          id, 
          status, 
          hours_logged, 
          feedback, 
          rating, 
          applied_at,
          updated_at,
          events (
            id, 
            event_name, 
            description, 
            location, 
            start_date, 
            end_date, 
            urgency
          )
        `)
        .eq('user_id', userId)
        .order('applied_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Get user history error:', error.message);
      return { data: null, error: error.message };
    }
  },

  /**
   * Get volunteers for an event
   * @param {string} eventId - Event ID
   * @returns {Promise} - Promise with volunteer data
   */
  async getEventVolunteers(eventId) {
    try {
      if (!eventId) {
        return { data: null, error: 'Event ID is required' };
      }

      const { data, error } = await supabase
        .from('volunteer_history')
        .select(`
          id, 
          status, 
          hours_logged, 
          applied_at,
          updated_at,
          profiles:user_id (
            id, 
            full_name, 
            email
          )
        `)
        .eq('event_id', eventId)
        .order('applied_at', { ascending: true });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Get event volunteers error:', error.message);
      return { data: null, error: error.message };
    }
  },

  /**
   * Apply to volunteer for an event
   * @param {string} userId - User ID
   * @param {string} eventId - Event ID
   * @returns {Promise} - Promise with application result
   */
  async applyForEvent(userId, eventId) {
    try {
      // Validate inputs
      if (!userId || !eventId) {
        return { data: null, error: 'User ID and Event ID are required' };
      }

      // Check if user has already applied
      const { data: existing } = await supabase
        .from('volunteer_history')
        .select('id')
        .eq('user_id', userId)
        .eq('event_id', eventId)
        .maybeSingle();

      if (existing) {
        return { data: null, error: 'You have already applied for this event' };
      }

      // Check if the event exists
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('id, status, max_volunteers, current_volunteers')
        .eq('id', eventId)
        .single();

      if (eventError || !eventData) {
        return { data: null, error: 'Event not found' };
      }

      // Check event status
      if (['Completed', 'Cancelled'].includes(eventData.status)) {
        return { data: null, error: 'Event is closed or complete' };
      }

      // Check volunteer capacity
      if (eventData.max_volunteers && 
          eventData.current_volunteers >= eventData.max_volunteers) {
        return { data: null, error: 'Event has reached maximum volunteer capacity' };
      }

      // Apply for the event
      const { data, error } = await supabase
        .from('volunteer_history')
        .insert([
          {
            user_id: userId,
            event_id: eventId,
            status: 'Applied',
            applied_at: new Date()
          }
        ])
        .select();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Apply for event error:', error.message);
      return { data: null, error: error.message };
    }
  },

  /**
   * Update volunteer application status
   * @param {string} applicationId - Volunteer history record ID
   * @param {string} status - New status (Accepted, Declined, Participated, NoShow)
   * @param {number} hoursLogged - Hours volunteered (optional, for Participated status)
   * @returns {Promise} - Promise with update result
   */
  async updateVolunteerStatus(applicationId, status, hoursLogged = null) {
    try {
      // Validate inputs
      if (!applicationId) {
        return { data: null, error: 'Application ID is required' };
      }
      
      if (!status) {
        return { data: null, error: 'Status is required' };
      }
      
      // Validate status value
      const validStatuses = ['Applied', 'Accepted', 'Declined', 'Participated', 'NoShow', 'Canceled'];
      if (!validStatuses.includes(status)) {
        return { data: null, error: `Status must be one of: ${validStatuses.join(', ')}` };
      }

      // Check if application exists
      const { data: existingApplication, error: fetchError } = await supabase
        .from('volunteer_history')
        .select('id, event_id')
        .eq('id', applicationId)
        .single();
        
      if (fetchError || !existingApplication) {
        return { data: null, error: 'Application not found' };
      }

      const updateData = {
        status,
        updated_at: new Date()
      };

      // Add hours_logged if provided and status is Participated
      if (status === 'Participated' && hoursLogged !== null) {
        // Validate hours logged
        if (isNaN(hoursLogged) || hoursLogged <= 0) {
          return { data: null, error: 'Hours logged must be a positive number' };
        }
        updateData.hours_logged = hoursLogged;
      }

      const { data, error } = await supabase
        .from('volunteer_history')
        .update(updateData)
        .eq('id', applicationId)
        .select();

      if (error) throw error;

      // If volunteer was accepted, increment the current_volunteers count
      if (status === 'Accepted') {
        await supabase.rpc('increment_event_volunteers', {
          event_id: existingApplication.event_id
        });
      }

      return { data, error: null };
    } catch (error) {
      console.error('Update volunteer status error:', error.message);
      return { data: null, error: error.message };
    }
  },

  /**
   * Provide feedback for a volunteering experience
   * @param {string} applicationId - Volunteer history record ID
   * @param {string} feedback - Feedback text
   * @param {number} rating - Rating from 1-5
   * @returns {Promise} - Promise with feedback result
   */
  async provideFeedback(applicationId, feedback, rating) {
    try {
      // Validate inputs
      if (!applicationId) {
        return { data: null, error: 'Application ID is required' };
      }
      
      if (!feedback) {
        return { data: null, error: 'Feedback is required' };
      }
      
      // Validate rating
      if (!rating || isNaN(rating) || rating < 1 || rating > 5) {
        return { data: null, error: 'Rating must be a number between 1 and 5' };
      }
      
      // Check if application exists
      const { data: existingApplication, error: fetchError } = await supabase
        .from('volunteer_history')
        .select('id, status')
        .eq('id', applicationId)
        .single();
        
      if (fetchError || !existingApplication) {
        return { data: null, error: 'Application not found' };
      }

      // Only allow feedback for participated events
      if (existingApplication.status !== 'Participated') {
        return { data: null, error: 'Feedback can only be provided for participated events' };
      }

      const { data, error } = await supabase
        .from('volunteer_history')
        .update({
          feedback,
          rating,
          updated_at: new Date()
        })
        .eq('id', applicationId)
        .select();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Provide feedback error:', error.message);
      return { data: null, error: error.message };
    }
  }
};

module.exports = volunteerHistoryService;