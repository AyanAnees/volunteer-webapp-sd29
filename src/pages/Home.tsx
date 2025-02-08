import styled from 'styled-components';
import { FaHandsHelping, FaCalendarAlt, FaUsers, FaArrowRight } from 'react-icons/fa';
import { theme } from '../styles/theme';
import { 
  Container,
  PrimaryLinkButton,
  SecondaryLinkButton,
  Card,
  Grid
} from '../components/ui/StyledComponents';

// Hero Section
const HeroSection = styled.section`
  background: linear-gradient(135deg, ${theme.colors.primary} 0%, #1a365d 100%);
  color: white;
  padding: 80px 0;
  width: 100%;
`;

const HeroContent = styled.div`
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
`;

const HeroTitle = styled.h1`
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: ${theme.spacing.lg};
  
  @media (max-width: ${theme.breakpoints.md}) {
    font-size: 2.5rem;
  }
  
  @media (max-width: ${theme.breakpoints.sm}) {
    font-size: 2rem;
  }
`;

const HeroText = styled.p`
  font-size: 1.25rem;
  margin-bottom: ${theme.spacing.xl};
  opacity: 0.9;
  line-height: 1.6;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  justify-content: center;
  
  @media (max-width: ${theme.breakpoints.sm}) {
    flex-direction: column;
    align-items: center;
  }
`;

// Features Section
const FeaturesSection = styled.section`
  padding: 80px 0;
  background-color: ${theme.colors.white};
  width: 100%;
`;

const SectionTitle = styled.h2`
  font-size: 2rem;
  text-align: center;
  margin-bottom: ${theme.spacing.xl};
`;

const FeatureCard = styled(Card)`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  height: 100%;
`;

const FeatureIcon = styled.div`
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background-color: ${theme.colors.primary};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  margin-bottom: ${theme.spacing.lg};
`;

const FeatureTitle = styled.h3`
  font-size: 1.25rem;
  margin-bottom: ${theme.spacing.md};
`;

const FeatureText = styled.p`
  color: ${theme.colors.gray[600]};
  line-height: 1.6;
`;

// How It Works Section
const StepsSection = styled.section`
  padding: 80px 0;
  background-color: ${theme.colors.gray[50]};
  width: 100%;
`;

const StepCard = styled(Card)`
  display: flex;
  gap: ${theme.spacing.md};
  align-items: flex-start;
`;

const StepNumber = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: ${theme.colors.primary};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  flex-shrink: 0;
`;

const StepContent = styled.div`
  flex: 1;
`;

const StepTitle = styled.h3`
  font-size: 1.25rem;
  margin-bottom: ${theme.spacing.sm};
`;

// CTA Section
const CtaSection = styled.section`
  padding: 80px 0;
  background-color: ${theme.colors.white};
  width: 100%;
`;

const CtaCard = styled(Card)`
  background: linear-gradient(135deg, ${theme.colors.primary} 0%, #1a365d 100%);
  color: white;
  text-align: center;
  padding: ${theme.spacing.xl} ${theme.spacing['2xl']};
`;

const CtaTitle = styled.h2`
  font-size: 2rem;
  margin-bottom: ${theme.spacing.md};
`;

const CtaText = styled.p`
  font-size: 1.1rem;
  margin-bottom: ${theme.spacing.xl};
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
  opacity: 0.9;
`;

// Testimonials Section
const TestimonialsSection = styled.section`
  padding: 80px 0;
  background-color: ${theme.colors.gray[50]};
  width: 100%;
`;

const TestimonialCard = styled(Card)`
  position: relative;
  padding-top: 50px;
`;

const QuoteMark = styled.div`
  position: absolute;
  top: 20px;
  left: ${theme.spacing.xl};
  font-size: 4rem;
  color: ${theme.colors.gray[200]};
  line-height: 1;
  font-family: serif;
`;

const TestimonialText = styled.p`
  font-style: italic;
  color: ${theme.colors.gray[700]};
  margin-bottom: ${theme.spacing.lg};
  line-height: 1.6;
`;

const TestimonialAuthor = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
`;

const AuthorImage = styled.img`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
`;

const AuthorInfo = styled.div``;

const AuthorName = styled.div`
  font-weight: 600;
`;

const AuthorRole = styled.div`
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.gray[600]};
`;

export default function Home() {
  return (
    <>
      <HeroSection>
        <Container maxW="container.xl">
          <HeroContent>
            <HeroTitle>Connect, Volunteer, Make a Difference</HeroTitle>
            <HeroText>
              Find the perfect volunteer opportunity that matches your skills and availability,
              or recruit talented volunteers for your organization's events and projects.
            </HeroText>
            <ButtonGroup>
              <PrimaryLinkButton to="/opportunities">
                Find Opportunities
              </PrimaryLinkButton>
              <SecondaryLinkButton to="/auth/register" style={{ backgroundColor: 'transparent', color: 'white', borderColor: 'white' }}>
                Sign Up
              </SecondaryLinkButton>
            </ButtonGroup>
          </HeroContent>
        </Container>
      </HeroSection>

      <FeaturesSection>
        <Container maxW="container.xl">
          <SectionTitle>Why Volunteer Connect?</SectionTitle>
          <Grid columns={3} gap={theme.spacing.xl}>
            <FeatureCard>
              <FeatureIcon>
                <FaHandsHelping />
              </FeatureIcon>
              <FeatureTitle>Skills Matching</FeatureTitle>
              <FeatureText>
                Our intelligent system matches volunteers with opportunities 
                based on their unique skills and interests.
              </FeatureText>
            </FeatureCard>
            
            <FeatureCard>
              <FeatureIcon>
                <FaCalendarAlt />
              </FeatureIcon>
              <FeatureTitle>Flexible Scheduling</FeatureTitle>
              <FeatureText>
                Find opportunities that fit your schedule with our 
                availability matching feature.
              </FeatureText>
            </FeatureCard>
            
            <FeatureCard>
              <FeatureIcon>
                <FaUsers />
              </FeatureIcon>
              <FeatureTitle>Community Building</FeatureTitle>
              <FeatureText>
                Connect with organizations and other volunteers to 
                build a network of impact makers.
              </FeatureText>
            </FeatureCard>
          </Grid>
        </Container>
      </FeaturesSection>

      <StepsSection>
        <Container maxW="container.xl">
          <SectionTitle>How It Works</SectionTitle>
          <Grid columns={1} gap={theme.spacing.lg}>
            <StepCard>
              <StepNumber>1</StepNumber>
              <StepContent>
                <StepTitle>Create your account</StepTitle>
                <FeatureText>
                  Sign up as a volunteer looking for opportunities or as an organization in need of volunteers.
                </FeatureText>
              </StepContent>
            </StepCard>
            
            <StepCard>
              <StepNumber>2</StepNumber>
              <StepContent>
                <StepTitle>Complete your profile</StepTitle>
                <FeatureText>
                  Add your skills, interests, and availability if you're a volunteer. If you're an organization, 
                  provide details about your mission and the type of help you need.
                </FeatureText>
              </StepContent>
            </StepCard>
            
            <StepCard>
              <StepNumber>3</StepNumber>
              <StepContent>
                <StepTitle>Find the perfect match</StepTitle>
                <FeatureText>
                  Browse volunteer opportunities that match your profile, or review volunteer applications for your events.
                </FeatureText>
              </StepContent>
            </StepCard>
            
            <StepCard>
              <StepNumber>4</StepNumber>
              <StepContent>
                <StepTitle>Make a difference</StepTitle>
                <FeatureText>
                  Connect with your match, volunteer for an event, and build a lasting relationship with your community.
                </FeatureText>
              </StepContent>
            </StepCard>
          </Grid>
        </Container>
      </StepsSection>

      <TestimonialsSection>
        <Container maxW="container.xl">
          <SectionTitle>What Our Users Say</SectionTitle>
          <Grid columns={2} gap={theme.spacing.xl}>
            <TestimonialCard>
              <QuoteMark>"</QuoteMark>
              <TestimonialText>
                Volunteer Connect made it so easy to find opportunities that match my schedule and skills. 
                I've been able to give back to my community in ways I never thought possible!
              </TestimonialText>
              <TestimonialAuthor>
                <AuthorImage src="https://randomuser.me/api/portraits/women/65.jpg" alt="Sarah Johnson" />
                <AuthorInfo>
                  <AuthorName>Sarah Johnson</AuthorName>
                  <AuthorRole>Volunteer</AuthorRole>
                </AuthorInfo>
              </TestimonialAuthor>
            </TestimonialCard>
            
            <TestimonialCard>
              <QuoteMark>"</QuoteMark>
              <TestimonialText>
                As a small non-profit, finding dedicated volunteers was always a challenge until we found 
                Volunteer Connect. Now we're able to connect with passionate people who really care about our cause.
              </TestimonialText>
              <TestimonialAuthor>
                <AuthorImage src="https://randomuser.me/api/portraits/men/32.jpg" alt="Michael Rodriguez" />
                <AuthorInfo>
                  <AuthorName>Michael Rodriguez</AuthorName>
                  <AuthorRole>Community Garden Director</AuthorRole>
                </AuthorInfo>
              </TestimonialAuthor>
            </TestimonialCard>
          </Grid>
        </Container>
      </TestimonialsSection>

      <CtaSection>
        <Container maxW="container.xl">
          <CtaCard>
            <CtaTitle>Ready to Make an Impact?</CtaTitle>
            <CtaText>
              Whether you're looking to volunteer or need volunteers for your organization,
              Volunteer Connect helps you find the perfect match to make a difference.
            </CtaText>
            <PrimaryLinkButton 
              to="/auth/register" 
              style={{ backgroundColor: 'white', color: theme.colors.primary }}
            >
              Get Started Today <FaArrowRight style={{ marginLeft: '8px' }} />
            </PrimaryLinkButton>
          </CtaCard>
        </Container>
      </CtaSection>
    </>
  );
}
