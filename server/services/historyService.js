const supabase = require('../config/supabase');

/**
 * Service to handle volunteer history operations using Supabase
 */
const historyService = {
  /**
   * Get volunteer history for a user
   * @param {string} userId - User ID
   * @returns {Promise} - Promise with user's volunteer history
   */
  async getUserHistory(userId) {
    try {
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
          event:event_id (
            id,
            event_name,
            description,
            location,
            start_date,
            end_date,
            status
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
   * @returns {Promise} - Promise with event's volunteers
   */
  async getEventVolunteers(eventId) {
    try {
      const { data, error } = await supabase
        .from('volunteer_history')
        .select(`
          id,
          status,
          hours_logged,
          applied_at,
          updated_at,
          user:user_id (
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
   * Apply for an event
   * @param {string} userId - User ID
   * @param {string} eventId - Event ID
   * @returns {Promise} - Promise with application result
   */
  async applyForEvent(userId, eventId) {
    try {
      // Check if already applied
      const { data: existingApplication, error: checkError } = await supabase
        .from('volunteer_history')
        .select('id, status')
        .eq('user_id', userId)
        .eq('event_id', eventId)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existingApplication) {
        return {
          data: existingApplication,
          error: `You have already applied for this event (Status: ${existingApplication.status})`
        };
      }

      // Get event details
      const { data: event, error: eventError } = await supabase
        .from('events')
        .select('id, event_name, status, max_volunteers, current_volunteers')
        .eq('id', eventId)
        .single();

      if (eventError) throw eventError;
      if (!event) {
        return { data: null, error: 'Event not found' };
      }

      // Check if event is still accepting volunteers
      if (event.status !== 'Planned' && event.status !== 'InProgress') {
        return { data: null, error: 'Event is no longer accepting volunteers' };
      }

      // Check if at capacity
      if (event.max_volunteers && event.current_volunteers >= event.max_volunteers) {
        return { data: null, error: 'Event has reached maximum volunteer capacity' };
      }

      // Create application
      const { data, error } = await supabase
        .from('volunteer_history')
        .insert([
          {
            user_id: userId,
            event_id: eventId,
            status: 'Applied',
            applied_at: new Date(),
            updated_at: new Date()
          }
        ])
        .select();

      if (error) throw error;

      // Update volunteer count
      await supabase
        .from('events')
        .update({
          current_volunteers: event.current_volunteers + 1,
          updated_at: new Date()
        })
        .eq('id', eventId);

      return { data: data[0], error: null };
    } catch (error) {
      console.error('Apply for event error:', error.message);
      return { data: null, error: error.message };
    }
  },

  /**
   * Update application status
   * @param {string} applicationId - Application ID
   * @param {string} status - New status
   * @returns {Promise} - Promise with update result
   */
  async updateApplicationStatus(applicationId, status) {
    try {
      // Validate status
      if (!['Applied', 'Accepted', 'Declined', 'Participated', 'NoShow'].includes(status)) {
        return { data: null, error: 'Invalid status value' };
      }

      // Update status
      const { data, error } = await supabase
        .from('volunteer_history')
        .update({
          status,
          updated_at: new Date()
        })
        .eq('id', applicationId)
        .select();

      if (error) throw error;
      if (!data || data.length === 0) {
        return { data: null, error: 'Application not found' };
      }

      return { data: data[0], error: null };
    } catch (error) {
      console.error('Update application status error:', error.message);
      return { data: null, error: error.message };
    }
  },

  /**
   * Log volunteer hours
   * @param {string} applicationId - Application ID
   * @param {number} hours - Hours logged
   * @returns {Promise} - Promise with update result
   */
  async logVolunteerHours(applicationId, hours) {
    try {
      // Update hours and set status to Participated
      const { data, error } = await supabase
        .from('volunteer_history')
        .update({
          hours_logged: hours,
          status: 'Participated',
          updated_at: new Date()
        })
        .eq('id', applicationId)
        .select();

      if (error) throw error;
      if (!data || data.length === 0) {
        return { data: null, error: 'Application not found' };
      }

      return { data: data[0], error: null };
    } catch (error) {
      console.error('Log hours error:', error.message);
      return { data: null, error: error.message };
    }
  },

  /**
   * Add feedback and rating
   * @param {string} applicationId - Application ID
   * @param {string} feedback - Feedback text
   * @param {number} rating - Rating (1-5)
   * @returns {Promise} - Promise with update result
   */
  async addFeedback(applicationId, feedback, rating) {
    try {
      // Validate rating
      if (rating < 1 || rating > 5) {
        return { data: null, error: 'Rating must be between 1 and 5' };
      }

      // Update feedback and rating
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
      if (!data || data.length === 0) {
        return { data: null, error: 'Application not found' };
      }

      return { data: data[0], error: null };
    } catch (error) {
      console.error('Add feedback error:', error.message);
      return { data: null, error: error.message };
    }
  }
};

module.exports = historyService;
