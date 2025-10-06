import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import './Dashboard.css';
import CompleteProfileModal from '../../Components/CompleteProfileModal';
import CompletePaymentModal from '../../Components/CompletePaymentModal';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { getStatusProgress } from './Components/StatusProgress';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

// Define types
type StageItemStatus = 'completed' | 'active' | 'pending';

type StageItem = {
  name: string;
  status: StageItemStatus;
};

type Stage = {
  name: string;
  status: StageItemStatus;
  items: StageItem[];
};

type StatusProgress = {
  stages: Stage[];
  percentage: number;
};

// Define user stats type for admin dashboard
type UserStats = {
  completed: number;
  ongoing: number;
  unprocessed: number;
  total: number;
};

type DocumentRowProps = {
  number: number;
  fileName: string;
  stage: string;
  onDownload: (fileName: string) => void;
};

const DocumentRow: React.FC<DocumentRowProps> = ({ number, fileName, stage, onDownload }) => (
  <>
    <div className="table-row">
      <div style={{ color: '#474747', fontSize: 14, fontWeight: 400 }}>{number}</div>
      <div style={{ color: '#474747', fontSize: 14, fontWeight: 400 }}>{fileName}</div>
      <div className="badge">{stage}</div>
      <div className="action-link" onClick={() => onDownload(fileName)}>Download</div>
    </div>
    <div className="table-divider" />
  </>
);

type ListItemProps = {
  title: string;
  subtitle?: string;
  onAction: () => void;
};

const ListItem: React.FC<ListItemProps> = ({ title, subtitle, onAction }) => (
  <>
    <div className="list-item">
      <div className="list-item__content">
        <div className="list-item__title">{title}</div>
        {subtitle && <div className="list-item__subtitle">{subtitle}</div>}
      </div>
      <div className="action-link" onClick={onAction}>View Details</div>
    </div>
    <div className="table-divider" />
  </>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, hasRole } = useAuth();
  const [showPaymentSuccessModal, setShowPaymentSuccessModal] = useState(false);
  const [showPaymentErrorModal, setShowPaymentErrorModal] = useState(false);
  const [paymentErrorMessage, setPaymentErrorMessage] = useState('');

  // Check if user is admin
  const isAdmin = hasRole('Admin');
  const [userStats, setUserStats] = useState<UserStats>({
    completed: 0,
    ongoing: 0,
    unprocessed: 0,
    total: 0
  });
  const [loadingStats, setLoadingStats] = useState<boolean>(false);

  // 👇 Local state instead of hardcoded IIFE
  const [statusProgress, setStatusProgress] = useState<StatusProgress>({
    stages: [],
    percentage: 0,
  });

  const CACHE_KEY = 'statusProgress';
  const CACHE_EXPIRY = 1000 * 60 * 60; // 1 hour

  // Function to fetch user statistics for admin dashboard
  const fetchUserStats = async () => {
    if (!isAdmin) return;

    setLoadingStats(true);
    try {
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

      const response = await fetch('/api/user-information', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken || '',
          'X-Requested-With': 'XMLHttpRequest',
        },
        credentials: 'same-origin'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user information');
      }

      const allUsers = await response.json();

      // Fetch compliance users
      const complianceResponse = await fetch('/api/compliance-user', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken || '',
          'X-Requested-With': 'XMLHttpRequest',
        },
        credentials: 'same-origin'
      });

      if (!complianceResponse.ok) {
        throw new Error('Failed to fetch compliance users');
      }

      const complianceData = await complianceResponse.json();
      const complianceUsers = complianceData.data || [];

      // Calculate statistics
      const totalUsers = allUsers.data ? allUsers.data.length : 0;
      const completedUsers = complianceUsers.filter((user: { process_status: string }) => user.process_status === 'done').length;
      const ongoingUsers = complianceUsers.filter((user: { process_status: string }) => user.process_status !== 'done').length;
      const unprocessedUsers = totalUsers - complianceUsers.length;

      setUserStats({
        completed: completedUsers,
        ongoing: ongoingUsers,
        unprocessed: unprocessedUsers,
        total: totalUsers
      });
    } catch (error) {
      console.error('Error fetching user statistics:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    // Debug isAdmin flag
    console.log('isAdmin value:', isAdmin);
    console.log('user object:', user);

    // Fetch user stats if admin
    if (isAdmin) {
      console.log('Fetching user stats for admin');
      fetchUserStats();
    }
  }, [isAdmin, user, hasRole]);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_EXPIRY) {
            setStatusProgress(data);
            return;
          }
        }

        const data = await getStatusProgress();
        setStatusProgress(data);

        localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
      } catch (err) {
        console.error("Failed to load progress:", err);
      }
    };

    fetchProgress();
  }, []);

  // Handle payment success
  useEffect(() => {
    const handlePaymentSuccess = async () => {
      const urlParams = new URLSearchParams(location.search);
      const status = urlParams.get('status');
      const sessionId = urlParams.get('session_id');

      console.log('Payment success check:', { status, sessionId, userId: user?.id });

      if (status === 'success' && sessionId && user?.id) {
        try {
          console.log('Processing payment success:', { sessionId, userId: user.id });

          // Get CSRF token
          const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

          const requestData = {
            session_id: sessionId,
            user_id: user.id
          };

          console.log('Sending payment success request:', requestData);

          const response = await fetch('/api/payment-success', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-CSRF-TOKEN': csrfToken || '',
              'X-Requested-With': 'XMLHttpRequest',
            },
            credentials: 'same-origin',
            body: JSON.stringify(requestData),
          });

          if (response.ok) {
            const result = await response.json();
            console.log('Payment success processed:', result);

            // Clear the status progress cache to force refresh
            localStorage.removeItem(CACHE_KEY);

            // Refresh the progress data
            const data = (await getStatusProgress()) as StatusProgress;
            setStatusProgress(data);
            localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));

            // Clean up URL parameters
            const newUrl = window.location.pathname;
            window.history.replaceState({}, document.title, newUrl);

            // Show success modal
            setShowPaymentSuccessModal(true);

            // Auto-hide success modal after 3 seconds
            setTimeout(() => {
              setShowPaymentSuccessModal(false);
            }, 3000);
          } else {
            const errorData = await response.json();
            console.error('Failed to process payment success:', errorData);

            // Show error modal instead of alert
            setPaymentErrorMessage(errorData.error || 'Unknown error');
            setShowPaymentErrorModal(true);

            // Auto-hide error modal after 5 seconds
            setTimeout(() => {
              setShowPaymentErrorModal(false);
            }, 5000);
          }
        } catch (error) {
          console.error('Error processing payment success:', error);
        }
      }
    };

    handlePaymentSuccess();
  }, [location.search, user?.id, CACHE_KEY]);

  // State for formation documents
  const [formationDocuments, setFormationDocuments] = useState<Array<{
    id: number;
    fileName: string;
    stage: string;
    file_path?: string;
    naming?: string;
  }>>([]);
  const [loadingDocuments, setLoadingDocuments] = useState<boolean>(false);

  // Pagination state for formation documents
  const [currentPage, setCurrentPage] = useState<number>(1);
  const documentsPerPage: number = 3;

  // Function to fetch formation documents from client_compliance_files table
  const fetchFormationDocuments = async () => {
    if (!user?.id) return;

    setLoadingDocuments(true);
    try {
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

      // Fetch documents from client_compliance_files for the current user
      const response = await fetch(`/api/compliance-files/user/${user.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken || '',
          'X-Requested-With': 'XMLHttpRequest',
        },
        credentials: 'same-origin'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch formation documents');
      }

      const result = await response.json();
      const files = result.data || [];

      // Filter for formation document types
      const formationTypes = [
        'state_registration_status',
        'bio_filing_status',
        'ein_filing_status',
        'bank_registration_status'
      ];

      const formationFiles = files
        .filter((file: any) => formationTypes.includes(file.column_for))
        .map((file: any, index: number) => ({
          id: file.id || index + 1,
          fileName: file.naming || file.file_name,
          stage: formatStageLabel(file.column_for),
          file_path: file.file_path || '',
          naming: file.naming
        }));

      setFormationDocuments(formationFiles);
    } catch (error) {
      console.error('Error fetching formation documents:', error);
    } finally {
      setLoadingDocuments(false);
    }
  };

  // Helper function to format column names for display
  const formatStageLabel = (columnName: string): string => {
    switch (columnName) {
      case 'state_registration_status':
        return 'State Registration';
      case 'bio_filing_status':
        return 'BIO Filing';
      case 'ein_filing_status':
        return 'EIN Filing';
      case 'bank_registration_status':
        return 'Bank Registration';
      default:
        return columnName.replace('_status', '').split('_').map(word =>
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }
  };

  // Pagination functions
  const getTotalPages = (): number => {
    return Math.ceil(formationDocuments.length / documentsPerPage);
  };

  const getCurrentPageDocuments = () => {
    const indexOfLastDocument = currentPage * documentsPerPage;
    const indexOfFirstDocument = indexOfLastDocument - documentsPerPage;
    return formationDocuments.slice(indexOfFirstDocument, indexOfLastDocument);
  };

  const handlePageChange = (pageNumber: number): void => {
    // Ensure page number is within valid range
    const totalPages = getTotalPages();
    if (pageNumber < 1) {
      setCurrentPage(1);
    } else if (pageNumber > totalPages) {
      setCurrentPage(totalPages);
    } else {
      setCurrentPage(pageNumber);
    }
  };

  // Fetch formation documents when component mounts or user changes
  useEffect(() => {
    if (user?.id) {
      fetchFormationDocuments();
    }
  }, [user?.id]);

  // Reset to first page when documents change
  useEffect(() => {
    setCurrentPage(1);
  }, [formationDocuments.length]);

  const additionalServices = [
    { id: 1, fileName: 'CSTF Mandatory Training Certificate', validFrom: '10/11/2022', expiry: '10/11/2023' },
    { id: 2, fileName: 'Fit to Work Annual Certificate', validFrom: '10/11/2022', expiry: '10/11/2023' },
    { id: 3, fileName: 'CSTF Mandatory Training Certificate', validFrom: '10/11/2022', expiry: '10/11/2023' }
  ];

  // State for tax information
  const [taxes, setTaxes] = useState<Array<{
    id: number;
    title: string;
    date: string;
  }>>([]);
  const [loadingTaxes, setLoadingTaxes] = useState<boolean>(false);

  // Function to fetch tax information from compliance_users table
  const fetchTaxInformation = async () => {
    if (!user?.id) return;

    setLoadingTaxes(true);
    try {
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

      // First check if compliance user exists for this user
      const checkResponse = await fetch(`/api/compliance-user?user_id=${user.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken || '',
          'X-Requested-With': 'XMLHttpRequest',
        },
        credentials: 'same-origin'
      });

      if (!checkResponse.ok) {
        throw new Error('Failed to check compliance user');
      }

      const checkResult = await checkResponse.json();
      const complianceUsers = checkResult.data || [];

      console.log('Compliance users found:', complianceUsers);

      // If no compliance user exists, set empty taxes
      if (!complianceUsers.length) {
        console.log('No compliance user found for this user');
        setTaxes([]);
        return;
      }

      // Get the first compliance user (there should only be one per user)
      const complianceUserId = complianceUsers[0].id;

      // Fetch specific compliance user data
      const response = await fetch(`/api/compliance-user/${complianceUserId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken || '',
          'X-Requested-With': 'XMLHttpRequest',
        },
        credentials: 'same-origin'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tax information');
      }

      const result = await response.json();
      const complianceUser = result.data;

      console.log('Compliance user details:', complianceUser);

      // Format tax dates for display
      const taxItems = [];

      if (complianceUser?.annual_franchise_tax) {
        taxItems.push({
          id: 1,
          title: 'Annual Franchise Tax Due',
          date: formatDate(complianceUser.annual_franchise_tax)
        });
      }

      if (complianceUser?.annual_irs_tax) {
        taxItems.push({
          id: 2,
          title: 'IRS Annual Tax Return Due',
          date: formatDate(complianceUser.annual_irs_tax)
        });
      }

      setTaxes(taxItems);
    } catch (error) {
      console.error('Error fetching tax information:', error);
      setTaxes([]); // Set empty taxes on error
    } finally {
      setLoadingTaxes(false);
    }
  };

  // Helper function to format date string
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return dateString; // Return original string if parsing fails
    }
  };

  useEffect(() => {
    console.log(user?.id)
    if (user?.id) {
      fetchTaxInformation();
    }
  }, [user?.id]);

  const userDocuments = [
    { id: 1, title: 'IRS Annual Tax Return (2025)' },
    { id: 2, title: 'Franchise Tax Notice' },
    { id: 3, title: 'Mail Forwarding Receipt' }
  ];

  const mailForwarding = [
    { id: 1, title: 'IRS Letter - July 2025' },
    { id: 2, title: 'Bank Statement - June 2025' },
    { id: 3, title: 'Franchise Tax Notice (scanned)' },
    { id: 4, title: 'Compliance Notice - State' }
  ];

  // Show blocking modal when a Stage Item named "Profile Setup" is active
  const hasActiveProfileSetup = statusProgress.stages.some((stage) =>
    stage.items.some((item) => item.name === 'Profile Setup' && item.status === 'active')
  );

  const hasActivePayment = statusProgress.stages.some((stage) =>
    stage.items.some((item) => item.name === 'Payment' && item.status === 'active')
  );

  const handleDownload = (filePath: string) => {
    console.log('Downloading:', filePath);

    // If filePath is a relative path, convert to absolute URL
    if (filePath && !filePath.startsWith('http')) {
      // Assuming files are stored in storage/app/public and accessible via /storage
      const fileUrl = `/storage/${filePath}`;

      // Create a temporary link element
      const link = document.createElement('a');
      link.href = fileUrl;
      link.target = '_blank';
      link.download = filePath.split('/').pop() || 'document';

      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (filePath && filePath.startsWith('http')) {
      // If it's already a full URL, open in new tab
      window.open(filePath, '_blank');
    } else {
      console.error('Invalid file path:', filePath);
      alert('File not available for download');
    }
  };

  const handleViewDetails = (item: any) => {
    console.log('View details:', item);
  };

  const handleLogout = () => {
    console.log('Logging out...');
  };

  // Create a pie chart data from user stats
  const createPieChartData = () => {
    return {
      labels: ['Completed', 'Ongoing', 'Unprocessed'],
      datasets: [
        {
          data: [userStats.completed, userStats.ongoing, userStats.unprocessed],
          backgroundColor: ['#4CAF50', '#FFC107', '#F44336'],
          borderColor: ['#388E3C', '#FFB300', '#D32F2F'],
          borderWidth: 1,
        },
      ],
    };
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          font: {
            family: '"DM Sans", sans-serif',
            size: 14
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = userStats.total;
            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    }
  };

  // Modal component
  interface ModalProps {
    modalType: 'success' | 'error';
    paymentErrorMessage?: string;
    setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  }

  const Modal: React.FC<ModalProps> = ({ modalType, paymentErrorMessage, setShowModal }) => {
    if (modalType === 'success') {
      return (
        <div className="modal-overlay">
          <div className="success-modal">
            <div className="success-icon">
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="32" cy="32" r="32" fill="#106552" />
                <path d="M20 32L28 40L44 24" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3 className="success-title">Payment Successful!</h3>
            <p className="success-message">Your payment has been processed and your stages have been updated.</p>
            <div className="success-actions">
              <button className="success-button" onClick={() => setShowModal(false)}>Close</button>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="modal-overlay">
          <div className="error-modal">
            <div className="error-icon">
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="32" cy="32" r="32" fill="#F44336" />
                <path d="M32 20V36" stroke="white" strokeWidth="4" strokeLinecap="round" />
                <circle cx="32" cy="44" r="2" fill="white" />
              </svg>
            </div>
            <h3 className="error-title">Payment Error</h3>
            <p className="error-message">{paymentErrorMessage || 'An error occurred while processing your payment.'}</p>
            <div className="error-actions">
              <button className="error-button" onClick={() => setShowModal(false)}>Close</button>
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="dashboard-container">
      {showPaymentSuccessModal && <Modal modalType="success" paymentErrorMessage={paymentErrorMessage} setShowModal={setShowPaymentSuccessModal} />}
      {showPaymentErrorModal && <Modal modalType="error" paymentErrorMessage={paymentErrorMessage} setShowModal={setShowPaymentErrorModal} />}
      {/* Blocking Modal for Active Profile Setup - Only show for non-admin users */}
      {hasActiveProfileSetup && !isAdmin && (
        <CompleteProfileModal />
      )}
      {/* Blocking Modal for Active Payment - Only show for non-admin users */}
      {hasActivePayment && !isAdmin && (
        <CompletePaymentModal />
      )}
      {/* Main Content */}
      <div className="content-grid">
        <div className="content-left">
          {/* Status Progress Card */}
          <div className="card">
            <div className="card__header">
              <div className="card__header-icon">📄</div>
              <div className="card__header-title">{isAdmin ? 'User Statistics' : 'Status Progress'}</div>
            </div>
            <div className="card__body">
              {/* Debug rendering */}
              {isAdmin ? (
                // Admin view - Show pie chart
                <div className="admin-stats">
                  {loadingStats ? (
                    <div className="loading-stats">Loading user statistics...</div>
                  ) : (
                    <div className="stats-container">
                      <div className="pie-chart-container" style={{ height: '300px', width: '100%' }}>
                        <Pie data={createPieChartData()} options={chartOptions} />
                      </div>
                      <div className="stats-summary">
                        <div className="stats-item">
                          <div className="stats-label">Total Users:</div>
                          <div className="stats-value">{userStats.total}</div>
                        </div>
                        <div className="stats-item">
                          <div className="stats-label">Completed:</div>
                          <div className="stats-value">{userStats.completed}</div>
                        </div>
                        <div className="stats-item">
                          <div className="stats-label">Ongoing:</div>
                          <div className="stats-value">{userStats.ongoing}</div>
                        </div>
                        <div className="stats-item">
                          <div className="stats-label">Unprocessed:</div>
                          <div className="stats-value">{userStats.unprocessed}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                // Regular user view - Show status progress
                <div className="status-progress">
                  <div className="status-icons">
                    {statusProgress.stages.map((stage, idx) => (
                      <div key={idx} className={`status-icon status-icon--${stage.status}`}>
                        {stage.status === 'completed' ? (
                          <img src={`/assets/${stage.name}-${stage.status}.png`} alt="Completed" />
                        ) : stage.status === 'active' ? (
                          <img src={`/assets/${stage.name}-${stage.status}.png`} alt="In Progress" />
                        ) : (
                          <img src={`/assets/${stage.name}-${stage.status}.png`} alt="Pending" />
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="progress-bar">
                    <div className="progress-bar__fill" style={{ width: `${statusProgress.percentage}%` }} />
                  </div>
                  <div className="status-stages">
                    {statusProgress.stages.map((stage, idx) => (
                      <div key={idx} className={`stage-card stage-card--${stage.status}`}>
                        <div className={`stage-card__title__${stage.status}`}>{stage.name}</div>
                        {stage.items.map((item, itemIdx) => (
                          <div key={itemIdx}>
                            <div className={`stage-item stage-item--${item.status}`}>
                              <div className={`stage-item__indicator stage-item__indicator--${item.status}`} />
                              <div className="stage-item__text">{item.name}</div>
                            </div>
                            {item.status === 'active' && (
                              <div className="current-status">Current Status</div>
                            )}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Formation Documents Card */}
          <div className="card">
            <div className="card__header">
              <div className="card__header-icon">📄</div>
              <div className="card__header-title">Formation Documents</div>
            </div>
            <div className="table-header">
              <div className="table-header__col">No.</div>
              <div className="table-header__col" style={{ width: 168 }}>File Name</div>
              <div className="table-header__col" style={{ width: 141 }}>Stage Process</div>
              <div className="table-header__col" style={{ width: 77 }}>Action</div>
            </div>
            <div style={{ padding: '24px 0' }}>
              {loadingDocuments ? (
                <div className="loading-documents">
                  <p style={{ textAlign: 'center', padding: '20px' }}>Loading documents...</p>
                </div>
              ) : formationDocuments.length > 0 ? (
                <>
                  {/* Current page documents */}
                  {getCurrentPageDocuments().map((doc, idx) => (
                    <DocumentRow
                      key={doc.id}
                      number={(currentPage - 1) * documentsPerPage + idx + 1}
                      fileName={doc.fileName}
                      stage={doc.stage}
                      onDownload={() => handleDownload(doc.file_path || doc.fileName)}
                    />
                  ))}

                  {/* Pagination controls */}
                  <div className="pagination-controls">
                    <button
                      className="pagination-button"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </button>
                    <span className="pagination-info">
                      Page {currentPage} of {getTotalPages()}
                    </span>
                    <button
                      className="pagination-button"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage >= getTotalPages()}
                    >
                      Next
                    </button>
                  </div>
                </>
              ) : (
                <div className="no-documents">
                  <p style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                    No formation documents found.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Additional Service Document Card */}
          <div className="card">
            <div className="card__header">
              <div className="card__header-icon">📄</div>
              <div className="card__header-title">Additional Service Document</div>
            </div>
            <div className="table-header">
              <div className="table-header__col" style={{ width: 241 }}>File Name</div>
              <div className="table-header__col">Valid From</div>
              <div className="table-header__col" style={{ width: 69 }}>Expiry</div>
              <div className="table-header__col">Action</div>
            </div>
            <div style={{ padding: '24px 32px' }}>
              {additionalServices.map((service, idx) => (
                <React.Fragment key={service.id}>
                  <div className="table-row" style={{ padding: 0 }}>
                    <div style={{ color: '#474747', fontSize: 14, fontWeight: 400, width: 241 }}>{service.fileName}</div>
                    <div style={{ color: '#474747', fontSize: 14, fontWeight: 400 }}>{service.validFrom}</div>
                    <div style={{ color: '#474747', fontSize: 14, fontWeight: 400 }}>{service.expiry}</div>
                    <div className="action-link" style={{ width: 44, textAlign: 'center' }}>View</div>
                  </div>
                  {idx < additionalServices.length - 1 && <div className="table-divider" style={{ margin: '22px 0' }} />}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        <div className="content-right">
          {/* Taxes Card */}
          <div className="card">
            <div className="card__header">
              <div className="card__header-icon">📄</div>
              <div className="card__header-title">Taxes</div>
            </div>
            <div className="card__body" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: 22 }}>
              {loadingTaxes ? (
                <div className="loading-taxes">
                  <p style={{ textAlign: 'center', padding: '10px' }}>Loading tax information...</p>
                </div>
              ) : taxes.length > 0 ? (
                taxes.map((tax) => (
                  <div key={tax.id} className="tax-item">
                    <div className="tax-item__content">
                      <div className="tax-item__title">{tax.title}</div>
                      <div className="tax-item__date">{tax.date}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-taxes">
                  <p style={{ textAlign: 'center', padding: '10px', color: '#666' }}>
                    No tax information found.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* User Documents Card */}
          <div className="card">
            <div className="card__header">
              <div className="card__header-icon">👤</div>
              <div className="card__header-title">User Documents</div>
            </div>
            <div className="card__body" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: 22 }}>
              {userDocuments.map((doc, idx) => (
                <ListItem
                  key={doc.id}
                  title={doc.title}
                  onAction={() => handleViewDetails(doc)}
                />
              ))}
            </div>
          </div>

          {/* Mail Forwarding Card */}
          <div className="card">
            <div className="card__header">
              <div className="card__header-icon">✉️</div>
              <div className="card__header-title">Mail Forwarding</div>
            </div>
            <div className="card__body" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: 22 }}>
              {mailForwarding.map((mail, idx) => (
                <ListItem
                  key={mail.id}
                  title={mail.title}
                  onAction={() => handleViewDetails(mail)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;