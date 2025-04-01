const express = require('express');
const router = express.Router();
const eventService = require('../services/eventService');

// GET all events
router.get('/', async (req, res) => {
  try {
    const { data, error } = await eventService.getAllEvents();
    
    if (error) {
      return res.status(500).json({ error });
    }
    
    res.json(data);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// GET a specific event by ID
router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const { data, error } = await eventService.getEventById(id);
    
    if (error) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.json(data);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});

// Create a new event
router.post('/', async (req, res) => {
  try {
    const { eventName, eventDescription, location, requiredSkills, urgency, startDate, endDate, userId } = req.body;

    // Validate required fields
    if (!eventName || !location || !startDate || !endDate) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    // Log the userId to help with debugging
    console.log("Creating event with userId:", userId);

    // Prepare event data for Supabase
    const eventData = {
        event_name: eventName,
        description: eventDescription || "No description provided",
        location,
        required_skills: requiredSkills || [],
        urgency,
        start_date: startDate,
        end_date: endDate,
        created_by: userId || null // Note this may still be null for anonymous events
    };

    // Additional logging to trace urgency
    console.log("Creating event with urgency:", urgency, "normalized to:", 
        typeof urgency === 'string' ? urgency.charAt(0).toUpperCase() + urgency.slice(1).toLowerCase() : urgency);

    const { data, error } = await eventService.createEvent(eventData);

    if (error) {
      return res.status(400).json({ error });
    }

    res.status(201).json({ 
      message: "Event saved successfully!", 
      event: {
        id: data[0].id,
        eventName: data[0].event_name,
        eventDescription: data[0].description,
        location: data[0].location,
        requiredSkills: data[0].required_skills,
        urgency: data[0].urgency,
        startDate: data[0].start_date,
        endDate: data[0].end_date
      }
    });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

// Delete an event by ID
router.delete('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const { error } = await eventService.deleteEvent(id);
    
    if (error) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

// Delete all events
router.delete('/', async (req, res) => {
  try {
    const { error } = await eventService.deleteAllEvents();
    
    if (error) {
      return res.status(500).json({ error });
    }
    
    res.json({ message: "All events cleared!" });
  } catch (error) {
    console.error('Error clearing events:', error);
    res.status(500).json({ error: 'Failed to clear events' });
  }
});

module.exports = router;
