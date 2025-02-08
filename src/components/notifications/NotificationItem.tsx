import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { 
  FaCheckCircle, 
  FaTimesCircle, 
  FaInfoCircle, 
  FaCalendarAlt, 
  FaBell,
  FaEnvelope
} from 'react-icons/fa';
import { theme } from '../../styles/theme';

// Define notification types
export type NotificationType = 'success' | 'error' | 'info' | 'event' | 'event_completed' | 'message' | 'generic';

export interface NotificationItemProps {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  link?: string;
  onMarkAsRead: (id: string) => void;
}

const NotificationContainer = styled.div<{ $isRead: boolean; $type: NotificationType }>`
  display: flex;
  padding: ${theme.spacing.md};
  border-left: 4px solid ${props => {
    switch (props.$type) {
      case 'success': return theme.colors.success;
      case 'error': return theme.colors.error;
      case 'info': return theme.colors.info;
      case 'event': return theme.colors.primary;
      case 'event_completed': return theme.colors.success;
      case 'message': return theme.colors.warning;
      default: return theme.colors.gray[400];
    }
  }};
  background-color: ${props => props.$isRead ? theme.colors.gray[50] : 'white'};
  margin-bottom: ${theme.spacing.md};
  border-radius: ${theme.borderRadius.md};
  box-shadow: ${props => props.$isRead ? 'none' : theme.shadows.sm};
  transition: all 0.2s ease;
  
  &:hover {
    box-shadow: ${theme.shadows.md};
  }
`;

const IconContainer = styled.div<{ $type: NotificationType }>`
  margin-right: ${theme.spacing.md};
  color: ${props => {
    switch (props.$type) {
      case 'success': return theme.colors.success;
      case 'error': return theme.colors.error;
      case 'info': return theme.colors.info;
      case 'event': return theme.colors.primary;
      case 'event_completed': return theme.colors.success;
      case 'message': return theme.colors.warning;
      default: return theme.colors.gray[400];
    }
  }};
  font-size: 1.5rem;
  display: flex;
  align-items: center;
`;

const ContentArea = styled.div`
  flex: 1;
`;

const NotificationTitle = styled.h3<{ $isRead: boolean }>`
  font-size: ${theme.fontSizes.md};
  margin-bottom: ${theme.spacing.xs};
  font-weight: ${props => props.$isRead ? 500 : 600};
`;

const NotificationMessage = styled.p`
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.gray[600]};
  margin-bottom: ${theme.spacing.xs};
`;

const NotificationMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: ${theme.fontSizes.xs};
  color: ${theme.colors.gray[500]};
`;

const NotificationDate = styled.span``;

const NotificationAction = styled.button`
  background: none;
  border: none;
  color: ${theme.colors.primary};
  font-size: ${theme.fontSizes.xs};
  cursor: pointer;
  font-weight: 500;
  padding: 0;
  
  &:hover {
    text-decoration: underline;
  }
`;

const StyledLink = styled(Link)`
  color: inherit;
  text-decoration: none;
  display: block;
  
  &:hover {
    text-decoration: none;
  }
`;

const NotificationItem: React.FC<NotificationItemProps> = ({
  id,
  type,
  title,
  message,
  createdAt,
  isRead,
  link,
  onMarkAsRead
}) => {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <FaCheckCircle />;
      case 'error':
        return <FaTimesCircle />;
      case 'info':
        return <FaInfoCircle />;
      case 'event':
        return <FaCalendarAlt />;
      case 'event_completed':
        return <FaCheckCircle />;
      case 'message':
        return <FaEnvelope />;
      default:
        return <FaBell />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return `${diffInMinutes} min ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    } else if (diffInHours < 48) {
      return 'yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onMarkAsRead(id);
  };

  const ContentComponent = (
    <NotificationContainer $isRead={isRead} $type={type}>
      <IconContainer $type={type} data-testid="notification-icon-container">
        {getIcon()}
      </IconContainer>
      <ContentArea>
        <NotificationTitle $isRead={isRead}>{title}</NotificationTitle>
        <NotificationMessage>{message}</NotificationMessage>
        <NotificationMeta>
          <NotificationDate>{formatDate(createdAt)}</NotificationDate>
          {!isRead && (
            <NotificationAction onClick={handleMarkAsRead}>
              Mark as read
            </NotificationAction>
          )}
        </NotificationMeta>
      </ContentArea>
    </NotificationContainer>
  );

  if (link) {
    return (
      <StyledLink to={link}>
        {ContentComponent}
      </StyledLink>
    );
  }

  return ContentComponent;
};

export default NotificationItem;
