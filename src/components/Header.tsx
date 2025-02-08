import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { 
  FaBars, 
  FaTimes, 
  FaBell, 
  FaUserCircle, 
  FaCalendarAlt,
  FaUsersCog,
  FaEnvelope,
  FaCheck,
  FaHistory,
  FaInfoCircle
} from 'react-icons/fa';
import { fetchNotifications } from '../services/notificationService';
import { supabase, isAuthenticated, getCurrentProfile } from '../lib/supabase';
import { theme } from '../styles/theme';
import { PrimaryLinkButton, SecondaryLinkButton } from './ui/StyledComponents';

const HeaderWrapper = styled.header`
  background-color: ${theme.colors.white};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
  width: 100%;
`;

const HeaderContainer = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 ${theme.spacing.md};
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 70px;
`;

const Logo = styled(Link)`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${theme.colors.primary};
  text-decoration: none;
`;

const NavLinks = styled.nav`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};

  @media (max-width: ${theme.breakpoints.md}) {
    display: none;
  }
`;

const NavLinkItem = styled(Link)<{ $active?: boolean }>`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  color: ${props => props.$active ? theme.colors.primary : theme.colors.gray[700]};
  font-weight: ${props => props.$active ? '600' : '500'};
  text-decoration: none;
  position: relative;

  &:after {
    content: '';
    position: absolute;
    bottom: -5px;
    left: 0;
    width: 100%;
    height: 2px;
    background-color: ${theme.colors.primary};
    transform: ${props => props.$active ? 'scaleX(1)' : 'scaleX(0)'};
    transition: transform 0.3s ease;
  }

  &:hover:after {
    transform: scaleX(1);
  }
`;

const AuthButtons = styled.div`
  display: flex;
  gap: ${theme.spacing.md};

  @media (max-width: ${theme.breakpoints.md}) {
    display: none;
  }
`;

const MobileMenuButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  color: ${theme.colors.gray[700]};
  cursor: pointer;
  display: none;

  @media (max-width: ${theme.breakpoints.md}) {
    display: block;
  }
`;

const MobileMenu = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 70px;
  left: 0;
  right: 0;
  background-color: ${theme.colors.white};
  padding: ${theme.spacing.lg};
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transform: ${({ isOpen }) => isOpen ? 'translateY(0)' : 'translateY(-100%)'};
  opacity: ${({ isOpen }) => isOpen ? 1 : 0};
  visibility: ${({ isOpen }) => isOpen ? 'visible' : 'hidden'};
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
  z-index: 90;

  @media (min-width: ${theme.breakpoints.md}) {
    display: none;
  }
`;

const MobileNavLink = styled(Link)<{ $active?: boolean }>`
  padding: ${theme.spacing.md};
  color: ${props => props.$active ? theme.colors.primary : theme.colors.gray[700]};
  font-weight: ${props => props.$active ? '600' : '500'};
  text-decoration: none;
  border-bottom: 1px solid ${theme.colors.gray[200]};

  &:last-child {
    border-bottom: none;
  }
`;

const MobileAuthButtons = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
  margin-top: ${theme.spacing.md};
`;

const UserMenu = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

const UserMenuButton = styled.button`
  background: none;
  border: none;
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  font-weight: 500;
  color: ${theme.colors.gray[700]};
  cursor: pointer;
  padding: ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.md};

  &:hover {
    background-color: ${theme.colors.gray[100]};
  }
`;

const UserMenuDropdown = styled.div<{ isOpen: boolean }>`
  position: absolute;
  top: 100%;
  right: 0;
  background-color: ${theme.colors.white};
  border: 1px solid ${theme.colors.gray[200]};
  border-radius: ${theme.borderRadius.md};
  box-shadow: ${theme.shadows.md};
  min-width: 200px;
  display: ${({ isOpen }) => isOpen ? 'flex' : 'none'};
  flex-direction: column;
  overflow: hidden;
  z-index: 10;
`;

const UserMenuLink = styled(Link)`
  padding: ${theme.spacing.md};
  color: ${theme.colors.gray[700]};
  text-decoration: none;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};

  &:hover {
    background-color: ${theme.colors.gray[100]};
  }
`;

const UserMenuButton2 = styled.button`
  padding: ${theme.spacing.md};
  text-align: left;
  background: none;
  border: none;
  color: ${theme.colors.gray[700]};
  cursor: pointer;
  transition: background-color 0.2s;
  font-family: inherit;
  font-size: inherit;
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};

  &:hover {
    background-color: ${theme.colors.gray[100]};
  }
`;

const NotificationBadge = styled.div`
  position: relative;
  cursor: pointer;
  margin-right: ${theme.spacing.sm};
`;

const Badge = styled.span`
  position: absolute;
  top: -5px;
  right: -5px;
  background-color: ${theme.colors.error};
  color: white;
  border-radius: 50%;
  min-width: 18px;
  height: 18px;
  font-size: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
`;

const NotificationsDropdown = styled.div<{ isOpen: boolean }>`
  position: absolute;
  top: 100%;
  right: -100px;
  background-color: ${theme.colors.white};
  border: 1px solid ${theme.colors.gray[200]};
  border-radius: ${theme.borderRadius.md};
  box-shadow: ${theme.shadows.md};
  width: 350px;
  max-height: 400px;
  overflow-y: auto;
  display: ${({ isOpen }) => isOpen ? 'flex' : 'none'};
  flex-direction: column;
  z-index: 100;
`;

interface NotificationLinkProps {
  isRead: boolean;
}

const NotificationItem = styled(Link)<NotificationLinkProps>`
  padding: ${theme.spacing.md};
  border-bottom: 1px solid ${theme.colors.gray[200]};
  text-decoration: none;
  color: ${theme.colors.gray[800]};
  background-color: ${props => props.isRead ? theme.colors.gray[50] : 'white'};
  
  &:hover {
    background-color: ${theme.colors.gray[100]};
  }

  &:last-child {
    border-bottom: none;
  }
`;

const NotificationHeader = styled.div`
  font-weight: 600;
  font-size: ${theme.fontSizes.sm};
  margin-bottom: ${theme.spacing.xs};
  display: flex;
  justify-content: space-between;
`;

const NotificationMessage = styled.div`
  font-size: ${theme.fontSizes.xs};
  color: ${theme.colors.gray[600]};
  margin-bottom: ${theme.spacing.xs};
`;

const NotificationTime = styled.div`
  font-size: ${theme.fontSizes.xs};
  color: ${theme.colors.gray[500]};
`;

const NotificationIcon = styled.span<{ type: string }>`
  color: ${props => {
    switch (props.type) {
      case 'success': return theme.colors.success;
      case 'error': return theme.colors.error;
      case 'info': return theme.colors.info;
      case 'event': return theme.colors.primary;
      case 'message': return theme.colors.warning;
      default: return theme.colors.gray[400];
    }
  }};
  margin-right: ${theme.spacing.xs};
  display: flex;
  align-items: center;
`;

const NotificationsHeader = styled.div`
  padding: ${theme.spacing.md};
  border-bottom: 1px solid ${theme.colors.gray[200]};
  font-weight: 600;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const NotificationsFooter = styled.div`
  padding: ${theme.spacing.md};
  border-top: 1px solid ${theme.colors.gray[200]};
  text-align: center;
`;

const ViewAllLink = styled(Link)`
  color: ${theme.colors.primary};
  font-weight: 500;
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
`;

const MarkAllAsReadButton = styled.button`
  background: none;
  border: none;
  color: ${theme.colors.gray[600]};
  font-size: ${theme.fontSizes.xs};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  
  &:hover {
    color: ${theme.colors.primary};
  }
`;

const UserTypeBadge = styled.span`
  display: inline-block;
  font-size: 0.7rem;
  padding: 0.1rem 0.3rem;
  border-radius: 0.25rem;
  background-color: ${props => props.color || theme.colors.primary};
  color: white;
  margin-left: 0.5rem;
  text-transform: capitalize;
`;

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [hasNotifications, setHasNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotificationsDropdownOpen, setIsNotificationsDropdownOpen] = useState(false);
  const [recentNotifications, setRecentNotifications] = useState<any[]>([]);
  
  const navigate = useNavigate();
  const location = useLocation();

  // Function to fetch notifications
  const fetchUserNotifications = async (profileId: string) => {
    try {
      console.log("Fetching notifications for profile:", profileId);
      const notifications = await fetchNotifications(profileId, 5);
      console.log("Fetched notifications:", notifications);
      
      const unread = notifications.filter(n => !n.is_read);
      setRecentNotifications(notifications);
      setUnreadCount(unread.length);
      setHasNotifications(unread.length > 0);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  // Check for notifications
  useEffect(() => {
    if (userProfile?.id) {
      fetchUserNotifications(userProfile.id);
      
      // Set up interval to refresh notifications every 30 seconds
      const intervalId = setInterval(() => {
        fetchUserNotifications(userProfile.id);
      }, 30000);
      
      return () => clearInterval(intervalId);
    }
  }, [userProfile?.id]);

  // Function to check and update auth state
  const checkAndUpdateAuth = async () => {
    try {
      const authStatus = await isAuthenticated();
      
      // Only update auth state if it has changed
      if (isLoggedIn !== authStatus) {
        setIsLoggedIn(authStatus);
      }

      if (authStatus) {
        const profile = await getCurrentProfile();
        setUserProfile(profile);
      }
    } catch (error) {
      console.error("Exception in checkAndUpdateAuth:", error);
    }
  };

  // Initialize auth state and listen for changes
  useEffect(() => {
    // Initial check on mount
    checkAndUpdateAuth();

    // Subscribe to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, !!session);
        
        // Handle the auth state change differently based on event type
        if (event === 'SIGNED_OUT') {
          // When signing out, immediately clear state
          setIsLoggedIn(false);
          setUserProfile(null);
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          // When signing in or refreshing token, update auth state
          setIsLoggedIn(!!session);
          if (session) {
            await checkAndUpdateAuth();
          }
        } else {
          // For other events, just update based on session presence
          setIsLoggedIn(!!session);
          if (session) {
            await checkAndUpdateAuth();
          } else {
            setUserProfile(null);
          }
        }
      }
    );

    return () => {
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  // Re-check auth when location changes (e.g., when clicking Home)
  // Debounce the check to prevent excessive calls
  useEffect(() => {
    // Use a shorter timeout for navbar updating
    const timeout = setTimeout(() => {
      // Only check auth if user is likely to be logged in
      if (isLoggedIn || location.pathname === '/') {
        checkAndUpdateAuth();
      }
    }, 100);
    
    return () => clearTimeout(timeout);
  }, [location.pathname, isLoggedIn]);

  const handleLogout = async () => {
    try {
      // First update local state to provide immediate feedback
      setIsLoggedIn(false);
      setUserProfile(null);
      setIsUserMenuOpen(false);
      
      // Then perform the actual logout
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Error during signout:", error);
        throw error;
      }
      
      console.log("Logout successful");
      
      // Use setTimeout to allow the auth state to fully update
      setTimeout(() => {
        // Navigate after signout is complete
        navigate('/');
      }, 500);
    } catch (error) {
      console.error("Error signing out:", error);
      alert("Failed to sign out. Please try again.");
      
      // Recheck auth in case of error
      checkAndUpdateAuth();
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
    if (isNotificationsDropdownOpen) {
      setIsNotificationsDropdownOpen(false);
    }
  };
  
  const toggleNotificationsDropdown = () => {
    setIsNotificationsDropdownOpen(!isNotificationsDropdownOpen);
    if (isUserMenuOpen) {
      setIsUserMenuOpen(false);
    }
  };

  const closeMenus = () => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
    setIsNotificationsDropdownOpen(false);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  const handleMarkAllAsRead = async () => {
    if (!userProfile) return;
    
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('profile_id', userProfile.id)
        .eq('is_read', false);
        
      if (error) throw error;
      
      // Update local state
      setRecentNotifications(recentNotifications.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
      setHasNotifications(false);
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };
  
  const formatNotificationTime = (dateString: string) => {
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
  
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <FaCheck />;
      case 'error':
        return <FaTimes />;
      case 'info':
        return <FaInfoCircle />;
      case 'event':
        return <FaCalendarAlt />;
      case 'message':
        return <FaEnvelope />;
      default:
        return <FaBell />;
    }
  };

  return (
    <HeaderWrapper>
      <HeaderContainer>
        {/* Change Logo link based on user type */}
        {isLoggedIn && userProfile ? (
          userProfile.type === 'volunteer' ? (
            <Logo to="/profile">Volunteer Connect</Logo>
          ) : (
            <Logo to="/admin">Volunteer Connect</Logo>
          )
        ) : (
          <Logo to="/">Volunteer Connect</Logo>
        )}

        <NavLinks data-testid="desktop-nav">
          {/* Only show Home link for non-logged-in users */}
          {!isLoggedIn && (
            <NavLinkItem to="/" $active={isActive('/')}>
              Home
            </NavLinkItem>
          )}
          <NavLinkItem to="/opportunities" $active={isActive('/opportunities')}>
            Opportunities
          </NavLinkItem>
          {isLoggedIn && userProfile?.type === 'volunteer' && (
            <NavLinkItem to="/applications" $active={isActive('/applications')}>
              My Applications
            </NavLinkItem>
          )}
          {isLoggedIn && (userProfile?.type === 'organization' || userProfile?.type === 'admin') && (
            <>
              <NavLinkItem to="/manage-events" $active={isActive('/manage-events')}>
                Manage Events
              </NavLinkItem>
              <NavLinkItem to="/admin" $active={isActive('/admin')}>
                Dashboard
              </NavLinkItem>
            </>
          )}
        </NavLinks>

        {isLoggedIn && userProfile ? (
          <UserMenu>
            <NotificationBadge onClick={toggleNotificationsDropdown} data-testid="notification-badge">
              <FaBell size={20} />
              {hasNotifications && <Badge>{unreadCount > 9 ? '9+' : unreadCount}</Badge>}
              
              <NotificationsDropdown isOpen={isNotificationsDropdownOpen} data-testid="notifications-dropdown">
                <NotificationsHeader>
                  <span>Notifications</span>
                  {hasNotifications && (
                    <MarkAllAsReadButton onClick={handleMarkAllAsRead}>
                      <FaCheck size={10} />
                      Mark all as read
                    </MarkAllAsReadButton>
                  )}
                </NotificationsHeader>
                
                {recentNotifications.length > 0 ? (
                  recentNotifications.map((notification) => (
                    <NotificationItem 
                      key={notification.id}
                      data-testid={`notification-item-${notification.id}`} // Add test ID
                      to={notification.link || '/notifications'}
                      isRead={notification.is_read}
                      onClick={closeMenus}
                    >
                      <NotificationHeader>
                        <div>
                          <NotificationIcon type={notification.type}>
                            {getNotificationIcon(notification.type)}
                          </NotificationIcon>
                          {notification.title}
                        </div>
                        {!notification.is_read && (
                          <div style={{ 
                            width: '8px', 
                            height: '8px', 
                            borderRadius: '50%', 
                            backgroundColor: theme.colors.primary 
                          }} />
                        )}
                      </NotificationHeader>
                      <NotificationMessage>
                        {notification.message}
                      </NotificationMessage>
                      <NotificationTime>
                        {formatNotificationTime(notification.created_at)}
                      </NotificationTime>
                    </NotificationItem>
                  ))
                ) : (
                  <div style={{ padding: theme.spacing.md, textAlign: 'center', color: theme.colors.gray[500] }}>
                    No notifications
                  </div>
                )}
                
                <NotificationsFooter>
                  <ViewAllLink to="/notifications" onClick={closeMenus}>
                    View all notifications
                  </ViewAllLink>
                </NotificationsFooter>
              </NotificationsDropdown>
            </NotificationBadge>
            
            <UserMenuButton onClick={toggleUserMenu}>
              <FaUserCircle size={24} />
              <span>
                {userProfile.display_name || 'User'}
                {userProfile.type && (
                  <UserTypeBadge 
                    color={
                      userProfile.type === 'admin' ? theme.colors.error : 
                      userProfile.type === 'organization' ? theme.colors.success : 
                      theme.colors.primary
                    }
                  >
                    {userProfile.type}
                  </UserTypeBadge>
                )}
              </span>
            </UserMenuButton>
            
            <UserMenuDropdown isOpen={isUserMenuOpen}>
              <UserMenuLink to="/profile" onClick={closeMenus}>
                <FaUserCircle />
                Profile
              </UserMenuLink>
              
              {userProfile.type === 'volunteer' && (
                <>
                  <UserMenuLink to="/applications" onClick={closeMenus}>
                    <FaCalendarAlt />
                    My Applications
                  </UserMenuLink>
                  <UserMenuLink to="/history" onClick={closeMenus}>
                    <FaHistory />
                    Volunteer History
                  </UserMenuLink>
                </>
              )}
              
              {(userProfile.type === 'organization' || userProfile.type === 'admin') && (
                <>
                  <UserMenuLink to="/manage-events" onClick={closeMenus}>
                    <FaCalendarAlt />
                    Manage Events
                  </UserMenuLink>
                  <UserMenuLink to="/admin" onClick={closeMenus}>
                    <FaUsersCog />
                    Dashboard
                  </UserMenuLink>
                </>
              )}
              <UserMenuButton2 onClick={handleLogout}>
                <FaTimes />
                Log Out
              </UserMenuButton2>
            </UserMenuDropdown>
          </UserMenu>
        ) : (
          <AuthButtons data-testid="desktop-auth-buttons">
            <SecondaryLinkButton to="/auth/login">
              Sign In
            </SecondaryLinkButton>
            <PrimaryLinkButton to="/auth/register">
              Sign Up
            </PrimaryLinkButton>
          </AuthButtons>
        )}

        <MobileMenuButton data-testid="mobile-menu-toggle" onClick={toggleMobileMenu} aria-label="Toggle menu">
          {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
        </MobileMenuButton>
      </HeaderContainer>

      <MobileMenu isOpen={isMobileMenuOpen} data-testid="mobile-menu">
        {!isLoggedIn && (
          <MobileNavLink to="/" $active={isActive('/')} onClick={closeMenus}>
            Home
          </MobileNavLink>
        )}
        <MobileNavLink to="/opportunities" $active={isActive('/opportunities')} onClick={closeMenus}>
          Opportunities
        </MobileNavLink>
        
        {isLoggedIn && userProfile?.type === 'volunteer' && (
          <>
            <MobileNavLink to="/applications" $active={isActive('/applications')} onClick={closeMenus}>
              My Applications
            </MobileNavLink>
            <MobileNavLink to="/history" $active={isActive('/history')} onClick={closeMenus}>
              Volunteer History
            </MobileNavLink>
            <MobileNavLink to="/profile" $active={isActive('/profile')} onClick={closeMenus}>
              Profile
            </MobileNavLink>
          </>
        )}
        
        {isLoggedIn && (userProfile?.type === 'organization' || userProfile?.type === 'admin') && (
          <>
            <MobileNavLink to="/manage-events" $active={isActive('/manage-events')} onClick={closeMenus}>
              Manage Events
            </MobileNavLink>
            <MobileNavLink to="/admin" $active={isActive('/admin')} onClick={closeMenus}>
              Dashboard
            </MobileNavLink>
            <MobileNavLink to="/profile" $active={isActive('/profile')} onClick={closeMenus}>
              Profile
            </MobileNavLink>
          </>
        )}
        
        {isLoggedIn && userProfile ? (
          <>
            <MobileNavLink to="/notifications" $active={isActive('/notifications')} onClick={closeMenus}>
              Notifications {hasNotifications && '(!)'}
            </MobileNavLink>
            <MobileNavLink as="button" to="#" onClick={() => {
              handleLogout();
              closeMenus();
            }}>
              Log Out
            </MobileNavLink>
          </>
        ) : (
          <MobileAuthButtons>
            <SecondaryLinkButton to="/auth/login" onClick={closeMenus}>
              Sign In
            </SecondaryLinkButton>
            <PrimaryLinkButton to="/auth/register" onClick={closeMenus}>
              Sign Up
            </PrimaryLinkButton>
          </MobileAuthButtons>
        )}
      </MobileMenu>
    </HeaderWrapper>
  );
}
