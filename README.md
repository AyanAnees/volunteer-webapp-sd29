# Volunteer WebApp

A volunteer matching application designed to connect volunteers with events.

## Features

- User registration and authentication using Supabase
- Profile management for volunteers
- Event creation and management
- Volunteer matching based on skills and availability
- History tracking for volunteer activities

## Tech Stack

- **Frontend**: HTML, CSS, Tailwind CSS
- **Backend**: Express.js
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm
- Supabase account

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/ayyan67/volunteer-webapp-sd29-reorganized.git
   cd volunteer-webapp-sd29-reorganized
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Add your Supabase credentials

4. Set up Supabase:
   - Follow the instructions in `SUPABASE_SETUP.md`
   - Run the SQL queries in `supabase_setup.sql`

5. Start the server:
   ```
   npm start
   ```
   For development:
   ```
   npm run dev
   ```

6. Open your browser and navigate to http://localhost:3000

## Project Structure

- `/client`: Frontend files
  - `/public`: Static assets
  - `/views`: HTML templates
- `/server`: Backend files
  - `/config`: Configuration files
  - `/routes`: API routes
  - `/services`: Business logic
- `/server.js`: Main entry point

## Authentication Flow

The application implements a two-step registration process:
1. User signs up with email, password, and basic info
2. After first login, user completes their profile with address, skills, and availability

## License

This project is licensed under the MIT License.
