import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { supabase, getCurrentProfile } from '../lib/supabase';
import { FaUser, FaCalendarAlt, FaPhone, FaCheckCircle, FaTimesCircle, 
  FaChevronLeft, FaStar, FaInfoCircle } from 'react-icons/fa';

// Import from the correct location
import { Button, Card, TextArea } from '../components/ui/StyledComponents';

// Define interfaces
interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  start_datetime: string;
  end_datetime: string;
  status: string;
  min_volunteers?: number;
  max_volunteers?: number;
  creator_id: string;
  event_skills?: any[];
  created_at?: string;
  updated_at?: string;
}

interface Application {
  id: string;
  event_id: string;
  volunteer_id: string;
  status: string;
  message: string;
  admin_message?: string | null;
  match_score: number;
  created_at: string;
  updated_at: string;
  volunteer: any;
}

// Styled Components
const ApplicationsContainer = styled.div`
  padding-top: 40px;
  padding-bottom: 40px;
`;

const BackLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
  margin-bottom: 16px;
  text-decoration: none;
  
  &:hover {
    color: #337ab7;
  }
`;

const EventInfoCard = styled(Card)`
  margin-bottom: 40px;
`;

const EventTitle = styled.h2`
  font-size: 24px;
  margin-bottom: 8px;
`;

const EventDetail = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
  margin-bottom: 8px;
`;

const EventStats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  margin-top: 16px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 8px;
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: #666;
`;

const ApplicationsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ApplicationCard = styled(Card)<{ status?: string }>`
  border-left: 4px solid ${props => {
    switch (props.status) {
      case 'accepted': return '#2ecc71';
      case 'rejected': return '#e74c3c';
      case 'waitlisted': return '#f1c40f';
      case 'completed': return '#28a745';
      default: return '#3498db';
    }
  }};
`;

const ApplicationHeader = styled.div`
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const ApplicantInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const ApplicantAvatar = styled.div<{ imageUrl?: string }>`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: #ccc;
  background-image: ${props => props.imageUrl ? `url(${props.imageUrl})` : 'none'};
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
`;

const ApplicantDetails = styled.div``;

const ApplicantName = styled.h3`
  font-size: 18px;
  margin-bottom: 8px;
`;

const ApplicantContact = styled.div`
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
`;

const ContactItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #666;
`;

const ApplicationStatus = styled.span<{ status: string }>`
  text-transform: capitalize;
  background-color: ${props => {
    switch (props.status) {
      case 'accepted': return '#2ecc71';
      case 'rejected': return '#e74c3c';
      case 'waitlisted': return '#f1c40f';
      case 'pending': return '#3498db';
      case 'canceled': return '#666';
      case 'completed': return '#28a745';
      default: return '#666';
    }
  }};
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 14px;
  color: #fff;
`;

const ApplicationBody = styled.div`
  margin-bottom: 16px;
`;

const ApplicationMessage = styled.p`
  color: #666;
  line-height: 1.6;
  margin-bottom: 16px;
  padding: 16px;
  background-color: #f9f9f9;
  border-radius: 4px;
  border-left: 3px solid #ccc;
`;

const SkillsMatching = styled.div`
  margin-top: 16px;
`;

const SkillsTitle = styled.h4`
  font-size: 16px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SkillsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 8px;
`;

const SkillItem = styled.div<{ isMatched: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background-color: ${props => props.isMatched ? '#2ecc71' + '20' : '#f9f9f9'};
  border-radius: 4px;
  font-size: 14px;
`;

const MatchScore = styled.div<{ score: number }>`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  
  .score-value {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: ${props => {
      if (props.score >= 80) return '#2ecc71';
      if (props.score >= 60) return '#3498db';
      return '#666';
    }};
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
  }
  
  .score-label {
    font-size: 14px;
    color: #666;
  }
`;

const ApplicationActions = styled.div`
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const FilterBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
`;

const NoApplications = styled.div`
  text-align: center;
  padding: 40px 0;
  color: #666;
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 8px;
  border-bottom: 1px solid #ccc;
`;

const ModalTitle = styled.h3`
  font-size: 24px;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  color: #666;
  cursor: pointer;
  
  &:hover {
    color: #337ab7;
  }
`;

export default function EventApplications() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [event, setEvent] = useState<Event | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date');
  const [currentApplication, setCurrentApplication] = useState<Application | null>(null);
  const [responseMessage, setResponseMessage] = useState('');
  const [isResponseModalOpen, setIsResponseModalOpen] = useState(false);
  const [actionType, setActionType] = useState<'accept' | 'reject' | 'waitlist' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isConfirmCompleteModalOpen, setIsConfirmCompleteModalOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  
  const [stats, setStats] = useState({
    total: 0,
    accepted: 0,
    pending: 0,
    rejected: 0,
    waitlisted: 0,
    spots: {
      filled: 0,
      total: 0
    }
  });

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        // Check if user is authorized
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          navigate('/login');
          return;
        }
        
        // Fetch user profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (profileError || !profileData) {
          console.error('Error fetching profile:', profileError);
          navigate('/');
          return;
        }
        
        const profile = profileData;
        setUserProfile(profile);
        
        if (!profile || profile.type !== 'organization') {
          alert('Only organizations can view applications for their events.');
          navigate('/');
          return;
        }
        
        // Fetch event details
        const { data: eventData, error: eventError } = await supabase
          .from('events')
          .select(`
            *,
            event_skills(
              id,
              skill_id,
              importance_level,
              skills(
                id,
                name,
                category
              )
            )
          `)
          .eq('id', id as string)
          .eq('creator_id', profile.id)
          .single();
          
        if (eventError) {
          console.error('Error fetching event:', eventError);
          navigate('/manage-events');
          return;
        }
        
        // Verify the user has permission to see this event's applications
        if (eventData.creator_id !== profile.id) {
          console.error('User does not have permission to view applications for this event');
          console.log('Current user ID:', profile.id);
          console.log('Event creator ID:', eventData.creator_id);
          alert('You do not have permission to view applications for this event');
          navigate('/manage-events');
          return;
        }
        
        setEvent(eventData);
        
        // Fetch applications for this event
        console.log('Fetching applications for event:', id);
        let query = supabase
          .from('applications')
          .select(`
            *,
            volunteer:volunteer_id(
              id,
              display_name,
              phone,
              profile_image_url,
              skills:profile_skills(
                id,
                proficiency_level,
                skills(
                  id,
                  name,
                  category
                )
              )
            )
          `)
          .eq('event_id', id as string);
        
        // Apply status filter
        if (statusFilter !== 'all') {
          query = query.eq('status', statusFilter);
        }
        
        // Apply sorting
        if (sortBy === 'date') {
          query = query.order('created_at', { ascending: false });
        } else if (sortBy === 'match') {
          query = query.order('match_score', { ascending: false });
        } else if (sortBy === 'name') {
          query = query.order('volunteer(display_name)', { ascending: true });
        }
        
        const { data: applicationsData, error: applicationsError } = await query;
        
        if (applicationsError) {
          console.error('Error fetching applications:', applicationsError);
          throw applicationsError;
        }
        
        console.log('Applications data:', applicationsData);
        
        setApplications(applicationsData || []);
        
        // Calculate stats
        const acceptedCount = (applicationsData || []).filter(app => app.status === 'accepted').length;
        const pendingCount = (applicationsData || []).filter(app => app.status === 'pending').length;
        const rejectedCount = (applicationsData || []).filter(app => app.status === 'rejected').length;
        const waitlistedCount = (applicationsData || []).filter(app => app.status === 'waitlisted').length;
        
        setStats({
          total: (applicationsData || []).length,
          accepted: acceptedCount,
          pending: pendingCount,
          rejected: rejectedCount,
          waitlisted: waitlistedCount,
          spots: {
            filled: acceptedCount,
            total: eventData.max_volunteers || 0
          }
        });
      } catch (error) {
        console.error('Error fetching applications:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchApplications();
  }, [id, navigate, statusFilter, sortBy]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleOpenResponseModal = (application: Application, action: 'accept' | 'reject' | 'waitlist') => {
    setCurrentApplication(application);
    setActionType(action);
    setResponseMessage('');
    setError('');
    setIsResponseModalOpen(true);
  };

  const handleUpdateStatus = async () => {
    if (!currentApplication || !actionType) return;
    
    setIsSubmitting(true);
    setError('');
    
    try {
      // Check if accepting would exceed max volunteers
      if (actionType === 'accept' && 
          event?.max_volunteers !== undefined && 
          event?.max_volunteers !== null && 
          stats.spots.filled >= event.max_volunteers) {
        setError(`Cannot accept more volunteers. Maximum limit has been reached.`);
        setIsSubmitting(false);
        return;
      }
      
      // Update application status
      const newStatus = actionType === 'accept' ? 'accepted' : 
                        actionType === 'reject' ? 'rejected' : 
                        actionType === 'waitlist' ? 'waitlisted' : 'pending';
      
      const { error: updateError } = await supabase
        .from('applications')
        .update({
          status: newStatus,
          admin_message: responseMessage || null
        })
        .eq('id', currentApplication.id);
      
      if (updateError) throw updateError;
      
      // Update local state
      setApplications(applications.map(app => 
        app.id === currentApplication.id 
          ? { ...app, status: newStatus, admin_message: responseMessage || null } 
          : app
      ));
      
      // Update stats
      const newStats = { ...stats };
      
      // Decrement from previous status
      if (currentApplication.status === 'accepted') newStats.accepted--;
      else if (currentApplication.status === 'pending') newStats.pending--;
      else if (currentApplication.status === 'rejected') newStats.rejected--;
      else if (currentApplication.status === 'waitlisted') newStats.waitlisted--;
      
      // Increment new status
      if (newStatus === 'accepted') {
        newStats.accepted++;
        newStats.spots.filled++;
      }
      else if (newStatus === 'pending') newStats.pending++;
      else if (newStatus === 'rejected') newStats.rejected++;
      else if (newStatus === 'waitlisted') newStats.waitlisted++;
      
      setStats(newStats);
      
      // Close modal
      setIsResponseModalOpen(false);
      setCurrentApplication(null);
      setActionType(null);
      
      // Send notification to the volunteer
      if (newStatus === 'accepted' || newStatus === 'rejected' || newStatus === 'waitlisted') {
        try {
          // Get organizer profile for sender_id
          const profile = await getCurrentProfile();
          if (!profile) {
            console.error("Couldn't get profile for notification");
            return;
          }
          
          // Create notification based on application status
          const statusMessages = {
            accepted: {
              title: 'Application Accepted!',
              message: `Your application for "${event?.title}" has been accepted! We look forward to seeing you at the event.`
            },
            rejected: {
              title: 'Application Status Update',
              message: `Your application for "${event?.title}" was not selected at this time.`
            },
            waitlisted: {
              title: 'Application Waitlisted',
              message: `Your application for "${event?.title}" has been waitlisted. We'll notify you if a spot becomes available.`
            }
          };
          
          const notification = {
            recipient_id: currentApplication.volunteer_id,
            sender_id: profile.id,
            type: newStatus === 'accepted' ? 'success' : newStatus === 'rejected' ? 'error' : 'info',
            title: statusMessages[newStatus].title,
            message: statusMessages[newStatus].message,
            link: `/opportunities/${event?.id}`,
            is_read: false,
            created_at: new Date().toISOString()
          };
          
          console.log('Sending application status notification:', notification);
          
          const { error: notificationError } = await supabase
            .from('notifications')
            .insert(notification);
          
          if (notificationError) {
            console.error('Error sending notification:', notificationError);
          } else {
            console.log(`✅ ${newStatus} notification sent to volunteer`);
          }
        } catch (error) {
          console.error('Error sending notification:', error);
        }
      }
    } catch (error: any) {
      setError(error.message || 'Failed to update application status. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSkillMatched = (volunteerSkills: any[], eventSkill: any) => {
    return volunteerSkills?.some(skill => skill.skills.id === eventSkill.skill_id);
  };

  const handleCompleteEvent = async () => {
    setIsSubmitting(true);
    try {
      if (!event || !userProfile) {
        throw new Error('Event or user profile not found');
      }
      
      // 1. Update event status
      const { error: eventError } = await supabase
        .from('events')
        .update({ status: 'completed' })
        .eq('id', id);
      
      if (eventError) throw eventError;
      
      // 2. Get all accepted applications for this event
      const { data: acceptedApplications, error: applicationsError } = await supabase
        .from('applications')
        .select(`
          id,
          volunteer_id,
          volunteer:volunteer_id(
            id, 
            display_name
          )
        `)
        .eq('event_id', id)
        .eq('status', 'accepted');
      
      if (applicationsError) throw applicationsError;
      
      if (acceptedApplications && acceptedApplications.length > 0) {
        const currentTimestamp = new Date().toISOString();
        
        // 3. Create volunteer history entries
        const historyEntries = acceptedApplications.map(app => ({
          volunteer_id: app.volunteer_id,
          event_id: id,
          status: 'completed',
          created_at: currentTimestamp,
          updated_at: currentTimestamp
        }));
        
        const { error: historyError } = await supabase
          .from('volunteer_history')
          .insert(historyEntries);
        
        if (historyError) {
          console.error('Error creating volunteer history entries:', historyError);
        }
        
        // 4. Update application status to "completed" for all accepted applications
        const applicationIds = acceptedApplications.map(app => app.id);
        const { error: updateApplicationsError } = await supabase
          .from('applications')
          .update({ 
            status: 'completed',
            updated_at: currentTimestamp
          })
          .in('id', applicationIds);
        
        if (updateApplicationsError) {
          console.error('Error updating application status:', updateApplicationsError);
        }
        
        // 5. Send notifications to all accepted volunteers
        const notifications = acceptedApplications.map(app => ({
          recipient_id: app.volunteer_id,
          sender_id: userProfile.id,
          type: 'event_completed',
          title: 'Event Completed',
          message: `The event "${event.title}" has been marked as complete. Thank you for your participation!`,
          link: `/events/${id}`,
          is_read: false,
          created_at: currentTimestamp
        }));
        
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert(notifications);
        
        if (notificationError) {
          console.error('Error sending notifications:', notificationError);
        }
      }
      
      // 6. Update the local state
      if (event) {
        setEvent({
          ...event,
          status: 'completed'
        });
      }
      
      // Also update the local applications list to show "completed" status
      setApplications(applications.map(app => 
        app.status === 'accepted' 
          ? { ...app, status: 'completed' } 
          : app
      ));
      
      setIsConfirmCompleteModalOpen(false);
      alert('Event has been successfully marked as complete!');
      
    } catch (error: any) {
      console.error('Error completing event:', error);
      alert(`Failed to complete event: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div>
        <div style={{ padding: '40px 0', textAlign: 'center' }}>
          <p>Loading applications...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div>
        <div style={{ padding: '40px 0', textAlign: 'center' }}>
          <p>Event not found or you don't have access to this event.</p>
        </div>
      </div>
    );
  }

  return (
    <ApplicationsContainer>
      <BackLink to="/manage-events">
        <FaChevronLeft />
        Back to Manage Events
      </BackLink>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1>Applications for "{event.title}"</h1>
        {event.status !== 'completed' && (
          <Button
            onClick={() => setIsConfirmCompleteModalOpen(true)}
            style={{ 
              backgroundColor: '#28a745', 
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <FaCheckCircle />
            Mark Event as Complete
          </Button>
        )}
        {event.status === 'completed' && (
          <div style={{ 
            backgroundColor: '#28a745', 
            color: 'white',
            padding: '8px 16px',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <FaCheckCircle />
            Event Completed
          </div>
        )}
      </div>
      
      <EventInfoCard>
        <EventTitle>{event.title}</EventTitle>
        
        <EventDetail>
          <FaCalendarAlt />
          {formatDate(event.start_datetime)}
        </EventDetail>
        
        <EventStats>
          <StatItem>
            <StatValue>{stats.total}</StatValue>
            <StatLabel>Total Applications</StatLabel>
          </StatItem>
          
          <StatItem>
            <StatValue>{stats.pending}</StatValue>
            <StatLabel>Pending Review</StatLabel>
          </StatItem>
          
          <StatItem>
            <StatValue>{stats.accepted}</StatValue>
            <StatLabel>Accepted</StatLabel>
          </StatItem>
          
          <StatItem>
            <StatValue>{event.max_volunteers !== undefined && event.max_volunteers !== null ? `${stats.spots.filled}/${event.max_volunteers}` : stats.spots.filled}</StatValue>
            <StatLabel>Spots Filled</StatLabel>
          </StatItem>
        </EventStats>
      </EventInfoCard>
      
      <FilterBar>
        <div>
          <label>Filter by Status</label>
          <div style={{ display: 'flex', gap: 16 }}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Applications</option>
              <option value="pending">Pending Review</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
              <option value="waitlisted">Waitlisted</option>
              <option value="completed">Completed</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="date">Sort by Date</option>
              <option value="match">Sort by Match Score</option>
              <option value="name">Sort by Name</option>
            </select>
          </div>
        </div>
        
        <div>
          <label>
            Showing {applications.length} application{applications.length !== 1 ? 's' : ''}
          </label>
        </div>
      </FilterBar>
      
      {applications.length > 0 ? (
        <ApplicationsList>
          {applications.map(application => (
            <ApplicationCard key={application.id} status={application.status}>
              <ApplicationHeader>
                <ApplicantInfo>
                  <ApplicantAvatar imageUrl={application.volunteer.profile_image_url}>
                    {!application.volunteer.profile_image_url && <FaUser />}
                  </ApplicantAvatar>
                  
                  <ApplicantDetails>
                    <ApplicantName>{application.volunteer.display_name}</ApplicantName>
                    <ApplicantContact>
                      {application.volunteer.phone && (
                        <ContactItem>
                          <FaPhone />
                          {application.volunteer.phone}
                        </ContactItem>
                      )}
                    </ApplicantContact>
                  </ApplicantDetails>
                </ApplicantInfo>
                
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <ApplicationStatus status={application.status}>
                    {application.status}
                  </ApplicationStatus>
                  
                  <div style={{ fontWeight: 500, fontSize: 14 }}>
                    Applied on {formatDate(application.created_at)}
                  </div>
                </div>
              </ApplicationHeader>
              
              <ApplicationBody>
                {application.message && (
                  <>
                    <label>Message from Applicant</label>
                    <ApplicationMessage>{application.message}</ApplicationMessage>
                  </>
                )}
                
                <MatchScore score={application.match_score || 0}>
                  <div className="score-value">{application.match_score || 0}%</div>
                  <div className="score-label">Match Score</div>
                </MatchScore>
                
                {event.event_skills && event.event_skills.length > 0 && (
                  <SkillsMatching>
                    <SkillsTitle>
                      <FaInfoCircle />
                      Skills Matching
                    </SkillsTitle>
                    
                    <SkillsGrid>
                      {event.event_skills.map(eventSkill => (
                        <SkillItem 
                          key={eventSkill.id} 
                          isMatched={isSkillMatched(application.volunteer.skills || [], eventSkill)}
                        >
                          {isSkillMatched(application.volunteer.skills || [], eventSkill) ? (
                            <FaCheckCircle color="#2ecc71" />
                          ) : (
                            <FaTimesCircle color="#666" />
                          )}
                          {eventSkill.skills.name}
                          {eventSkill.importance_level > 1 && (
                            <FaStar size={12} color="#f1c40f" />
                          )}
                        </SkillItem>
                      ))}
                    </SkillsGrid>
                  </SkillsMatching>
                )}
              </ApplicationBody>
              
              {application.status === 'pending' && (
                <ApplicationActions>
                  <Button
                    onClick={() => handleOpenResponseModal(application, 'accept')}
                    disabled={event.max_volunteers !== undefined && event.max_volunteers !== null && stats.spots.filled >= event.max_volunteers}
                  >
                    <FaCheckCircle style={{ marginRight: 8 }} />
                    Accept
                  </Button>
                  
                  <Button
                    onClick={() => handleOpenResponseModal(application, 'waitlist')}
                  >
                    <FaInfoCircle style={{ marginRight: 8 }} />
                    Waitlist
                  </Button>
                  
                  <Button
                    onClick={() => handleOpenResponseModal(application, 'reject')}
                    style={{ borderColor: '#e74c3c', color: '#e74c3c' }}
                  >
                    <FaTimesCircle style={{ marginRight: 8 }} />
                    Reject
                  </Button>
                </ApplicationActions>
              )}
              
              {application.status !== 'pending' && (
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    onClick={() => handleOpenResponseModal(application, 'pending' as any)}
                  >
                    Change Status
                  </Button>
                </div>
              )}
            </ApplicationCard>
          ))}
        </ApplicationsList>
      ) : (
        <NoApplications>
          <p>No applications found for this event{statusFilter !== 'all' ? ` with status "${statusFilter}"` : ''}.</p>
        </NoApplications>
      )}
      
      {/* Response Modal */}
      {isResponseModalOpen && currentApplication && (
        <ModalOverlay>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>
                {actionType === 'accept' ? 'Accept Application' : 
                 actionType === 'reject' ? 'Reject Application' : 'Waitlist Application'}
              </ModalTitle>
              <CloseButton onClick={() => setIsResponseModalOpen(false)}>×</CloseButton>
            </ModalHeader>
            
            <p style={{ marginBottom: 16 }}>
              You are about to {actionType === 'accept' ? 'accept' : 
                               actionType === 'reject' ? 'reject' : 'waitlist'} 
              the application from <strong>{currentApplication.volunteer.display_name}</strong>.
            </p>
            
            {error && <div style={{ color: '#e74c3c', marginBottom: 16 }}>{error}</div>}
            
            <div>
              <label htmlFor="response-message">Message to Applicant (Optional)</label>
              <TextArea
                id="response-message"
                value={responseMessage}
                onChange={(e) => setResponseMessage(e.target.value)}
                placeholder={
                  actionType === 'accept' ? "Thank you for your application! We're excited to have you join us." :
                  actionType === 'reject' ? "Thank you for your application. Unfortunately, we won't be able to accommodate you for this event." :
                  "Thank you for your application. We've added you to our waitlist and will notify you if a spot becomes available."
                }
                rows={5}
              />
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 16, marginTop: 24 }}>
              <Button onClick={() => setIsResponseModalOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleUpdateStatus} 
                disabled={isSubmitting}
                style={{
                  backgroundColor: actionType === 'reject' ? '#e74c3c' :
                                   actionType === 'waitlist' ? '#f1c40f' :
                                   '#2ecc71'
                }}
              >
                {isSubmitting ? 'Saving...' : 
                 actionType === 'accept' ? 'Accept Application' :
                 actionType === 'reject' ? 'Reject Application' :
                 'Waitlist Application'}
              </Button>
            </div>
          </ModalContent>
        </ModalOverlay>
      )}
      
      {/* Confirm Complete Event Modal */}
      {isConfirmCompleteModalOpen && (
        <ModalOverlay>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>Mark Event as Complete</ModalTitle>
              <CloseButton onClick={() => setIsConfirmCompleteModalOpen(false)}>×</CloseButton>
            </ModalHeader>
            
            <p style={{ marginBottom: 16 }}>
              Are you sure you want to mark this event as complete? This will:
            </p>
            
            <ul style={{ marginBottom: 16 }}>
              <li>Update the event status to 'completed'</li>
              <li>Notify all accepted volunteers</li>
              <li>Add this event to volunteers' history</li>
            </ul>
            
            <p style={{ marginBottom: 16 }}>
              This action cannot be undone.
            </p>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 16, marginTop: 24 }}>
              <Button onClick={() => setIsConfirmCompleteModalOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCompleteEvent}
                style={{ backgroundColor: '#28a745', color: 'white' }}
              >
                Confirm Completion
              </Button>
            </div>
          </ModalContent>
        </ModalOverlay>
      )}
    </ApplicationsContainer>
  );
}
