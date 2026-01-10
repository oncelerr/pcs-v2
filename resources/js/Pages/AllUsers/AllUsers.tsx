import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './AllUsers.css'
import { COUNTRIES } from '../../data/countries';
import LoadingSpinner from '../../Components/LoadingSpinner';
import ConfirmationModal from '../../Components/ConfirmationModal';
import UserDetailsModal from '../../Components/UserDetailsModal';
import AddCandidateModal from '../../Components/AddCandidateModal/AddCandidateModal';
import CompleteProfileModal from '../Dashboard/Components/CompleteProfileModal/CompleteProfileModal';

// Function to generate a random password in the format PCS-XXXXXX
function generateRandomPassword(): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let result = 'PCS-';
  
  // Generate 6 random characters
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  return result;
}

// Define interface for user information
interface UserInformation {
  id: number;
  company_name: string;
  first_name: string;
  last_name: string;
  company_designator: string;
  state_registration: string;
  franchise?: string;
  irs?: string;
}

// Define interface for pagination data
interface PaginationData {
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
  from: number;
  to: number;
}

const AllUsers: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // State for user data and loading status
  const [userData, setUserData] = useState<UserInformation[]>([]);
  const [addCandidateModal, setAddCandidateModal] = useState<boolean>(false);
  const [showCompleteProfileModal, setShowCompleteProfileModal] = useState<boolean>(false);
  const [newCandidateData, setNewCandidateData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal state
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'confirm' as 'confirm' | 'success' | 'error' | 'info',
    onConfirm: () => {}
  });
  
  // User details modal state
  const [userDetailsModal, setUserDetailsModal] = useState({
    isOpen: false,
    userData: null as UserInformation | null
  });
  
  // Pagination state
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    per_page: 10,
    current_page: 1,
    last_page: 1,
    from: 0,
    to: 0
  });
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Function to fetch user data with pagination
  const fetchUserData = async () => {
    setLoading(true);
    try {
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      
      const params = new URLSearchParams({
        page: pagination.current_page.toString(),
        per_page: pagination.per_page.toString(),
        sort_by: 'created_at',
        sort_order: 'desc'
      });
      
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      
      if (filterStatus) {
        params.append('company_type', filterStatus);
      }
      
      const response = await fetch(`/api/user-information?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken || '',
          'X-Requested-With': 'XMLHttpRequest',
        },
        credentials: 'same-origin'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch user data: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        setUserData(result.data);
        setPagination(result.pagination);
      } else {
        throw new Error(result.message || 'Failed to fetch user data');
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  // Effect to fetch data when pagination, search, or filter changes
  useEffect(() => {
    fetchUserData();
  }, [pagination.current_page, pagination.per_page, searchTerm, filterStatus]);
  
  // Handle page changes
  const handlePageChange = (pageNumber: number) => {
    setPagination(prev => ({ ...prev, current_page: pageNumber }));
  };
  
  // Handle items per page change
  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPerPage = Number(e.target.value);
    setPagination(prev => ({ ...prev, per_page: newPerPage, current_page: 1 }));
  };
  
  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPagination(prev => ({ ...prev, current_page: 1 }));
  };
  
  // Handle filter change
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterStatus(e.target.value);
    setPagination(prev => ({ ...prev, current_page: 1 }));
  };
  
  // Handle Add Candidate submission
  const handleAddCandidate = async (candidateData: { name: string; email: string }) => {
    try {
      setLoading(true);
      
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      
      const response = await fetch('/api/addcan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken || '',
          'X-Requested-With': 'XMLHttpRequest',
        },
        credentials: 'same-origin',
        body: JSON.stringify({
          name: candidateData.name,
          email: candidateData.email,
          password: 'password',
          password_confirmation: 'password',
          agree_terms: true
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add candidate');
      }
      
      const result = await response.json();
      
      // Check if registration was successful (handle both message formats)
      if (result.message && result.message.includes('Registration successful') || result.user) {
        // Close Add Candidate Modal
        setAddCandidateModal(false);
        
        // Store candidate data for CompleteProfileModal
        setNewCandidateData({
          name: candidateData.name,
          email: candidateData.email,
          userId: result.user?.id || result.user_id
        });
        
        // Open Complete Profile Modal
        setShowCompleteProfileModal(true);
        
        // Show success message
        setModalState({
          isOpen: true,
          title: 'Success',
          message: 'Candidate added successfully. Please complete their profile.',
          type: 'success',
          onConfirm: () => setModalState(prev => ({ ...prev, isOpen: false }))
        });
      } else {
        throw new Error('Unexpected response from server');
      }
    } catch (err) {
      console.error('Error adding candidate:', err);
      setModalState({
        isOpen: true,
        title: 'Error',
        message: err instanceof Error ? err.message : 'Failed to add candidate',
        type: 'error',
        onConfirm: () => setModalState(prev => ({ ...prev, isOpen: false }))
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Handle Complete Profile Modal close
  const handleCompleteProfileClose = () => {
    setShowCompleteProfileModal(false);
    setNewCandidateData(null);
    // Refresh user list
    fetchUserData();
  };
  
  // Action dropdown state
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
  
  // Reference for dropdown menu
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  
  // Toggle dropdown visibility
  const toggleDropdown = (userId: number) => {
    setActiveDropdown(activeDropdown === userId ? null : userId);
  };
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Handle action selection
  const handleAction = (action: string, userId: number) => {
    setActiveDropdown(null);
    
    switch (action) {
      case 'view':
        const selectedUser = userData.find(user => user.id === userId);
        if (selectedUser) {
          setUserDetailsModal({
            isOpen: true,
            userData: selectedUser
          });
        } else {
          setModalState({
            isOpen: true,
            title: 'Error',
            message: 'User details not found',
            type: 'error',
            onConfirm: () => setModalState(prev => ({ ...prev, isOpen: false }))
          });
        }
        break;
      case 'resetPassword':
        setModalState({
          isOpen: true,
          title: 'Reset Password',
          message: 'Are you sure you want to reset the password for this user?',
          type: 'confirm',
          onConfirm: () => {
            setLoading(true);
            
            const randomPassword = generateRandomPassword();
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            
            fetch(`/api/reset-password/${userId}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken || '',
                'X-Requested-With': 'XMLHttpRequest',
              },
              body: JSON.stringify({ password: randomPassword }),
              credentials: 'same-origin'
            })
            .then(response => {
              if (!response.ok) {
                throw new Error(`Failed to reset password: ${response.statusText}`);
              }
              return response.json();
            })
            .then(data => {
              setLoading(false);
              
              if (data.success) {
                navigator.clipboard.writeText(randomPassword).then(() => {
                  setModalState({
                    isOpen: true,
                    title: 'Password Reset',
                    message: `New password has been generated and saved: <strong>${randomPassword}</strong><br/><span style="font-size: 14px; color: #16a34a; margin-top: 5px; display: block;">✓ Copied to clipboard</span>`,
                    type: 'success',
                    onConfirm: () => {
                      setModalState(prev => ({ ...prev, isOpen: false }));
                    }
                  });
                }).catch(err => {
                  console.error('Could not copy password to clipboard:', err);
                  setModalState({
                    isOpen: true,
                    title: 'Password Reset',
                    message: `New password has been generated and saved: <strong>${randomPassword}</strong><br/><span style="font-size: 14px; color: #dc2626; margin-top: 5px; display: block;">❌ Failed to copy to clipboard</span>`,
                    type: 'success',
                    onConfirm: () => {
                      setModalState(prev => ({ ...prev, isOpen: false }));
                    }
                  });
                });
              } else {
                throw new Error(data.message || 'Failed to reset password');
              }
            })
            .catch(err => {
              setLoading(false);
              console.error('Error resetting password:', err);
              
              setModalState({
                isOpen: true,
                title: 'Error',
                message: `Failed to reset password: ${err instanceof Error ? err.message : 'Unknown error'}`,
                type: 'error',
                onConfirm: () => setModalState(prev => ({ ...prev, isOpen: false }))
              });
            });
          }
        });
        break;
      case 'delete':
        setModalState({
          isOpen: true,
          title: 'Confirm Deletion',
          message: 'Are you sure you want to delete this user? This will remove all their information from the system and cannot be undone.',
          type: 'confirm',
          onConfirm: () => {
            setLoading(true);
            
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            
            fetch(`/api/user-information/${userId}`, {
              method: 'DELETE',
              headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken || '',
                'X-Requested-With': 'XMLHttpRequest',
              },
              credentials: 'same-origin'
            })
            .then(response => {
              if (!response.ok) {
                throw new Error(`Failed to delete user: ${response.statusText}`);
              }
              return response.json();
            })
            .then(data => {
              if (data.success) {
                setModalState({
                  isOpen: true,
                  title: 'Success',
                  message: 'User and all related information has been successfully deleted.',
                  type: 'success',
                  onConfirm: () => {
                    setModalState(prev => ({ ...prev, isOpen: false }));
                    fetchUserData();
                  }
                });
              } else {
                throw new Error(data.message || 'Failed to delete user');
              }
            })
            .catch(err => {
              console.error('Error deleting user:', err);
              setError(err instanceof Error ? err.message : 'An unknown error occurred while deleting the user');
              
              setModalState({
                isOpen: true,
                title: 'Error',
                message: err instanceof Error ? err.message : 'Failed to delete user',
                type: 'error',
                onConfirm: () => setModalState(prev => ({ ...prev, isOpen: false }))
              });
            })
            .finally(() => {
              setLoading(false);
            });
          }
        });
        break;
      default:
        break;
    }
  };

  // Go to previous page
  const goToPrevPage = () => {
    if (pagination.current_page > 1) {
      handlePageChange(pagination.current_page - 1);
    }
  };
  
  // Go to next page
  const goToNextPage = () => {
    if (pagination.current_page < pagination.last_page) {
      handlePageChange(pagination.current_page + 1);
    }
  };

  // Handle modal cancel action
  const handleModalCancel = () => {
    setModalState(prev => ({ ...prev, isOpen: false }));
  };
  
  // Handle closing the user details modal
  const handleCloseUserDetailsModal = () => {
    setUserDetailsModal(prev => ({ ...prev, isOpen: false }));
  };
  
  return (
    <div className="all-users-container">
      {/* Confirmation Modal */}
      <ConfirmationModal 
        isOpen={modalState.isOpen}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
        onConfirm={modalState.onConfirm}
        onCancel={handleModalCancel}
      />
      
      {/* User Details Modal */}
      <UserDetailsModal
        isOpen={userDetailsModal.isOpen}
        userData={userDetailsModal.userData}
        onClose={handleCloseUserDetailsModal}
      />
      
      {/* Add Candidate Modal */}
      {addCandidateModal && (
        <AddCandidateModal 
          onClose={() => setAddCandidateModal(false)}
          onSubmit={handleAddCandidate}
        />
      )}
      
      {/* Complete Profile Modal */}
      {showCompleteProfileModal && newCandidateData && (
        <CompleteProfileModal 
          onClose={handleCompleteProfileClose}
          candidateUserId={newCandidateData.userId}
        />
      )}
    
      <div className="personal-deets-cont">
        <div className="personal-deets-header">
          <img className="personal-deets-header-img" src="/assets/paper-icon.png" alt="" />
          <h3 className="h3-title">All User Registered</h3>
        </div>
        <div className="tool-bar">
          <input 
            className="search-bar" 
            type="text"
            placeholder="Search by name, company, or email" 
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <select 
            className="dropdown-bar" 
            value={filterStatus}
            onChange={handleFilterChange}
          >
            <option value="">All Types</option>
            <option value="llc">LLC</option>
            <option value="corporation">Corporation</option>
            <option value="nonprofit">Non-profit</option>
          </select>
          <input className="status-bar" type="text" placeholder="Status" />
          <button className="add-candidate" onClick={() => setAddCandidateModal(true)}>Add Candidate</button>
        </div>
        <table className="all-users-table">
          <thead>
            <tr>
              <th>Company Name</th>
              <th>Full Name</th>
              <th>Company Designator</th>
              <th>State Registration</th>
              <th>Franchise</th>
              <th>IRS</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '20px' }}>
                  <LoadingSpinner size="small" color="#126654" />
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '20px', color: 'red' }}>{error}</td>
              </tr>
            ) : userData.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '20px' }}>No user data found</td>
              </tr>
            ) : (
              userData.map((user, index) => (
                <tr key={user.id || index}>
                  <td>{user.company_name}</td>
                  <td>{`${user.first_name} ${user.last_name}`}</td>
                  <td>{user.company_designator}</td>
                  <td>{user.state_registration}</td>
                  <td>{user.franchise || '04/11/2023'}</td>
                  <td>{user.irs || '04/11/2023'}</td>
                  <td className="action-dropdown-cell">
                    <div className="action-dropdown" ref={activeDropdown === user.id ? dropdownRef : null}>
                      <button 
                        className="action-dropdown-toggle" 
                        data-dropdown-id={user.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleDropdown(user.id);
                        }}
                      >
                        Actions ▼
                      </button>
                      {activeDropdown === user.id && (
                        <div className="action-dropdown-menu" style={{ 
                          position: 'absolute',
                          top: '100%',
                          right: 0,
                          zIndex: 1000,
                          marginTop: '5px'
                        }}>
                          <button onClick={() => handleAction('view', user.id)}>View</button>
                          <button onClick={() => handleAction('resetPassword', user.id)}>Reset Password</button>
                          <button onClick={() => handleAction('delete', user.id)} className="delete-action">Delete</button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        
        {/* Pagination Controls */}
        <div className="pagination-container">
          <div className="pagination-info">
            {loading ? 'Loading...' : 
              `Showing ${pagination.from || 0} to ${pagination.to || 0} of ${pagination.total} entries`
            }
          </div>
          
          <div className="pagination-controls">
            <button 
              className={`pagination-button ${pagination.current_page === 1 ? 'disabled' : ''}`}
              onClick={goToPrevPage}
              disabled={pagination.current_page === 1 || loading}
            >
              Previous
            </button>
            
            {(() => {
              const currentPage = pagination.current_page;
              const lastPage = pagination.last_page;
              const delta = 2;
              
              let pages = [];
              
              pages.push(1);
              
              const rangeStart = Math.max(2, currentPage - delta);
              const rangeEnd = Math.min(lastPage - 1, currentPage + delta);
              
              if (rangeStart > 2) {
                pages.push('ellipsis-start');
              }
              
              for (let i = rangeStart; i <= rangeEnd; i++) {
                pages.push(i);
              }
              
              if (rangeEnd < lastPage - 1) {
                pages.push('ellipsis-end');
              }
              
              if (lastPage > 1) {
                pages.push(lastPage);
              }
              
              return pages.map((page, index) => {
                if (page === 'ellipsis-start' || page === 'ellipsis-end') {
                  return (
                    <span key={page} className="pagination-ellipsis">
                      &hellip;
                    </span>
                  );
                }
                
                return (
                  <button
                    key={`page-${page}`}
                    className={`pagination-number ${currentPage === page ? 'active' : ''}`}
                    onClick={() => handlePageChange(page as number)}
                    disabled={loading}
                  >
                    {page}
                  </button>
                );
              });
            })()}
            
            <button 
              className={`pagination-button ${pagination.current_page === pagination.last_page ? 'disabled' : ''}`}
              onClick={goToNextPage}
              disabled={pagination.current_page === pagination.last_page || loading}
            >
              Next
            </button>
          </div>
          
          <div className="items-per-page">
            <label htmlFor="itemsPerPage">Items per page:</label>
            <select 
              id="itemsPerPage" 
              value={pagination.per_page} 
              onChange={handleItemsPerPageChange}
              className="items-per-page-select"
              disabled={loading}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllUsers;