const express = require('express');
const router = express.Router();
const volunteerHistoryService = require('../services/volunteerHistoryService');

/**
 * @route GET /api/history/user/:userId
 * @desc Get volunteer history for a user
 * @access Private
 */
router.get('/user/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    
    const { data, error } = await volunteerHistoryService.getUserHistory(userId);
    
    if (error) {
      return res.status(400).json({ error });
    }
    
    res.json(data);
  } catch (error) {
    console.error('Error fetching user history:', error);
    res.status(500).json({ error: 'Failed to fetch user history' });
  }
});

/**
 * @route GET /api/history/event/:eventId
 * @desc Get volunteers for an event
 * @access Private - Only event creator should have access
 */
router.get('/event/:eventId', async (req, res) => {
  try {
    const eventId = req.params.eventId;
    
    const { data, error } = await volunteerHistoryService.getEventVolunteers(eventId);
    
    if (error) {
      return res.status(400).json({ error });
    }
    
    res.json(data);
  } catch (error) {
    console.error('Error fetching event volunteers:', error);
    res.status(500).json({ error: 'Failed to fetch event volunteers' });
  }
});

/**
 * @route POST /api/history/apply
 * @desc Apply to volunteer for an event
 * @access Private
 */
router.post('/apply', async (req, res) => {
  try {
    const { userId, eventId } = req.body;
    
    if (!userId || !eventId) {
      return res.status(400).json({ error: 'User ID and Event ID are required' });
    }
    
    const { data, error } = await volunteerHistoryService.applyForEvent(userId, eventId);
    
    if (error) {
      return res.status(400).json({ error });
    }
    
    res.status(201).json({ 
      message: 'Successfully applied for event', 
      application: data[0] 
    });
  } catch (error) {
    console.error('Error applying for event:', error);
    res.status(500).json({ error: 'Failed to apply for event' });
  }
});

/**
 * @route PUT /api/history/status/:id
 * @desc Update volunteer application status
 * @access Private - Should validate if user is event creator
 */
router.put('/status/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const { status, hoursLogged } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }
    
    if (!['Accepted', 'Declined', 'Participated', 'NoShow'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }
    
    const { data, error } = await volunteerHistoryService.updateVolunteerStatus(id, status, hoursLogged);
    
    if (error) {
      return res.status(400).json({ error });
    }
    
    res.json({ 
      message: 'Status updated successfully', 
      application: data[0] 
    });
  } catch (error) {
    console.error('Error updating volunteer status:', error);
    res.status(500).json({ error: 'Failed to update volunteer status' });
  }
});

/**
 * @route PUT /api/history/feedback/:id
 * @desc Provide feedback for a volunteering experience
 * @access Private - Should be restricted to event creator
 */
router.put('/feedback/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const { feedback, rating } = req.body;
    
    if (!feedback) {
      return res.status(400).json({ error: 'Feedback is required' });
    }
    
    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }
    
    const { data, error } = await volunteerHistoryService.provideFeedback(id, feedback, rating);
    
    if (error) {
      return res.status(400).json({ error });
    }
    
    res.json({ 
      message: 'Feedback provided successfully', 
      application: data[0] 
    });
  } catch (error) {
    console.error('Error providing feedback:', error);
    res.status(500).json({ error: 'Failed to provide feedback' });
  }
});

module.exports = router;