import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AuthLayout from '../../layouts/AuthLayout';

// Mock the Header component
vi.mock('../../components/Header', () => ({
  default: () => <div data-testid="header-component">Header Mock</div>,
}));

// Mock the Outlet component
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    Outlet: () => <div data-testid="outlet-content">Auth Form Content</div>,
  };
});

// Mock console.error to prevent pollution of test output
const originalConsoleError = console.error;
console.error = vi.fn();

describe('AuthLayout Component', () => {
  afterAll(() => {
    console.error = originalConsoleError;
  });

  it('renders the header and auth form outlet', () => {
    render(
      <BrowserRouter>
        <AuthLayout />
      </BrowserRouter>
    );

    // Check if header is rendered
    expect(screen.getByTestId('header-component')).toBeInTheDocument();
    
    // Check if outlet content (auth form) is rendered
    expect(screen.getByTestId('outlet-content')).toBeInTheDocument();
  });

  it('handles logo loading error gracefully', () => {
    render(
      <BrowserRouter>
        <AuthLayout />
      </BrowserRouter>
    );

    // Find the logo image
    const logoImg = screen.getByAltText('Volunteer Connect Logo');
    expect(logoImg).toBeInTheDocument();

    // Simulate an error loading the image
    fireEvent.error(logoImg);

    // Verify that the console.error was called
    expect(console.error).toHaveBeenCalled();
    
    // Logo should now be hidden
    expect(logoImg).toHaveStyle('display: none');
  });
});
