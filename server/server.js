import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './db.js';  

dotenv.config();

const app = express();
app.use(cors({ origin: "http://127.0.0.1:5501" , credentials: true }));
app.use(express.json()); 

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*"); 
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

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
app.put('/events/:id', async (req, res) => {
    try {
        const eventId = req.params.id;
        const { eventName, eventDescription, location, urgency, startDate, endDate, skills } = req.body;

        const [result] = await pool.query(
            'UPDATE events SET event_name=?, event_description=?, location=?, urgency=?, start_date=?, end_date=?, skills=? WHERE id=?',
            [eventName, eventDescription, location, urgency, startDate, endDate, skills, eventId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Event not found" });
        }

        res.json({ message: "Event updated successfully!" });
    } catch (error) {
        console.error('Error updating event:', error);
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
export default app;
if (import.meta.url === `file://${process.argv[1]}`) {
    const PORT = process.env.PORT || 5001;
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
}

