import { supabase } from '../lib/supabase';
import { Notification } from '../components/notifications/NotificationList';

/**
 * Fetches notifications for the current user
 * @param recipientId - The ID of the user's profile
 * @param limit - Optional limit to the number of notifications to fetch
 * @param page - Optional page number for pagination
 * @returns Array of notifications
 */
export const fetchNotifications = async (recipientId: string, limit?: number, page: number = 1): Promise<Notification[]> => {
  try {
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('recipient_id', recipientId)
      .order('created_at', { ascending: false });
    
    if (limit) {
      const offset = (page - 1) * limit;
      query = query.limit(limit).range(offset, offset + limit - 1);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
};

/**
 * Marks a notification as read
 * @param notificationId - The ID of the notification to mark as read
 */
export const markNotificationAsRead = async (notificationId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return false;
  }
};

/**
 * Marks all notifications for a user as read
 * @param recipientId - The ID of the user's profile
 */
export const markAllNotificationsAsRead = async (recipientId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('recipient_id', recipientId)
      .eq('is_read', false);
    
    if (error) {
      console.error('Error marking notifications as read:', error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return false;
  }
};

/**
 * Creates a new notification for a user
 * @param notification - The notification to create
 */
export const createNotification = async (notification: Omit<Notification, 'id'>): Promise<Notification | null> => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert(notification)
      .select()
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};

/**
 * Sets up a real-time subscription for notifications
 * @param recipientId - The ID of the user's profile
 * @param callback - Callback function that receives new notifications
 * @returns A function to unsubscribe from the real-time updates
 */
export const subscribeToNotifications = (
  recipientId: string,
  callback: (notification: Notification) => void
): (() => void) => {
  const subscription = supabase
    .channel('notifications-channel')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `recipient_id=eq.${recipientId}`
      },
      (payload) => {
        callback(payload.new as Notification);
      }
    )
    .subscribe();
  
  // Return unsubscribe function
  return () => {
    supabase.removeChannel(subscription);
  };
};
