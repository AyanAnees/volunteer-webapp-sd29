import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import ManageEvents from '../../pages/ManageEvents';
import * as supabaseModule from '../../lib/supabase';

// Mock react-icons/fa module
vi.mock('react-icons/fa', () => ({
  FaPlus: () => null,
  FaCalendarAlt: () => null,
  FaMapMarkerAlt: () => null,
  FaUserFriends: () => null, 
  FaEdit: () => null,
  FaEye: () => null,
  FaTrash: () => null,
  FaSearch: () => null,
  FaCheckCircle: () => null
}));

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn()
  };
});

// Mock the supabase module
vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn().mockImplementation(() => ({
      select: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      ilike: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: [
          { 
            id: '1', 
            title: 'Test Event', 
            status: 'published', 
            start_datetime: '2023-05-01', 
            creator_id: 'user-id',
            location: 'Test Location',
            description: 'Test Description',
            max_volunteers: 10,
            applications: []
          }
        ],
        error: null
      })
    }))
  },
  getCurrentProfile: vi.fn().mockResolvedValue({
    id: 'user-id',
    display_name: 'Test Org',
    type: 'organization'
  })
}));

// Test to check if we can render the component without errors
describe('ManageEvents Component', () => {
  test('renders correctly after loading', async () => {
    render(
      <BrowserRouter>
        <ManageEvents />
      </BrowserRouter>
    );
    
    // Wait for loading to complete and check for the main title
    expect(await screen.findByRole('heading', { name: /manage your events/i })).toBeInTheDocument();
  });
});
