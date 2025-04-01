const supabase = require('../config/supabase');

/**
 * Service to handle event-related operations using Supabase
 */
const eventService = {
  /**
   * Get all events with filtering options
   * @param {object} filters - Optional filters (status, urgency, skills, date range)
   * @returns {Promise} - Promise with events data
   */
  async getAllEvents(filters = {}) {
    try {
      let query = supabase
        .from('events')
        .select(`
          id,
          event_name,
          description,
          location,
          required_skills,
          urgency,
          start_date,
          end_date,
          max_volunteers,
          current_volunteers,
          status,
          created_at,
          created_by
        `);
      
      // Apply filters
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      
      if (filters.urgency) {
        query = query.eq('urgency', filters.urgency);
      }
      
      if (filters.skill) {
        query = query.contains('required_skills', [filters.skill]);
      }
      
      if (filters.startDate) {
        query = query.gte('start_date', filters.startDate);
      }
      
      if (filters.endDate) {
        query = query.lte('end_date', filters.endDate);
      }
      
      // Apply ordering
      query = query.order('start_date', { ascending: true });

      const { data, error } = await query;

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Get all events error:', error.message);
      return { data: null, error: error.message };
    }
  },

  /**
   * Get events created by a specific user
   * @param {string} userId - User ID of the event creator
   * @returns {Promise} - Promise with events data
   */
  async getUserEvents(userId) {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('created_by', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Get user events error:', error.message);
      return { data: null, error: error.message };
    }
  },

  /**
   * Get event by ID with detailed information
   * @param {string} eventId - Event ID
   * @returns {Promise} - Promise with event data
   */
  async getEventById(eventId) {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (error) throw error;
      
      // Get volunteers for this event
      const { data: volunteers } = await supabase
        .from('volunteer_history')
        .select(`
          id,
          status,
          profiles:user_id (
            id,
            full_name
          )
        `)
        .eq('event_id', eventId)
        .in('status', ['Applied', 'Accepted', 'Participated']);
      
      return { 
        data: {
          ...data,
          volunteers: volunteers || []
        }, 
        error: null 
      };
    } catch (error) {
      console.error('Get event error:', error.message);
      return { data: null, error: error.message };
    }
  },

  /**
   * Create a new event with validation
   * @param {object} eventData - Event data
   * @returns {Promise} - Promise with created event data
   */
  async createEvent(eventData) {
    try {
      // Validation
      const requiredFields = ['event_name', 'description', 'location', 'urgency', 'start_date', 'end_date'];
      for (const field of requiredFields) {
        if (!eventData[field]) {
          return { data: null, error: `${field.replace('_', ' ')} is required` };
        }
      }
      
      // Validate event name length
      if (eventData.event_name.length > 100) {
        return { data: null, error: 'Event name cannot exceed 100 characters' };
      }
      
      // Validate date range
      const startDate = new Date(eventData.start_date);
      const endDate = new Date(eventData.end_date);
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return { data: null, error: 'Invalid date format' };
      }
      
      if (startDate >= endDate) {
        return { data: null, error: 'End date must be after start date' };
      }
      
      // Validate urgency (case-insensitive)
      const normalizedUrgency = typeof eventData.urgency === 'string' ? 
        eventData.urgency.charAt(0).toUpperCase() + eventData.urgency.slice(1).toLowerCase() : 
        eventData.urgency;
      
      if (!['Low', 'Medium', 'High'].includes(normalizedUrgency)) {
        return { data: null, error: 'Urgency must be Low, Medium, or High' };
      }
      
      // Standardize the urgency value to ensure consistent capitalization
      eventData.urgency = normalizedUrgency;

      // Create the event
      // Use service role key to bypass RLS if needed
      const supabaseAdmin = supabase;
      
      const { data, error } = await supabaseAdmin
        .from('events')
        .insert([
          {
            ...eventData,
            status: 'Planned',
            created_at: new Date(),
            updated_at: new Date()
          },
        ])
        .select();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Create event error:', error.message);
      return { data: null, error: error.message };
    }
  },

  /**
   * Update an event
   * @param {string} eventId - Event ID
   * @param {object} eventData - Updated event data
   * @returns {Promise} - Promise with update result
   */
  async updateEvent(eventId, eventData) {
    try {
      // Validation similar to createEvent
      if (eventData.event_name && eventData.event_name.length > 100) {
        return { data: null, error: 'Event name cannot exceed 100 characters' };
      }
      
      if (eventData.start_date && eventData.end_date) {
        const startDate = new Date(eventData.start_date);
        const endDate = new Date(eventData.end_date);
        
        if (startDate >= endDate) {
          return { data: null, error: 'End date must be after start date' };
        }
      }
      
      if (eventData.urgency && !['Low', 'Medium', 'High'].includes(eventData.urgency)) {
        return { data: null, error: 'Urgency must be Low, Medium, or High' };
      }

      const { data, error } = await supabase
        .from('events')
        .update({
          ...eventData,
          updated_at: new Date()
        })
        .eq('id', eventId)
        .select();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Update event error:', error.message);
      return { data: null, error: error.message };
    }
  },

  /**
   * Delete an event
   * @param {string} eventId - Event ID
   * @returns {Promise} - Promise with delete result
   */
  async deleteEvent(eventId) {
    try {
      // First delete all volunteer history for this event
      await supabase
        .from('volunteer_history')
        .delete()
        .eq('event_id', eventId);
        
      // Then delete the event
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Delete event error:', error.message);
      return { error: error.message };
    }
  },

  /**
   * Update event status
   * @param {string} eventId - Event ID
   * @param {string} status - New status (Planned, InProgress, Completed, Cancelled)
   * @returns {Promise} - Promise with update result
   */
  async updateEventStatus(eventId, status) {
    try {
      if (!['Planned', 'InProgress', 'Completed', 'Cancelled'].includes(status)) {
        return { data: null, error: 'Invalid status value' };
      }
      
      const { data, error } = await supabase
        .from('events')
        .update({
          status,
          updated_at: new Date()
        })
        .eq('id', eventId)
        .select();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Update event status error:', error.message);
      return { data: null, error: error.message };
    }
  },
  
  /**
   * Find events matching user skills and preferences
   * @param {string} userId - User ID
   * @returns {Promise} - Promise with matching events
   */
  async findMatchingEvents(userId) {
    try {
      // Get user skills and preferences
      const { data: profile } = await supabase
        .from('profiles')
        .select('preferences')
        .eq('id', userId)
        .single();
      
      const { data: skills } = await supabase
        .from('user_skills')
        .select('skill_name')
        .eq('user_id', userId);
      
      const userSkills = skills ? skills.map(s => s.skill_name) : [];
      const userPreferences = profile?.preferences || [];
      
      // Find events that match user skills or preferences
      // Only include future events and active status
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .or(`status.in.(Planned,InProgress)`)
        .gte('start_date', new Date().toISOString())
        .order('start_date', { ascending: true });
      
      if (error) throw error;
      
      // Filter and score events on the server-side for more complex matching
      const now = new Date();
      const scoredEvents = data.map(event => {
        let score = 0;
        
        // Score based on skill match (0-5 points)
        const skillOverlap = event.required_skills.filter(skill => 
          userSkills.includes(skill)
        ).length;
        
        if (skillOverlap > 0) {
          score += Math.min(skillOverlap * 2, 5); // Max 5 points for skills
        }
        
        // Score based on preference match (0-3 points)
        if (userPreferences.length > 0) {
          // Simple fuzzy matching looking for preference words in event description
          const descLower = event.description.toLowerCase();
          const prefMatch = userPreferences.filter(pref => 
            descLower.includes(pref.toLowerCase())
          ).length;
          
          score += Math.min(prefMatch, 3); // Max 3 points for preferences
        }
        
        // Score based on urgency (0-3 points)
        if (event.urgency === 'High') score += 3;
        else if (event.urgency === 'Medium') score += 2;
        else score += 1;
        
        // Score based on how soon the event is happening (0-4 points)
        const eventDate = new Date(event.start_date);
        const daysUntil = Math.max(0, Math.floor((eventDate - now) / (1000 * 60 * 60 * 24)));
        
        if (daysUntil < 3) score += 4;
        else if (daysUntil < 7) score += 3;
        else if (daysUntil < 14) score += 2;
        else if (daysUntil < 30) score += 1;
        
        return {
          ...event,
          matchScore: score
        };
      });
      
      // Sort by match score (highest first)
      scoredEvents.sort((a, b) => b.matchScore - a.matchScore);
      
      return { data: scoredEvents, error: null };
    } catch (error) {
      console.error('Find matching events error:', error.message);
      return { data: [], error: error.message };
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
      // Check if the user has already applied for this event
      const { data: existingApplication } = await supabase
        .from('volunteer_history')
        .select('id, status')
        .eq('user_id', userId)
        .eq('event_id', eventId)
        .maybeSingle();
      
      if (existingApplication) {
        return { 
          data: existingApplication, 
          error: `You have already applied for this event (Status: ${existingApplication.status})` 
        };
      }
      
      // Check if event exists and is still accepting volunteers
      const { data: event, error: eventError } = await supabase
        .from('events')
        .select('id, event_name, max_volunteers, current_volunteers, status')
        .eq('id', eventId)
        .single();
      
      if (eventError) {
        return { data: null, error: 'Event not found' };
      }
      
      if (event.status !== 'Planned' && event.status !== 'InProgress') {
        return { data: null, error: 'Event is no longer accepting volunteers' };
      }
      
      if (event.max_volunteers && event.current_volunteers >= event.max_volunteers) {
        return { data: null, error: 'Event has reached maximum volunteer capacity' };
      }
      
      // Create the application
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
      
      // Increment the current_volunteers count for the event
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
  }
};

module.exports = eventService;