const express = require('express');
const router = express.Router();
const authService = require('../services/authService');

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 */
router.post('/register', async (req, res) => {
  try {
    const { 
      email, 
      password, 
      firstName, 
      lastName,
      address1,
      address2,
      city,
      state,
      zipCode
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (!address1 || !city || !state || !zipCode) {
      return res.status(400).json({ error: 'Address information is required' });
    }

    const { data, error } = await authService.register(email, password, { 
      firstName, 
      lastName,
      address1,
      address2,
      city,
      state,
      zipCode
    });

    if (error) {
      return res.status(400).json({ error });
    }

    res.status(201).json({
      message: 'Registration successful',
      user: {
        id: data.user.id,
        email: data.user.email
      }
    });
  } catch (error) {
    console.error('Register route error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

/**
 * @route POST /api/auth/login
 * @desc Log in a user
 * @access Public
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const { data, error } = await authService.login(email, password);

    if (error) {
      return res.status(401).json({ error });
    }

    res.status(200).json({
      message: 'Login successful',
      user: {
        id: data.user.id,
        email: data.user.email
      },
      session: data.session
    });
  } catch (error) {
    console.error('Login route error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

/**
 * @route POST /api/auth/logout
 * @desc Log out a user
 * @access Public
 */
router.post('/logout', async (req, res) => {
  try {
    const { error } = await authService.logout();

    if (error) {
      return res.status(400).json({ error });
    }

    res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout route error:', error);
    res.status(500).json({ error: 'Server error during logout' });
  }
});

/**
 * @route GET /api/auth/user
 * @desc Get current user
 * @access Private
 */
router.get('/user', async (req, res) => {
  try {
    const { data, error } = await authService.getCurrentUser();

    if (error) {
      return res.status(401).json({ error });
    }

    if (!data.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    res.status(200).json({
      user: {
        id: data.user.id,
        email: data.user.email
      }
    });
  } catch (error) {
    console.error('Get user route error:', error);
    res.status(500).json({ error: 'Server error retrieving user' });
  }
});

module.exports = router;
