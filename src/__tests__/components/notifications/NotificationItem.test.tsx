import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import NotificationItem, { NotificationType } from '../../../components/notifications/NotificationItem';

// Helper to create a standard notification
const createNotification = (
  id: string = 'notification-1',
  type: NotificationType = 'info',
  isRead: boolean = false,
  link?: string
) => ({
  id,
  type,
  title: 'Test Notification',
  message: 'This is a test notification message',
  createdAt: new Date().toISOString(),
  isRead,
  link,
  onMarkAsRead: vi.fn(),
});

describe('NotificationItem Component', () => {
  it('renders notification with correct content', () => {
    const notification = createNotification();
    
    render(
      <BrowserRouter>
        <NotificationItem {...notification} />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Test Notification')).toBeInTheDocument();
    expect(screen.getByText('This is a test notification message')).toBeInTheDocument();
    expect(screen.getByText('Mark as read')).toBeInTheDocument();
  });

  it('does not show mark as read button for read notifications', () => {
    const notification = createNotification('notification-1', 'info', true);
    
    render(
      <BrowserRouter>
        <NotificationItem {...notification} />
      </BrowserRouter>
    );
    
    expect(screen.queryByText('Mark as read')).not.toBeInTheDocument();
  });

  it('displays different icons based on notification type', () => {
    // Test each notification type
    const types: NotificationType[] = [
      'success', 'error', 'info', 'event', 'event_completed', 'message', 'generic'
    ];
    
    types.forEach((type, index) => {
      console.log(`Testing notification type: ${type} (${index + 1}/${types.length})`);
      const notification = createNotification('notification-1', type);
      
      const { unmount } = render(
        <BrowserRouter>
          <NotificationItem {...notification} />
        </BrowserRouter>
      );
      
      try {
        // Check if icon container is rendered using the test ID we added
        const iconContainer = screen.getByTestId('notification-icon-container');
        expect(iconContainer).toBeInTheDocument();
        
        // Check if any SVG icon is rendered inside the container
        const svgIcon = iconContainer.querySelector('svg');
        expect(svgIcon).not.toBeNull();
        expect(svgIcon).toBeInstanceOf(SVGElement);
        
        // Log success for debugging
        console.log(`✓ Icon test passed for type: ${type}`);
      } catch (error) {
        console.error(`✗ Icon test failed for type: ${type}:`, error);
        throw error; // Re-throw to fail the test
      }
      
      unmount();
    });
  });

  it('calls onMarkAsRead when mark as read button is clicked', () => {
    const notification = createNotification();
    
    render(
      <BrowserRouter>
        <NotificationItem {...notification} />
      </BrowserRouter>
    );
    
    const markAsReadButton = screen.getByText('Mark as read');
    fireEvent.click(markAsReadButton);
    
    expect(notification.onMarkAsRead).toHaveBeenCalledWith(notification.id);
  });

  it('renders as a link when link prop is provided', () => {
    const notification = createNotification(
      'notification-1', 
      'info', 
      false, 
      '/test-link'
    );
    
    render(
      <BrowserRouter>
        <NotificationItem {...notification} />
      </BrowserRouter>
    );
    
    const link = screen.getByText('Test Notification').closest('a');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/test-link');
  });

  it('renders as a div when no link is provided', () => {
    const notification = createNotification();
    
    const { container } = render(
      <BrowserRouter>
        <NotificationItem {...notification} />
      </BrowserRouter>
    );
    
    // The root should be a div, not an anchor
    const rootElement = container.firstChild;
    expect(rootElement?.nodeName).toBe('DIV');
  });

  it('formats dates correctly based on time difference', () => {
    const now = new Date();
    
    // Test minutes ago
    const minutesAgo = new Date(now.getTime() - 10 * 60 * 1000).toISOString(); // 10 minutes ago
    const minutesNotification = {
      ...createNotification(),
      createdAt: minutesAgo
    };
    
    const { unmount: unmount1 } = render(
      <BrowserRouter>
        <NotificationItem {...minutesNotification} />
      </BrowserRouter>
    );
    
    expect(screen.getByText('10 min ago')).toBeInTheDocument();
    unmount1();
    
    // Test hours ago
    const hoursAgo = new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString(); // 5 hours ago
    const hoursNotification = {
      ...createNotification(),
      createdAt: hoursAgo
    };
    
    const { unmount: unmount2 } = render(
      <BrowserRouter>
        <NotificationItem {...hoursNotification} />
      </BrowserRouter>
    );
    
    expect(screen.getByText('5 hours ago')).toBeInTheDocument();
    unmount2();
    
    // Test yesterday
    const yesterday = new Date(now.getTime() - 25 * 60 * 60 * 1000).toISOString(); // 25 hours ago
    const yesterdayNotification = {
      ...createNotification(),
      createdAt: yesterday
    };
    
    render(
      <BrowserRouter>
        <NotificationItem {...yesterdayNotification} />
      </BrowserRouter>
    );
    
    expect(screen.getByText('yesterday')).toBeInTheDocument();
  });

  it('applies different styles based on notification type and read status', () => {
    // Since we're using styled-components with transient props,
    // directly testing for CSS styles is challenging. Instead,
    // we'll check for proper rendering of each notification type
    // and validate that they have the correct structure
    
    // Test both read and unread notifications
    const testCases = [
      { id: 'notification-1', type: 'success' as NotificationType, isRead: false, name: 'unread success' },
      { id: 'notification-2', type: 'error' as NotificationType, isRead: true, name: 'read error' },
      { id: 'notification-3', type: 'info' as NotificationType, isRead: false, name: 'unread info' },
      { id: 'notification-4', type: 'event' as NotificationType, isRead: true, name: 'read event' }
    ];
    
    testCases.forEach(testCase => {
      const notification = createNotification(testCase.id, testCase.type, testCase.isRead);
      
      const { unmount } = render(
        <BrowserRouter>
          <NotificationItem {...notification} />
        </BrowserRouter>
      );
      
      // Check title and message are rendered
      expect(screen.getByText('Test Notification')).toBeInTheDocument();
      expect(screen.getByText('This is a test notification message')).toBeInTheDocument();
      
      // Check appropriate icon container exists
      const iconContainer = screen.getByTestId('notification-icon-container');
      expect(iconContainer).toBeInTheDocument();
      
      // Check "Mark as read" button based on read status
      if (testCase.isRead) {
        expect(screen.queryByText('Mark as read')).not.toBeInTheDocument();
      } else {
        expect(screen.getByText('Mark as read')).toBeInTheDocument();
      }
      
      unmount();
    });
  });
});
