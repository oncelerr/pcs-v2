import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaUser, FaCog, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import './Sidebar.css';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { logout } = useAuth();
  const location = useLocation();

  // Check if the current route is active
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <h3>PremiumCorp</h3>
        <button className="close-btn" onClick={onClose}>&times;</button>
      </div>
      <nav className="sidebar-nav">
        <ul>
          <li className={isActive('/dashboard') ? 'active' : ''}>
            <Link to="/dashboard">
              <FaHome className="icon" />
              <span>Dashboard</span>
            </Link>
          </li>
          <li className={isActive('/profile') ? 'active' : ''}>
            <Link to="/profile">
              <FaUser className="icon" />
              <span>Profile</span>
            </Link>
          </li>
          <li className={isActive('/settings') ? 'active' : ''}>
            <Link to="/settings">
              <FaCog className="icon" />
              <span>Settings</span>
            </Link>
          </li>
          <li>
            <button onClick={logout} className="logout-btn">
              <FaSignOutAlt className="icon" />
              <span>Logout</span>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
