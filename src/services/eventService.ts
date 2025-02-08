import { supabase } from '../lib/supabase';
import { CalendarEvent } from '../components/calendar/EventCalendar';

// Type for the events data returned from Supabase
interface EventData {
  id: string;
  title: string;
  start_datetime: string;
  end_datetime: string;
  location: string;
  status: string;
}

interface ApplicationWithEvent {
  events: EventData;
}

/**
 * Fetches upcoming events for a volunteer
 * @param volunteerId The ID of the volunteer
 * @param limit Optional limit to the number of events to fetch (default: 100)
 * @returns Array of upcoming events
 */
export const fetchUpcomingVolunteerEvents = async (volunteerId: string, limit = 100): Promise<CalendarEvent[]> => {
  try {
    // Get current date in ISO format for comparison
    const now = new Date().toISOString();
    
    // Fetch applications for the volunteer where event date is in the future
    const { data, error } = await supabase
      .from('applications')
      .select(`
        *,
        events(*)
      `)
      .eq('volunteer_id', volunteerId)
      .in('status', ['pending', 'accepted'])
      .gte('events.start_datetime', now)
      .order('events.start_datetime', { ascending: true })
      .limit(limit);
    
    if (error) {
      console.error('Error fetching volunteer events:', error);
      throw new Error(error.message);
    }
    
    // Map the data to the CalendarEvent format
    const events: CalendarEvent[] = (data as ApplicationWithEvent[])
      ?.filter(app => app.events) // Filter out any null events
      .map(app => ({
        id: app.events.id,
        title: app.events.title,
        start_datetime: app.events.start_datetime,
        end_datetime: app.events.end_datetime,
        location: app.events.location,
        status: app.events.status
      })) || [];
    
    return events;
  } catch (error) {
    console.error('Error in fetchUpcomingVolunteerEvents:', error);
    return [];
  }
};

/**
 * Fetches past events for a volunteer
 * @param volunteerId The ID of the volunteer
 * @param limit Optional limit to the number of events to fetch (default: 100)
 * @returns Array of past events
 */
export const fetchPastVolunteerEvents = async (volunteerId: string, limit = 100): Promise<CalendarEvent[]> => {
  try {
    // Get current date in ISO format for comparison
    const now = new Date().toISOString();
    
    // Fetch applications for the volunteer where event date is in the past
    const { data, error } = await supabase
      .from('applications')
      .select(`
        *,
        events(*)
      `)
      .eq('volunteer_id', volunteerId)
      .eq('status', 'completed')
      .lt('events.start_datetime', now)
      .order('events.start_datetime', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('Error fetching past volunteer events:', error);
      throw new Error(error.message);
    }
    
    // Map the data to the CalendarEvent format
    const events: CalendarEvent[] = (data as ApplicationWithEvent[])
      ?.filter(app => app.events) // Filter out any null events
      .map(app => ({
        id: app.events.id,
        title: app.events.title,
        start_datetime: app.events.start_datetime,
        end_datetime: app.events.end_datetime,
        location: app.events.location,
        status: app.events.status
      })) || [];
    
    return events;
  } catch (error) {
    console.error('Error in fetchPastVolunteerEvents:', error);
    return [];
  }
};

/**
 * Fetches events created by an organization
 * @param organizationId The ID of the organization
 * @param limit Optional limit to the number of events to fetch (default: 100)
 * @returns Array of events
 */
export const fetchOrganizationEvents = async (organizationId: string, limit = 100): Promise<CalendarEvent[]> => {
  try {
    // Fetch events created by the organization
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('creator_id', organizationId)
      .order('start_datetime', { ascending: true })
      .limit(limit);
    
    if (error) {
      console.error('Error fetching organization events:', error);
      throw new Error(error.message);
    }
    
    // Map the data to the CalendarEvent format
    const events: CalendarEvent[] = (data as EventData[]).map(event => ({
      id: event.id,
      title: event.title,
      start_datetime: event.start_datetime,
      end_datetime: event.end_datetime,
      location: event.location,
      status: event.status
    })) || [];
    
    return events;
  } catch (error) {
    console.error('Error in fetchOrganizationEvents:', error);
    return [];
  }
};

/**
 * Generates sample events for demo purposes
 * @param count Number of sample events to generate
 * @returns Array of sample events
 */
export const generateSampleEvents = (count: number = 10): CalendarEvent[] => {
  const events: CalendarEvent[] = [];
  const eventTypes = [
    'Community Cleanup',
    'Food Drive', 
    'Homeless Shelter Assistance',
    'Animal Shelter Help',
    'Elderly Care Visit',
    'Youth Mentoring',
    'Educational Workshop',
    'Disaster Relief',
    'Environmental Conservation',
    'Health Screening'
  ];
  
  const locations = [
    'Community Center',
    'Downtown Park',
    'Public Library', 
    'City Hall',
    'Local School',
    'Riverfront',
    'Animal Shelter',
    'Senior Center',
    'Youth Center',
    'Medical Clinic'
  ];
  
  const statuses = ['pending', 'accepted', 'completed', 'cancelled'];
  
  // Current date for reference
  const now = new Date();
  const twoMonthsAgo = new Date(now);
  twoMonthsAgo.setMonth(now.getMonth() - 2);
  
  const fourMonthsFromNow = new Date(now);
  fourMonthsFromNow.setMonth(now.getMonth() + 4);
  
  // Generate random events
  for (let i = 0; i < count; i++) {
    // Random date between 2 months ago and 4 months from now
    const eventDate = new Date(
      twoMonthsAgo.getTime() + Math.random() * (fourMonthsFromNow.getTime() - twoMonthsAgo.getTime())
    );
    
    // Random duration between 1-4 hours
    const durationHours = Math.floor(Math.random() * 4) + 1;
    const endDate = new Date(eventDate);
    endDate.setHours(endDate.getHours() + durationHours);
    
    // Generate the event
    const event: CalendarEvent = {
      id: `event-${i + 1}`,
      title: eventTypes[Math.floor(Math.random() * eventTypes.length)],
      start_datetime: eventDate.toISOString(),
      end_datetime: endDate.toISOString(),
      location: locations[Math.floor(Math.random() * locations.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)]
    };
    
    events.push(event);
  }
  
  // Sort events by start date
  events.sort((a, b) => new Date(a.start_datetime).getTime() - new Date(b.start_datetime).getTime());
  
  return events;
};
