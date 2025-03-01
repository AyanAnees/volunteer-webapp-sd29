// Mock environment variables before any tests run
process.env.SUPABASE_URL = 'https://mock-supabase-url.supabase.co';
process.env.SUPABASE_KEY = 'mock-supabase-key';

// Increase Jest timeout for all tests
jest.setTimeout(10000);

// Global afterAll to clean up any resources
afterAll(() => {
  // Any cleanup code that should run after all tests
});
