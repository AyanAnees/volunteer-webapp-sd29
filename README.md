# Volunteer Web Application

## Overview
A comprehensive web application designed to connect volunteers with volunteering opportunities. This platform aims to streamline the process of finding and managing volunteer activities, tracking volunteer history, and coordinating events.

## Features
- **User Authentication**: Secure login and registration system
- **Volunteer Matching**: Algorithm to match volunteers with suitable opportunities
- **Event Management**: Create, edit, and manage volunteering events
- **User Profiles**: Customizable profiles with preferences and history
- **Volunteer History**: Track and display volunteering activity
- **Notifications**: Alert system for new opportunities and updates
- **Report Generator**: Download volunteer and event management reports as PDFs and CSVs

## Tech Stack
- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express
- **Database**: PostgreSQL with Supabase
- **Testing**: Jest for unit and integration tests

## Project Structure
```
volunteer-webapp/
├── client/               # Frontend code
│   ├── public/           # Public assets
│   │   ├── css/          # CSS stylesheets
│   │   └── js/           # JavaScript files
│   └── views/            # HTML views
├── server/               # Backend code
│   ├── config/           # Server configuration
│   ├── routes/           # API routes
│   └── services/         # Business logic services
└── tests/                # Test suites
    ├── mocks/            # Test mocks
    ├── routes/           # Route tests
    └── services/         # Service tests
```

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation
1. Clone the repository
   ```
   git clone https://github.com/AyanAnees/volunteer-webapp-sd29.git
   cd volunteer-webapp-sd29
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=3002
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_key
 
   ```

4. Start the development server
   ```
   npm start
   ```

5. Visit `http://localhost:3002` in your browser to access the application

## Testing
Run tests using the following command:
```
npm test
```

## Team
- **Ayan Anees**: Authentication and state management
- **Haley Trinh**: Volunteer matching and history features
- **Hanna Asfaw**: Event management functionality
- **Sameer Gul**: User profile management

## License
This project is licensed under the MIT License - see the LICENSE file for details.
