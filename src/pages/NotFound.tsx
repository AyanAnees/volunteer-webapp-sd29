import styled from 'styled-components';
import { theme } from '../styles/theme';
import { Container, PrimaryLinkButton } from '../components/ui/StyledComponents';

const NotFoundContainer = styled(Container)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: ${theme.spacing['3xl']} ${theme.spacing.md};
  min-height: 60vh;
`;

const NotFoundImage = styled.img`
  width: 200px;
  height: 200px;
  margin-bottom: ${theme.spacing.xl};
`;

const NotFoundTitle = styled.h1`
  font-size: ${theme.fontSizes['3xl']};
  font-weight: 700;
  margin-bottom: ${theme.spacing.md};
`;

const NotFoundText = styled.p`
  font-size: ${theme.fontSizes.lg};
  color: ${theme.colors.gray[600]};
  max-width: 500px;
  margin: 0 auto ${theme.spacing.xl};
`;

export default function NotFound() {
  return (
    <NotFoundContainer>
      <NotFoundImage 
        src="https://via.placeholder.com/200x200?text=404" 
        alt="404 Not Found" 
      />
      
      <NotFoundTitle>
        Page Not Found
      </NotFoundTitle>
      
      <NotFoundText>
        The page you're looking for doesn't exist or has been moved.
      </NotFoundText>
      
      <PrimaryLinkButton to="/">
        Return Home
      </PrimaryLinkButton>
    </NotFoundContainer>
  );
}
