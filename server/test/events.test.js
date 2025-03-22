import request from 'supertest';
//import app from '../server.js'; // Use ES Modules import
//import pool from '../db.js';    // Use ES Modules import
//jest.mock('../db.js');



const mockPool = {
    query: jest.fn(),
  };
 
  jest.unstable_mockModule('../db.js', () => ({
    default: mockPool,
  }));
  
  const { default: app } = await import('../server.js');
  const { default: pool } = await import('../db.js');

describe('Event Routes', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /events', () => {
        it('should create a new event and return 201 status', async () => {
            const mockEvent = {
                eventName: 'Test Event',
                eventDescription: 'This is a test event',
                location: 'Test Location',
                urgency: 'High',
                startDate: '2023-12-01',
                endDate: '2023-12-02',
            };

            
            pool.query.mockResolvedValueOnce([{ insertId: 1 }]);

            const response = await request(app)
                .post('/events')
                .send(mockEvent);

            expect(response.status).toBe(201);
            expect(response.body).toEqual({
                message: 'Event added successfully!',
                eventId: 1,
            });
        });

        it('should return 500 status if database query fails', async () => {
            const mockEvent = {
                eventName: 'Test Event',
                eventDescription: 'This is a test event',
                location: 'Test Location',
                urgency: 'High',
                startDate: '2023-12-01',
                endDate: '2023-12-02',
            };

           
            pool.query.mockRejectedValueOnce(new Error('Database error'));

            const response = await request(app)
                .post('/events')
                .send(mockEvent);

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ error: 'Database error' });
        });
    });

    describe('GET /events', () => {
        it('should fetch all events and return 200 status', async () => {
            const mockEvents = [
                {
                    id: 1,
                    event_name: 'Test Event 1',
                    event_description: 'This is a test event',
                    location: 'Test Location',
                    urgency: 'High',
                    start_date: '2023-12-01',
                    end_date: '2023-12-02',
                },
                {
                    id: 2,
                    event_name: 'Test Event 2',
                    event_description: 'This is another test event',
                    location: 'Test Location 2',
                    urgency: 'Medium',
                    start_date: '2023-12-03',
                    end_date: '2023-12-04',
                },
            ];

            pool.query.mockResolvedValueOnce([mockEvents]);

            const response = await request(app).get('/events');

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockEvents);
        });

        it('should return 500 status if database query fails', async () => {
         
            pool.query.mockRejectedValueOnce(new Error('Database error'));

            const response = await request(app).get('/events');

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ error: 'Database error' });
        });
    });

    describe('PUT /events/:id', () => {
        it('should update an event and return 200 status', async () => {
            const mockEventId = 1;
            const mockEvent = {
                eventName: 'Updated Event',
                eventDescription: 'This is an updated event',
                location: 'Updated Location',
                urgency: 'Low',
                startDate: '2023-12-05',
                endDate: '2023-12-06',
                skills: 'Updated Skills',
            };

            // Mock the database query
            pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

            const response = await request(app)
                .put(`/events/${mockEventId}`)
                .send(mockEvent);

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                message: 'Event updated successfully!',
            });
        });

        it('should return 404 status if event is not found', async () => {
            const mockEventId = 999; // Non-existent event ID
            const mockEvent = {
                eventName: 'Updated Event',
                eventDescription: 'This is an updated event',
                location: 'Updated Location',
                urgency: 'Low',
                startDate: '2023-12-05',
                endDate: '2023-12-06',
                skills: 'Updated Skills',
            };

            pool.query.mockResolvedValueOnce([{ affectedRows: 0 }]);

            const response = await request(app)
                .put(`/events/${mockEventId}`)
                .send(mockEvent);

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ error: 'Event not found' });
        });

        it('should return 500 status if database query fails', async () => {
            const mockEventId = 1;
            const mockEvent = {
                eventName: 'Updated Event',
                eventDescription: 'This is an updated event',
                location: 'Updated Location',
                urgency: 'Low',
                startDate: '2023-12-05',
                endDate: '2023-12-06',
                skills: 'Updated Skills',
            };

            pool.query.mockRejectedValueOnce(new Error('Database error'));

            const response = await request(app)
                .put(`/events/${mockEventId}`)
                .send(mockEvent);

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ error: 'Database error' });
        });
    });

    describe('DELETE /events/:id', () => {
        it('should delete an event and return 200 status', async () => {
            const mockEventId = 1;

            // Mock the database query
            pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

            const response = await request(app).delete(`/events/${mockEventId}`);

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                message: 'Event deleted successfully!',
            });
        });

        it('should return 500 status if database query fails', async () => {
            const mockEventId = 1;

            pool.query.mockRejectedValueOnce(new Error('Database error'));

            const response = await request(app).delete(`/events/${mockEventId}`);

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ error: 'Database error' });
        });
    });
});