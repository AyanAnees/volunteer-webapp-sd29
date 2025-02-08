import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { supabase } from '../../lib/supabase';
import { theme } from '../../styles/theme';
import {
  FormGroup,
  Label,
  Input,
  RadioGroup,
  RadioLabel,
  ErrorMessage,
  PrimaryButton,
  Flex,
  SmallText
} from '../../components/ui/StyledComponents';

const AuthTitle = styled.h1`
  font-size: 1.75rem;
  font-weight: 600;
  color: ${theme.colors.gray[800]};
  margin-bottom: ${theme.spacing.lg};
  text-align: center;
`;

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [accountType, setAccountType] = useState<'volunteer' | 'organization'>('volunteer');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState('');
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email is invalid';
    
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    
    if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    
    if (!displayName) newErrors.displayName = 'Display name is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      console.log('Form validation failed:', errors);
      return;
    }
    
    setIsLoading(true);
    setGeneralError('');
    
    try {
      console.log('[DEBUG] Starting registration process with:', { 
        email, 
        displayName, 
        accountType,
        passwordLength: password.length
      });
      
      // Clear any existing session first to avoid conflicts
      console.log('[DEBUG] Clearing existing sessions (if any)');
      await supabase.auth.signOut();
      
      // Create user in Supabase Auth with minimal data to avoid the trigger issues
      console.log('[DEBUG] Calling supabase.auth.signUp with minimal data');
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password
      });
      
      console.log('[DEBUG] Auth signup complete. Result:', { 
        userId: authData?.user?.id,
        hasError: !!authError,
        errorMessage: authError?.message || 'No error',
        status: authData?.user?.identities?.[0]?.identity_data?.email_verified
      });
      
      if (authError) {
        console.error('[DEBUG] Auth error details:', authError);
        throw authError;
      }
      
      // Create user profile
      if (authData?.user?.id) {
        const userId = authData.user.id;
        console.log('[DEBUG] Auth successful. User ID:', userId);
        console.log('[DEBUG] Waiting before attempting profile creation...');
        
        // Wait a moment for the auth to fully complete
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        try {
          console.log('[DEBUG] Creating profile with data:', {
            id: userId,
            type: accountType,
            display_name: displayName
          });
          
          // Create the profile directly using Supabase insert
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: userId,
              type: accountType,
              display_name: displayName,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select();
            
          console.log('[DEBUG] Profile creation attempt complete:', { 
            success: !profileError,
            data: profileData,
            error: profileError ? profileError.message : null
          });
          
          if (profileError) {
            console.error('[DEBUG] Profile error details:', {
              code: profileError.code,
              details: profileError.details,
              hint: profileError.hint,
              message: profileError.message
            });
            
            // Try again with raw SQL if RLS might be an issue
            console.log('[DEBUG] Attempting direct profile insertion with function...');
            
            const { data: functionData, error: functionError } = await supabase.rpc(
              'create_profile_for_user',
              { 
                user_id: userId,
                user_type: accountType,
                user_display_name: displayName
              }
            );
            
            console.log('[DEBUG] Function call result:', {
              success: !functionError,
              data: functionData,
              error: functionError ? functionError.message : null
            });
            
            if (functionError) {
              throw functionError;
            }
          }
          
          // Show success message and navigate
          console.log('[DEBUG] Registration fully successful!');
          alert('Account created successfully! Please check your email to verify your account.');
          
          // Use setTimeout for navigation to avoid race conditions
          setTimeout(() => {
            setIsLoading(false);
            navigate('/auth/login');
          }, 1000);
          
          // Return early to prevent setting isLoading=false twice
          return;
          
        } catch (error: any) {
          console.error('[DEBUG] Profile creation/update failed:', error);
          console.log('[DEBUG] Profile creation raw error:', {
            name: error.name,
            message: error.message,
            stack: error.stack,
            code: error.code,
            details: error.details
          });
          setGeneralError('Your account was created but there was an error with your profile. Please try logging in, or contact support if the issue persists.');
        }
      } else {
        console.error('[DEBUG] Auth succeeded but no user ID was returned:', authData);
        throw new Error('Auth signup succeeded but no user data was returned');
      }
    } catch (error: any) {
      console.error('[DEBUG] Registration error details:', {
        name: error.name,
        message: error.message,
        code: error.code,
        details: error.details
      });
      setGeneralError(error.message || 'An error occurred while registering');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <AuthTitle>Create Account</AuthTitle>
      
      {generalError && (
        <ErrorMessage style={{ marginBottom: '20px', textAlign: 'center' }}>{generalError}</ErrorMessage>
      )}
      
      <form onSubmit={handleRegister}>
        <FormGroup>
          <Label htmlFor="email">Email address</Label>
          <Input 
            id="email"
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
          />
          {errors.email && <ErrorMessage>{errors.email}</ErrorMessage>}
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="displayName">Display Name</Label>
          <Input 
            id="displayName"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Enter your name or organization name"
          />
          {errors.displayName && <ErrorMessage>{errors.displayName}</ErrorMessage>}
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="password">Password</Label>
          <Input 
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create a password"
          />
          {errors.password && <ErrorMessage>{errors.password}</ErrorMessage>}
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input 
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your password"
          />
          {errors.confirmPassword && <ErrorMessage>{errors.confirmPassword}</ErrorMessage>}
        </FormGroup>
        
        <FormGroup>
          <Label>Account Type</Label>
          <RadioGroup>
            <RadioLabel>
              <input
                type="radio"
                name="accountType"
                checked={accountType === 'volunteer'}
                onChange={() => setAccountType('volunteer')}
              />
              I want to volunteer
            </RadioLabel>
            <RadioLabel>
            <input
            type="radio"
            name="accountType"
            checked={accountType === 'organization'}
            onChange={() => setAccountType('organization')}
            />
            I need volunteers (Organization Account)
            </RadioLabel>
          </RadioGroup>
        </FormGroup>
        
        <PrimaryButton
          type="submit"
          disabled={isLoading}
          style={{ width: '100%', marginTop: '1rem' }}
        >
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </PrimaryButton>
      </form>
      
      <Flex justify="center" style={{ marginTop: '1.5rem' }}>
        <SmallText>
          Already have an account?{' '}
          <Link to="/auth/login" style={{ fontWeight: 500, color: theme.colors.primary }}>Sign in</Link>
        </SmallText>
      </Flex>
    </div>
  );
}
