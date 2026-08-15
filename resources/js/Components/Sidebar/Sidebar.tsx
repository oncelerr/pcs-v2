import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import StateServiceRequestModal from '../../Pages/Dashboard/Components/StateServiceRequestModal/StateServiceRequestModal';
import './Sidebar.css';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { logout, user } = useAuth();
  const location = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);
  const [showServiceRequestModal, setShowServiceRequestModal] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  // Check if the logged-in user is admin
  const isAdmin = user?.role?.name?.toLowerCase() === 'admin';

  const handleServiceRequestSubmit = async (formData: any) => {
    try {
      // Get the auth token from localStorage
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        alert('You must be logged in to submit a request.');
        throw new Error('No authentication token found');
      }

      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      
      const response = await fetch('/api/state-service-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-CSRF-TOKEN': csrfToken || '',
          'X-Requested-With': 'XMLHttpRequest',
        },
        credentials: 'same-origin',
        body: JSON.stringify({
          ...formData,
          user_id: user?.id
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setShowServiceRequestModal(false);
        // Show success message
        alert(data.message || 'Service request submitted successfully!');
      } else {
        throw new Error(data.message || 'Failed to submit request');
      }
    } catch (error) {
      console.error('Error submitting service request:', error);
      alert(error instanceof Error ? error.message : 'Failed to submit service request. Please try again.');
      throw error;
    }
  };

  const handleAdditionalServicesClick = (e: React.MouseEvent) => {
    if (!isAdmin) {
      e.preventDefault();
      setShowServiceRequestModal(true);
    }
  };

  return (
    <>
      {showServiceRequestModal && (
        <StateServiceRequestModal
          onClose={() => setShowServiceRequestModal(false)}
          onSubmit={handleServiceRequestSubmit}
        />
      )}

      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <img src="/assets/sidenav-logo.png" alt="" />
        </div>
        <div className="sidenav-hr" />
        <nav className="sidebar-nav">
          <Link to="/dashboard" className={'sidebar-link ' + (isActive('/dashboard') ? 'active' : '')}>
            <img src="/assets/home-icon.png" alt="" /> Dashboard
          </Link>

          {/* Admin vs User */}
          <Link
            to="#"
            className="sidebar-link"
            onClick={(e) => {
              e.preventDefault();
              setProfileOpen(prev => !prev);
            }}
          >
            <img src="/assets/user-icon.png" alt="" />
            <span>{isAdmin ? 'Accounts' : 'Profile'}</span>
            <img className={"chevron " + (profileOpen ? 'open' : '')} src="/assets/chevron-down.png" alt="" />
          </Link>

          <div className={"submenu " + (profileOpen ? 'open' : '')}>
            {isAdmin ? (
              <>
                <Link to="/all-users" className={'submenu-link ' + (isActive('/all-users') ? 'active' : '')}>
                  <span>All Users</span>
                </Link>
                <Link to="/compliance" className={'submenu-link ' + (isActive('/compliance') ? 'active' : '')}>
                  <span>Compliance</span>
                </Link>
                <Link to="/user-documents" className={'submenu-link ' + (isActive('/user-documents') ? 'active' : '')}>
                  <span>User Documents</span>
                </Link>
                <Link to="/state-service-requests" className={'submenu-link ' + (isActive('/state-service-requests') ? 'active' : '')}>
                  <span>Service Requests</span>
                </Link>
                <Link to="/admin-activity" className={'submenu-link ' + (isActive('/admin-activity') ? 'active' : '')}>
                  <span>Activity &amp; Reports</span>
                </Link>
              </>
            ) : (
              <>
                <Link to="/profile" className={'submenu-link ' + (isActive('/profile') ? 'active' : '')}>
                  <span>My Profile</span>
                </Link>
                <Link to="/acc-settings" className={'submenu-link ' + (isActive('/acc-settings') ? 'active' : '')}>
                  <span>Account Settings</span>
                </Link>
              </>
            )}
          </div>

          <Link
            to={isAdmin ? '/blog-management' : '#'}
            className={'sidebar-link ' + (isActive(isAdmin ? '/blog-management' : '/user-service') ? 'active' : '')}
            onClick={handleAdditionalServicesClick}
          >
            <img src="/assets/services-icon.png" alt="" /> {isAdmin ? 'Blogs' : 'Additional Services'}
          </Link>

          <div className={'sidebar-logout'} onClick={() => { localStorage.removeItem('statusProgress'); logout() }}>
            <img src="/assets/logout.svg" alt="" /> Logout
          </div>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;