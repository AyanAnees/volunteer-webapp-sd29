const express = require('express');
const router = express.Router();
const profileService = require('../services/profileService');

/**
 * @route GET /api/states
 * @desc Get list of states for form dropdowns
 * @access Public
 */
router.get('/', async (req, res) => {
  try {
    const { data, error } = await profileService.getStatesList();
    
    if (error) {
      return res.status(500).json({ error });
    }
    
    res.json(data);
  } catch (error) {
    console.error('Error fetching states:', error);
    res.status(500).json({ error: 'Failed to fetch states list' });
  }
});

module.exports = router;