import styled from 'styled-components';
import { theme } from '../../styles/theme';
import { Link } from 'react-router-dom';

// Layout components
export const Container = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 ${theme.spacing.md};
`;

export const Card = styled.div`
  background-color: ${theme.colors.white};
  border-radius: ${theme.borderRadius.lg};
  box-shadow: ${theme.shadows.md};
  padding: ${theme.spacing.xl};
`;

export const PageHeader = styled.div`
  margin-bottom: ${theme.spacing.xl};
`;

export const FormContainer = styled.div`
  max-width: 550px;
  margin: ${theme.spacing.xl} auto;
  padding: ${theme.spacing.xl};
  background-color: ${theme.colors.white};
  border-radius: ${theme.borderRadius.lg};
  box-shadow: ${theme.shadows.md};
`;

// Form components
export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: ${theme.spacing.lg};
`;

export const Label = styled.label`
  font-weight: 500;
  margin-bottom: ${theme.spacing.sm};
`;

export const Input = styled.input`
  padding: ${theme.spacing.md};
  border: 1px solid ${theme.colors.gray[300]};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.fontSizes.md};
  background-color: ${theme.colors.gray[50]};
  color: ${theme.colors.gray[800]};
  width: 100%;
  box-sizing: border-box;
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 1px ${theme.colors.primary};
  }

  &::placeholder {
    color: ${theme.colors.gray[400]};
  }
`;

export const TextArea = styled.textarea`
  padding: ${theme.spacing.md};
  border: 1px solid ${theme.colors.gray[300]};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.fontSizes.md};
  min-height: 120px;
  background-color: ${theme.colors.gray[50]};
  color: ${theme.colors.gray[800]};
  width: 100%;
  box-sizing: border-box;
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 1px ${theme.colors.primary};
  }
`;

export const Select = styled.select`
  padding: ${theme.spacing.md};
  border: 1px solid ${theme.colors.gray[300]};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.fontSizes.md};
  background-color: ${theme.colors.gray[50]};
  color: ${theme.colors.gray[800]};
  width: 100%;
  box-sizing: border-box;
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 1px ${theme.colors.primary};
  }
`;

export const RadioGroup = styled.div`
  display: flex;
  gap: ${theme.spacing.lg};
  margin-top: ${theme.spacing.xs};
`;

export const RadioLabel = styled.label`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  cursor: pointer;
  font-size: ${theme.fontSizes.md};
`;

export const ErrorMessage = styled.div`
  color: ${theme.colors.error};
  font-size: ${theme.fontSizes.sm};
  margin-top: ${theme.spacing.xs};
`;

export const FormDivider = styled.div`
  display: flex;
  align-items: center;
  margin: ${theme.spacing.xl} 0;
  
  &::before,
  &::after {
    content: '';
    flex: 1;
    border-bottom: 1px solid ${theme.colors.gray[300]};
  }
  
  span {
    margin: 0 ${theme.spacing.md};
    color: ${theme.colors.gray[500]};
    font-size: ${theme.fontSizes.sm};
  }
`;

// Button components
export const Button = styled.button`
  padding: ${theme.spacing.md} ${theme.spacing.xl};
  border-radius: ${theme.borderRadius.md};
  font-weight: 500;
  font-size: ${theme.fontSizes.md};
  transition: all ${theme.transitions.fast};
  text-align: center;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.sm};
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

export const PrimaryButton = styled(Button)`
  background-color: ${theme.colors.primary};
  color: ${theme.colors.white};
  border: none;
  
  &:hover:not(:disabled) {
    background-color: ${theme.colors.primaryHover};
  }
`;

export const SecondaryButton = styled(Button)`
  background-color: transparent;
  color: ${theme.colors.primary};
  border: 1px solid ${theme.colors.primary};
  
  &:hover:not(:disabled) {
    background-color: ${theme.colors.gray[50]};
  }
`;

export const DangerButton = styled(Button)`
  background-color: ${theme.colors.error};
  color: ${theme.colors.white};
  border: none;
  
  &:hover:not(:disabled) {
    background-color: #C53030; /* Darker red */
  }
`;

export const LinkButton = styled(Link)`
  padding: ${theme.spacing.md} ${theme.spacing.xl};
  border-radius: ${theme.borderRadius.md};
  font-weight: 500;
  font-size: ${theme.fontSizes.md};
  transition: all ${theme.transitions.fast};
  text-align: center;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.sm};
  text-decoration: none;
`;

export const PrimaryLinkButton = styled(LinkButton)`
  background-color: ${theme.colors.primary};
  color: ${theme.colors.white};
  border: none;
  
  &:hover {
    background-color: ${theme.colors.primaryHover};
  }
`;

export const SecondaryLinkButton = styled(LinkButton)`
  background-color: transparent;
  color: ${theme.colors.primary};
  border: 1px solid ${theme.colors.primary};
  
  &:hover {
    background-color: ${theme.colors.gray[50]};
  }
`;

// Typography
export const Title = styled.h1`
  font-size: ${theme.fontSizes['3xl']};
  font-weight: 700;
  margin-bottom: ${theme.spacing.lg};
`;

export const SubTitle = styled.h2`
  font-size: ${theme.fontSizes.xl};
  font-weight: 600;
  margin-bottom: ${theme.spacing.md};
`;

export const Text = styled.p`
  font-size: ${theme.fontSizes.md};
  margin-bottom: ${theme.spacing.md};
`;

export const SmallText = styled.p`
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.gray[600]};
`;

// Grid/flex layouts
export const Grid = styled.div<{ columns?: number, gap?: string }>`
  display: grid;
  grid-template-columns: repeat(${props => props.columns || 1}, 1fr);
  gap: ${props => props.gap || theme.spacing.md};
  
  @media (max-width: ${theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
`;

export const Flex = styled.div<{ direction?: string, justify?: string, align?: string, gap?: string }>`
  display: flex;
  flex-direction: ${props => props.direction || 'row'};
  justify-content: ${props => props.justify || 'flex-start'};
  align-items: ${props => props.align || 'stretch'};
  gap: ${props => props.gap || theme.spacing.md};
`;

// Badge/tag component
export const Badge = styled.span<{ variant?: 'primary' | 'success' | 'warning' | 'error' | 'info' }>`
  display: inline-block;
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.full};
  font-size: ${theme.fontSizes.xs};
  font-weight: 500;
  text-transform: uppercase;
  background-color: ${props => {
    switch (props.variant) {
      case 'success': return theme.colors.success;
      case 'warning': return theme.colors.warning;
      case 'error': return theme.colors.error;
      case 'info': return theme.colors.info;
      case 'primary':
      default: return theme.colors.primary;
    }
  }};
  color: white;
`;

// Table components
export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: ${theme.spacing.xl};
`;

export const Th = styled.th`
  padding: ${theme.spacing.md};
  text-align: left;
  border-bottom: 2px solid ${theme.colors.gray[300]};
  font-weight: 600;
`;

export const Td = styled.td`
  padding: ${theme.spacing.md};
  border-bottom: 1px solid ${theme.colors.gray[200]};
`;

export const Tr = styled.tr`
  &:hover {
    background-color: ${theme.colors.gray[50]};
  }
`;
