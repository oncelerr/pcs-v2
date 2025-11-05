import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../Components/Sidebar/Sidebar';
import { FaBars } from 'react-icons/fa';
import { FaBell, FaCheck, FaExclamationCircle, FaInfoCircle } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import './DashboardLayout.css';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string | null;
  is_read: boolean;
  created_at: string;
}

const DashboardLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isSidebarOpen && !target.closest('.sidebar') && !target.closest('.menu-toggle')) {
        setIsSidebarOpen(false);
      }
      // Close user menu when clicking outside of it
      if (isUserMenuOpen && !target.closest('.user-menu-container')) {
        setIsUserMenuOpen(false);
      }
      // Close notification panel when clicking outside of it
      if (isNotificationOpen && !target.closest('.notification-container')) {
        setIsNotificationOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSidebarOpen, isUserMenuOpen, isNotificationOpen]);
  
  // Fetch notifications when component mounts
  useEffect(() => {
    if (user?.id) {
      fetchNotifications();
    }
  }, [user?.id]);
  
  const fetchNotifications = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const response = await axios.get(`/api/notifications/user/${user.id}`);
      setNotifications(response.data);
      
      // Calculate unread count
      const unread = response.data.filter((notif: Notification) => !notif.is_read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const markAsRead = async (notificationId: number) => {
    try {
      await axios.post(`/api/notifications/${notificationId}/read`);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId ? { ...notif, is_read: true } : notif
        )
      );
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };
  
  const markAllAsRead = async () => {
    if (notifications.length === 0) return;
    
    try {
      // Get all unread notification IDs
      const unreadIds = notifications
        .filter(notif => !notif.is_read)
        .map(notif => notif.id);
      
      if (unreadIds.length === 0) return;
      
      // Make API call to mark all as read
      await axios.post('/api/notifications/mark-all-read', { user_id: user?.id });
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, is_read: true }))
      );
      
      // Reset unread count
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };
  
  // Get notification icon based on type
  const getNotificationIcon = (type: string | null) => {
    switch (type) {
      case 'success':
      case 'payment_successful':
        return <FaCheck className="notification-icon success" />;
      case 'error':
      case 'payment_error':
      case 'stripe_api_error':
        return <FaExclamationCircle className="notification-icon error" />;
      default:
        return <FaInfoCircle className="notification-icon info" />;
    }
  };
  
  // Format date to relative time (e.g., "2 hours ago")
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    
    return date.toLocaleDateString();
  };

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  if (!user) {
    return null; // or redirect to login
  }

  const getInitials = (fullName: string): string => {
    if (!fullName) return '';
    const parts = fullName
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    if (parts.length === 0) return '';
    const first = parts[0]?.charAt(0) ?? '';
    const second = parts[1]?.charAt(0) ?? '';
    return (first + second).toUpperCase();
  };

  const titleMap: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/profile': 'Profile',
    '/user-service': 'Services',
    '/acc-settings': 'Account Settings',
  };

  const computeTitle = (pathname: string): string => {
    if (titleMap[pathname]) return titleMap[pathname];
    const parts = pathname.split('/').filter(Boolean);
    if (parts.length === 0) return 'Dashboard';
    return parts
      .map(p => p.replace(/-/g, ' '))
      .map(p => p.charAt(0).toUpperCase() + p.slice(1))
      .join(' / ');
  };

  const pageTitle = computeTitle(location.pathname);

  return (
    <div className="dashboard-layout">
      <button
        className="menu-toggle"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        aria-label="Toggle menu"
      >
        <FaBars />
      </button>

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <main className="main-content">
        <div className="content-wrapper">
          <div className="main-content-header">
            <h1 className="main-content-title">{pageTitle}</h1>
            <div className="srch-notif-cont">
              <input type="text" className="main-content-search" placeholder='Search' name="" id="" />
              
              {/* Notification Button and Dropdown */}
              <div 
                className="notification-container" 
                ref={notificationRef}
              >
                <button 
                  className="notification-button" 
                  onClick={() => setIsNotificationOpen(prev => !prev)}
                  aria-label="Notifications"
                  aria-haspopup="true"
                  aria-expanded={isNotificationOpen}
                >
                  <img src="/assets/notif.png" alt="" />
                  {unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount}</span>
                  )}
                </button>
                
                {isNotificationOpen && (
                  <div className="notification-panel slide-down">
                    <div className="notification-header">
                      <h3>Notifications</h3>
                      {unreadCount > 0 && (
                        <button 
                          className="mark-all-read" 
                          onClick={markAllAsRead}
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                    
                    <div className="notification-list">
                      {isLoading ? (
                        <div className="notification-loading">Loading notifications...</div>
                      ) : notifications.length === 0 ? (
                        <div className="notification-empty">No notifications</div>
                      ) : (
                        notifications.map(notification => (
                          <div 
                            key={notification.id} 
                            className={`notification-item ${!notification.is_read ? 'unread' : ''}`}
                            onClick={() => markAsRead(notification.id)}
                          >
                            <div className="notification-icon-container">
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="notification-content">
                              <div className="notification-title">{notification.title}</div>
                              <div className="notification-message">{notification.message}</div>
                              <div className="notification-time">{formatRelativeTime(notification.created_at)}</div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <div 
                className="user-menu-container" 
                ref={userMenuRef}
                tabIndex={-1}
                onMouseEnter={() => setIsUserMenuOpen(true)}
                onFocus={() => setIsUserMenuOpen(true)}
                onBlur={(e) => {
                  const next = e.relatedTarget as Node | null;
                  if (!userMenuRef.current?.contains(next)) {
                    setIsUserMenuOpen(false);
                  }
                }}
              >
                <button 
                  className="main-content-user" 
                  aria-label="User initials"
                  aria-haspopup="menu"
                  aria-expanded={isUserMenuOpen}
                  onClick={() => setIsUserMenuOpen(prev => !prev)}
                >
                  {getInitials(user.name || '')}
                </button>
                {isUserMenuOpen && (
                  <div className="user-menu-panel slide-down" role="menu">
                    <div className="user-menu-greeting">Hello, {user.name || 'User'}</div>
                    <button 
                      className="user-menu-item" 
                      role="menuitem"
                      onClick={() => navigate('/acc-settings')}
                    >
                      Account Settings
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
