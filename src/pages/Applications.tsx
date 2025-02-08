import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { supabase, getCurrentProfile } from '../lib/supabase';
import { theme } from '../styles/theme';
import {
  Container,
  Title,
  Table,
  Th,
  Td,
  Tr,
  Text,
  TextArea,
  PrimaryButton,
  SecondaryButton,
  Badge
} from '../components/ui/StyledComponents';

const ApplicationsContainer = styled(Container)`
  padding-top: ${theme.spacing.xl};
  padding-bottom: ${theme.spacing.xl};
`;

const TabsContainer = styled.div`
  display: flex;
  border-bottom: 1px solid ${theme.colors.gray[200]};
  margin-bottom: ${theme.spacing.lg};
`;

const Tab = styled.button<{ active: boolean }>`
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  background: none;
  border: none;
  border-bottom: 2px solid ${props => props.active ? theme.colors.primary : 'transparent'};
  color: ${props => props.active ? theme.colors.primary : theme.colors.gray[700]};
  font-weight: ${props => props.active ? 600 : 400};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    color: ${theme.colors.primary};
  }
`;

const TabContent = styled.div`
  margin-top: ${theme.spacing.lg};
`;

const ApplicationBadge = styled(Badge)<{ status: string }>`
  background-color: ${props => {
    switch (props.status) {
      case 'accepted': return theme.colors.success;
      case 'completed': return theme.colors.success + '90'; // Slightly transparent green
      case 'rejected': return theme.colors.error;
      case 'pending': return theme.colors.info;
      case 'waitlisted': return theme.colors.warning;
      case 'canceled': return theme.colors.gray[500];
      default: return theme.colors.gray[400];
    }
  }};
`;

const ModalHeader = styled.div`
  padding-bottom: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.md};
  border-bottom: 1px solid ${theme.colors.gray[200]};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ModalFooter = styled.div`
  padding-top: ${theme.spacing.md};
  margin-top: ${theme.spacing.md};
  border-top: 1px solid ${theme.colors.gray[200]};
  display: flex;
  justify-content: flex-end;
  gap: ${theme.spacing.md};
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: ${theme.fontSizes.xl};
  cursor: pointer;
  color: ${theme.colors.gray[600]};
  position: absolute;
  top: ${theme.spacing.md};
  right: ${theme.spacing.md};
  
  &:hover {
    color: ${theme.colors.gray[800]};
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ModalContent = styled.div`
  background-color: ${theme.colors.white};
  padding: ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.md};
  box-shadow: ${theme.shadows.md};
  width: 500px;
`;

export default function Applications() {
  const [applications, setApplications] = useState<any[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [feedback, setFeedback] = useState('');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setIsLoading(true);
        
        // Check if user is authenticated
        const { data: session } = await supabase.auth.getSession();
        if (!session?.session) {
          navigate('/login');
          return;
        }
        
        const profile = await getCurrentProfile();
        if (!profile) {
          console.error('No user profile found');
          navigate('/login');
          return;
        }
        
        setUserProfile(profile);
        
        // Determine if the user is a volunteer or organization
        const isUserVolunteer = profile.type === 'volunteer';
        
        // Fetch applications based on user type
        let applicationsData;
        
        if (isUserVolunteer) {
          // For volunteers, show their own applications
          const { data, error } = await supabase
            .from('applications')
            .select(`
              id,
              event_id,
              status,
              message,
              admin_message,
              created_at,
              updated_at,
              event:events(
                id,
                title,
                description,
                location,
                start_datetime,
                end_datetime,
                status
              )
            `)
            .eq('volunteer_id', profile.id)
            .order('created_at', { ascending: false });
          
          if (error) throw error;
          applicationsData = data;
          
          // Additional check: mark applications as completed if their event is completed
          if (applicationsData) {
            for (const app of applicationsData) {
              // Ensure event is properly typed and access its status safely
              if (app.event && typeof app.event === 'object' && 'status' in app.event) {
                const eventStatus = app.event.status;
                
                if (eventStatus === 'completed' && app.status === 'accepted') {
                  // Update the application status to match the event status
                  const { error: updateError } = await supabase
                    .from('applications')
                    .update({ status: 'completed' })
                    .eq('id', app.id);
                  
                  if (updateError) {
                    console.error('Error updating application status:', updateError);
                  } else {
                    app.status = 'completed'; // Update in local state too
                    console.log(`✅ Application ${app.id} updated to completed status`);
                  }
                }
              }
            }
          }
        } else {
          // Fetch applications for organization's events
          const { data, error } = await supabase
            .from('applications')
            .select(`
              id,
              event_id,
              status,
              message,
              admin_message,
              created_at,
              updated_at,
              event:events!inner(
                id,
                title,
                description,
                location,
                start_datetime,
                end_datetime,
                status
              ),
              volunteer:profiles!volunteer_id(
                id,
                display_name,
                location,
                profile_image_url
              )
            `)
            .eq('events.creator_id', profile.id)
            .order('created_at', { ascending: false });
          
          if (error) throw error;
          applicationsData = data;
        }

        setApplications(applicationsData || []);
      } catch (error) {
        console.error('Error fetching applications:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusDisplay = (status: string, event_status?: string): string => {
    if (event_status === 'completed') return 'COMPLETED';
    
    switch (status) {
      case 'pending':
        return 'PENDING';
      case 'accepted':
        return 'ACCEPTED';
      case 'rejected':
        return 'REJECTED';
      default:
        return status.toUpperCase();
    }
  };

  const handleUpdateStatus = async (applicationId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('applications')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', applicationId);

      if (error) throw error;

      // Update state
      setApplications(applications.map(app => 
        app.id === applicationId ? { ...app, status: newStatus } : app
      ));

      alert(`Application ${newStatus} successfully`);
    } catch (error: any) {
      console.error('Error updating status:', error);
      alert(`Error updating status: ${error.message}`);
    }
  };

  const handleOpenFeedback = (application: any) => {
    setSelectedApplication(application);
    setFeedback('');
    setShowFeedbackModal(true);
  };

  const handleSubmitFeedback = async () => {
    try {
      if (!selectedApplication || !feedback.trim()) return;

      // Add record to history
      const { error } = await supabase
        .from('history')
        .insert({
          volunteer_id: selectedApplication.volunteer_id,
          event_id: selectedApplication.event_id,
          feedback: feedback,
          hours_logged: null, // You could add this as a form field
          rating: null, // You could add this as a form field
        });

      if (error) throw error;

      setShowFeedbackModal(false);
      alert('Feedback submitted successfully!');
    } catch (error: any) {
      console.error('Error submitting feedback:', error);
      alert(`Error submitting feedback: ${error.message}`);
    }
  };

  const filterApplications = (status: string) => {
    if (!applications) return [];

    // For "all" tab, show all applications
    if (status === 'all') {
      return applications;
    }

    // Special case for "completed": show applications with "accepted" status 
    // but only if their related event has "completed" status, or applications with "completed" status
    if (status === 'completed') {
      return applications.filter(app => {
        const eventStatus = app.event && typeof app.event === 'object' ? app.event.status : null;
        return app.status === 'completed' || (eventStatus === 'completed' && app.status === 'accepted');
      });
    } 
    
    // For other statuses, normal filtering
    return applications.filter(app => {
      const eventStatus = app.event && typeof app.event === 'object' ? app.event.status : null;
      
      // Don't show "accepted" applications if their event is completed
      if (status === 'accepted' && eventStatus === 'completed') {
        return false;
      }
      
      return app.status === status;
    });
  };

  const isVolunteer = userProfile?.type === 'volunteer';

  if (isLoading) {
    return (
      <ApplicationsContainer>
        <div style={{ textAlign: 'center', padding: '40px 0' }}>Loading applications...</div>
      </ApplicationsContainer>
    );
  }

  if (!userProfile) {
    return (
      <ApplicationsContainer style={{ textAlign: 'center', padding: '40px 0' }}>
        <Text>Please log in to view your applications</Text>
      </ApplicationsContainer>
    );
  }

  return (
    <ApplicationsContainer>
      <Title>{isVolunteer ? 'My Applications' : 'Applications for Your Events'}</Title>

      {applications.length > 0 ? (
        <>
          <TabsContainer>
            <Tab 
              active={activeTab === 'all'} 
              onClick={() => setActiveTab('all')}
            >
              All
            </Tab>
            <Tab 
              active={activeTab === 'pending'} 
              onClick={() => setActiveTab('pending')}
            >
              Pending
            </Tab>
            <Tab 
              active={activeTab === 'accepted'} 
              onClick={() => setActiveTab('accepted')}
            >
              Accepted
            </Tab>
            <Tab 
              active={activeTab === 'completed'} 
              onClick={() => setActiveTab('completed')}
            >
              Completed
            </Tab>
          </TabsContainer>

          <TabContent>
            {activeTab === 'all' && (
              <ApplicationsList
                applications={filterApplications('all')}
                formatDate={formatDate}
                getStatusDisplay={getStatusDisplay}
                isVolunteer={isVolunteer}
                handleUpdateStatus={handleUpdateStatus}
                handleOpenFeedback={handleOpenFeedback}
              />
            )}
            
            {activeTab === 'pending' && (
              <ApplicationsList
                applications={filterApplications('pending')}
                formatDate={formatDate}
                getStatusDisplay={getStatusDisplay}
                isVolunteer={isVolunteer}
                handleUpdateStatus={handleUpdateStatus}
                handleOpenFeedback={handleOpenFeedback}
              />
            )}
            
            {activeTab === 'accepted' && (
              <ApplicationsList
                applications={filterApplications('accepted')}
                formatDate={formatDate}
                getStatusDisplay={getStatusDisplay}
                isVolunteer={isVolunteer}
                handleUpdateStatus={handleUpdateStatus}
                handleOpenFeedback={handleOpenFeedback}
              />
            )}
            
            {activeTab === 'completed' && (
              <ApplicationsList
                applications={filterApplications('completed')}
                formatDate={formatDate}
                getStatusDisplay={getStatusDisplay}
                isVolunteer={isVolunteer}
                handleUpdateStatus={handleUpdateStatus}
                handleOpenFeedback={handleOpenFeedback}
              />
            )}
          </TabContent>
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Text style={{ marginBottom: theme.spacing.md }}>No applications found</Text>
          {isVolunteer && (
            <PrimaryButton as={Link} to="/opportunities">
              Browse Opportunities
            </PrimaryButton>
          )}
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && selectedApplication && (
        <Modal>
          <ModalContent>
            <ModalHeader>
              <Text>Submit Feedback</Text>
              <CloseButton onClick={() => setShowFeedbackModal(false)}>×</CloseButton>
            </ModalHeader>
            
            <div style={{ marginBottom: theme.spacing.lg }}>
              <Text style={{ marginBottom: theme.spacing.sm }}>
                <strong>Event:</strong> {selectedApplication?.event?.title}
              </Text>
              <Text style={{ marginBottom: theme.spacing.md }}>
                <strong>Volunteer:</strong> {selectedApplication?.volunteer?.display_name}
              </Text>
              <TextArea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Enter your feedback about this volunteer's participation"
                rows={5}
              />
            </div>
            
            <ModalFooter>
              <SecondaryButton onClick={() => setShowFeedbackModal(false)}>
                Cancel
              </SecondaryButton>
              <PrimaryButton onClick={handleSubmitFeedback}>
                Submit Feedback
              </PrimaryButton>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </ApplicationsContainer>
  );
}

function ApplicationsList({
  applications,
  formatDate,
  getStatusDisplay,
  isVolunteer,
  handleUpdateStatus,
  handleOpenFeedback,
}: {
  applications: any[];
  formatDate: (date: string) => string;
  getStatusDisplay: (status: string, event_status?: string) => string;
  isVolunteer: boolean;
  handleUpdateStatus: (id: string, status: string) => void;
  handleOpenFeedback: (application: any) => void;
}) {
  return (
    <Table>
      <thead>
        <Tr>
          <Th>Event</Th>
          {!isVolunteer && <Th>Volunteer</Th>}
          <Th>Date</Th>
          <Th>Status</Th>
          <Th>Actions</Th>
        </Tr>
      </thead>
      <tbody>
        {applications.map((app) => (
          <Tr key={app.id}>
            <Td>
              <div>
                <strong>{app.event?.title}</strong>
                <div style={{ fontSize: theme.fontSizes.sm, color: theme.colors.gray[600] }}>
                  {app.event?.location || 'No location'}
                </div>
              </div>
            </Td>
            {!isVolunteer && (
              <Td>
                {app.volunteer?.display_name || 'Unknown volunteer'}
              </Td>
            )}
            <Td>
              <div>
                <div>{formatDate(app.event?.start_datetime)}</div>
                <div style={{ fontSize: theme.fontSizes.sm, color: theme.colors.gray[600] }}>
                  to {formatDate(app.event?.end_datetime)}
                </div>
              </div>
            </Td>
            <Td>
              <ApplicationBadge status={app.status === 'accepted' && 
                app.event?.status === 'completed' ? 'completed' : app.status}>
                {getStatusDisplay(app.status, app.event?.status)}
              </ApplicationBadge>
            </Td>
            <Td>
              <ButtonGroup>
                <PrimaryButton
                  as={Link}
                  to={`/opportunities/${app.event_id}`}
                  style={{ padding: theme.spacing.xs + ' ' + theme.spacing.sm }}
                >
                  View
                </PrimaryButton>

                {isVolunteer && app.status === 'pending' && (
                  <SecondaryButton
                    style={{ padding: theme.spacing.xs + ' ' + theme.spacing.sm }}
                    onClick={() => handleUpdateStatus(app.id, 'canceled')}
                  >
                    Cancel
                  </SecondaryButton>
                )}

                {!isVolunteer && app.status === 'pending' && (
                  <>
                    <PrimaryButton
                      style={{ padding: theme.spacing.xs + ' ' + theme.spacing.sm }}
                      onClick={() => handleUpdateStatus(app.id, 'accepted')}
                    >
                      Accept
                    </PrimaryButton>
                    <SecondaryButton
                      style={{ padding: theme.spacing.xs + ' ' + theme.spacing.sm }}
                      onClick={() => handleUpdateStatus(app.id, 'rejected')}
                    >
                      Reject
                    </SecondaryButton>
                  </>
                )}

                {!isVolunteer && 
                  app.status === 'accepted' && 
                  new Date(app.event.end_datetime) < new Date() && (
                  <PrimaryButton
                    style={{ padding: theme.spacing.xs + ' ' + theme.spacing.sm }}
                    onClick={() => handleOpenFeedback(app)}
                  >
                    Feedback
                  </PrimaryButton>
                )}
              </ButtonGroup>
            </Td>
          </Tr>
        ))}
      </tbody>
    </Table>
  );
}
