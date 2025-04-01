const express = require("express");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");
require('dotenv').config();

// Import routes
const eventRoutes = require('./routes/events');
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const historyRoutes = require('./routes/history');
const statesRoutes = require('./routes/states');
const volunteerMatchingRoutes = require('./routes/volunteer-matching');
const logsRoutes = require('./routes/logs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Serve static files from the client/public directory
app.use(express.static(path.join(__dirname, '../client/public')));

// Debug middleware to log all API requests
app.use('/api', (req, res, next) => {
  console.log(`API Request: ${req.method} ${req.originalUrl}`);
  next();
});

// API routes
app.use('/api/events', eventRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/states', statesRoutes);
app.use('/api/volunteer-matching', volunteerMatchingRoutes);
app.use('/api/logs', logsRoutes);

// Route to serve HTML pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/views/index.html'));
});

app.get('/event-management', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/views/event-management.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/views/login.html'));
});

app.get('/volunteer-matching', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/views/volunteer-matching.html'));
});

app.get('/profile', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/views/profile.html'));
});

app.get('/history', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/views/history.html'));
});

app.get('/notifications', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/views/notifications.html'));
});

// 404 handler for API routes that don't exist
app.use('/api/*', (req, res) => {
    console.log('API route not found:', req.originalUrl);
    res.status(404).json({ error: 'API endpoint not found' });
});

// Catch-all route for non-API routes - serve the SPA
app.get('*', (req, res) => {
    // For all other routes, serve the main index.html
    // This allows client-side routing to work properly
    res.sendFile(path.join(__dirname, '../client/views/index.html'));
});

// Export for main server file
module.exports = app;