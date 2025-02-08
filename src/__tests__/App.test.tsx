import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import App from '../App';

// Mock dependencies
vi.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }: any) => <div data-testid="browser-router">{children}</div>
}));

vi.mock('../AppRouter', () => ({
  default: () => <div data-testid="app-router">App Router Mock</div>
}));

vi.mock('@tanstack/react-query', () => ({
  QueryClient: vi.fn().mockImplementation(() => ({})),
  QueryClientProvider: ({ children }: any) => <div data-testid="query-client-provider">{children}</div>
}));

vi.mock('styled-components', () => ({
  ThemeProvider: ({ children }: any) => <div data-testid="theme-provider">{children}</div>
}));

vi.mock('../styles/theme', () => ({
  theme: {}
}));

vi.mock('../styles/GlobalStyles', () => ({
  GlobalStyles: () => <div data-testid="global-styles" />
}));

describe('App Component', () => {
  it('renders the app with all providers', () => {
    const { getByTestId } = render(<App />);
    
    // Check if all providers are rendered
    expect(getByTestId('query-client-provider')).toBeInTheDocument();
    expect(getByTestId('theme-provider')).toBeInTheDocument();
    expect(getByTestId('global-styles')).toBeInTheDocument();
    expect(getByTestId('browser-router')).toBeInTheDocument();
    expect(getByTestId('app-router')).toBeInTheDocument();
  });

  it('renders the providers in the correct order', () => {
    const { container } = render(<App />);
    
    // The nesting order should be:
    // QueryClientProvider > ThemeProvider > GlobalStyles + BrowserRouter > AppRouter
    const queryClientProvider = container.firstChild;
    expect(queryClientProvider).toHaveAttribute('data-testid', 'query-client-provider');
    
    const themeProvider = queryClientProvider?.firstChild;
    expect(themeProvider).toHaveAttribute('data-testid', 'theme-provider');
    
    // GlobalStyles and BrowserRouter should be children of ThemeProvider
    const globalStyles = themeProvider?.childNodes[0];
    expect(globalStyles).toHaveAttribute('data-testid', 'global-styles');
    
    const browserRouter = themeProvider?.childNodes[1];
    expect(browserRouter).toHaveAttribute('data-testid', 'browser-router');
    
    // AppRouter should be child of BrowserRouter
    const appRouter = browserRouter?.firstChild;
    expect(appRouter).toHaveAttribute('data-testid', 'app-router');
  });
});
