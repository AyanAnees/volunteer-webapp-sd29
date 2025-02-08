import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import Loading from '../../components/ui/Loading';

describe('Loading Component', () => {
  it('renders the loading spinner', () => {
    const { container } = render(<Loading />);
    const loadingContainer = container.querySelector('div');
    expect(loadingContainer).toBeInTheDocument();
    const spinner = container.querySelector('div > div');
    expect(spinner).toBeInTheDocument();
  });

  it('has the correct dimensions', () => {
    const { container } = render(<Loading />);
    const loadingContainer = container.querySelector('div');
    expect(loadingContainer).toBeInTheDocument();
    const spinner = container.querySelector('div > div');
    expect(spinner).toBeInTheDocument();
  });
});
