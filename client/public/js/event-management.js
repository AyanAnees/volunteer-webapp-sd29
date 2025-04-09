// Event Management System by Hanna Asfaw
// This file contains functionality for managing events

class EventManager {
  constructor() {
    this.events = [];
    this.loaded = false;
    this.currentFilter = 'all';
  }

  // Load events from server
  async loadEvents() {
    try {
      const response = await fetch('/api/events');
      if (!response.ok) {
        throw new Error('Failed to load events');
      }
      
      const data = await response.json();
      this.events = data.events || [];
      this.loaded = true;
      return this.events;
    } catch (error) {
      console.error('Error loading events:', error);
      return [];
    }
  }

  // Create a new event
  async createEvent(eventData) {
    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to create event');
      }
      
      const newEvent = await response.json();
      this.events.push(newEvent);
      return newEvent;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  }

  // Update an existing event
  async updateEvent(eventId, updatedData) {
    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update event');
      }
      
      const updatedEvent = await response.json();
      
      // Update the event in the local array
      const index = this.events.findIndex(event => event.id === eventId);
      if (index !== -1) {
        this.events[index] = updatedEvent;
      }
      
      return updatedEvent;
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  }

  // Delete an event
  async deleteEvent(eventId) {
    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete event');
      }
      
      // Remove the event from the local array
      this.events = this.events.filter(event => event.id !== eventId);
      
      return true;
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  }

  // Filter events by type
  filterByType(type) {
    if (type === 'all') {
      return this.events;
    }
    
    return this.events.filter(event => event.type === type);
  }

  // Filter events by date range
  filterByDateRange(startDate, endDate) {
    return this.events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate >= startDate && eventDate <= endDate;
    });
  }

  // Search events by keyword
  searchEvents(keyword) {
    if (!keyword) {
      return this.events;
    }
    
    const lowerKeyword = keyword.toLowerCase();
    return this.events.filter(event => {
      return (
        (event.title && event.title.toLowerCase().includes(lowerKeyword)) ||
        (event.description && event.description.toLowerCase().includes(lowerKeyword)) ||
        (event.location && event.location.toLowerCase().includes(lowerKeyword))
      );
    });
  }

  // Get upcoming events
  getUpcomingEvents() {
    const now = new Date();
    return this.events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate > now;
    }).sort((a, b) => {
      return new Date(a.date) - new Date(b.date);
    });
  }

  // Generate event statistics
  generateStatistics() {
    if (!this.loaded || this.events.length === 0) {
      return null;
    }

    // Count events by type
    const eventsByType = {};
    this.events.forEach(event => {
      const type = event.type || 'Uncategorized';
      if (!eventsByType[type]) {
        eventsByType[type] = 0;
      }
      eventsByType[type]++;
    });

    // Count upcoming vs. past events
    const now = new Date();
    const upcomingEvents = this.events.filter(event => new Date(event.date) > now);
    const pastEvents = this.events.filter(event => new Date(event.date) <= now);

    return {
      totalEvents: this.events.length,
      upcomingEvents: upcomingEvents.length,
      pastEvents: pastEvents.length,
      eventsByType
    };
  }
}

// Export the class for use in the main application
module.exports = EventManager;
