import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Sidebar.css';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { logout, user } = useAuth();
  const location = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  // Check if the logged-in user is admin
  const isAdmin = user?.role?.name?.toLowerCase() === 'admin';

  return (
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
              <Link to="/user-management" className={'submenu-link ' + (isActive('/user-management') ? 'active' : '')}>
                <span>All Users</span>
              </Link>
              <Link to="/user-management" className={'submenu-link ' + (isActive('/user-management') ? 'active' : '')}>
                <span>Pending</span>
              </Link>
              <Link to="/user-management" className={'submenu-link ' + (isActive('/user-management') ? 'active' : '')}>
                <span>Compliance</span>
              </Link>
              <Link to="/user-management" className={'submenu-link ' + (isActive('/user-management') ? 'active' : '')}>
                <span>Approved</span>
              </Link>
              <Link to="/user-management" className={'submenu-link ' + (isActive('/user-management') ? 'active' : '')}>
                <span>Uploads</span>
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
          to={isAdmin ? '/content-management' : '/user-service'}
          className={'sidebar-link ' + (isActive(isAdmin ? '/content-management' : '/user-service') ? 'active' : '')}
        >
          <img src="/assets/services-icon.png" alt="" /> {isAdmin ? 'Blogs' : 'Services'}
        </Link>

        <div className={'sidebar-logout'} onClick={() => { localStorage.removeItem('statusProgress'); logout() }}>
          <img src="/assets/logout.svg" alt="" /> Logout
        </div>
      </nav >
    </div >
  );
};

export default Sidebar;
