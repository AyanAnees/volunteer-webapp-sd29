import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, test, expect } from 'vitest';
import NotFound from '../../pages/NotFound';

describe('NotFound Component', () => {
  test('renders not found page with error message', () => {
    render(
      <BrowserRouter>
        <NotFound />
      </BrowserRouter>
    );
    
    // Check for the error message
    expect(screen.getByText(/page not found/i)).toBeInTheDocument();
  });

  test('provides a link to go back to the homepage', () => {
    render(
      <BrowserRouter>
        <NotFound />
      </BrowserRouter>
    );
    
    // Check for the home link
    const homeLink = screen.getByText('Return Home');
    expect(homeLink).toBeInTheDocument();
    expect(homeLink.getAttribute('href')).toBe('/');
  });
});