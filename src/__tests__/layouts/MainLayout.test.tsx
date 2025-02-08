import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';

// Mock the Header and Footer components
vi.mock('../../components/Header', () => ({
  default: () => <div data-testid="header-component">Header Mock</div>,
}));

vi.mock('../../components/Footer', () => ({
  default: () => <div data-testid="footer-component">Footer Mock</div>,
}));

// Mock the Outlet component
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    Outlet: () => <div data-testid="outlet-content">Outlet Content</div>,
  };
});

describe('MainLayout Component', () => {
  it('renders the header, outlet content, and footer', () => {
    render(
      <BrowserRouter>
        <MainLayout />
      </BrowserRouter>
    );

    // Check if header is rendered
    expect(screen.getByTestId('header-component')).toBeInTheDocument();
    
    // Check if outlet content is rendered
    expect(screen.getByTestId('outlet-content')).toBeInTheDocument();
    
    // Check if footer is rendered
    expect(screen.getByTestId('footer-component')).toBeInTheDocument();
  });

  it('renders with the correct structure', () => {
    const { container } = render(
      <BrowserRouter>
        <MainLayout />
      </BrowserRouter>
    );

    // Check for the main layout container
    expect(container.firstChild).toHaveStyle('min-height: 100vh');
    expect(container.firstChild).toHaveStyle('display: flex');
    expect(container.firstChild).toHaveStyle('flex-direction: column');
    
    // Check if the main tag exists
    const mainElement = container.querySelector('main');
    expect(mainElement).toBeInTheDocument();
    
    // Check for correct styles
    expect(mainElement).toHaveStyle('flex: 1');
  });
});
