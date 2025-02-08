import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { theme } from '../styles/theme';

const FooterWrapper = styled.footer`
  background-color: ${theme.colors.white};
  border-top: 1px solid ${theme.colors.gray[200]};
  padding: ${theme.spacing.xl} 0;
  margin-top: auto;
  width: 100%;
`;

const FooterContainer = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 ${theme.spacing.md};
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const FooterTop = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-bottom: ${theme.spacing.xl};
  
  @media (max-width: ${theme.breakpoints.md}) {
    flex-direction: column;
    gap: ${theme.spacing.xl};
  }
`;

const FooterSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
`;

const FooterTitle = styled.h3`
  font-size: ${theme.fontSizes.lg};
  margin-bottom: ${theme.spacing.sm};
  color: ${theme.colors.gray[800]};
`;

const FooterLink = styled(Link)`
  color: ${theme.colors.gray[600]};
  text-decoration: none;
  transition: color 0.2s;
  
  &:hover {
    color: ${theme.colors.primary};
  }
`;

const FooterDivider = styled.hr`
  width: 100%;
  border: none;
  border-top: 1px solid ${theme.colors.gray[200]};
  margin: ${theme.spacing.lg} 0;
`;

const FooterBottom = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  
  @media (max-width: ${theme.breakpoints.md}) {
    flex-direction: column;
    gap: ${theme.spacing.md};
    text-align: center;
  }
`;

const Copyright = styled.p`
  color: ${theme.colors.gray[600]};
  font-size: ${theme.fontSizes.sm};
`;

const SocialLinks = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
`;

const SocialLink = styled.a`
  color: ${theme.colors.gray[600]};
  text-decoration: none;
  transition: color 0.2s;
  
  &:hover {
    color: ${theme.colors.primary};
  }
`;

export default function Footer() {
  return (
    <FooterWrapper>
      <FooterContainer>
        <FooterTop>
          <FooterSection>
            <FooterTitle>Volunteer Connect</FooterTitle>
            <p style={{ color: theme.colors.gray[600], maxWidth: '300px' }}>
              Connecting passionate volunteers with organizations that need help.
              Make a difference in your community today.
            </p>
          </FooterSection>
          
          <FooterSection>
            <FooterTitle>Quick Links</FooterTitle>
            <FooterLink to="/">Home</FooterLink>
            <FooterLink to="/opportunities">Opportunities</FooterLink>
            <FooterLink to="/about">About Us</FooterLink>
            <FooterLink to="/contact">Contact</FooterLink>
          </FooterSection>
          
          <FooterSection>
            <FooterTitle>Resources</FooterTitle>
            <FooterLink to="/how-it-works">How It Works</FooterLink>
            <FooterLink to="/faq">FAQ</FooterLink>
            <FooterLink to="/terms">Terms of Service</FooterLink>
            <FooterLink to="/privacy">Privacy Policy</FooterLink>
          </FooterSection>
          
          <FooterSection>
            <FooterTitle>Contact Us</FooterTitle>
            <a href="mailto:info@volunteerconnect.org" style={{ color: theme.colors.gray[600], textDecoration: 'none' }}>
              info@volunteerconnect.org
            </a>
            <a href="tel:+11234567890" style={{ color: theme.colors.gray[600], textDecoration: 'none' }}>
              (123) 456-7890
            </a>
          </FooterSection>
        </FooterTop>
        
        <FooterDivider />
        
        <FooterBottom>
          <Copyright>
            &copy; {new Date().getFullYear()} Volunteer Connect. All rights reserved.
          </Copyright>
          
          <SocialLinks>
            <SocialLink href="https://facebook.com" target="_blank" rel="noopener noreferrer">Facebook</SocialLink>
            <SocialLink href="https://twitter.com" target="_blank" rel="noopener noreferrer">Twitter</SocialLink>
            <SocialLink href="https://instagram.com" target="_blank" rel="noopener noreferrer">Instagram</SocialLink>
            <SocialLink href="https://linkedin.com" target="_blank" rel="noopener noreferrer">LinkedIn</SocialLink>
          </SocialLinks>
        </FooterBottom>
      </FooterContainer>
    </FooterWrapper>
  );
}
