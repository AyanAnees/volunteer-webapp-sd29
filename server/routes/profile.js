const express = require('express');
const router = express.Router();
const profileService = require('../services/profileService');

/**
 * @route GET /api/profile/:userId
 * @desc Get user profile
 * @access Private
 */
router.get('/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Get profile data
    const { data: profile, error: profileError } = await profileService.getProfile(userId);
    
    if (profileError) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    
    // Get skills
    const { data: skills, error: skillsError } = await profileService.getSkills(userId);
    
    if (skillsError) {
      console.error('Error fetching skills:', skillsError);
    }
    
    // Get availability
    const { data: availability, error: availabilityError } = await profileService.getAvailability(userId);
    
    if (availabilityError) {
      console.error('Error fetching availability:', availabilityError);
    }
    
    // Combine all data
    const userData = {
      ...profile,
      skills: skills || [],
      availability: availability || []
    };
    
    res.json(userData);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

/**
 * @route GET /api/profile/search
 * @desc Search for profiles (debug endpoint)
 * @access Public
 */
router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;
    console.log('Direct profile search with query:', query);
    
    if (!query || query.length < 2) {
      return res.status(400).json({ error: 'Search query must be at least 2 characters' });
    }
    
    // Direct raw query to debug
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .ilike('full_name', `%${query}%`);
    
    console.log('Direct profile search results:', data);
    console.log('Direct profile search error:', error);
    
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    
    res.json(data);
  } catch (error) {
    console.error('Error in direct profile search:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route POST /api/profile/:userId
 * @desc Update user profile
 * @access Private
 */
router.post('/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const { 
      fullName, 
      address1, 
      address2, 
      city, 
      state, 
      zipCode,
      skills,
      availability 
    } = req.body;
    
    // Update basic profile info
    const profileData = {
      full_name: fullName,
      address_1: address1,
      address_2: address2 || null,
      city,
      state,
      zip_code: zipCode
    };
    
    const { error: profileError } = await profileService.updateProfile(userId, profileData);
    
    if (profileError) {
      return res.status(400).json({ error: profileError });
    }
    
    // Update skills if provided and not empty
    if (skills && Array.isArray(skills) && skills.length > 0 && skills[0]) {
      // Convert simple array of skill names to required format
      const formattedSkills = skills.map(skill => ({
        name: skill,
        proficiency: 'Beginner' // Default proficiency
      }));
      
      const { error: skillsError } = await profileService.saveSkills(userId, formattedSkills);
      
      if (skillsError) {
        console.error('Error saving skills:', skillsError);
      }
    }
    
    // Update availability if provided and not empty
    if (availability && Array.isArray(availability) && availability.length > 0 && availability[0]) {
      // Convert datetime strings to required format
      const formattedAvailability = availability.map(slot => {
        const date = new Date(slot);
        // Get day of week as string (Monday, Tuesday, etc.)
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayOfWeek = dayNames[date.getDay()];
        
        // Format time as HH:MM:SS
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const startTime = `${hours}:${minutes}:00`;
        
        // End time is 1 hour later by default
        const endDate = new Date(date);
        endDate.setHours(endDate.getHours() + 1);
        const endHours = endDate.getHours().toString().padStart(2, '0');
        const endMinutes = endDate.getMinutes().toString().padStart(2, '0');
        const endTime = `${endHours}:${endMinutes}:00`;
        
        return {
          day: dayOfWeek,
          startTime: startTime,
          endTime: endTime
        };
      });
      
      const { error: availabilityError } = await profileService.saveAvailability(userId, formattedAvailability);
      
      if (availabilityError) {
        console.error('Error saving availability:', availabilityError);
      }
    }
    
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

module.exports = router;
