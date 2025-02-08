import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import Home from '../../pages/Home';

// Mock any dependencies if needed
vi.mock('../../lib/supabase', () => {
  return {
    supabase: {
      auth: {
        getSession: vi.fn().mockResolvedValue({
          data: { session: null },
          error: null
        })
      }
    }
  };
});

describe('Home Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders home page with main sections', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );
    
    // Check for the hero section title
    expect(screen.getByText('Connect, Volunteer, Make a Difference')).toBeInTheDocument();
    
    // Check for description text
    expect(screen.getByText(/Find the perfect volunteer opportunity/i)).toBeInTheDocument();
  });

  test('contains call-to-action links', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );
    
    // Should have Find Opportunities link
    const findOpportunitiesLink = screen.getByText('Find Opportunities');
    expect(findOpportunitiesLink).toBeInTheDocument();
    
    // Should have Sign Up link
    expect(screen.getByText('Sign Up')).toBeInTheDocument();
  });
});