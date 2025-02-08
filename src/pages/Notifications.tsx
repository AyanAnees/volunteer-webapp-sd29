import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaBell } from 'react-icons/fa';
import { theme } from '../styles/theme';
import { supabase, getCurrentProfile } from '../lib/supabase';
import { handleAuthRedirect } from '../lib/authRedirect';
import NotificationList from '../components/notifications/NotificationList';
import { 
  fetchNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead
} from '../services/notificationService';
import {
  Container,
  Title,
  Card,
  PrimaryButton,
  Text
} from '../components/ui/StyledComponents';

const NotificationsContainer = styled(Container)`
  padding-top: ${theme.spacing.xl};
  padding-bottom: ${theme.spacing.xl};
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.xl};
`;

const IconContainer = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: ${theme.colors.primary}20;
  color: ${theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
`;

const NoNotifications = styled.div`
  text-align: center;
  padding: ${theme.spacing.xl} 0;
  color: ${theme.colors.gray[600]};
`;

const LoadMoreButton = styled(PrimaryButton)`
  margin: ${theme.spacing.md} auto;
  display: block;
`;

export default function Notifications() {
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 10;
  const navigate = useNavigate();

  useEffect(() => {
    const initializePage = async () => {
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
          console.error('No user profile found for notifications page');
          setIsLoading(false);
          return;
        }
        
        setUserProfile(profile);
        
        // Get notifications from the server
        let notificationData = await fetchNotifications(profile.id, pageSize);
        
        setNotifications(notificationData || []);
        setHasMore(notificationData && notificationData.length === pageSize);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error initializing notifications page:', error);
        setIsLoading(false);
      }
    };
    
    initializePage();
  }, [navigate]);

  const handleMarkAsRead = async (id: string) => {
    const success = await markNotificationAsRead(id);
    
    if (success) {
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id 
            ? { ...notification, is_read: true } 
            : notification
        )
      );
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!userProfile) return;
    
    const success = await markAllNotificationsAsRead(userProfile.id);
    
    if (success) {
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, is_read: true }))
      );
    }
  };

  const handleLoadMore = async () => {
    if (!userProfile) return;
    
    const nextPage = page + 1;
    setPage(nextPage);
    
    // In a real app, fetch the next page of notifications
    const moreNotifications = await fetchNotifications(userProfile.id, pageSize, nextPage);
    
    // Add the new notifications to the existing ones
    setNotifications(prev => [...prev, ...moreNotifications]);
    
    // Check if we have more to load
    setHasMore(moreNotifications.length === pageSize);
  };

  if (isLoading) {
    return (
      <NotificationsContainer>
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Text>Loading notifications...</Text>
        </div>
      </NotificationsContainer>
    );
  }

  return (
    <NotificationsContainer>
      <Header>
        <IconContainer>
          <FaBell />
        </IconContainer>
        <Title>Your Notifications</Title>
      </Header>
      
      {notifications.length > 0 ? (
        <>
          <NotificationList
            notifications={notifications}
            onMarkAsRead={handleMarkAsRead}
            onMarkAllAsRead={handleMarkAllAsRead}
          />
          
          {hasMore && (
            <LoadMoreButton onClick={handleLoadMore}>
              Load More
            </LoadMoreButton>
          )}
        </>
      ) : (
        <Card>
          <NoNotifications>
            <p>You don't have any notifications yet.</p>
          </NoNotifications>
        </Card>
      )}
    </NotificationsContainer>
  );
}
