import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { 
  FaClock, 
  FaMapMarkerAlt, 
  FaUserFriends, 
  FaCalendarCheck, 
  FaCheck,
  FaTimes
} from 'react-icons/fa';
import { supabase, isAuthenticated, getCurrentProfile } from '../lib/supabase';
import { theme } from '../styles/theme';
import { 
  Container, 
  Card, 
  Title, 
  PrimaryButton,
  SecondaryButton,
  Badge,
  Flex,
  FormGroup,
  TextArea,
  ErrorMessage
} from '../components/ui/StyledComponents';

const EventDetailContainer = styled(Container)`
  padding-top: ${theme.spacing.xl};
  padding-bottom: ${theme.spacing.xl};
`;

const EventHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.xl};
  
  @media (min-width: ${theme.breakpoints.md}) {
    flex-direction: row;
    align-items: flex-start;
  }
`;

const EventHeaderLeft = styled.div`
  flex: 2;
`;

const EventHeaderRight = styled.div`
  flex: 1;
  
  @media (max-width: ${theme.breakpoints.md}) {
    width: 100%;
  }
`;

const EventImageContainer = styled.div`
  width: 100%;
  border-radius: ${theme.borderRadius.lg};
  overflow: hidden;
  box-shadow: ${theme.shadows.md};
  margin-bottom: ${theme.spacing.xl};
`;

const EventImage = styled.img`
  width: 100%;
  height: 400px;
  object-fit: cover;
  
  @media (max-width: ${theme.breakpoints.md}) {
    height: 300px;
  }
  
  @media (max-width: ${theme.breakpoints.sm}) {
    height: 200px;
  }
`;

const EventTitle = styled.h1`
  font-size: ${theme.fontSizes['3xl']};
  margin-bottom: ${theme.spacing.md};
`;

const EventOrganizer = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.lg};
`;

const OrganizerImage = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: ${theme.colors.gray[300]};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: ${theme.colors.gray[600]};
`;

const OrganizerInfo = styled.div``;

const OrganizerName = styled.div`
  font-weight: 600;
`;

const OrganizerText = styled.div`
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.gray[600]};
`;

const EventMetaCard = styled(Card)`
  margin-bottom: ${theme.spacing.xl};
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.md} 0;
  border-bottom: 1px solid ${theme.colors.gray[200]};
  
  &:last-child {
    border-bottom: none;
  }
`;

const MetaIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: ${theme.colors.gray[100]};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${theme.colors.primary};
`;

const MetaContent = styled.div`
  flex: 1;
`;

const MetaTitle = styled.div`
  font-weight: 500;
`;

const MetaText = styled.div`
  color: ${theme.colors.gray[600]};
  font-size: ${theme.fontSizes.sm};
`;

const EventContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xl};
`;

const EventSection = styled.div``;

const SectionTitle = styled.h2`
  font-size: ${theme.fontSizes.xl};
  margin-bottom: ${theme.spacing.md};
  padding-bottom: ${theme.spacing.sm};
  border-bottom: 2px solid ${theme.colors.gray[200]};
`;

const EventDescription = styled.div`
  line-height: 1.6;
  color: ${theme.colors.gray[700]};
  
  p {
    margin-bottom: ${theme.spacing.md};
  }
`;

const RequirementsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: ${theme.spacing.md};
`;

const RequirementItem = styled.div`
  background-color: ${theme.colors.gray[50]};
  padding: ${theme.spacing.md};
  border-radius: ${theme.borderRadius.md};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

const RequirementIcon = styled.div<{ isRequired?: boolean }>`
  color: ${props => props.isRequired ? theme.colors.error : theme.colors.success};
  display: flex;
  align-items: center;
`;

const RequirementText = styled.div`
  font-size: ${theme.fontSizes.sm};
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing.sm};
  margin: ${theme.spacing.md} 0;
`;

const Tag = styled.span`
  background-color: ${theme.colors.primary}20;
  color: ${theme.colors.primary};
  font-size: ${theme.fontSizes.sm};
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.full};
  font-weight: 500;
`;

const ApplicationContainer = styled.div`
  margin-top: ${theme.spacing.xl};
`;

const ApplicationCard = styled(Card)`
  margin-top: ${theme.spacing.md};
`;

const StatusBadge = styled(Badge)<{ status: string }>`
  background-color: ${props => {
    switch (props.status) {
      case 'pending': return theme.colors.info;
      case 'accepted': return theme.colors.success;
      case 'rejected': return theme.colors.error;
      case 'completed': return theme.colors.gray[500];
      default: return theme.colors.gray[400];
    }
  }};
  color: white;
  text-transform: uppercase;
  font-size: ${theme.fontSizes.xs};
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.full};
`;

const MatchScore = styled.div<{ score: number }>`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: ${props => {
    if (props.score >= 80) return theme.colors.success;
    if (props.score >= 60) return theme.colors.info;
    return theme.colors.gray[400];
  }};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: ${theme.fontSizes.lg};
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled(Card)`
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  padding-bottom: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.md};
  border-bottom: 1px solid ${theme.colors.gray[200]};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ModalTitle = styled.h3`
  font-size: ${theme.fontSizes.xl};
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: ${theme.fontSizes.xl};
  cursor: pointer;
  color: ${theme.colors.gray[600]};
  
  &:hover {
    color: ${theme.colors.gray[800]};
  }
`;

export default function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [event, setEvent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [application, setApplication] = useState<any>(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [applicationMessage, setApplicationMessage] = useState('');
  const [applicationError, setApplicationError] = useState('');
  const [matchScore, setMatchScore] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        // Check if user is logged in
        const auth = await isAuthenticated();
        if (auth) {
          const profile = await getCurrentProfile();
          setUserProfile(profile);
        }
        
        // Fetch event details
        let { data: eventData, error: eventError } = await supabase
          .from('events')
          .select(`
            *,
            creator:profiles(id, display_name, type),
            event_skills(
              id,
              importance_level,
              skills(id, name, category)
            )
          `)
          .eq('id', id as string)
          .single();
        
        if (eventError) {
          console.error('Error fetching event:', eventError);
          // For demo purposes, use a sample event if not found
          eventData = getSampleEvent(id as string);
        }
        
        setEvent(eventData);
        
        // If user is logged in, check if they've already applied
        if (auth && userProfile) {
          const { data: appData } = await supabase
            .from('applications')
            .select('*')
            .eq('event_id', id)
            .eq('volunteer_id', userProfile.id)
            .maybeSingle();
          
          setApplication(appData);
          
          // Calculate match score if user is a volunteer
          if (userProfile.type === 'volunteer' && eventData) {
            // In a real app, this would be a more complex calculation
            // based on skills match, availability, etc.
            setMatchScore(Math.floor(Math.random() * 30) + 70); // 70-100% match for demo
          }
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEventDetails();
  }, [id, userProfile?.id]);

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const formatDuration = (startDateString: string, endDateString: string) => {
    const start = new Date(startDateString);
    const end = new Date(endDateString);
    const durationMs = end.getTime() - start.getTime();
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours} hour${hours !== 1 ? 's' : ''}${minutes > 0 ? `, ${minutes} minute${minutes !== 1 ? 's' : ''}` : ''}`;
  };

  const handleApplyClick = () => {
    if (!userProfile) {
      navigate('/auth/login', { state: { from: `/opportunities/${id}` } });
      return;
    }
    
    if (userProfile.type !== 'volunteer') {
      alert('Only volunteers can apply to opportunities.');
      return;
    }
    
    setIsApplyModalOpen(true);
  };

  const handleSubmitApplication = async () => {
    setApplicationError('');
    setIsSubmitting(true);
    
    try {
      const { data, error } = await supabase
        .from('applications')
        .insert({
          event_id: id,
          volunteer_id: userProfile.id,
          message: applicationMessage,
          match_score: matchScore,
          status: 'pending',
        })
        .select()
        .single();
      
      if (error) throw error;
      
      setApplication(data);
      setIsApplyModalOpen(false);
      setApplicationMessage('');
      
      // In a real app, you might want to send a notification to the organization
    } catch (error: any) {
      setApplicationError(error.message || 'Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Sample event for demo purposes
  const getSampleEvent = (eventId: string) => {
    const sampleEvents = [
      {
        id: '1',
        title: 'Community Garden Cleanup',
        description: `<p>Help us clean up and prepare the community garden for spring planting. No experience necessary!</p>
        <p>We need volunteers to help with weeding, mulching, and preparing garden beds. This is a great opportunity for anyone interested in gardening, environmental conservation, or just spending time outdoors making a difference in the community.</p>
        <p>All tools and materials will be provided. Please wear clothes you don't mind getting dirty and bring a water bottle. We'll have snacks and refreshments available.</p>`,
        start_datetime: new Date(Date.now() + 86400000 * 3).toISOString(),
        end_datetime: new Date(Date.now() + 86400000 * 3 + 10800000).toISOString(),
        location: 'Main Street Community Garden, 123 Main St',
        image_url: 'https://images.unsplash.com/photo-1592150621744-aca64f48394a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2681&q=80',
        creator: { id: '1', display_name: 'Green Earth Initiative', type: 'organization' },
        min_volunteers: 5,
        max_volunteers: 20,
        status: 'published',
        event_skills: [
          { id: '1', importance_level: 1, skills: { id: '1', name: 'Gardening', category: 'Outdoors' } },
          { id: '2', importance_level: 1, skills: { id: '2', name: 'Physical Labor', category: 'General' } },
          { id: '3', importance_level: 2, skills: { id: '3', name: 'Plant Knowledge', category: 'Outdoors' } },
        ]
      },
      {
        id: '2',
        title: 'Homeless Shelter Meal Service',
        description: `<p>Volunteers needed to help prepare and serve meals at the downtown homeless shelter. We serve dinner to approximately 100 people each night and need help with preparation, serving, and cleanup.</p>
        <p>The shelter provides essential services to people experiencing homelessness in our community, and meal service is a critical part of our operation. By volunteering, you'll directly impact the lives of those in need.</p>
        <p>No prior experience is required, but food handler's certification is a plus. All volunteers will be given a brief orientation before starting their shift.</p>`,
        start_datetime: new Date(Date.now() + 86400000 * 5).toISOString(),
        end_datetime: new Date(Date.now() + 86400000 * 5 + 14400000).toISOString(),
        location: 'Hope Street Shelter, 456 Hope St',
        image_url: 'https://images.unsplash.com/photo-1541802645635-11f2286a7482?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2670&q=80',
        creator: { id: '2', display_name: 'Community Outreach Network', type: 'organization' },
        min_volunteers: 4,
        max_volunteers: 10,
        status: 'published',
        event_skills: [
          { id: '4', importance_level: 2, skills: { id: '4', name: 'Cooking', category: 'Food' } },
          { id: '5', importance_level: 1, skills: { id: '5', name: 'Food Service', category: 'Food' } },
          { id: '6', importance_level: 1, skills: { id: '6', name: 'Customer Service', category: 'General' } },
        ]
      },
    ];

    return sampleEvents.find(event => event.id === eventId) || sampleEvents[0];
  };

  if (isLoading) {
    return (
      <Container>
        <div style={{ padding: '40px 0', textAlign: 'center' }}>
          <p>Loading event details...</p>
        </div>
      </Container>
    );
  }

  if (!event) {
    return (
      <Container>
        <div style={{ padding: '40px 0', textAlign: 'center' }}>
          <p>Event not found</p>
        </div>
      </Container>
    );
  }

  return (
    <EventDetailContainer>
      <EventHeader>
        <EventHeaderLeft>
          <EventImageContainer>
            <EventImage src={event.image_url || 'https://via.placeholder.com/800x400?text=Event+Image'} alt={event.title} />
          </EventImageContainer>
          
          <EventTitle>{event.title}</EventTitle>
          
          <EventOrganizer>
            <OrganizerImage>
              {event.creator?.display_name.charAt(0).toUpperCase() || 'O'}
            </OrganizerImage>
            <OrganizerInfo>
              <OrganizerName>{event.creator?.display_name || 'Organization'}</OrganizerName>
              <OrganizerText>Event Organizer</OrganizerText>
            </OrganizerInfo>
          </EventOrganizer>
          
          <TagsContainer>
            {event.event_skills?.map((skillItem: any) => (
              <Tag key={skillItem.id}>
                {skillItem.skills.name}
                {skillItem.importance_level > 1 && ' (Required)'}
              </Tag>
            ))}
          </TagsContainer>
        </EventHeaderLeft>
        
        <EventHeaderRight>
          <EventMetaCard>
            <MetaItem>
              <MetaIcon>
                <FaClock size={18} />
              </MetaIcon>
              <MetaContent>
                <MetaTitle>Date & Time</MetaTitle>
                <MetaText>{formatDateTime(event.start_datetime)}</MetaText>
              </MetaContent>
            </MetaItem>
            
            <MetaItem>
              <MetaIcon>
                <FaCalendarCheck size={18} />
              </MetaIcon>
              <MetaContent>
                <MetaTitle>Duration</MetaTitle>
                <MetaText>{formatDuration(event.start_datetime, event.end_datetime)}</MetaText>
              </MetaContent>
            </MetaItem>
            
            <MetaItem>
              <MetaIcon>
                <FaMapMarkerAlt size={18} />
              </MetaIcon>
              <MetaContent>
                <MetaTitle>Location</MetaTitle>
                <MetaText>{event.location}</MetaText>
              </MetaContent>
            </MetaItem>
            
            <MetaItem>
              <MetaIcon>
                <FaUserFriends size={18} />
              </MetaIcon>
              <MetaContent>
                <MetaTitle>Volunteer Spots</MetaTitle>
                <MetaText>
                  {event.min_volunteers} minimum
                  {event.max_volunteers && `, ${event.max_volunteers} maximum`}
                </MetaText>
              </MetaContent>
            </MetaItem>
          </EventMetaCard>
          
          {userProfile?.type === 'volunteer' && matchScore && (
            <Flex justify="center" style={{ marginBottom: theme.spacing.md }}>
              <div style={{ textAlign: 'center' }}>
                <MatchScore score={matchScore}>{matchScore}%</MatchScore>
                <div style={{ marginTop: theme.spacing.xs, fontSize: theme.fontSizes.sm }}>Match Score</div>
              </div>
            </Flex>
          )}
          
          {application ? (
            <ApplicationContainer>
              <Flex justify="space-between" align="center">
                <div>
                  <div style={{ fontWeight: 500, marginBottom: theme.spacing.xs }}>Your Application</div>
                  <StatusBadge status={application.status}>{application.status}</StatusBadge>
                </div>
              </Flex>
              
              {application.status === 'pending' && (
                <SecondaryButton 
                  style={{ marginTop: theme.spacing.md, width: '100%' }}
                  onClick={async () => {
                    if (confirm('Are you sure you want to withdraw your application?')) {
                      await supabase
                        .from('applications')
                        .update({ status: 'canceled' })
                        .eq('id', application.id);
                      
                      setApplication({ ...application, status: 'canceled' });
                    }
                  }}
                >
                  Withdraw Application
                </SecondaryButton>
              )}
            </ApplicationContainer>
          ) : (
            userProfile?.type === 'volunteer' && (
              <PrimaryButton onClick={handleApplyClick} style={{ width: '100%' }}>
                Apply Now
              </PrimaryButton>
            )
          )}
        </EventHeaderRight>
      </EventHeader>
      
      <EventContent>
        <EventSection>
          <SectionTitle>About This Opportunity</SectionTitle>
          <EventDescription dangerouslySetInnerHTML={{ __html: event.description }} />
        </EventSection>
        
        <EventSection>
          <SectionTitle>Requirements</SectionTitle>
          <RequirementsGrid>
            {event.event_skills?.map((skillItem: any) => (
              <RequirementItem key={skillItem.id}>
                <RequirementIcon isRequired={skillItem.importance_level > 1}>
                  {skillItem.importance_level > 1 ? <FaTimes /> : <FaCheck />}
                </RequirementIcon>
                <RequirementText>
                  {skillItem.skills.name}
                  {skillItem.importance_level > 1 ? ' (Required)' : ' (Preferred)'}
                </RequirementText>
              </RequirementItem>
            ))}
          </RequirementsGrid>
        </EventSection>
      </EventContent>
      
      {isApplyModalOpen && (
        <Modal>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>Apply for this Opportunity</ModalTitle>
              <CloseButton onClick={() => setIsApplyModalOpen(false)}>&times;</CloseButton>
            </ModalHeader>
            
            {matchScore && (
              <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.md, marginBottom: theme.spacing.md }}>
                <MatchScore score={matchScore}>{matchScore}%</MatchScore>
                <div>
                  <div style={{ fontWeight: 500 }}>Match Score</div>
                  <div style={{ fontSize: theme.fontSizes.sm, color: theme.colors.gray[600] }}>
                    Based on your skills and the opportunity requirements
                  </div>
                </div>
              </div>
            )}
            
            <FormGroup>
              <TextArea
                value={applicationMessage}
                onChange={(e) => setApplicationMessage(e.target.value)}
                placeholder="Tell the organization why you're interested in this opportunity and why you'd be a good fit."
                rows={6}
              />
            </FormGroup>
            
            {applicationError && <ErrorMessage>{applicationError}</ErrorMessage>}
            
            <Flex justify="flex-end" gap={theme.spacing.md} style={{ marginTop: theme.spacing.md }}>
              <SecondaryButton onClick={() => setIsApplyModalOpen(false)}>
                Cancel
              </SecondaryButton>
              <PrimaryButton onClick={handleSubmitApplication} disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </PrimaryButton>
            </Flex>
          </ModalContent>
        </Modal>
      )}
    </EventDetailContainer>
  );
}
