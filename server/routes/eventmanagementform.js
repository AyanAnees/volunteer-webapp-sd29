const express = require("express");
const cors = require("cors");
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

let events = []; 
let errors = [];
// Validation function
function validateEvent(event) {
    
    if (!event.eventName || event.eventName.length > 100) {
        errors.push("Event name is required and must be under 100 characters.");
    }
    if (!event.eventDescription || event.eventDescription.length > 500) {
        errors.push("Event description is required and must be under 500 characters.");
    }
    if (!event.location) {
        errors.push("Location is required.");
    }
    if (!event.startDate || !event.endDate || new Date(event.startDate) > new Date(event.endDate)) {
        errors.push("Valid start and end dates are required.");
    }
    return errors;
}

module.exports = validateEvent
// Route to create an event
app.post("/submit-event", (req, res) => {
    try {
        const event = req.body;
        const validationErrors = validateEvent(event);

        if (validationErrors.length > 0) {
            return res.status(400).json({ success: false, errors: validationErrors });
        }

        event.id = events.length + 1; 
        events.push(event);

        res.json({ success: true, message: "Event saved successfully!", event });
    } catch (error) {
        console.error("Error saving event:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});


// Route to get all events
app.get("/events", (req, res) => {
    res.json(events);
});

// Start the server
//app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
if (process.env.NODE_ENV !== "test") {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}



module.exports = app;
