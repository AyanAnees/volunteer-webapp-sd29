import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { supabase, getCurrentProfile } from '../../lib/supabase';
import { theme } from '../../styles/theme';
import { FaEnvelope, FaLock, FaSignInAlt } from 'react-icons/fa';
import {
  FormGroup,
  Label,
  Input,
  ErrorMessage,
  PrimaryButton,
  Flex,
  SmallText
} from '../../components/ui/StyledComponents';

const AuthTitle = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: ${theme.colors.gray[800]};
  margin-bottom: ${theme.spacing.lg};
  text-align: center;
  letter-spacing: -0.5px;
`;

const AuthSubtitle = styled.p`
  text-align: center;
  color: ${theme.colors.gray[600]};
  margin-bottom: ${theme.spacing.xl};
  font-size: ${theme.fontSizes.md};
`;

const InputWrapper = styled.div`
  position: relative;
`;

const InputIcon = styled.div`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: ${theme.colors.gray[500]};
  font-size: 1rem;
`;

const StyledInput = styled(Input)`
  padding-left: 40px;
  height: 48px;
  transition: all 0.2s ease;
  border: 1px solid ${theme.colors.gray[300]};
  
  &:focus {
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px ${theme.colors.primary}20;
  }
`;

const LoginButton = styled(PrimaryButton)`
  height: 48px;
  font-weight: 600;
  font-size: ${theme.fontSizes.md};
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px ${theme.colors.primary}40;
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const ForgotPasswordLink = styled(Link)`
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.primary};
  text-decoration: none;
  transition: color 0.2s ease;
  
  &:hover {
    color: ${theme.colors.primaryHover};
    text-decoration: underline;
  }
`;

const SignUpLink = styled(Link)`
  font-weight: 600; 
  color: ${theme.colors.primary};
  text-decoration: none;
  transition: color 0.2s ease;
  
  &:hover {
    color: ${theme.colors.primaryHover};
    text-decoration: underline;
  }
`;

const SignUpText = styled(SmallText)`
  margin-top: ${theme.spacing.xl};
  text-align: center;
  font-size: ${theme.fontSizes.md};
`;

const Divider = styled.div`
  margin: ${theme.spacing.lg} 0;
  display: flex;
  align-items: center;
  
  &::before, &::after {
    content: '';
    flex: 1;
    border-bottom: 1px solid ${theme.colors.gray[200]};
  }
`;

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  
  // Helper function to redirect based on user type
  const redirectBasedOnUserType = async () => {
    try {
      const profile = await getCurrentProfile();
      if (profile) {
        if (profile.type === 'volunteer') {
          console.log('Volunteer user, redirecting to profile');
          navigate('/profile', { replace: true });
        } else {
          // For organization or admin users
          console.log('Organization/admin user, redirecting to dashboard');
          navigate('/admin', { replace: true });
        }
      } else {
        // Fallback if profile not found
        console.log('No profile found, redirecting to homepage');
        navigate('/', { replace: true });
      }
    } catch (error) {
      console.error('Error getting profile for redirect:', error);
      navigate('/', { replace: true });
    }
  };
  
  // Check if already authenticated and redirect if necessary
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          console.log('User already authenticated, redirecting based on type');
          redirectBasedOnUserType();
        }
      } catch (error) {
        console.error('Error checking session:', error);
      }
    };
    
    checkAuthStatus();
  }, [navigate]);
  
  // This effect handles navigation after successful login
  useEffect(() => {
    if (isAuthenticated) {
      console.log('Authentication state confirmed, redirecting based on user type');
      // Reduced timeout for faster navigation
      const timer = setTimeout(() => {
        setIsLoading(false); // Make sure to reset loading state
        redirectBasedOnUserType();
      }, 200);
      
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, navigate]);

  const validateForm = () => {
    let isValid = true;
    
    // Reset errors
    setEmailError('');
    setPasswordError('');
    setGeneralError('');
    
    // Validate email
    if (!email) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Email is invalid');
      isValid = false;
    }
    
    // Validate password
    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    }
    
    return isValid;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setGeneralError('');
    setIsAuthenticated(false);
    
    try {
      console.log('Attempting login with:', { email });
      
      // Clear any existing sessions first
      await supabase.auth.signOut();
      
      // Now attempt login
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('Login error:', error);
        throw error;
      }
      
      if (!data || !data.user) {
        throw new Error('Login successful but no user data returned');
      }
      
      console.log('Login successful, user:', data.user.id);
      
      // Set authenticated state which will trigger the useEffect to handle navigation
      setIsAuthenticated(true);
      
      // Add a backup navigation in case the state change doesn't trigger the effect
      setTimeout(() => {
        if (isLoading) { // Still loading after 2 seconds? Force navigation
          console.log('Backup navigation triggered');
          setIsLoading(false);
          redirectBasedOnUserType();
        }
      }, 2000);
      
    } catch (error: any) {
      console.error('Login exception:', error);
      setGeneralError(error.message || 'An error occurred during login');
      setIsLoading(false);
    }
  };

  return (
    <div>
      <AuthTitle>Welcome Back</AuthTitle>
      <AuthSubtitle>Sign in to continue to Volunteer Connect</AuthSubtitle>
      
      {generalError && (
        <ErrorMessage style={{ marginBottom: '20px', textAlign: 'center', padding: '10px' }}>{generalError}</ErrorMessage>
      )}
      
      <form onSubmit={handleLogin}>
        <FormGroup>
          <Label htmlFor="email">Email address</Label>
          <InputWrapper>
            <InputIcon>
              <FaEnvelope />
            </InputIcon>
            <StyledInput 
              id="email"
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
            />
          </InputWrapper>
          {emailError && <ErrorMessage>{emailError}</ErrorMessage>}
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="password">Password</Label>
          <InputWrapper>
            <InputIcon>
              <FaLock />
            </InputIcon>
            <StyledInput 
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
          </InputWrapper>
          {passwordError && <ErrorMessage>{passwordError}</ErrorMessage>}
        </FormGroup>

        <Flex justify="flex-end" style={{ marginBottom: '1.5rem' }}>
          <ForgotPasswordLink to="/auth/forgot-password">
            Forgot password?
          </ForgotPasswordLink>
        </Flex>
        
        <LoginButton
          type="submit"
          disabled={isLoading}
          style={{ width: '100%' }}
        >
          {isLoading ? 'Signing in...' : (
            <>
              <FaSignInAlt /> Sign in
            </>
          )}
        </LoginButton>
      </form>
      
      <SignUpText>
        Don't have an account?{' '}
        <SignUpLink to="/auth/register">
          Sign up
        </SignUpLink>
      </SignUpText>
    </div>
  );
}
