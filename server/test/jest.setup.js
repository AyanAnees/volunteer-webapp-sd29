// Mock the database connection
jest.mock('./db.js', () => ({
    query: jest.fn(),
}));