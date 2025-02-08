import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { theme } from '../../styles/theme';

// Layouts
export const Container = styled.div`
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1rem;
  
  @media (min-width: 768px) {
    padding: 0 2rem;
  }
`;

export const Flex = styled.div<{ 
  $direction?: string,
  $justify?: string, 
  $align?: string, 
  $gap?: string,
  $wrap?: string
}>`
  display: flex;
  flex-direction: ${props => props.$direction || 'row'};
  justify-content: ${props => props.$justify || 'flex-start'};
  align-items: ${props => props.$align || 'stretch'};
  gap: ${props => props.$gap || '0'};
  flex-wrap: ${props => props.$wrap || 'nowrap'};
`;

// Card
export const Card = styled.div`
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  padding: 1.5rem;
`;

// Buttons
export const Button = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  font-weight: 500;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  border: none;
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const PrimaryButton = styled(Button)`
  background-color: ${theme.colors.primary};
  color: white;
  
  &:hover:not(:disabled) {
    background-color: ${theme.colors.primaryHover};
  }
`;

export const SecondaryButton = styled(Button)`
  background-color: transparent;
  color: ${theme.colors.primary};
  border: 1px solid ${theme.colors.primary};
  
  &:hover:not(:disabled) {
    background-color: rgba(49, 130, 206, 0.1);
  }
`;

// Link Buttons
export const LinkButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  font-weight: 500;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  text-decoration: none;
`;

export const PrimaryLinkButton = styled(LinkButton)`
  background-color: ${theme.colors.primary};
  color: white;
  
  &:hover {
    background-color: ${theme.colors.primaryHover};
    color: white;
  }
`;

export const SecondaryLinkButton = styled(LinkButton)`
  background-color: transparent;
  color: ${theme.colors.primary};
  border: 1px solid ${theme.colors.primary};
  
  &:hover {
    background-color: rgba(49, 130, 206, 0.1);
  }
`;

// Grid
interface GridProps {
  $columns?: number;
  $gap?: string;
}

export const Grid = styled.div<GridProps>`
  display: grid;
  grid-template-columns: repeat(${props => props.$columns || 1}, 1fr);
  gap: ${props => props.$gap || '1rem'};
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(${props => Math.min(props.$columns || 1, 2)}, 1fr);
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

// Form Elements
export const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

export const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: ${theme.colors.gray[700]};
`;

export const Input = styled.input`
  width: 100%;
  padding: 0.5rem 0.75rem;
  font-size: 1rem;
  border: 1px solid ${theme.colors.gray[300]};
  border-radius: 0.375rem;
  transition: all 0.2s ease;
  color: ${theme.colors.gray[800]};
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 1px ${theme.colors.primary};
  }
  
  &::placeholder {
    color: ${theme.colors.gray[400]};
  }
`;

export const Select = styled.select`
  width: 100%;
  padding: 0.5rem 0.75rem;
  font-size: 1rem;
  border: 1px solid ${theme.colors.gray[300]};
  border-radius: 0.375rem;
  transition: all 0.2s ease;
  background-color: white;
  color: ${theme.colors.gray[800]};
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 1px ${theme.colors.primary};
  }
`;

export const TextArea = styled.textarea`
  width: 100%;
  padding: 0.5rem 0.75rem;
  font-size: 1rem;
  border: 1px solid ${theme.colors.gray[300]};
  border-radius: 0.375rem;
  transition: all 0.2s ease;
  min-height: 100px;
  color: ${theme.colors.gray[800]};
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 1px ${theme.colors.primary};
  }
  
  &::placeholder {
    color: ${theme.colors.gray[400]};
  }
`;

export const RadioGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
`;

export const RadioLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.875rem;
  color: ${theme.colors.gray[700]};
  
  input {
    cursor: pointer;
  }
`;

export const ErrorMessage = styled.div`
  color: ${theme.colors.error};
  font-size: 0.875rem;
  margin-top: 0.5rem;
`;

// Heading components
export const Heading1 = styled.h1`
  font-size: 2.25rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: ${theme.colors.gray[800]};
  
  @media (max-width: 768px) {
    font-size: 1.875rem;
  }
`;

export const Heading2 = styled.h2`
  font-size: 1.875rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: ${theme.colors.gray[800]};
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

export const Heading3 = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: ${theme.colors.gray[800]};
  
  @media (max-width: 768px) {
    font-size: 1.25rem;
  }
`;

// Text
export const Text = styled.p`
  font-size: 1rem;
  margin-bottom: 1rem;
  color: ${theme.colors.gray[700]};
  line-height: 1.5;
`;

export const SmallText = styled.p`
  font-size: 0.875rem;
  color: ${theme.colors.gray[600]};
  line-height: 1.5;
`;

// Badge
export const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.125rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: 9999px;
  background-color: ${theme.colors.primary};
  color: white;
`;

// Alert
interface AlertProps {
  status?: 'info' | 'success' | 'warning' | 'error';
}

export const Alert = styled.div<AlertProps>`
  padding: 1rem;
  border-radius: 0.375rem;
  margin-bottom: 1rem;
  
  ${props => {
    switch (props.status) {
      case 'success':
        return `
          background-color: #F0FFF4;
          color: #276749;
          border: 1px solid #C6F6D5;
        `;
      case 'error':
        return `
          background-color: #FFF5F5;
          color: #C53030;
          border: 1px solid #FED7D7;
        `;
      case 'warning':
        return `
          background-color: #FFFAF0;
          color: #C05621;
          border: 1px solid #FEEBC8;
        `;
      case 'info':
      default:
        return `
          background-color: #EBF8FF;
          color: #2B6CB0;
          border: 1px solid #BEE3F8;
        `;
    }
  }}
`;
