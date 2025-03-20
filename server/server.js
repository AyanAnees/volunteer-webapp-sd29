import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './db.js';  

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json()); 
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*"); 
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.use(cors({ origin: "http://127.0.0.1:5501" }));


app.post('/events', async (req, res) => {
    try {
        const { eventName, eventDescription, location, urgency, startDate, endDate } = req.body;
        console.log("Received Data:", req.body);
        const [result] = await pool.query(
            'INSERT INTO events (event_name, event_description, location, urgency, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?)',
            [eventName, eventDescription, location, urgency, startDate, endDate]
        );
        res.status(201).json({ message: "Event added successfully!", eventId: result.insertId });
    } catch (error) {
        console.error('Error saving event:', error);
        res.status(500).json({ error: "Database error" });
    }
});


app.get('/events', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM events');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ error: "Database error" });
    }
});


app.delete('/events/:id', async (req, res) => {
    try {
        const eventId = req.params.id;
        await pool.query('DELETE FROM events WHERE id = ?', [eventId]);
        res.json({ message: "Event deleted successfully!" });
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({ error: "Database error" });
    }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
