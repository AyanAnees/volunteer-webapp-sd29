const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// In-memory log storage for debugging
const logs = [];

/**
 * @route GET /api/logs
 * @desc Get all debug logs
 */
router.get('/', (req, res) => {
  res.json(logs);
});

/**
 * @route POST /api/logs
 * @desc Add a debug log
 */
router.post('/', (req, res) => {
  const { message, data } = req.body;
  const timestamp = new Date();
  
  const log = {
    timestamp,
    message,
    data
  };
  
  console.log(`[CLIENT LOG] ${message}`, data);
  
  logs.push(log);
  
  // Keep only the last 100 logs
  if (logs.length > 100) {
    logs.shift();
  }
  
  res.status(201).json({ success: true });
});

/**
 * @route DELETE /api/logs
 * @desc Clear all logs
 */
router.delete('/', (req, res) => {
  logs.length = 0;
  res.json({ success: true, message: 'Logs cleared' });
});

// Get all events without filters or matching
router.get('/all-events', async (req, res) => {
  try {
    // Direct query to events table
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching all events:', error);
      return res.status(500).json({ error: error.message });
    }
    
    console.log(`Found ${data ? data.length : 0} events in database`);
    res.json(data || []);
  } catch (error) {
    console.error('Error in all-events endpoint:', error);
    res.status(500).json({ error: error.message });
  }
});

// Helper function to get user profile info
router.get('/check-profile/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Direct query to profiles table
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId);
      
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    
    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    
    res.json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;