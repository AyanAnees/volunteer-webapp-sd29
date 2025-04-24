# Volunteer Matching Application

A modern web application connecting volunteers with opportunities based on skills, availability, and interests. This platform bridges the gap between volunteers and organizations, making it easier for volunteers to find meaningful opportunities and for organizations to find qualified help.

![Volunteer Matching](https://via.placeholder.com/800x400?text=Volunteer+Matching)

## Features

### User Management
- **Secure Authentication**: Email/password authentication with Supabase
- **Role-Based Access**: Different interfaces for volunteers, organizations, and admins
- **Profile Management**: Comprehensive profile editing with skills and availability
- **User Types**: Support for both volunteers and organizations

### Opportunity Matching
- **Smart Matching Algorithm**: Connects volunteers with opportunities based on skills and availability
- **Customizable Search**: Filter opportunities by category, location, and date
- **Application System**: Streamlined process for applying to volunteer positions
- **Status Tracking**: Monitor application status from submission to acceptance

### Event Management
- **Event Creation**: Organizations can create and publish volunteer opportunities
- **Volunteer Management**: Tools for tracking and managing volunteer participation
- **Application Review**: Interface for reviewing and responding to volunteer applications
- **Event Analytics**: Track participation and success metrics

### Real-time Features
- **Notifications**: Instant updates for application status changes and event reminders
- **Live Updates**: Real-time data synchronization with Supabase
- **Activity Feed**: Track recent activity and upcoming events
- **Calendar Integration**: Visualize scheduled volunteer activities

### Analytics & Impact
- **Volunteer Hours**: Automatic tracking of volunteer participation
- **Impact Metrics**: Visualize the difference made in the community
- **Progress Tracking**: Monitor personal volunteer goals and achievements
- **Organization Insights**: Data-driven insights for opportunity providers

## Technology Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Routing**: React Router DOM for navigation
- **Styling**: Custom styled-components for consistent UI

### Backend & Data
- **Backend**: Supabase (PostgreSQL + RESTful API)
- **Authentication**: Supabase Auth with JWT
- **Database**: PostgreSQL with Row Level Security
- **Real-time**: Supabase Realtime for live updates

### State Management
- **Client State**: React hooks and context
- **Server State**: React Query for data fetching and caching
- **Global State**: Context API for application-wide state

### Testing
- **Framework**: Vitest for unit and integration testing
- **Component Testing**: React Testing Library
- **Test Coverage**: Maintained at 80%+ coverage
- **E2E Testing**: Integration tests for critical user flows

## Getting Started

### Prerequisites
- Node.js 16+ and npm/yarn
- Supabase account (free tier available)
- Git for version control

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/AyanAnees/volunteer-webapp-sd29.git
   cd volunteer-webapp-sd29
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Create a `.env` file based on `.env.example`
   - Add your Supabase URL and anon key:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Initialize the database:
   - Run the SQL scripts in the `supabase` folder against your Supabase project

5. Start the development server:
   ```bash
   npm run dev
   ```

## Project Structure

```
volunteer-webapp-sd29/
├── public/             # Static assets
├── src/
│   ├── components/     # Reusable UI components
│   │   ├── availability/  # Availability selection components
│   │   ├── events/        # Event-related components
│   │   ├── profile/       # Profile editing components
│   │   └── skills/        # Skills selection components
│   ├── contexts/       # React contexts for state management
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Library code and utilities
│   ├── pages/          # Page components
│   ├── routes/         # Routing configuration
│   ├── services/       # API and service functions
│   └── utils/          # Utility functions
├── supabase/           # Database migration scripts
├── __mocks__/          # Test mocks
├── .env.example        # Example environment variables
├── package.json        # Project dependencies
└── tsconfig.json       # TypeScript configuration
```

## Testing

Run the test suite:
```bash
npm test
```

Check test coverage:
```bash
npm run test:coverage
```

## Deployment

1. Build the production version:
   ```bash
   npm run build
   ```

2. Deploy to your hosting provider of choice (Vercel, Netlify, etc.)

3. Ensure environment variables are set correctly in your hosting environment

## Database Schema

The application uses the following core tables:

- **users** - Authentication and basic user information
- **profiles** - Extended user information and preferences
- **skills** - Available volunteer skills
- **availability** - Volunteer availability records
- **events** - Volunteer opportunities/events
- **applications** - Volunteer applications for events
- **notifications** - System messages and alerts
- **history** - Participation records and metrics

## Team

- **Ayan Anees** - Authentication and State Management
- **Haley Tri** - Volunteer Matching and History Features
- **Hanna Dem** - Event Management
- **Sameer Gul** - Profile Management and UI Components

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin feature/my-new-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
