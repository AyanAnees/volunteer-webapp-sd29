import React, { useState } from 'react';
import styled from 'styled-components';
import NotificationItem, { NotificationType } from './NotificationItem';
import { FaFilter, FaCheck } from 'react-icons/fa';
import { theme } from '../../styles/theme';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  created_at: string;
  is_read: boolean;
  link?: string;
  related_entity_id?: string;
  related_entity_type?: 'application' | 'event' | 'message' | 'system';
}

interface NotificationListProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
}

const ListContainer = styled.div`
  margin-bottom: ${theme.spacing.xl};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing.md};
`;

const Title = styled.h2`
  font-size: ${theme.fontSizes.xl};
  margin: 0;
`;

const FilterContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
`;

const FilterButton = styled.button`
  background: none;
  border: 1px solid ${theme.colors.gray[200]};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  font-size: ${theme.fontSizes.sm};
  cursor: pointer;
  color: ${theme.colors.gray[700]};
  
  &:hover {
    background-color: ${theme.colors.gray[50]};
  }
`;

const ReadAllButton = styled.button`
  background: none;
  border: none;
  color: ${theme.colors.primary};
  font-size: ${theme.fontSizes.sm};
  cursor: pointer;
  
  &:hover {
    text-decoration: underline;
  }
`;

const FilterDropdown = styled.div<{ visible: boolean }>`
  position: absolute;
  top: 100%;
  right: 0;
  background-color: white;
  border: 1px solid ${theme.colors.gray[200]};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.md};
  width: 200px;
  box-shadow: ${theme.shadows.md};
  z-index: 10;
  display: ${props => props.visible ? 'block' : 'none'};
  margin-top: ${theme.spacing.xs};
`;

const FilterOption = styled.div<{ selected: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${theme.spacing.xs} 0;
  cursor: pointer;
  
  &:hover {
    color: ${theme.colors.primary};
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${theme.spacing.xl};
  background-color: ${theme.colors.gray[50]};
  border-radius: ${theme.borderRadius.md};
  color: ${theme.colors.gray[600]};
`;

const FilterTypes = [
  { value: 'all', label: 'All Notifications' },
  { value: 'unread', label: 'Unread Only' },
  { value: 'event', label: 'Event Updates' },
  { value: 'application', label: 'Application Status' },
  { value: 'message', label: 'Messages' }
];

const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
}) => {
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  const toggleFilterDropdown = () => {
    setFilterDropdownOpen(!filterDropdownOpen);
  };

  const handleFilterSelect = (filter: string) => {
    setActiveFilter(filter);
    setFilterDropdownOpen(false);
  };

  const getFilteredNotifications = () => {
    if (activeFilter === 'all') {
      return notifications;
    } else if (activeFilter === 'unread') {
      return notifications.filter(notification => !notification.is_read);
    } else if (activeFilter === 'event') {
      return notifications.filter(notification => 
        notification.type === 'event' || 
        notification.type === 'event_completed' || 
        notification.related_entity_type === 'event'
      );
    } else if (activeFilter === 'application') {
      return notifications.filter(notification => 
        notification.related_entity_type === 'application'
      );
    } else if (activeFilter === 'message') {
      return notifications.filter(notification => 
        notification.type === 'message' || notification.related_entity_type === 'message'
      );
    }
    return notifications;
  };

  const filteredNotifications = getFilteredNotifications();
  const hasUnread = notifications.some(notification => !notification.is_read);

  return (
    <ListContainer>
      <Header>
        <Title>Notifications</Title>
        <FilterContainer>
          {hasUnread && (
            <ReadAllButton onClick={onMarkAllAsRead}>
              Mark all as read
            </ReadAllButton>
          )}
          <FilterButton onClick={toggleFilterDropdown}>
            <FaFilter size={12} />
            {FilterTypes.find(f => f.value === activeFilter)?.label || 'Filter'}
          </FilterButton>
          <FilterDropdown visible={filterDropdownOpen}>
            {FilterTypes.map(filter => (
              <FilterOption 
                key={filter.value}
                selected={activeFilter === filter.value}
                onClick={() => handleFilterSelect(filter.value)}
              >
                {filter.label}
                {activeFilter === filter.value && <FaCheck size={12} color={theme.colors.primary} />}
              </FilterOption>
            ))}
          </FilterDropdown>
        </FilterContainer>
      </Header>

      {filteredNotifications.length > 0 ? (
        filteredNotifications.map(notification => (
          <NotificationItem
            key={notification.id}
            id={notification.id}
            type={notification.type}
            title={notification.title}
            message={notification.message}
            createdAt={notification.created_at}
            isRead={notification.is_read}
            link={notification.link}
            onMarkAsRead={onMarkAsRead}
          />
        ))
      ) : (
        <EmptyState>
          {activeFilter === 'all' 
            ? "You don't have any notifications yet." 
            : "No notifications match the selected filter."}
        </EmptyState>
      )}
    </ListContainer>
  );
};

export default NotificationList;
