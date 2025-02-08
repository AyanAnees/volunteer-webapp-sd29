import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaCalendarAlt, FaClipboardList, FaClock, FaChartLine, FaMapMarkerAlt } from 'react-icons/fa';
import NotificationList from '../components/notifications/NotificationList';
import EventCalendar from '../components/calendar/EventCalendar';
import { fetchNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../services/notificationService';
import { fetchUpcomingVolunteerEvents, generateSampleEvents } from '../services/eventService';
import { supabase, getCurrentProfile } from '../lib/supabase';
import { handleAuthRedirect } from '../lib/authRedirect';
import { theme } from '../styles/theme';
import {
  Container,
  Title,
  Card,
  Grid,
  Flex,
  PrimaryLinkButton,
  Badge,
  Table,
  Th,
  Td,
  Tr
} from '../components/ui/StyledComponents';

const DashboardContainer = styled(Container)`
  padding-top: ${theme.spacing.xl};
  padding-bottom: ${theme.spacing.xl};
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.xl};
  
  @media (max-width: ${theme.breakpoints.lg}) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: ${theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled(Card)`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
`;

const StatIcon = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 10px;
  background-color: ${theme.colors.primary}20;
  color: ${theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
`;

const StatContent = styled.div`
  flex: 1;
`;

const StatValue = styled.div`
  font-size: ${theme.fontSizes['2xl']};
  font-weight: bold;
`;

const StatLabel = styled.div`
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.gray[600]};
`;

const SectionHeading = styled.h2`
  font-size: ${theme.fontSizes.xl};
  margin-bottom: ${theme.spacing.md};
  padding-bottom: ${theme.spacing.xs};
  border-bottom: 2px solid ${theme.colors.gray[200]};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ViewAllLink = styled(Link)`
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.primary};
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
`;

const ProfileSection = styled.div`
  margin-bottom: ${theme.spacing.xl};
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  color: ${theme.colors.gray[600]};
  font-size: ${theme.fontSizes.sm};
`;

const ProfileCompletionCard = styled(Card)`
  display: flex;
  gap: ${theme.spacing.lg};
  
  @media (max-width: ${theme.breakpoints.md}) {
    flex-direction: column;
  }
`;

const ProfileCompletionInfo = styled.div`
  flex: 1;
`;

const ProfileCompletionTitle = styled.h3`
  font-size: ${theme.fontSizes.lg};
  margin-bottom: ${theme.spacing.sm};
`;

const ProfileCompletionText = styled.p`
  color: ${theme.colors.gray[600]};
  margin-bottom: ${theme.spacing.md};
`;

const ProgressWrapper = styled.div`
  height: 8px;
  background-color: ${theme.colors.gray[200]};
  border-radius: ${theme.borderRadius.full};
  margin-bottom: ${theme.spacing.sm};
  overflow: hidden;
`;

const ProgressBar = styled.div<{ value: number }>`
  height: 100%;
  width: ${props => props.value}%;
  background-color: ${props => {
    if (props.value >= 80) return theme.colors.success;
    if (props.value >= 40) return theme.colors.warning;
    return theme.colors.error;
  }};
  border-radius: ${theme.borderRadius.full};
`;

const ProgressText = styled.div`
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.gray[600]};
`;

const RecommendedSection = styled.div`
  margin-bottom: ${theme.spacing.xl};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${theme.spacing.xl};
  background-color: ${theme.colors.gray[50]};
  border-radius: ${theme.borderRadius.lg};
`;

const EmptyStateTitle = styled.h3`
  font-size: ${theme.fontSizes.lg};
  margin-bottom: ${theme.spacing.sm};
`;

const EmptyStateText = styled.p`
  color: ${theme.colors.gray[600]};
  margin-bottom: ${theme.spacing.md};
`;

const StatusBadge = styled(Badge)<{ status: string }>`
  background-color: ${props => {
    switch (props.status) {
      case 'pending': return theme.colors.info;
      case 'accepted': return theme.colors.success;
      case 'rejected': return theme.colors.error;
      case 'completed': return theme.colors.gray[500];
      case 'canceled': return theme.colors.gray[400];
      default: return theme.colors.gray[400];
    }
  }};
`;

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [recentEvents, setRecentEvents] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalHours: 0,
    completedEvents: 0,
    upcomingEvents: 0,
    pendingApplications: 0
  });
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [recommendedOpportunities, setRecommendedOpportunities] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        // First check if user is authenticated
        const isAuthenticated = await handleAuthRedirect(navigate);
        if (!isAuthenticated) {
          // The function already handles the redirect
          return;
        }
        
        // Now we know the user is authenticated, get their profile
        const profile = await getCurrentProfile();
        
        if (!profile) {
          console.error('No user profile found for dashboard');
          setIsLoading(false);
          return;
        }
        
        setUserProfile(profile);
        // For demo - in a real app, you would calculate this based on profile fields
        calculateProfileCompletion(profile);
        
        // Get applications
        let { data: applicationData } = await supabase
          .from('applications')
          .select(`
            *,
            event:events(
              id,
              title,
              start_datetime,
              end_datetime,
              location,
              creator:profiles(display_name)
            )
          `)
          .eq('volunteer_id', profile.id)
          .order('created_at', { ascending: false })
          .limit(5);
        
        // If no data in Supabase, use sample data for the demo
        if (!applicationData || applicationData.length === 0) {
          applicationData = generateSampleApplications(profile.id);
        }
        
        setApplications(applicationData);
        
        // Calculate stats
        const completed = applicationData.filter(app => app.status === 'completed').length;
        const upcoming = applicationData.filter(app => 
          app.status === 'accepted' && new Date(app.event.start_datetime) > new Date()
        ).length;
        const pending = applicationData.filter(app => app.status === 'pending').length;
        
        setStats({
          totalHours: Math.floor(Math.random() * 50) + 10, // Random for demo
          completedEvents: completed,
          upcomingEvents: upcoming,
          pendingApplications: pending
        });
        
        // Get recommended opportunities based on skills (would be more sophisticated in real app)
        setRecommendedOpportunities(generateSampleOpportunities());
        
        // Get notifications
        let notificationData = await fetchNotifications(profile.id);
        
        // If no real notifications, use empty array
        if (!notificationData || notificationData.length === 0) {
          notificationData = [];
        }
        
        setNotifications(notificationData);
        
        // Get calendar events (or generate sample ones for demo)
        let eventData = await fetchUpcomingVolunteerEvents(profile.id);
        
        // If no real events, use sample data for the demo
        if (!eventData || eventData.length === 0) {
          eventData = generateSampleEvents(15); // Generate 15 sample events
        }
        
        setCalendarEvents(eventData);
        
        // Set loading to false when done
        setIsLoading(false);
        
      } catch (error) {
        console.error("Error loading dashboard:", error);
        setIsLoading(false);
        navigate('/auth/login');
      }
    };
    
    loadDashboard();
  }, []);

  const calculateProfileCompletion = (profile: any) => {
    let fields = 0;
    let total = 5; // Basic required fields
    
    if (profile.display_name) fields++;
    if (profile.bio) fields++;
    if (profile.location) fields++;
    if (profile.phone) fields++;
    if (profile.profile_image_url) fields++;
    
    setProfileCompletion(Math.round((fields / total) * 100));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Generate sample applications for demo
  const generateSampleApplications = (userId: string) => {
    return [
      {
        id: '1',
        volunteer_id: userId,
        status: 'accepted',
        created_at: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
        event: {
          id: '1',
          title: 'Community Garden Cleanup',
          start_datetime: new Date(Date.now() + 86400000 * 3).toISOString(), // 3 days from now
          end_datetime: new Date(Date.now() + 86400000 * 3 + 10800000).toISOString(),
          location: 'Main Street Community Garden',
          creator: { display_name: 'Green Earth Initiative' }
        }
      },
      {
        id: '2',
        volunteer_id: userId,
        status: 'pending',
        created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        event: {
          id: '2',
          title: 'Homeless Shelter Meal Service',
          start_datetime: new Date(Date.now() + 86400000 * 5).toISOString(), // 5 days from now
          end_datetime: new Date(Date.now() + 86400000 * 5 + 14400000).toISOString(),
          location: 'Hope Street Shelter',
          creator: { display_name: 'Community Outreach Network' }
        }
      },
      {
        id: '3',
        volunteer_id: userId,
        status: 'completed',
        created_at: new Date(Date.now() - 86400000 * 10).toISOString(), // 10 days ago
        event: {
          id: '3',
          title: 'After-School Tutoring Program',
          start_datetime: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
          end_datetime: new Date(Date.now() - 86400000 * 5 + 7200000).toISOString(),
          location: 'Washington Elementary School',
          creator: { display_name: 'Education for All Foundation' }
        }
      }
    ];
  };

  // Generate sample opportunities for demo
  const generateSampleOpportunities = () => {
    return [
      {
        id: '4',
        title: 'Animal Shelter Dog Walking',
        location: 'Paws and Claws Animal Shelter',
        start_datetime: new Date(Date.now() + 86400000 * 2).toISOString(), // 2 days from now
        match_score: 95
      },
      {
        id: '5',
        title: 'Senior Center Tech Support',
        location: 'Golden Years Senior Center',
        start_datetime: new Date(Date.now() + 86400000 * 4).toISOString(), // 4 days from now
        match_score: 88
      },
      {
        id: '6',
        title: 'Food Bank Sorting & Packing',
        location: 'Community Food Bank',
        start_datetime: new Date(Date.now() + 86400000 * 1).toISOString(), // 1 day from now
        match_score: 82
      }
    ];
  };

  if (isLoading) {
    return (
      <Container>
        <div style={{ padding: '40px 0', textAlign: 'center' }}>
          <p>Loading dashboard...</p>
        </div>
      </Container>
    );
  }

  return (
    <DashboardContainer>
      <Flex justify="space-between" align="center" style={{ marginBottom: theme.spacing.lg }}>
        <Title>Volunteer Dashboard</Title>
      </Flex>
      
      <ProfileSection>
        <ProfileCompletionCard>
          <ProfileCompletionInfo>
            <ProfileCompletionTitle>Welcome, {userProfile?.display_name || 'Volunteer'}!</ProfileCompletionTitle>
            <ProfileCompletionText>
              Complete your profile to improve your match recommendations and increase your chances of being selected for opportunities.
            </ProfileCompletionText>
            
            <ProgressWrapper>
              <ProgressBar value={profileCompletion} />
            </ProgressWrapper>
            <ProgressText>Profile Completion: {profileCompletion}%</ProgressText>
          </ProfileCompletionInfo>
          
          <Flex align="center" justify="center">
            <PrimaryLinkButton to="/profile">
              Complete Your Profile
            </PrimaryLinkButton>
          </Flex>
        </ProfileCompletionCard>
      </ProfileSection>
      
      <StatsGrid>
        <StatCard>
          <StatIcon>
            <FaClock />
          </StatIcon>
          <StatContent>
            <StatValue>{stats.totalHours}</StatValue>
            <StatLabel>Volunteer Hours</StatLabel>
          </StatContent>
        </StatCard>
        
        <StatCard>
          <StatIcon>
            <FaCalendarAlt />
          </StatIcon>
          <StatContent>
            <StatValue>{stats.completedEvents}</StatValue>
            <StatLabel>Completed Events</StatLabel>
          </StatContent>
        </StatCard>
        
        <StatCard>
          <StatIcon>
            <FaClipboardList />
          </StatIcon>
          <StatContent>
            <StatValue>{stats.upcomingEvents}</StatValue>
            <StatLabel>Upcoming Events</StatLabel>
          </StatContent>
        </StatCard>
        
        <StatCard>
          <StatIcon>
            <FaChartLine />
          </StatIcon>
          <StatContent>
            <StatValue>{stats.pendingApplications}</StatValue>
            <StatLabel>Pending Applications</StatLabel>
          </StatContent>
        </StatCard>
      </StatsGrid>
      
      <div style={{ marginBottom: theme.spacing.xl }}>
        <SectionHeading>
          Your Applications
          <ViewAllLink to="/applications">View All</ViewAllLink>
        </SectionHeading>
        
        {applications.length > 0 ? (
          <Table>
            <thead>
              <Tr>
                <Th>Opportunity</Th>
                <Th>Organization</Th>
                <Th>Date</Th>
                <Th>Status</Th>
              </Tr>
            </thead>
            <tbody>
              {applications.map(application => (
                <Tr key={application.id}>
                  <Td>
                    <Link to={`/opportunities/${application.event.id}`} style={{ color: theme.colors.primary }}>
                      {application.event.title}
                    </Link>
                  </Td>
                  <Td>{application.event.creator.display_name}</Td>
                  <Td>{formatDate(application.event.start_datetime)}</Td>
                  <Td>
                    <StatusBadge status={application.status} variant="primary">
                      {application.status.toUpperCase()}
                    </StatusBadge>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <EmptyState>
            <EmptyStateTitle>No Applications Yet</EmptyStateTitle>
            <EmptyStateText>
              You haven't applied to any volunteer opportunities yet. Browse available opportunities to get started.
            </EmptyStateText>
            <PrimaryLinkButton to="/opportunities">
              Find Opportunities
            </PrimaryLinkButton>
          </EmptyState>
        )}
      </div>
      
      {/* Calendar Section */}
      <div style={{ marginBottom: theme.spacing.xl }}>
        <SectionHeading>
          Upcoming Events Calendar
          <ViewAllLink to="/applications">View All Events</ViewAllLink>
        </SectionHeading>
        
        <EventCalendar 
          events={calendarEvents}
          onEventClick={(event) => navigate(`/opportunities/${event.id}`)} 
        />
      </div>
      
      {/* Notifications Section */}
      <div style={{ marginBottom: theme.spacing.xl }}>
        <NotificationList 
          notifications={notifications}
          onMarkAsRead={(id) => {
            markNotificationAsRead(id);
            setNotifications(notifications.map(notification => 
              notification.id === id 
                ? { ...notification, is_read: true } 
                : notification
            ));
          }}
          onMarkAllAsRead={() => {
            if (userProfile) {
              markAllNotificationsAsRead(userProfile.id);
              setNotifications(notifications.map(notification => 
                ({ ...notification, is_read: true })
              ));
            }
          }}
        />
      </div>
      
      <RecommendedSection>
        <SectionHeading>
          Recommended For You
          <ViewAllLink to="/opportunities">View All Opportunities</ViewAllLink>
        </SectionHeading>
        
        {recommendedOpportunities.length > 0 ? (
          <Grid columns={3} gap={theme.spacing.md}>
            {recommendedOpportunities.map(opportunity => (
              <Card key={opportunity.id}>
                <Flex justify="space-between" align="center" style={{ marginBottom: theme.spacing.sm }}>
                  <Link to={`/opportunities/${opportunity.id}`} style={{ 
                    color: theme.colors.gray[800], 
                    fontWeight: 600,
                    fontSize: theme.fontSizes.lg,
                    textDecoration: 'none'
                  }}>
                    {opportunity.title}
                  </Link>
                  <Badge variant="success">{opportunity.match_score}% Match</Badge>
                </Flex>
                <MetaItem>
                  <FaMapMarkerAlt />
                  {opportunity.location}
                </MetaItem>
                <MetaItem>
                  <FaCalendarAlt />
                  {formatDate(opportunity.start_datetime)}
                </MetaItem>
                <div style={{ marginTop: theme.spacing.md }}>
                  <Link to={`/opportunities/${opportunity.id}`} style={{
                    color: theme.colors.primary,
                    fontSize: theme.fontSizes.sm,
                    fontWeight: 500
                  }}>
                    View Details →
                  </Link>
                </div>
              </Card>
            ))}
          </Grid>
        ) : (
          <EmptyState>
            <EmptyStateTitle>No Recommendations Yet</EmptyStateTitle>
            <EmptyStateText>
              Complete your profile with your skills and interests to receive personalized recommendations.
            </EmptyStateText>
            <PrimaryLinkButton to="/profile">
              Update Your Profile
            </PrimaryLinkButton>
          </EmptyState>
        )}
      </RecommendedSection>
    </DashboardContainer>
  );
}
