import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../Components/Sidebar/Sidebar';
import { FaBars } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import './DashboardLayout.css';

const DashboardLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

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
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSidebarOpen, isUserMenuOpen]);

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
              <button><img src="/assets/notif.png" alt="" /></button>
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
