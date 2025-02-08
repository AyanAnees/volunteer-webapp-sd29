import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { 
  FaPlus, 
  FaCalendarAlt, 
  FaMapMarkerAlt, 
  FaUserFriends, 
  FaEdit, 
  FaEye, 
  FaTrash,
  FaSearch,
  FaCheckCircle
} from 'react-icons/fa';
import { supabase, getCurrentProfile } from '../lib/supabase';
import { theme } from '../styles/theme';
import { 
  Container, 
  Title,
  Card,
  PrimaryButton,
  SecondaryButton,
  Badge,
  Flex,
  Input,
  Select
} from '../components/ui/StyledComponents';

// Styled Components
const ManageEventsContainer = styled(Container)`
  padding-top: ${theme.spacing.xl};
  padding-bottom: ${theme.spacing.xl};
`;

const EventsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${theme.spacing.md};
  margin-top: ${theme.spacing.xl};
`;

const EventCard = styled(Card)`
  display: flex;
  flex-direction: column;
  
  @media (min-width: ${theme.breakpoints.md}) {
    flex-direction: row;
  }
`;

const EventImageContainer = styled.div`
  width: 100%;
  height: 160px;
  
  @media (min-width: ${theme.breakpoints.md}) {
    width: 220px;
    height: auto;
    flex-shrink: 0;
  }
`;

const EventImage = styled.div<{ imageUrl?: string }>`
  width: 100%;
  height: 100%;
  background-image: ${props => props.imageUrl ? `url(${props.imageUrl})` : 'none'};
  background-color: ${theme.colors.gray[200]};
  background-size: cover;
  background-position: center;
  border-radius: ${theme.borderRadius.md};
`;

const EventContent = styled.div`
  flex: 1;
  padding: ${theme.spacing.md};
  display: flex;
  flex-direction: column;
`;

const EventTitle = styled.h3`
  font-size: ${theme.fontSizes.xl};
  margin-bottom: ${theme.spacing.sm};
`;

const EventMetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.gray[600]};
  margin-bottom: ${theme.spacing.xs};
`;

const EventActions = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
  margin-top: auto;
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  color: ${theme.colors.primary};
  font-size: ${theme.fontSizes.sm};
  cursor: pointer;
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.sm};
  
  &:hover {
    background-color: ${theme.colors.primary}10;
  }
`;

const DeleteButton = styled(ActionButton)`
  color: ${theme.colors.error};
  
  &:hover {
    background-color: ${theme.colors.error}10;
  }
`;

const StatusBadge = styled(Badge)<{ status: string }>`
  text-transform: capitalize;
  background-color: ${props => {
    switch (props.status) {
      case 'draft': return theme.colors.gray[500];
      case 'published': return theme.colors.success;
      case 'canceled': return theme.colors.error;
      case 'completed': return theme.colors.info;
      default: return theme.colors.gray[500];
    }
  }};
`;

const SearchBar = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.lg};
  
  @media (max-width: ${theme.breakpoints.md}) {
    flex-direction: column;
  }
`;

const SearchInput = styled.div`
  position: relative;
  flex: 1;
`;

const SearchIcon = styled.div`
  position: absolute;
  left: ${theme.spacing.md};
  top: 50%;
  transform: translateY(-50%);
  color: ${theme.colors.gray[400]};
`;

const StyledInput = styled(Input)`
  padding-left: 2.5rem;
`;

const FilterContainer = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  
  @media (max-width: ${theme.breakpoints.sm}) {
    flex-direction: column;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${theme.spacing['2xl']} 0;
`;

const EmptyStateTitle = styled.h3`
  font-size: ${theme.fontSizes.xl};
  margin-bottom: ${theme.spacing.md};
`;

const EmptyStateText = styled.p`
  color: ${theme.colors.gray[600]};
  margin-bottom: ${theme.spacing.lg};
`;

const ConfirmationModal = styled.div`
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
  text-align: center;
`;

const ModalTitle = styled.h3`
  font-size: ${theme.fontSizes.xl};
  margin-bottom: ${theme.spacing.md};
`;

const ModalText = styled.p`
  margin-bottom: ${theme.spacing.lg};
  color: ${theme.colors.gray[700]};
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: center;
  gap: ${theme.spacing.md};
`;

interface Event {
  id: string;
  title: string;
  start_datetime: string;
  end_datetime: string;
  location: string;
  status: string;
  image_url?: string;
  min_volunteers: number;
  max_volunteers?: number;
  applicants_count?: number;
}

export default function ManageEvents() {
  const [isLoading, setIsLoading] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);
  const [eventToComplete, setEventToComplete] = useState<Event | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Fetch events on component mount
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const profile = await getCurrentProfile();
        
        // Redirect if not an organization or admin
        if (!profile || (profile.type !== 'organization' && profile.type !== 'admin')) {
          alert('Only organizations can access this page.');
          navigate('/');
          return;
        }
        
        setUserProfile(profile);

        // Fetch events created by this organization
        let query = supabase
          .from('events')
          .select(`
            *,
            applications:applications(count)
          `)
          .eq('creator_id', profile.id);
          
        // Apply status filter
        if (statusFilter !== 'all') {
          query = query.eq('status', statusFilter);
        }
        
        // Apply search filter if any
        if (searchTerm) {
          query = query.ilike('title', `%${searchTerm}%`);
        }
        
        // Apply sorting
        if (sortBy === 'date') {
          query = query.order('start_datetime', { ascending: false });
        } else if (sortBy === 'title') {
          query = query.order('title');
        } else if (sortBy === 'status') {
          query = query.order('status');
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        // Format the data
        const formattedEvents = data?.map(event => ({
          ...event,
          applicants_count: event.applications?.length || 0
        })) || [];
        
        setEvents(formattedEvents);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEvents();
  }, [navigate, searchTerm, statusFilter, sortBy]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleDelete = (event: Event) => {
    setEventToDelete(event);
  };

  const confirmDelete = async () => {
    if (!eventToDelete) return;
    
    try {
      // First delete associated records (event_skills, applications)
      await supabase.from('event_skills').delete().eq('event_id', eventToDelete.id);
      await supabase.from('applications').delete().eq('event_id', eventToDelete.id);
      
      // Then delete the event
      const { error } = await supabase.from('events').delete().eq('id', eventToDelete.id);
      
      if (error) throw error;
      
      // Update the UI
      setEvents(events.filter(event => event.id !== eventToDelete.id));
      setEventToDelete(null);
      
      alert('Event deleted successfully.');
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Failed to delete event. Please try again.');
    }
  };

  const cancelDelete = () => {
    setEventToDelete(null);
  };

  const handleCompleteEvent = (event: Event) => {
    setEventToComplete(event);
  };

  const confirmCompleteEvent = async () => {
    if (!eventToComplete) return;
    setIsSubmitting(true);
    
    try {
      const id = eventToComplete.id;
      const currentTimestamp = new Date().toISOString();
      
      console.log('Starting event completion process for event:', id);
      
      // 1. Update event status
      const { error: eventError } = await supabase
        .from('events')
        .update({ 
          status: 'completed',
          updated_at: currentTimestamp
        })
        .eq('id', id);
      
      if (eventError) {
        console.error('Error updating event status:', eventError);
        throw eventError;
      } else {
        console.log('✅ Event status updated successfully');
      }
      
      // 2. Get all accepted applications for this event
      console.log('Fetching accepted applications');
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
      
      if (applicationsError) {
        console.error('Error fetching applications:', applicationsError);
        throw applicationsError;
      }
      
      console.log('Found accepted applications:', acceptedApplications);
      
      if (acceptedApplications && acceptedApplications.length > 0) {
        // 4. Update application status to "completed" for all accepted applications FIRST
        // (Do this before creating history entries to avoid foreign key constraints)
        console.log('Updating application statuses to completed');
        const applicationIds = acceptedApplications.map(app => app.id);
        
        // Handle one by one to ensure each update completes
        for (const appId of applicationIds) {
          const { error: updateError } = await supabase
            .from('applications')
            .update({ 
              status: 'completed',
              updated_at: currentTimestamp
            })
            .eq('id', appId);
            
          if (updateError) {
            console.error(`Error updating application ${appId}:`, updateError);
          } else {
            console.log(`✅ Application ${appId} updated successfully`);
          }
        }
        
        // 3. Create volunteer history entries
        console.log('Creating volunteer history entries');
        
        // Create entries one by one to catch individual errors
        for (const app of acceptedApplications) {
          const historyEntry = {
            volunteer_id: app.volunteer_id,
            event_id: id,
            hours_logged: 2, // Default hours, could be calculated based on event duration
            feedback: null,
            rating: null,
            created_at: currentTimestamp,
            updated_at: currentTimestamp
          };
          
          console.log('Creating history entry:', historyEntry);
          
          const { error: historyError } = await supabase
            .from('history')
            .insert(historyEntry);
          
          if (historyError) {
            console.error(`Error creating volunteer history for ${app.volunteer_id}:`, historyError);
          } else {
            console.log(`✅ Volunteer history entry created for ${app.volunteer_id}`);
          }
        }
        
        // 5. Send notifications to all accepted volunteers
        console.log('Getting current user profile for notifications');
        const profile = await getCurrentProfile();
        console.log('Current profile:', profile);
        
        if (profile) {
          console.log('Creating notifications for volunteers');
          
          // Create notifications one by one to catch individual errors
          for (const app of acceptedApplications) {
            const notification = {
              recipient_id: app.volunteer_id,
              sender_id: profile.id,
              type: 'success',
              title: 'Event Completed',
              message: `The event "${eventToComplete.title}" has been marked as complete. Thank you for your participation!`,
              link: `/opportunities/${eventToComplete.id}`,
              is_read: false
            };
            
            console.log('Sending notification:', notification);
            
            try {
              const { error: notificationError } = await supabase
                .from('notifications')
                .insert(notification);
              
              if (notificationError) {
                console.error(`Error sending notification to ${app.volunteer_id}:`, notificationError);
                console.error('Full error details:', JSON.stringify(notificationError));
              } else {
                console.log(`✅ Notification sent to ${app.volunteer_id}`);
              }
            } catch (err) {
              console.error('Unexpected error sending notification:', err);
              console.error('Notification object was:', notification);
            }
          }
        } else {
          console.error('Failed to get current profile for sending notifications');
        }
      } else {
        console.log('No accepted applications found for this event');
      }
      
      // Update the UI
      setEvents(events.map(event => 
        event.id === eventToComplete.id 
          ? { ...event, status: 'completed' } 
          : event
      ));
      
      setEventToComplete(null);
      alert('Event has been successfully marked as complete!');
      
    } catch (error) {
      console.error('Error completing event:', error);
      alert('Failed to mark event as complete. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const cancelCompleteEvent = () => {
    setEventToComplete(null);
  };

  if (isLoading) {
    return (
      <Container>
        <div style={{ padding: '40px 0', textAlign: 'center' }}>
          <p>Loading...</p>
        </div>
      </Container>
    );
  }

  return (
    <ManageEventsContainer>
      <Flex justify="space-between" align="center" style={{ marginBottom: theme.spacing.lg }}>
        <Title>Manage Your Events</Title>
        <PrimaryButton as={Link} to="/events/create">
          <FaPlus style={{ marginRight: theme.spacing.xs }} />
          Create New Event
        </PrimaryButton>
      </Flex>

      <SearchBar>
        <SearchInput>
          <SearchIcon>
            <FaSearch />
          </SearchIcon>
          <StyledInput
            placeholder="Search events by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchInput>
        
        <FilterContainer>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ minWidth: '150px' }}
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="completed">Completed</option>
            <option value="canceled">Canceled</option>
          </Select>
          
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ minWidth: '150px' }}
          >
            <option value="date">Sort by Date</option>
            <option value="title">Sort by Title</option>
            <option value="status">Sort by Status</option>
          </Select>
        </FilterContainer>
      </SearchBar>

      {events.length > 0 ? (
        <EventsGrid>
          {events.map(event => (
            <EventCard key={event.id}>
              <EventImageContainer>
                <EventImage imageUrl={event.image_url} />
              </EventImageContainer>
              
              <EventContent>
                <Flex justify="space-between" align="flex-start" style={{ flexWrap: 'wrap' }}>
                  <EventTitle>{event.title}</EventTitle>
                  <StatusBadge status={event.status}>{event.status}</StatusBadge>
                </Flex>
                
                <EventMetaItem>
                  <FaCalendarAlt />
                  {formatDate(event.start_datetime)}
                </EventMetaItem>
                
                <EventMetaItem>
                  <FaMapMarkerAlt />
                  {event.location || 'No location specified'}
                </EventMetaItem>
                
                <EventMetaItem>
                  <FaUserFriends />
                  {event.applicants_count} applicant{event.applicants_count !== 1 ? 's' : ''} / {event.max_volunteers || '∞'} spots
                </EventMetaItem>
                
                <EventActions>
                  <ActionButton as={Link} to={`/opportunities/${event.id}`}>
                    <FaEye />
                    View Event
                  </ActionButton>
                  
                  <ActionButton as={Link} to={`/events/edit/${event.id}`}>
                    <FaEdit />
                    Edit
                  </ActionButton>
                  
                  <ActionButton as={Link} to={`/events/${event.id}/applications`}>
                    <FaUserFriends />
                    Manage Applications ({event.applicants_count})
                  </ActionButton>
                  
                  {event.status !== 'completed' && (
                    <ActionButton 
                      onClick={() => handleCompleteEvent(event)}
                      style={{ backgroundColor: '#28a745', color: 'white' }}
                    >
                      <FaCheckCircle />
                      Mark Complete
                    </ActionButton>
                  )}
                  
                  <DeleteButton onClick={() => handleDelete(event)}>
                    <FaTrash />
                    Delete
                  </DeleteButton>
                </EventActions>
              </EventContent>
            </EventCard>
          ))}
        </EventsGrid>
      ) : (
        <EmptyState>
          <EmptyStateTitle>No events found</EmptyStateTitle>
          <EmptyStateText>
            {searchTerm || statusFilter !== 'all' 
              ? "No events match your search criteria. Try adjusting your filters." 
              : "You haven't created any events yet. Create your first volunteer opportunity to get started!"}
          </EmptyStateText>
          <PrimaryButton as={Link} to="/events/create">
            <FaPlus style={{ marginRight: theme.spacing.xs }} />
            Create Your First Event
          </PrimaryButton>
        </EmptyState>
      )}
      
      {/* Confirmation Modal */}
      {eventToDelete && (
        <ConfirmationModal>
          <ModalContent>
            <ModalTitle>Delete Event</ModalTitle>
            <ModalText>
              Are you sure you want to delete "{eventToDelete.title}"? This action cannot be undone.
              All applications for this event will also be deleted.
            </ModalText>
            <ModalActions>
              <SecondaryButton onClick={cancelDelete}>
                Cancel
              </SecondaryButton>
              <PrimaryButton 
                onClick={confirmDelete}
                style={{ backgroundColor: theme.colors.error }}
              >
                Delete Event
              </PrimaryButton>
            </ModalActions>
          </ModalContent>
        </ConfirmationModal>
      )}
      
      {/* Complete Event Modal */}
      {eventToComplete && (
        <ConfirmationModal>
          <ModalContent>
            <ModalTitle>Mark Event as Complete</ModalTitle>
            <ModalText>
              Are you sure you want to mark "{eventToComplete.title}" as complete? This will:
            </ModalText>
            <ul style={{ marginBottom: '16px' }}>
              <li>Update the event status to 'completed'</li>
              <li>Notify all accepted volunteers</li>
              <li>Add this event to volunteers' history</li>
            </ul>
            <ModalText>
              This action cannot be undone.
            </ModalText>
            <ModalActions>
              <SecondaryButton onClick={cancelCompleteEvent}>
                Cancel
              </SecondaryButton>
              <PrimaryButton 
                onClick={confirmCompleteEvent}
                style={{ backgroundColor: '#28a745' }}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Processing...' : 'Confirm Completion'}
              </PrimaryButton>
            </ModalActions>
          </ModalContent>
        </ConfirmationModal>
      )}
    </ManageEventsContainer>
  );
}
