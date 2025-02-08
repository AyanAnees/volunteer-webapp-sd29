import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaCalendarAlt, FaMapMarkerAlt, FaHistory, FaUsers, FaStar } from 'react-icons/fa';
import { BsStars } from 'react-icons/bs';
import { theme } from '../styles/theme';
import { supabase, getCurrentProfile } from '../lib/supabase';
import {
  Container,
  Title,
  Card,
  Text
} from '../components/ui/StyledComponents';

interface UserStats {
  eventsCompleted: number;
  totalHours: number;
  uniqueOrganizations: number;
  skillsUsed: number;
  averageRating: number;
}

interface HistoryItem {
  id: string;
  volunteer_id: string;
  created_at: string;
  hours_logged: number;
  rating?: number;
  feedback?: string;
  events?: {
    id: string;
    title: string;
    description: string;
    location: string;
    start_datetime: string;
    end_datetime: string;
    status: string;
    image_url?: string;
    creator_id: string;
    profiles?: {
      display_name: string;
    }[];
  };
}

const HistoryContainer = styled(Container)`
  padding-top: ${theme.spacing.xl};
  padding-bottom: ${theme.spacing.xl};
`;

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: ${theme.spacing.lg};
`;

const EventCard = styled(Card)`
  transition: transform 0.2s;
  
  &:hover {
    transform: translateY(-5px);
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.xl};
`;

const StatCard = styled(Card)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: ${theme.spacing.lg};
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: ${theme.spacing.xs};
  color: ${theme.colors.primary};
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  color: ${theme.colors.gray[500]};
`;

const EventHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: ${theme.spacing.sm};
`;

const EventTitle = styled.h3`
  margin: 0;
  color: ${theme.colors.gray[800]};
`;

const EventMeta = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: ${theme.spacing.xs};
  color: ${theme.colors.gray[500]};
  
  svg {
    margin-right: ${theme.spacing.xs};
  }
`;

const FeedbackSection = styled.div`
  margin-top: ${theme.spacing.md};
  padding-top: ${theme.spacing.md};
  border-top: 1px solid ${theme.colors.gray[200]};
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  text-align: center;
`;

const SectionTitle = styled.h2`
  margin-bottom: ${theme.spacing.lg};
  color: ${theme.colors.gray[800]};
`;

const NoEventsContainer = styled.div`
  text-align: center;
  padding: ${theme.spacing.xl};
  background-color: ${theme.colors.gray[50]};
  border-radius: ${theme.borderRadius.md};
  margin-top: ${theme.spacing.lg};
`;

const RatingStars = styled.div`
  display: flex;
  margin-bottom: ${theme.spacing.xs};
  color: ${theme.colors.primary};
`;

export default function History() {
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [stats, setStats] = useState<UserStats>({
    eventsCompleted: 0,
    totalHours: 0,
    uniqueOrganizations: 0,
    skillsUsed: 0,
    averageRating: 0
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const fetchHistoryData = async () => {
    try {
      setLoading(true);
      
      const profile = await getCurrentProfile();
      if (!profile) {
        setLoading(false);
        return;
      }
      
      const { data: historyData, error } = await supabase
        .from('volunteer_history')
        .select(`
          *,
          events (
            id,
            title,
            description,
            location,
            start_datetime,
            end_datetime,
            status,
            image_url,
            creator_id,
            profiles (
              display_name
            )
          )
        `)
        .eq('volunteer_id', profile.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching history:', error);
        setLoading(false);
        return;
      }
      
      console.log('History data:', historyData);
      
      if (historyData && historyData.length > 0) {
        setHistory(historyData);
        
        // Calculate stats
        const totalEvents = historyData.length;
        const totalHours = historyData.reduce((sum, item) => sum + (item.hours_logged || 0), 0);
        
        // Safely get organization names, handling missing profiles
        const orgNames = historyData
          .map(item => {
            if (item.events?.profiles && item.events.profiles[0]) {
              return item.events.profiles[0].display_name;
            }
            return 'Unknown Organization';
          })
          .filter(name => name !== 'Unknown Organization');
        
        const uniqueOrgs = new Set(orgNames).size;
        
        const ratingsWithValue = historyData.filter(item => item.rating);
        const avgRating = ratingsWithValue.length > 0 
          ? ratingsWithValue.reduce((sum, item) => sum + item.rating, 0) / ratingsWithValue.length 
          : 0;
        
        setStats({
          eventsCompleted: totalEvents,
          totalHours,
          uniqueOrganizations: uniqueOrgs,
          skillsUsed: 0, // Add this when we have skills data
          averageRating: Math.round(avgRating * 10) / 10
        });
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchHistoryData();
  }, []);
  
  const renderPastEvents = () => {
    if (history.length === 0) {
      return (
        <NoEventsContainer>
          <BsStars size={40} color={theme.colors.primary} />
          <Title as="h3">No volunteer history yet</Title>
          <Text>When you complete volunteer events, they'll appear here.</Text>
          
          {/* Sample event for visual reference */}
          <EventCard style={{ maxWidth: '400px', margin: '20px auto' }}>
            <EventHeader>
              <EventTitle>This is a sample event.</EventTitle>
            </EventHeader>
            <EventMeta>
              <FaCalendarAlt />
              <span>{formatDate(new Date().toISOString())}</span>
            </EventMeta>
            <EventMeta>
              <FaMapMarkerAlt />
              <span>Sample Location</span>
            </EventMeta>
            <Text>This is what your history will look like after you've completed events.</Text>
            <FeedbackSection>
              <SectionTitle as="h4">Feedback from organizer</SectionTitle>
              <RatingStars>
                {[1, 2, 3, 4, 5].map((star) => (
                  <FaStar key={star} size={16} />
                ))}
              </RatingStars>
              <Text>"Thank you for your help!"</Text>
            </FeedbackSection>
          </EventCard>
        </NoEventsContainer>
      );
    }
    
    return (
      <CardGrid>
        {history.map((item) => (
          <EventCard key={item.id}>
            <EventHeader>
              <EventTitle>{item.events?.title || 'Unknown Event'}</EventTitle>
            </EventHeader>
            <EventMeta>
              <FaCalendarAlt />
              <span>{item.events?.start_datetime ? formatDate(item.events.start_datetime) : 'Date unknown'}</span>
            </EventMeta>
            <EventMeta>
              <FaMapMarkerAlt />
              <span>{item.events?.location || 'Location unknown'}</span>
            </EventMeta>
            <EventMeta>
              <FaUsers />
              <span>
                Organized by {item.events?.profiles && item.events.profiles[0] 
                  ? item.events.profiles[0].display_name 
                  : 'Unknown Organization'}
              </span>
            </EventMeta>
            <Text>{item.events?.description || 'No description available'}</Text>
            
            {item.feedback && (
              <FeedbackSection>
                <SectionTitle as="h4">Feedback</SectionTitle>
                <RatingStars>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FaStar 
                      key={star} 
                      size={16} 
                      color={star <= (item.rating || 0) ? theme.colors.primary : theme.colors.gray[50]}
                    />
                  ))}
                </RatingStars>
                <Text>"{item.feedback}"</Text>
              </FeedbackSection>
            )}
          </EventCard>
        ))}
      </CardGrid>
    );
  };
  
  if (loading) {
    return (
      <LoadingContainer>
        <FaHistory size={40} color={theme.colors.primary} />
        <Title as="h2">Loading your impact and history</Title>
        <Text>Just a moment while we gather your volunteer journey...</Text>
      </LoadingContainer>
    );
  }
  
  return (
    <HistoryContainer>
      <Title>Your Volunteer History & Impact</Title>
      
      <SectionTitle>Your Impact Summary</SectionTitle>
      <StatsGrid>
        <StatCard>
          <StatValue>{stats.eventsCompleted}</StatValue>
          <StatLabel>Events Completed</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{stats.totalHours}</StatValue>
          <StatLabel>Total Hours</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{stats.uniqueOrganizations}</StatValue>
          <StatLabel>Organizations</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{stats.averageRating.toFixed(1)}</StatValue>
          <StatLabel>Avg. Rating</StatLabel>
        </StatCard>
      </StatsGrid>
      
      <SectionTitle>Your Past Events</SectionTitle>
      {renderPastEvents()}
    </HistoryContainer>
  );
}
