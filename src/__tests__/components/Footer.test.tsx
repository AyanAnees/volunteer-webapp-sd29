import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Footer from '../../components/Footer';

describe('Footer Component', () => {
  beforeEach(() => {
    render(
      <BrowserRouter>
        <Footer />
      </BrowserRouter>
    );
  });

  it('renders the footer with correct structure', () => {
    // Check if the footer exists
    const footer = screen.getByRole('contentinfo');
    expect(footer).toBeInTheDocument();
    
    // Check if the footer container exists inside
    const footerContainer = footer.firstChild;
    expect(footerContainer).toBeInTheDocument();
  });

  it('displays the organization name', () => {
    // Check if the organization name is present
    expect(screen.getByText('Volunteer Connect')).toBeInTheDocument();
  });

  it('displays the copyright notice with current year', () => {
    const currentYear = new Date().getFullYear();
    const copyrightText = `© ${currentYear} Volunteer Connect. All rights reserved.`;
    expect(screen.getByText(copyrightText)).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    // Check if the common navigation links are present
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Opportunities')).toBeInTheDocument();
    expect(screen.getByText('About Us')).toBeInTheDocument();
    expect(screen.getByText('Contact')).toBeInTheDocument();
  });

  it('renders resource links', () => {
    // Check if the resource links are present
    expect(screen.getByText('How It Works')).toBeInTheDocument();
    expect(screen.getByText('FAQ')).toBeInTheDocument();
    expect(screen.getByText('Terms of Service')).toBeInTheDocument();
    expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
  });

  it('renders contact information', () => {
    // Check if contact information is present
    expect(screen.getByText('info@volunteerconnect.org')).toBeInTheDocument();
    expect(screen.getByText('(123) 456-7890')).toBeInTheDocument();
  });

  it('renders social media links', () => {
    // Check if social media links are present
    expect(screen.getByText('Facebook')).toBeInTheDocument();
    expect(screen.getByText('Twitter')).toBeInTheDocument();
    expect(screen.getByText('Instagram')).toBeInTheDocument();
    expect(screen.getByText('LinkedIn')).toBeInTheDocument();
  });

  it('has the correct link destinations', () => {
    // Check if the internal links have the correct paths
    expect(screen.getByText('Home').closest('a')).toHaveAttribute('href', '/');
    expect(screen.getByText('Opportunities').closest('a')).toHaveAttribute('href', '/opportunities');
    
    // Check if social links have the correct attributes
    const facebookLink = screen.getByText('Facebook').closest('a');
    expect(facebookLink).toHaveAttribute('href', 'https://facebook.com');
    expect(facebookLink).toHaveAttribute('target', '_blank');
    expect(facebookLink).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
