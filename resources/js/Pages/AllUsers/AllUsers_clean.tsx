import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './AllUsers.css'
import { COUNTRIES } from '../../data/countries';

const AllUsers: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Table column configuration
  const columns = [
    { key: 'companyName', label: 'Company Name', width: 186 },
    { key: 'fullName', label: 'Full Name', width: 185 },
    { key: 'companyDesignator', label: 'Company Designator', width: 164 },
    { key: 'stateRegistration', label: 'State Registration', width: 155 },
    { key: 'franchise', label: 'Franchise', width: 131 },
    { key: 'irs', label: 'IRS', width: 109 },
    { key: 'action', label: 'Action', width: 80 }
  ];

  // Sample table data
  const tableData = [
    {
      companyName: "VIMA Vacation Intervals Management LLC",
      fullName: "Gerardo Alonso Espinosa de los Monteros Garrido",
      companyDesignator: "LLC",
      stateRegistration: "DELAWARE",
      franchise: "04/11/2023",
      irs: "04/11/2023"
    },
    {
      companyName: "PRIXGIG",
      fullName: "Johnny Nel",
      companyDesignator: "LLC",
      stateRegistration: "DELAWARE",
      franchise: "04/11/2023",
      irs: "04/11/2023"
    },
    {
      companyName: "Acvs Corporation",
      fullName: "Héctor Manuel Aceves Ortega",
      companyDesignator: "LLC",
      stateRegistration: "DELAWARE",
      franchise: "04/11/2023",
      irs: "04/11/2023"
    },
    {
      companyName: "Enrosure Services",
      fullName: "Abhishek Shaw",
      companyDesignator: "LLC",
      stateRegistration: "DELAWARE",
      franchise: "04/11/2023",
      irs: "04/11/2023"
    },
    {
      companyName: "Freshh Anderson",
      fullName: "Greg Amponsah",
      companyDesignator: "Corporation",
      stateRegistration: "WYOMING",
      franchise: "04/11/2023",
      irs: "04/11/2023"
    },
    {
      companyName: "Lemon Sun",
      fullName: "Alejandro Mendoza",
      companyDesignator: "LLC",
      stateRegistration: "FLORIDA",
      franchise: "04/11/2023",
      irs: "04/11/2023"
    },
    {
      companyName: "Connect Train Me LLC",
      fullName: "Rishi Dinanath",
      companyDesignator: "LLC",
      stateRegistration: "WYOMING",
      franchise: "04/11/2023",
      irs: "04/11/2023"
    },
    {
      companyName: "LYNXLABS",
      fullName: "Jorge Alejandro Caballero Murillo",
      companyDesignator: "LLC",
      stateRegistration: "DELAWARE",
      franchise: "04/11/2023",
      irs: "04/11/2023"
    },
    {
      companyName: "Optic Health LLC",
      fullName: "Maria Elizabeth Nieuwoudt",
      companyDesignator: "LLC",
      stateRegistration: "WYOMING",
      franchise: "04/11/2023",
      irs: "04/11/2023"
    },
    {
      companyName: "8020.studio LLC",
      fullName: "Vladimir Blagojevic",
      companyDesignator: "LLC",
      stateRegistration: "WYOMING",
      franchise: "04/11/2023",
      irs: "04/11/2023"
    }
  ];

  return (
    <>
      <div className="all-users-container">
        <div className="sidebar">
          <div className="sidebar-content">
            <img className="sidebar-logo" src="https://placehold.co/233x51" />
            <div className="sidebar-divider"></div>
            <div className="sidebar-nav">
              <div className="nav-item-active">
                <div className="nav-item-content">
                  <div className="nav-item-inner">
                    <div className="nav-icon">
                      <div className="nav-icon-home" />
                    </div>
                    <div className="nav-text">Home</div>
                  </div>
                </div>
              </div>
              <div className="user-management-section">
                <div className="user-management-header">
                  <div className="nav-item-inner">
                    <div className="user-management-icon">
                      <div className="user-icon-circle" />
                      <div className="user-icon-head" />
                    </div>
                    <div className="nav-text-manrope">User Management</div>
                    <div className="dropdown-arrow">
                      <div className="dropdown-arrow-path" />
                    </div>
                  </div>
                </div>
                <div className="nav-submenu-item nav-submenu-active">
                  <div className="nav-item-inner">
                    <div className="nav-text-manrope">All Users Registered</div>
                  </div>
                </div>
                <div className="nav-submenu-item">
                  <div className="nav-item-inner">
                    <div className="nav-text-manrope">Unprocessed Users</div>
                  </div>
                </div>
                <div className="nav-submenu-item">
                  <div className="nav-item-inner">
                    <div className="nav-text-manrope">Compliance</div>
                  </div>
                </div>
                <div className="nav-submenu-item">
                  <div className="nav-item-inner">
                    <div className="nav-text-manrope">Successful Compliance</div>
                  </div>
                </div>
                <div className="nav-submenu-item">
                  <div className="nav-item-inner">
                    <div className="nav-text-manrope">Compliance Uploaded Files</div>
                  </div>
                </div>
              </div>
              <div className="content-manager-item">
                <div className="nav-item-inner">
                  <div className="content-manager-icon">
                    <div className="content-manager-icon-rect" />
                  </div>
                  <div className="nav-text-manrope">Content Manager</div>
                </div>
              </div>
            </div>
          </div>
          <div className="logout-section">
            <div className="logout-content">
              <div className="logout-icon-1" />
              <div className="logout-icon-2" />
              <div className="logout-icon-3" />
              <div className="logout-text">Logout</div>
            </div>
          </div>
        </div>
        <div className="dashboard-header">
          <div className="dashboard-title">Dashboard</div>
          <div className="header-actions">
            <div className="search-box">
              <div className="search-icon">search</div>
              <div className="search-text">Search</div>
            </div>
            <div className="notification-section">
              <div className="notification-button">
                <div className="notification-icon">
                  <div className="notification-bell" />
                  <div className="notification-badge" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="main-content">
          <div className="content-wrapper">
            <div className="content-header">
              <div className="page-header">
                <div className="page-icon">file</div>
                <div className="page-title">All Users</div>
              </div>
              <div className="filters-section">
                <div className="filters-row">
                  <div className="search-filter">
                    <div className="search-filter-icon">
                      <div className="search-filter-icon-path" />
                    </div>
                    <div className="search-filter-text">Search</div>
                  </div>
                  <div className="dropdown-filters">
                    <div className="dropdown-filter">
                      <div className="dropdown-filter-text">Profession</div>
                      <div className="dropdown-filter-icon">
                        <div className="dropdown-filter-arrow" />
                      </div>
                    </div>
                    <div className="dropdown-filter">
                      <div className="dropdown-filter-text">Status</div>
                      <div className="dropdown-filter-icon">
                        <div className="dropdown-filter-arrow" />
                      </div>
                    </div>
                  </div>
                  <div className="add-candidate-button">
                    <div className="add-candidate-icon">
                      <div className="add-candidate-icon-path" />
                    </div>
                    <div className="add-candidate-text">Add a Candidate</div>
                  </div>
                </div>
              </div>
            </div>
            {/* Table Header */}
            <div className="table-header">
              <div className="table-header-row">
                <div className="table-header-container">
                  {columns.map((column) => (
                    <div key={column.key} className="table-header-cell" style={{ width: column.width }}>
                      <div className="table-header-cell-content">
                        <div className={column.key === 'stateRegistration' ? 'table-header-text-alt' : column.key === 'action' ? 'table-header-action' : 'table-header-text'}>
                          {column.label}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          {/* Table Body - Optimized */}
          <div className="table-body">
            {tableData.map((row, index) => (
              <React.Fragment key={index}>
                <div className="table-row">
                  {columns.map((column) => (
                    <div key={column.key} className="table-cell" style={{ width: column.width }}>
                      <div className="table-cell-content">
                        {column.key === 'action' ? (
                          <div className="view-link">View</div>
                        ) : (
                          <div className="table-cell-text">
                            {row[column.key as keyof typeof row]}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {index < tableData.length - 1 && <div className="table-divider"></div>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default AllUsers;
