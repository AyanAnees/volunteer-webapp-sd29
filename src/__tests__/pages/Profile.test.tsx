/// <reference types="vitest/globals" />

import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, test, expect, vi } from 'vitest';
import { ThemeProvider } from 'styled-components';
import Profile from '../../pages/Profile';
import { theme } from '../../styles/theme';

// Mock the supabase module
vi.mock('../../lib/supabase', () => {
  // Define a mock query builder that resolves like a promise
  const mockQueryBuilder = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    match: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(), // Added order for skills fetch
    update: vi.fn().mockReturnThis(),
    // Make it promise-like: resolve immediately with empty data for secondary fetches
    then: (resolve: (value: { data: any[], error: null }) => void) => resolve({ data: [], error: null })
  };

  return {
    supabase: {
      from: vi.fn().mockReturnValue(mockQueryBuilder),
      storage: {
        from: vi.fn().mockReturnValue({
          upload: vi.fn(),
          getPublicUrl: vi.fn()
        })
      }
    },
    getCurrentProfile: vi.fn().mockResolvedValue({
      id: 'user-123',
      display_name: 'Test User',
      type: 'volunteer'
    }),
    isAuthenticated: vi.fn().mockResolvedValue(true),
    handleAuthRedirect: vi.fn().mockResolvedValue(true)
  };
});

// Mock navigate function
// vi.mock('react-router-dom', async () => {
//   const actual = await vi.importActual('react-router-dom');
//   return {
//     ...actual,
//     useNavigate: () => vi.fn(),
//   };
// });
// Re-enable if needed, but Profile might not use navigate directly

describe('Profile Component', () => {
  test('renders profile page with loading state initially, then profile info', async () => {
    render(
      <ThemeProvider theme={theme}>
        <BrowserRouter>
          <Profile />
        </BrowserRouter>
      </ThemeProvider>
    );
    
    // Check for specific loading state text
    expect(screen.getByText(/Loading profile.../i)).toBeInTheDocument();
    
    // Wait for the profile name to appear after loading
    const profileNameElement = await screen.findByText('Test User');
    expect(profileNameElement).toBeInTheDocument();
  });
});