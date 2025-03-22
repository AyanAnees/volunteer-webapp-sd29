const request = require("supertest");
const app = require("../routes/eventmanagementform");

let server;

beforeAll(() => {
    server = app.listen(3001); // Start the server on a test port
});

afterAll((done) => {
    server.close(done); // Close the server after all tests
});

describe("Event Management API Tests", () => {
    test("Should create an event successfully", async () => {
        const eventData = {
            eventName: "Tech Conference",
            eventDescription: "A conference about health and tech",
            location: "Houston",
            startDate: "2025-04-10",
            endDate: "2025-04-12"
        };

        const response = await request(app)
            .post("/submit-event")
            .send(eventData)
            .set("Content-Type", "application/json");

        expect(response.status).toBe(200); // Expect success
        expect(response.body.success).toBe(true);
        expect(response.body.event.eventName).toBe("Tech Conference");
    });

    test("Should return validation error for missing fields", async () => {
        const incompleteEventData = {
            eventName: "", 
            eventDescription: "Short event",
            location: "Houston,TX",
            startDate: "2025-05-01",
            endDate: "2025-05-03"
        };

        const response = await request(app)
            .post("/submit-event")
            .send(incompleteEventData)
            .set("Content-Type", "application/json");

        expect(response.status).toBe(400); 
        expect(response.body.success).toBe(false);
        expect(response.body.errors).toContain("Event name is required and must be under 100 characters.");
    });
    test("Should return validation error for incorrect input", async () => {
        const incompleteEventData = {
            eventName: "#$$%^", 
            eventDescription: "Short event",
            location: "Houston,TX",
            startDate: "2025-05-01",
            endDate: "2025-05-03"
        };

        const response = await request(app)
            .post("/submit-event")
            .send(incompleteEventData)
            .set("Content-Type", "application/json");

        expect(response.status).toBe(400); 
        expect(response.body.success).toBe(false);
        expect(response.body.errors).toContain("PLease input the correct characters");
    });

    test("Should fetch all events", async () => {
        const response = await request(app).get("/events");

        expect(response.status).toBe(200); // Expect success
        expect(response.body).toBeInstanceOf(Array);
    });
});


