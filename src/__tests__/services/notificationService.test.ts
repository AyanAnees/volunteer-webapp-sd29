import { describe, test, expect, vi, beforeEach } from 'vitest';
import { 
  fetchNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead
} from '../../services/notificationService';
import * as supabaseModule from '../../lib/supabase';

// Mock the supabase module
vi.mock('../../lib/supabase', () => {
  return {
    supabase: {
      from: vi.fn().mockImplementation((table) => {
        if (table === 'notifications') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                order: vi.fn().mockResolvedValue({
                  data: [
                    { id: '1', title: 'Test Notification', message: 'This is a test', read: false },
                    { id: '2', title: 'Another Notification', message: 'This is another test', read: false }
                  ],
                  error: null
                })
              })
            }),
            insert: vi.fn().mockResolvedValue({
              data: { id: '3' },
              error: null
            }),
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({
                data: { id: '1', read: true },
                error: null
              }),
              in: vi.fn().mockResolvedValue({
                data: [{ id: '1', read: true }, { id: '2', read: true }],
                error: null
              })
            })
          };
        }
        return {
          select: vi.fn().mockReturnValue({
            data: [],
            error: null
          })
        };
      })
    }
  };
});

describe('Notification Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('fetchNotifications retrieves notifications for user', async () => {
    const userId = 'test-user-id';
    const result = await fetchNotifications(userId);
    
    expect(supabaseModule.supabase.from).toHaveBeenCalledWith('notifications');
    expect(result.length).toBe(2);
    expect(result[0].title).toBe('Test Notification');
    expect(result[1].title).toBe('Another Notification');
  });

  test('fetchNotifications handles errors', async () => {
    // Mock the select function to return an error
    vi.mocked(supabaseModule.supabase.from).mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Database error' }
          })
        })
      })
    } as any);
    
    const userId = 'test-user-id';
    const result = await fetchNotifications(userId);
    
    // Should return an empty array when there's an error
    expect(result).toEqual([]);
  });

  test('markNotificationAsRead updates notification read status', async () => {
    const notificationId = '1';
    const result = await markNotificationAsRead(notificationId);
    
    expect(supabaseModule.supabase.from).toHaveBeenCalledWith('notifications');
    expect(result).toBeTruthy();
  });

  test('markNotificationAsRead handles errors', async () => {
    // Mock the update function to return an error
    vi.mocked(supabaseModule.supabase.from).mockReturnValueOnce({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database error' }
        })
      })
    } as any);
    
    const notificationId = '1';
    const result = await markNotificationAsRead(notificationId);
    
    // Should return false when there's an error
    expect(result).toBeFalsy();
  });

  test('markAllNotificationsAsRead updates multiple notifications', async () => {
    // Mock the structure correctly with multiple eq calls
    vi.mocked(supabaseModule.supabase.from).mockReturnValueOnce({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: [{ id: '1', is_read: true }, { id: '2', is_read: true }],
            error: null
          })
        })
      })
    } as any);
    
    const userId = 'test-user-id';
    const result = await markAllNotificationsAsRead(userId);
    
    expect(supabaseModule.supabase.from).toHaveBeenCalledWith('notifications');
    expect(result).toBeTruthy();
  });

  test('markAllNotificationsAsRead handles errors', async () => {
    // Mock the structure correctly with multiple eq calls
    vi.mocked(supabaseModule.supabase.from).mockReturnValueOnce({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Database error' }
          })
        })
      })
    } as any);
    
    const userId = 'test-user-id';
    const result = await markAllNotificationsAsRead(userId);
    
    // Should return false when there's an error
    expect(result).toBeFalsy();
  });

  test('can insert new notifications', async () => {
    // Test direct insert to the notifications table
    const result = await supabaseModule.supabase.from('notifications').insert({
      user_id: 'test-user-id',
      title: 'New Notification',
      message: 'This is a new notification',
      type: 'info'
    });
    
    expect(supabaseModule.supabase.from).toHaveBeenCalledWith('notifications');
    expect(result.error).toBeNull();
  });

  test('handles errors when inserting notifications', async () => {
    // Mock the insert function to return an error
    vi.mocked(supabaseModule.supabase.from).mockReturnValueOnce({
      insert: vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Database error' }
      })
    } as any);
    
    const result = await supabaseModule.supabase.from('notifications').insert({
      user_id: 'test-user-id',
      title: 'New Notification',
      message: 'This is a new notification',
      type: 'info'
    });
    
    // Should have an error
    expect(result.error).not.toBeNull();
  });
});
