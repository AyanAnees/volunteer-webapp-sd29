// Gonna hold our backend
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors()); // Allow requests from frontend
app.use(bodyParser.json()); // Parse JSON data

// Hardcoded storage for events (this will be lost when server restarts)
let events = [];

// ✅ Route to handle event submission
app.post("/submit-event", (req, res) => {
    const { eventName, eventDescription, location, requiredSkills, urgency, startDate, endDate } = req.body;

    // Validate required fields
    if (!eventName || !location || !startDate || !endDate) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    // Create event object
    const newEvent = {
        id: events.length + 1, // Simple ID generation
        eventName,
        eventDescription,
        location,
        requiredSkills: requiredSkills || [],
        urgency,
        startDate,
        endDate
    };

    events.push(newEvent); // Store event in memory
    res.status(201).json({ message: "Event saved successfully!", event: newEvent });
});

// ✅ Route to get all stored events
app.get("/events", (req, res) => {
    res.json(events);
});

// ✅ Route to delete all events (reset)
app.delete("/clear-events", (req, res) => {
    events = []; // Clear event storage
    res.json({ message: "All events cleared!" });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
