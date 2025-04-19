// Main server entry point
const app = require('./server/server');
require('dotenv').config(); // ADD THIS at the top

// Use a fixed port 3002 to avoid conflicts
const PORT = 3002;

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
