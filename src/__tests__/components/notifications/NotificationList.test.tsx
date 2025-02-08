import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import NotificationList, { Notification } from '../../../components/notifications/NotificationList';

// Helper to create sample notifications
const createSampleNotifications = (): Notification[] => {
  const now = new Date();
  
  return [
    {
      id: '1',
      type: 'info',
      title: 'Information Update',
      message: 'This is an information notification',
      created_at: now.toISOString(),
      is_read: false,
      related_entity_type: 'system'
    },
    {
      id: '2',
      type: 'event',
      title: 'New Event Available',
      message: 'A new volunteer event has been added',
      created_at: new Date(now.getTime() - 60 * 60 * 1000).toISOString(), // 1 hour ago
      is_read: true,
      link: '/events/123',
      related_entity_type: 'event',
      related_entity_id: '123'
    },
    {
      id: '3',
      type: 'success',
      title: 'Application Approved',
      message: 'Your application has been approved',
      created_at: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      is_read: false,
      link: '/applications/456',
      related_entity_type: 'application',
      related_entity_id: '456'
    },
    {
      id: '4',
      type: 'message',
      title: 'New Message',
      message: 'You have received a new message',
      created_at: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
      is_read: false,
      related_entity_type: 'message',
      related_entity_id: '789'
    }
  ];
};

describe('NotificationList Component', () => {
  it('renders notification list with correct title', () => {
    const notifications = createSampleNotifications();
    const onMarkAsRead = vi.fn();
    const onMarkAllAsRead = vi.fn();
    
    render(
      <BrowserRouter>
        <NotificationList 
          notifications={notifications} 
          onMarkAsRead={onMarkAsRead} 
          onMarkAllAsRead={onMarkAllAsRead} 
        />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Notifications')).toBeInTheDocument();
  });

  it('renders all notifications by default', () => {
    const notifications = createSampleNotifications();
    const onMarkAsRead = vi.fn();
    const onMarkAllAsRead = vi.fn();
    
    render(
      <BrowserRouter>
        <NotificationList 
          notifications={notifications} 
          onMarkAsRead={onMarkAsRead} 
          onMarkAllAsRead={onMarkAllAsRead} 
        />
      </BrowserRouter>
    );
    
    // Check if all notification titles are rendered
    expect(screen.getByText('Information Update')).toBeInTheDocument();
    expect(screen.getByText('New Event Available')).toBeInTheDocument();
    expect(screen.getByText('Application Approved')).toBeInTheDocument();
    expect(screen.getByText('New Message')).toBeInTheDocument();
  });

  it('shows mark all as read button when there are unread notifications', () => {
    const notifications = createSampleNotifications();
    const onMarkAsRead = vi.fn();
    const onMarkAllAsRead = vi.fn();
    
    render(
      <BrowserRouter>
        <NotificationList 
          notifications={notifications} 
          onMarkAsRead={onMarkAsRead} 
          onMarkAllAsRead={onMarkAllAsRead} 
        />
      </BrowserRouter>
    );
    
    const markAllAsReadButton = screen.getByText('Mark all as read');
    expect(markAllAsReadButton).toBeInTheDocument();
  });

  it('does not show mark all as read button when all notifications are read', () => {
    const readNotifications = createSampleNotifications().map(n => ({ ...n, is_read: true }));
    const onMarkAsRead = vi.fn();
    const onMarkAllAsRead = vi.fn();
    
    render(
      <BrowserRouter>
        <NotificationList 
          notifications={readNotifications} 
          onMarkAsRead={onMarkAsRead} 
          onMarkAllAsRead={onMarkAllAsRead} 
        />
      </BrowserRouter>
    );
    
    expect(screen.queryByText('Mark all as read')).not.toBeInTheDocument();
  });

  it('calls onMarkAllAsRead when mark all as read button is clicked', () => {
    const notifications = createSampleNotifications();
    const onMarkAsRead = vi.fn();
    const onMarkAllAsRead = vi.fn();
    
    render(
      <BrowserRouter>
        <NotificationList 
          notifications={notifications} 
          onMarkAsRead={onMarkAsRead} 
          onMarkAllAsRead={onMarkAllAsRead} 
        />
      </BrowserRouter>
    );
    
    const markAllAsReadButton = screen.getByText('Mark all as read');
    fireEvent.click(markAllAsReadButton);
    
    expect(onMarkAllAsRead).toHaveBeenCalledTimes(1);
  });

  it('displays empty state when there are no notifications', () => {
    const onMarkAsRead = vi.fn();
    const onMarkAllAsRead = vi.fn();
    
    render(
      <BrowserRouter>
        <NotificationList 
          notifications={[]} 
          onMarkAsRead={onMarkAsRead} 
          onMarkAllAsRead={onMarkAllAsRead} 
        />
      </BrowserRouter>
    );
    
    expect(screen.getByText("You don't have any notifications yet.")).toBeInTheDocument();
  });

  it('filters notifications correctly when filter is changed', () => {
    const notifications = createSampleNotifications();
    const onMarkAsRead = vi.fn();
    const onMarkAllAsRead = vi.fn();
    
    render(
      <BrowserRouter>
        <NotificationList 
          notifications={notifications} 
          onMarkAsRead={onMarkAsRead} 
          onMarkAllAsRead={onMarkAllAsRead} 
        />
      </BrowserRouter>
    );
    
    // Open filter dropdown
    const filterButton = screen.getAllByText('All Notifications')[0]; // Get the button, not the dropdown option
    fireEvent.click(filterButton);
    
    // Select 'Unread Only' filter (should be visible now that dropdown is open)
    const unreadFilter = screen.getByText('Unread Only');
    fireEvent.click(unreadFilter);
    
    // After filtering, the read notification should not be visible
    expect(screen.queryByText('New Event Available')).not.toBeInTheDocument();
    
    // But unread notifications should still be visible
    expect(screen.getByText('Information Update')).toBeInTheDocument();
    expect(screen.getByText('Application Approved')).toBeInTheDocument();
    expect(screen.getByText('New Message')).toBeInTheDocument();
  });

  it('filters by event type correctly', () => {
    const notifications = createSampleNotifications();
    const onMarkAsRead = vi.fn();
    const onMarkAllAsRead = vi.fn();
    
    render(
      <BrowserRouter>
        <NotificationList 
          notifications={notifications} 
          onMarkAsRead={onMarkAsRead} 
          onMarkAllAsRead={onMarkAllAsRead} 
        />
      </BrowserRouter>
    );
    
    // Open filter dropdown
    const filterButton = screen.getAllByText('All Notifications')[0];
    fireEvent.click(filterButton);
    
    // Select 'Event Updates' filter
    const eventFilter = screen.getByText('Event Updates');
    fireEvent.click(eventFilter);
    
    // Only event-related notification should be displayed
    expect(screen.queryByText('Information Update')).not.toBeInTheDocument();
    expect(screen.getByText('New Event Available')).toBeInTheDocument();
    expect(screen.queryByText('Application Approved')).not.toBeInTheDocument();
    expect(screen.queryByText('New Message')).not.toBeInTheDocument();
  });

  it('filters by application type correctly', () => {
    const notifications = createSampleNotifications();
    const onMarkAsRead = vi.fn();
    const onMarkAllAsRead = vi.fn();
    
    render(
      <BrowserRouter>
        <NotificationList 
          notifications={notifications} 
          onMarkAsRead={onMarkAsRead} 
          onMarkAllAsRead={onMarkAllAsRead} 
        />
      </BrowserRouter>
    );
    
    // Open filter dropdown
    const filterButton = screen.getAllByText('All Notifications')[0];
    fireEvent.click(filterButton);
    
    // Select 'Application Status' filter
    const applicationFilter = screen.getByText('Application Status');
    fireEvent.click(applicationFilter);
    
    // Only application-related notification should be displayed
    expect(screen.queryByText('Information Update')).not.toBeInTheDocument();
    expect(screen.queryByText('New Event Available')).not.toBeInTheDocument();
    expect(screen.getByText('Application Approved')).toBeInTheDocument();
    expect(screen.queryByText('New Message')).not.toBeInTheDocument();
  });

  it('displays correct message when filtered results are empty', () => {
    // Create notifications without any message types
    const notifications = createSampleNotifications().filter(
      n => n.related_entity_type !== 'message' && n.type !== 'message'
    );
    
    const onMarkAsRead = vi.fn();
    const onMarkAllAsRead = vi.fn();
    
    render(
      <BrowserRouter>
        <NotificationList 
          notifications={notifications} 
          onMarkAsRead={onMarkAsRead} 
          onMarkAllAsRead={onMarkAllAsRead} 
        />
      </BrowserRouter>
    );
    
    // Open filter dropdown
    const filterButton = screen.getAllByText('All Notifications')[0];
    fireEvent.click(filterButton);
    
    // Select 'Messages' filter
    const messageFilter = screen.getByText('Messages');
    fireEvent.click(messageFilter);
    
    // Should show no results message
    expect(screen.getByText('No notifications match the selected filter.')).toBeInTheDocument();
  });

  it('properly passes onMarkAsRead to notification items', () => {
    const notifications = createSampleNotifications();
    const onMarkAsRead = vi.fn();
    const onMarkAllAsRead = vi.fn();
    
    render(
      <BrowserRouter>
        <NotificationList 
          notifications={notifications} 
          onMarkAsRead={onMarkAsRead} 
          onMarkAllAsRead={onMarkAllAsRead} 
        />
      </BrowserRouter>
    );
    
    // Click on mark as read for first notification (which is unread)
    const markAsReadButtons = screen.getAllByText('Mark as read');
    fireEvent.click(markAsReadButtons[0]);
    
    // Should call onMarkAsRead with the id of first notification
    expect(onMarkAsRead).toHaveBeenCalledWith('1');
  });
});
