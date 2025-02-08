import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'styled-components';
import { theme } from '../styles/theme';
import AppRouter from '../AppRouter';

// Mock all the lazy-loaded components
vi.mock('../layouts/MainLayout', async () => {
  const actual = await vi.importActual('react-router-dom');
  const Outlet = (actual as any).Outlet;
  return { default: () => <div data-testid="main-layout"><Outlet /></div> };
});

vi.mock('../layouts/AuthLayout', async () => {
  const actual = await vi.importActual('react-router-dom');
  const Outlet = (actual as any).Outlet;
  return { default: () => <div data-testid="auth-layout"><Outlet /></div> };
});

// Mock pages
vi.mock('../pages/Home', () => ({
  default: () => <div data-testid="home-page">Home Page</div>,
}));

vi.mock('../pages/auth/Login', () => ({
  default: () => <div data-testid="login-page">Login Page</div>,
}));

vi.mock('../pages/auth/Register', () => ({
  default: () => <div data-testid="register-page">Register Page</div>,
}));

vi.mock('../pages/Dashboard', () => ({
  default: () => <div data-testid="dashboard-page">Dashboard Page</div>,
}));

vi.mock('../pages/NotFound', () => ({
  default: () => <div data-testid="not-found-page">Not Found Page</div>,
}));

// Mock other lazy components - using a factory to avoid repetitive code
const createLazyMock = (name: string) =>
  vi.fn().mockImplementation(() => <div data-testid={`${name}-page`}>{name} Page</div>);

vi.mock('../pages/Profile', () => ({ default: createLazyMock('profile') }));
vi.mock('../pages/Events', () => ({ default: createLazyMock('events') }));
vi.mock('../pages/Opportunities', () => ({ default: createLazyMock('opportunities') }));
vi.mock('../pages/EventDetail', () => ({ default: createLazyMock('event-detail') }));
vi.mock('../pages/EventCreate', () => ({ default: createLazyMock('event-create') }));
vi.mock('../pages/ManageEvents', () => ({ default: createLazyMock('manage-events') }));
vi.mock('../pages/EventApplications', () => ({ default: createLazyMock('event-applications') }));
vi.mock('../pages/Applications', () => ({ default: createLazyMock('applications') }));
vi.mock('../pages/Notifications', () => ({ default: createLazyMock('notifications') }));
vi.mock('../pages/History', () => ({ default: createLazyMock('history') }));
vi.mock('../pages/AdminDashboard', () => ({ default: createLazyMock('admin-dashboard') }));

 // Helper function to render with necessary providers
 const queryClient = new QueryClient();
 const renderWithProviders = (ui: React.ReactElement, { route = '/' } = {}) => {
  window.history.pushState({}, 'Test page', route);
  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

describe('AppRouter Component', () => {
  it('renders the main layout for the root path', async () => {
    renderWithProviders(<AppRouter />, { route: '/' });
    expect(screen.getByTestId('main-layout')).toBeInTheDocument();
    expect(await screen.findByTestId('home-page')).toBeInTheDocument();
  });

  it('renders home page for the root path', async () => {
    renderWithProviders(<AppRouter />, { route: '/' });
    expect(await screen.findByTestId('home-page')).toBeInTheDocument();
  });

  it('renders login page for /auth/login path', async () => {
    renderWithProviders(<AppRouter />, { route: '/auth/login' });
    expect(screen.getByTestId('auth-layout')).toBeInTheDocument();
    expect(await screen.findByTestId('login-page')).toBeInTheDocument();
  });

  it('renders register page for /auth/register path', async () => {
    renderWithProviders(<AppRouter />, { route: '/auth/register' });
    expect(screen.getByTestId('auth-layout')).toBeInTheDocument();
    expect(await screen.findByTestId('register-page')).toBeInTheDocument();
  });

  it('renders dashboard page for /dashboard path', async () => {
    renderWithProviders(<AppRouter />, { route: '/dashboard' });
    expect(screen.getByTestId('main-layout')).toBeInTheDocument();
    expect(await screen.findByTestId('dashboard-page')).toBeInTheDocument();
  });

  it('renders not found page for unknown routes', async () => {
    renderWithProviders(<AppRouter />, { route: '/unknown-route' });
    expect(screen.getByTestId('main-layout')).toBeInTheDocument();
    expect(await screen.findByTestId('not-found-page')).toBeInTheDocument();
  });

  // Testing a few more critical routes
  it('renders opportunities page for /opportunities path', async () => {
    renderWithProviders(<AppRouter />, { route: '/opportunities' });
    expect(screen.getByTestId('main-layout')).toBeInTheDocument();
    expect(await screen.findByTestId('opportunities-page')).toBeInTheDocument();
  });

  it('renders admin dashboard for /admin path', async () => {
    renderWithProviders(<AppRouter />, { route: '/admin' });
    expect(screen.getByTestId('main-layout')).toBeInTheDocument();
    expect(await screen.findByTestId('admin-dashboard-page')).toBeInTheDocument();
  });
});
