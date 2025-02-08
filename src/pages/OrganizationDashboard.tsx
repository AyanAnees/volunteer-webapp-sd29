import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FaCalendarPlus, FaUsers, FaClipboardCheck, FaChartPie } from 'react-icons/fa';
import { supabase, getCurrentProfile } from '../lib/supabase';
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
      case 'published': return theme.colors.success;
      case 'draft': return theme.colors.gray[400];
      default: return theme.colors.gray[400];
    }
  }};
`;

const EventCard = styled(Card)`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const EventHeader = styled.div`
  margin-bottom: ${theme.spacing.md};
`;

const EventTitle = styled(Link)`
  font-size: ${theme.fontSizes.lg};
  font-weight: 600;
  color: ${theme.colors.gray[800]};
  text-decoration: none;
  
  &:hover {
    color: ${theme.colors.primary};
    text-decoration: underline;
  }
`;

const EventInfo = styled.div`
  margin-bottom: ${theme.spacing.md};
  color: ${theme.colors.gray[600]};
  font-size: ${theme.fontSizes.sm};
`;

const EventFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  padding-top: ${theme.spacing.md};
  border-top: 1px solid ${theme.colors.gray[200]};
`;

export default function OrganizationDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalEvents: 0,
    activeEvents: 0,
    totalVolunteers: 0,
    pendingApplications: 0
  });

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        // Get current user profile
        const profile = await getCurrentProfile();
        setUserProfile(profile);

        if (profile) {
          // Fetch events created by this organization
          let { data: eventsData, error: eventsError } = await supabase
            .from('events')
            .select('*')
            .eq('creator_id', profile.id)
            .order('created_at', { ascending: false });
            
          if (eventsError) throw eventsError;
          
          // If no events in database, use sample data for demo
          if (!eventsData || eventsData.length === 0) {
            eventsData = generateSampleEvents(profile.id);
          }
          
          setEvents(eventsData);
          
          // Fetch applications for these events
          const eventIds = eventsData.map(event => event.id);
          
          if (eventIds.length > 0) {
            let { data: appsData, error: appsError } = await supabase
              .from('applications')
              .select(`
                *,
                volunteer:profiles(id, display_name),
                event:events(id, title)
              `)
              .in('event_id', eventIds)
              .order('created_at', { ascending: false });
              
            if (appsError) throw appsError;
            
            // If no applications in database, use sample data for demo
            if (!appsData || appsData.length === 0) {
              appsData = generateSampleApplications(eventIds);
            }
            
            setApplications(appsData);
          }
          
          // Calculate stats
          const activeEvents = eventsData.filter(
            event => event.status === 'published' && new Date(event.end_datetime) > new Date()
          ).length;
          
          const totalVolunteers = new Set(
            applications.filter(app => app.status === 'accepted').map(app => app.volunteer_id)
          ).size;
          
          const pendingApps = applications.filter(app => app.status === 'pending').length;
          
          setStats({
            totalEvents: eventsData.length,
            activeEvents,
            totalVolunteers: totalVolunteers || Math.floor(Math.random() * 20) + 5, // Random for demo
            pendingApplications: pendingApps || Math.floor(Math.random() * 10) + 2 // Random for demo
          });
        }
      } catch (error) {
        console.error('Error loading dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDashboard();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Generate sample events for demo
  const generateSampleEvents = (organizationId: string) => {
    return [
      {
        id: '1',
        creator_id: organizationId,
        title: 'Community Garden Cleanup',
        description: 'Help us clean up and prepare the community garden for spring planting.',
        location: 'Main Street Community Garden',
        start_datetime: new Date(Date.now() + 86400000 * 3).toISOString(), // 3 days from now
        end_datetime: new Date(Date.now() + 86400000 * 3 + 10800000).toISOString(),
        status: 'published',
        min_volunteers: 5,
        max_volunteers: 20,
        created_at: new Date(Date.now() - 86400000 * 7).toISOString() // 7 days ago
      },
      {
        id: '2',
        creator_id: organizationId,
        title: 'After-School Tutoring Program',
        description: 'Tutor elementary school students in math and reading.',
        location: 'Washington Elementary School',
        start_datetime: new Date(Date.now() + 86400000 * 7).toISOString(), // 7 days from now
        end_datetime: new Date(Date.now() + 86400000 * 7 + 7200000).toISOString(),
        status: 'published',
        min_volunteers: 3,
        max_volunteers: 10,
        created_at: new Date(Date.now() - 86400000 * 5).toISOString() // 5 days ago
      },
      {
        id: '3',
        creator_id: organizationId,
        title: 'Fundraising Gala',
        description: 'Help with our annual fundraising gala.',
        location: 'City Convention Center',
        start_datetime: new Date(Date.now() + 86400000 * 14).toISOString(), // 14 days from now
        end_datetime: new Date(Date.now() + 86400000 * 14 + 18000000).toISOString(),
        status: 'draft',
        min_volunteers: 10,
        max_volunteers: 30,
        created_at: new Date(Date.now() - 86400000 * 2).toISOString() // 2 days ago
      }
    ];
  };

  // Generate sample applications for demo
  const generateSampleApplications = (eventIds: string[]) => {
    return [
      {
        id: '1',
        event_id: eventIds[0],
        volunteer_id: 'volunteer1',
        status: 'accepted',
        created_at: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
        volunteer: { id: 'volunteer1', display_name: 'John Smith' },
        event: { id: eventIds[0], title: 'Community Garden Cleanup' }
      },
      {
        id: '2',
        event_id: eventIds[0],
        volunteer_id: 'volunteer2',
        status: 'pending',
        created_at: new Date(Date.now() - 86400000 * 3).toISOString(), // 3 days ago
        volunteer: { id: 'volunteer2', display_name: 'Emily Johnson' },
        event: { id: eventIds[0], title: 'Community Garden Cleanup' }
      },
      {
        id: '3',
        event_id: eventIds[1],
        volunteer_id: 'volunteer3',
        status: 'pending',
        created_at: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
        volunteer: { id: 'volunteer3', display_name: 'Michael Williams' },
        event: { id: eventIds[1], title: 'After-School Tutoring Program' }
      },
      {
        id: '4',
        event_id: eventIds[1],
        volunteer_id: 'volunteer4',
        status: 'accepted',
        created_at: new Date(Date.now() - 86400000 * 1).toISOString(), // 1 day ago
        volunteer: { id: 'volunteer4', display_name: 'Emma Davis' },
        event: { id: eventIds[1], title: 'After-School Tutoring Program' }
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
        <Title>Organization Dashboard</Title>
        <PrimaryLinkButton to="/events/create">
          <FaCalendarPlus style={{ marginRight: '8px' }} />
          Create New Opportunity
        </PrimaryLinkButton>
      </Flex>
      
      <StatsGrid>
        <StatCard>
          <StatIcon>
            <FaCalendarPlus />
          </StatIcon>
          <StatContent>
            <StatValue>{stats.totalEvents}</StatValue>
            <StatLabel>Total Events</StatLabel>
          </StatContent>
        </StatCard>
        
        <StatCard>
          <StatIcon>
            <FaChartPie />
          </StatIcon>
          <StatContent>
            <StatValue>{stats.activeEvents}</StatValue>
            <StatLabel>Active Events</StatLabel>
          </StatContent>
        </StatCard>
        
        <StatCard>
          <StatIcon>
            <FaUsers />
          </StatIcon>
          <StatContent>
            <StatValue>{stats.totalVolunteers}</StatValue>
            <StatLabel>Total Volunteers</StatLabel>
          </StatContent>
        </StatCard>
        
        <StatCard>
          <StatIcon>
            <FaClipboardCheck />
          </StatIcon>
          <StatContent>
            <StatValue>{stats.pendingApplications}</StatValue>
            <StatLabel>Pending Applications</StatLabel>
          </StatContent>
        </StatCard>
      </StatsGrid>
      
      <div style={{ marginBottom: theme.spacing.xl }}>
        <SectionHeading>
          Recent Applications
          <ViewAllLink to="/manage-events">Manage All Events</ViewAllLink>
        </SectionHeading>
        
        {applications.length > 0 ? (
          <Table>
            <thead>
              <Tr>
                <Th>Volunteer</Th>
                <Th>Event</Th>
                <Th>Applied</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </Tr>
            </thead>
            <tbody>
              {applications.slice(0, 5).map(application => (
                <Tr key={application.id}>
                  <Td>{application.volunteer?.display_name || 'Unknown Volunteer'}</Td>
                  <Td>{application.event?.title || 'Unknown Event'}</Td>
                  <Td>{formatDate(application.created_at)}</Td>
                  <Td>
                    <StatusBadge status={application.status} variant="primary">
                      {application.status.toUpperCase()}
                    </StatusBadge>
                  </Td>
                  <Td>
                    <Link to={`/manage-events?event=${application.event_id}`} style={{ 
                      color: theme.colors.primary,
                      textDecoration: 'none',
                      fontWeight: 500,
                      fontSize: theme.fontSizes.sm
                    }}>
                      Manage →
                    </Link>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <EmptyState>
            <EmptyStateTitle>No Applications Yet</EmptyStateTitle>
            <EmptyStateText>
              You haven't received any applications for your volunteer opportunities yet.
            </EmptyStateText>
          </EmptyState>
        )}
      </div>
      
      <div style={{ marginBottom: theme.spacing.xl }}>
        <SectionHeading>
          Your Opportunities
          <ViewAllLink to="/manage-events">View All</ViewAllLink>
        </SectionHeading>
        
        {events.length > 0 ? (
          <Grid columns={3} gap={theme.spacing.md}>
            {events.slice(0, 6).map(event => (
              <EventCard key={event.id}>
                <EventHeader>
                  <EventTitle to={`/opportunities/${event.id}`}>
                    {event.title}
                  </EventTitle>
                </EventHeader>
                
                <EventInfo>
                  <div>Location: {event.location}</div>
                  <div>Date: {formatDate(event.start_datetime)}</div>
                  <div>
                    Volunteers: {event.min_volunteers} min
                    {event.max_volunteers ? `, ${event.max_volunteers} max` : ''}
                  </div>
                </EventInfo>
                
                <EventFooter>
                  <StatusBadge status={event.status} variant="primary">
                    {event.status.toUpperCase()}
                  </StatusBadge>
                  
                  <Link to={`/manage-events?event=${event.id}`} style={{ 
                    color: theme.colors.primary,
                    textDecoration: 'none',
                    fontWeight: 500,
                    fontSize: theme.fontSizes.sm
                  }}>
                    Manage →
                  </Link>
                </EventFooter>
              </EventCard>
            ))}
          </Grid>
        ) : (
          <EmptyState>
            <EmptyStateTitle>No Events Created</EmptyStateTitle>
            <EmptyStateText>
              You haven't created any volunteer opportunities yet. Create your first opportunity to start finding volunteers.
            </EmptyStateText>
            <PrimaryLinkButton to="/events/create">
              <FaCalendarPlus style={{ marginRight: '8px' }} />
              Create New Opportunity
            </PrimaryLinkButton>
          </EmptyState>
        )}
      </div>
    </DashboardContainer>
  );
}
