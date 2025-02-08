import styled from 'styled-components';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import { theme } from '../styles/theme';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
`;

const FlexContainer = styled.div`
  display: flex;
  flex: 1;
  background: linear-gradient(135deg, ${theme.colors.primary}10, ${theme.colors.secondary}10);
  justify-content: center;
  align-items: center;
  padding: 3rem 1.5rem;
`;

const AuthContainer = styled.div`
  width: 100%;
  max-width: 32rem;
  padding: 1.5rem;
`;

const LogoBox = styled.div`
  text-align: center;
  margin-bottom: 2rem;
  position: relative;
  z-index: 1;
  
  &::after {
    content: '';
    position: absolute;
    width: 100px;
    height: 100px;
    background-color: ${theme.colors.primary}15;
    border-radius: 50%;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: -1;
  }
`;

const Logo = styled.img`
  height: 90px;
  margin: 0 auto;
  transition: all 0.3s ease;
  filter: drop-shadow(0px 4px 6px rgba(0, 0, 0, 0.1));
  
  &:hover {
    transform: scale(1.05);
    filter: drop-shadow(0px 6px 8px rgba(0, 0, 0, 0.15));
  }
`;

const AuthCard = styled.div`
  background-color: white;
  padding: 2.5rem;
  border-radius: ${theme.borderRadius.lg};
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
  }
`;

export default function AuthLayout() {
  return (
    <PageContainer>
      <Header />
      <FlexContainer>
        <AuthContainer>
          <LogoBox>
            <Logo 
              src="/volunteer-logo.svg" 
              alt="Volunteer Connect Logo" 
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                console.error("Error loading logo:", e);
                // Fallback to text if image fails to load
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  const textLogo = document.createElement('div');
                  textLogo.innerText = 'Volunteer Connect';
                  textLogo.style.fontSize = '24px';
                  textLogo.style.fontWeight = 'bold';
                  textLogo.style.color = theme.colors.primary;
                  parent.appendChild(textLogo);
                }
              }}
            />
          </LogoBox>
          <AuthCard>
            <Outlet />
          </AuthCard>
        </AuthContainer>
      </FlexContainer>
    </PageContainer>
  );
}
