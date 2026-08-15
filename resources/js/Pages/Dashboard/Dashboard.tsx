import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import './Dashboard.css';
import LoadingSpinner from '../../Components/LoadingSpinner/LoadingSpinner';
import ConfirmationModal from '../../Components/ConfirmationModal/ConfirmationModal';
import CompleteProfileModal from './Components/CompleteProfileModal/CompleteProfileModal';
import CompletePaymentModal from './Components/CompletePaymentModal/CompletePaymentModal';
import UserDashboard from './Components/UserDashboard/UserDashboard';
import AdminDashboard from './Components/AdminDashboard/AdminDashboard';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
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

type PaymentStats = {
  paid: number;
  unpaid: number;
};

type ComplianceStepStat = {
  label: string;
  done: number;
  inProgress: number;
  pending: number;
};

type ComplianceStepStats = ComplianceStepStat[];

interface UserDocument {
  id: number;
  fileName: string;
  stage: string;
  file_path?: string;
  validFrom?: string;
  expiry?: string;
  type?: string;
}

type DocumentRowProps = {
  number: number;
  document: UserDocument;
  onDownload: (filePath: string, fileName: string) => void;
};

const DocumentRow: React.FC<DocumentRowProps> = ({ number, document, onDownload }) => (
  <>
    <div className="table-row">
      <div style={{ color: '#474747', fontSize: 14, fontWeight: 400 }}>{number}</div>
      <div style={{ color: '#474747', fontSize: 14, fontWeight: 400 }}>{document.fileName}</div>
      <div className="badge">{document.stage}</div>
      <div className="action-link" onClick={() => onDownload(document.file_path || '', document.fileName)}>Download</div>
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
  const [showPaymentCancelModal, setShowPaymentCancelModal] = useState(false);
  const [paymentErrorMessage, setPaymentErrorMessage] = useState('');
  const [paymentCancelMessage, setPaymentCancelMessage] = useState('');

  // Check if user is admin
  const isAdmin = hasRole('Admin');
  const [userStats, setUserStats] = useState<UserStats>({
    completed: 0,
    ongoing: 0,
    unprocessed: 0,
    total: 0
  });
  const [loadingStats, setLoadingStats] = useState<boolean>(false);
  const [paymentStats, setPaymentStats] = useState<PaymentStats>({ paid: 0, unpaid: 0 });
  const [complianceStepStats, setComplianceStepStats] = useState<ComplianceStepStats>([]);

  // 👇 Local state instead of hardcoded IIFE
  const [statusProgress, setStatusProgress] = useState<StatusProgress>({
    stages: [],
    percentage: 0,
  });

  const CACHE_KEY = 'statusProgress';
  const CACHE_EXPIRY = 1000 * 60 * 60; // 1 hour

  // Function to fetch all pages of data from a paginated API
  const fetchAllPages = async (url: string, csrfToken: string | null) => {
    let currentPage = 1;
    let hasMorePages = true;
    let allData: any[] = [];

    while (hasMorePages) {
      const pageUrl = `${url}?page=${currentPage}&per_page=100`; // Use maximum allowed per_page
      const response = await fetch(pageUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken || '',
          'X-Requested-With': 'XMLHttpRequest',
        },
        credentials: 'same-origin'
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch data from ${pageUrl}`);
      }

      const result = await response.json();
      const data = result.data || [];
      allData = [...allData, ...data];

      // Check if there are more pages
      const pagination = result.pagination;
      if (pagination && pagination.current_page < pagination.last_page) {
        currentPage++;
      } else {
        hasMorePages = false;
      }
    }

    return allData;
  };

  // Function to fetch user statistics for admin dashboard
  const fetchUserStats = async () => {
    if (!isAdmin) return;

    setLoadingStats(true);
    try {
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

      // Fetch all users using pagination
      const allUsersData = await fetchAllPages('/api/user-information', csrfToken || null);
      console.log('All users fetched:', allUsersData.length);

      // Fetch all compliance users using pagination
      const complianceUsers = await fetchAllPages('/api/compliance-user', csrfToken || null);
      console.log('All compliance users fetched:', complianceUsers.length);

      /**
       * Calculate statistics based on ComplianceUser model status fields
       * 
       * Categories hierarchy (in order of precedence):
       * 1. Unprocessed: Users with compliance_status = 'pending'
       * 2. On-Going: Users with process_status = 'pending' (and NOT already counted as Unprocessed)
       * 3. Completed: Users with process_status = 'done'
       * 
       * These categories match the constants defined in the ComplianceUser model:
       * - STATUS_DONE = 'done'
       * - STATUS_PENDING = 'pending'
       * - STATUS_IN_PROGRESS = 'in progress' (not currently used in this categorization)
       */
      const totalUsers = allUsersData.length;

      // First identify unprocessed users (highest precedence)
      const unprocessedUserIds = new Set(
        complianceUsers
          .filter((user: { compliance_status: string }) => user.compliance_status === 'pending')
          .map((user: { id: number }) => user.id)
      );
      const unprocessedUsers = unprocessedUserIds.size;

      // On-Going: users with process_status = 'pending' but NOT already counted as unprocessed
      const ongoingUsers = complianceUsers.filter((user: { process_status: string; id: number }) =>
        user.process_status === 'pending' && !unprocessedUserIds.has(user.id)
      ).length;

      // Completed: users with process_status = 'done'
      const completedUsers = complianceUsers.filter((user: { process_status: string }) =>
        user.process_status === 'done'
      ).length;

      // Log detailed categorization information for debugging
      console.log('User statistics calculated:', {
        total: totalUsers,
        completed: completedUsers,
        ongoing: ongoingUsers,
        unprocessed: unprocessedUsers,
        allUsersCount: allUsersData.length,
        complianceUsersCount: complianceUsers.length,
        unprocessedUserIds: Array.from(unprocessedUserIds),
        categoryCounts: {
          unprocessed: unprocessedUsers,
          ongoing: ongoingUsers,
          completed: completedUsers,
          total: unprocessedUsers + ongoingUsers + completedUsers
        }
      });

      setUserStats({
        completed: completedUsers,
        ongoing: ongoingUsers,
        unprocessed: unprocessedUsers,
        total: totalUsers
      });

      // Payment status breakdown - user.is_paid comes from the eager-loaded
      // user relation on UserInformationController::index
      const paidUsers = allUsersData.filter((u: any) => u.user?.is_paid === true).length;
      setPaymentStats({
        paid: paidUsers,
        unpaid: totalUsers - paidUsers
      });

      // Compliance step breakdown across the 5 filing steps
      const stepFields: { key: string; label: string }[] = [
        { key: 'compliance_status', label: 'Compliance' },
        { key: 'state_registration_status', label: 'State Registration' },
        { key: 'bio_filing_status', label: 'BOI Filing' },
        { key: 'ein_filing_status', label: 'EIN Filing' },
        { key: 'bank_registration_status', label: 'Bank Registration' },
      ];

      const stepStats: ComplianceStepStats = stepFields.map(({ key, label }) => {
        let done = 0, inProgress = 0, pending = 0;
        complianceUsers.forEach((cu: any) => {
          const value = cu[key] || 'pending';
          if (value === 'done') done++;
          else if (value === 'in progress') inProgress++;
          else pending++;
        });
        return { label, done, inProgress, pending };
      });
      setComplianceStepStats(stepStats);
    } catch (error) {
      console.error('Error fetching user statistics:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    // Debug isAdmin flag
    // console.log('isAdmin value:', isAdmin);
    // console.log('user object:', user);

    // Fetch user stats if admin
    if (isAdmin) {
      // console.log('Fetching user stats for admin');
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

  // Handle payment success and cancellation
  useEffect(() => {
    const handlePaymentStatus = async () => {
      const urlParams = new URLSearchParams(location.search);
      const status = urlParams.get('status');
      const sessionId = urlParams.get('session_id');

      // console.log('Payment status check:', { status, sessionId, userId: user?.id });

      // Handle payment cancellation
      if (status === 'canceled' || status === 'cancelled') {
        // Clean up URL parameters
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);

        // Show cancellation modal with appropriate message
        setPaymentCancelMessage('Your payment was canceled. If you experienced any issues, please try again or contact support.');
        setShowPaymentCancelModal(true);

        // Auto-hide cancel modal after 5 seconds
        setTimeout(() => {
          setShowPaymentCancelModal(false);
        }, 5000);
        return;
      }

      // Handle payment failure
      if (status === 'failed') {
        // Clean up URL parameters
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);

        // Show error modal
        setPaymentErrorMessage('Your payment could not be processed. Please try again or contact support.');
        setShowPaymentErrorModal(true);

        // Auto-hide error modal after 5 seconds
        setTimeout(() => {
          setShowPaymentErrorModal(false);
        }, 5000);
        return;
      }

      // Handle payment success
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

    handlePaymentStatus();
  }, [location.search, user?.id, CACHE_KEY]);

  // State for formation documents
  const [formationDocuments, setFormationDocuments] = useState<UserDocument[]>([]);
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

  // State for additional services
  const [additionalServices, setAdditionalServices] = useState<UserDocument[]>([]);
  const [loadingAdditionalServices, setLoadingAdditionalServices] = useState<boolean>(false);

  // Pagination state for additional services
  const [additionalServicesPage, setAdditionalServicesPage] = useState<number>(1);
  const servicesPerPage: number = 3;

  // Function to fetch additional services from client_compliance_files table
  const fetchAdditionalServices = async () => {
    if (!user?.id) return;

    setLoadingAdditionalServices(true);
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
        throw new Error('Failed to fetch additional services');
      }

      const result = await response.json();
      const files = result.data || [];

      // Filter for additional service types
      const serviceTypes = [
        'registration_agent_service_status',
        'business_license_research_status',
        'trademark_registration_status',
        'dba_registration_status',
        'copyright_registration_status',
        'brand_strategy_consultation_status',
        'business_address_status',
        'meeting_room_access_status',
        'phone_answering_service_status',
        'virtual_receptionist_status'
      ];

      const serviceFiles = files
        .filter((file: any) => serviceTypes.includes(file.column_for))
        .map((file: any, index: number) => {
          const validFrom = file.created_at ? formatDate(file.created_at) : 'N/A';
          const expiry = file.expiry_date ? formatDate(file.expiry_date) : 'No Expiry';

          return {
            id: file.id || index + 1,
            fileName: file.naming || file.file_name || formatServiceLabel(file.column_for),
            validFrom: validFrom,
            expiry: expiry,
            // Add the required stage property for UserDocument interface
            stage: `${validFrom} - ${expiry}`,
            type: file.column_for,
            file_path: file.file_path || ''
          };
        });

      setAdditionalServices(serviceFiles);
    } catch (error) {
      console.error('Error fetching additional services:', error);
    } finally {
      setLoadingAdditionalServices(false);
    }
  };

  // Helper function to format service labels
  const formatServiceLabel = (serviceType: string): string => {
    return serviceType
      .replace('_status', '')
      .replace('_service', '')
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Pagination functions for additional services
  const getAdditionalServicesTotalPages = (): number => {
    return Math.ceil(additionalServices.length / servicesPerPage);
  };

  const getCurrentPageServices = () => {
    const indexOfLastService = additionalServicesPage * servicesPerPage;
    const indexOfFirstService = indexOfLastService - servicesPerPage;
    return additionalServices.slice(indexOfFirstService, indexOfLastService);
  };

  const handleServicesPageChange = (pageNumber: number): void => {
    // Ensure page number is within valid range
    const totalPages = getAdditionalServicesTotalPages();
    if (pageNumber < 1) {
      setAdditionalServicesPage(1);
    } else if (pageNumber > totalPages) {
      setAdditionalServicesPage(totalPages);
    } else {
      setAdditionalServicesPage(pageNumber);
    }
  };

  // Fetch additional services when component mounts or user changes
  useEffect(() => {
    if (user?.id) {
      fetchAdditionalServices();
    }
  }, [user?.id]);

  // Reset to first page when services change
  useEffect(() => {
    setAdditionalServicesPage(1);
  }, [additionalServices.length]);

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

      // console.log('Compliance users found:', complianceUsers);

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

      // console.log('Compliance user details:', complianceUser);

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
    // console.log(user?.id)
    if (user?.id) {
      fetchTaxInformation();
    }
  }, [user?.id]);

  // State for user documents
  const [userDocuments, setUserDocuments] = useState<Array<{
    id: number;
    title: string;
    date?: string;
    type: string;
    file_path?: string;
  }>>([]);
  const [loadingUserDocuments, setLoadingUserDocuments] = useState<boolean>(false);

  // Function to fetch user documents from compliance_users table
  const fetchUserDocuments = async () => {
    if (!user?.id) return;

    setLoadingUserDocuments(true);
    try {
      // Reuse the same compliance user lookup logic from fetchTaxInformation
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

      // If no compliance user exists, set empty documents
      if (!complianceUsers.length) {
        setUserDocuments([]);
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
        throw new Error('Failed to fetch user documents');
      }

      const result = await response.json();
      const complianceUser = result.data;

      // Format documents for display
      const documentItems = [];

      // Also fetch client compliance files to get file paths
      const filesResponse = await fetch(`/api/compliance-files/user/${user.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken || '',
          'X-Requested-With': 'XMLHttpRequest',
        },
        credentials: 'same-origin'
      });

      let files = [];
      if (filesResponse.ok) {
        const filesResult = await filesResponse.json();
        files = filesResult.data || [];
      }

      // Helper function to find file path by column type
      const getFilePath = (columnType: string): string => {
        const file = files.find((f: { column_for: string; file_path?: string }) => f.column_for === columnType);
        return file ? file.file_path || '' : '';
      };

      if (complianceUser?.annual_franchise_tax) {
        documentItems.push({
          id: 1,
          title: 'Annual Franchise Tax Document',
          date: formatDate(complianceUser.annual_franchise_tax),
          type: 'annual_franchise_tax',
          file_path: getFilePath('annual_franchise_tax')
        });
      }

      if (complianceUser?.annual_irs_tax) {
        documentItems.push({
          id: 2,
          title: 'IRS Annual Tax Return',
          date: formatDate(complianceUser.annual_irs_tax),
          type: 'annual_irs_tax',
          file_path: getFilePath('annual_irs_tax')
        });
      }

      if (complianceUser?.mail_forwarding_status) {
        documentItems.push({
          id: 3,
          title: 'Mail Forwarding Receipt',
          date: complianceUser.mail_forwarding_status === 'active' ? 'Active' : 'Inactive',
          type: 'mail_forwarding_status',
          file_path: getFilePath('mail_forwarding_status')
        });
      }

      setUserDocuments(documentItems);
    } catch (error) {
      console.error('Error fetching user documents:', error);
      setUserDocuments([]);
    } finally {
      setLoadingUserDocuments(false);
    }
  };

  // Fetch user documents when component mounts or user changes
  useEffect(() => {
    if (user?.id) {
      fetchUserDocuments();
    }
  }, [user?.id]);

  // Show blocking modal when a Stage Item named "Profile Setup" is active
  const hasActiveProfileSetup = statusProgress.stages.some((stage) =>
    stage.items.some((item) => item.name === 'Profile Setup' && item.status === 'active')
  );

  const hasActivePayment = statusProgress.stages.some((stage) =>
    stage.items.some((item) => item.name === 'Payment' && item.status === 'active')
  );

  /**
   * Enhanced file download handler using backend API
   * This approach mirrors the working UserDocuments.tsx implementation
   * Uses a secure signed URL from the backend to handle downloads properly
   */
  const handleDownload = async (filePath: string, fileName?: string) => {
    if (!filePath) {
      console.error('Invalid file path: empty or undefined');
      alert('File path is missing. Please contact support.');
      return;
    }

    console.log('Attempting to download file:', filePath);

    try {
      // Get CSRF token and auth token
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      const token = localStorage.getItem('auth_token');

      // Extract filename from path if not provided
      const fileNameToUse = fileName || filePath.split('/').pop() || 'document';

      // Call backend API to get secure download URL
      const response = await fetch('/api/get-document-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken || '',
          'X-Requested-With': 'XMLHttpRequest',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: user?.id,
          filePath: filePath,
          fileName: fileNameToUse,
          download: true
        }),
        credentials: 'same-origin'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to get download URL');
      }

      const data = await response.json();
      const downloadUrl = data.downloadUrl;

      if (!downloadUrl) {
        throw new Error('No download URL received from server');
      }

      console.log('Download URL received:', downloadUrl);

      // Handle download based on file type
      const isPdf = fileNameToUse.toLowerCase().endsWith('.pdf');
      
      if (isPdf) {
        // For PDFs, open in new tab - this works better in production
        window.open(downloadUrl, '_blank');
      } else {
        // For other files (images, etc.), use download attribute
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = fileNameToUse;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      console.log('File download initiated successfully:', fileNameToUse);

    } catch (error: any) {
      console.error('Error downloading file:', error);
      
      // Show user-friendly error message
      const errorMessage = error.message || 'Failed to download file. Please try again or contact support.';
      alert(errorMessage);
    }
  };

  const handleViewDetails = (item: any) => {
    console.log('View details:', item);
  };

  // Create a pie chart data from user stats
  const createPieChartData = () => {
    // Check if all values are zero
    const allZero = userStats.completed === 0 && userStats.ongoing === 0 && userStats.unprocessed === 0;

    // If all values are zero, provide a placeholder value for visualization
    const data = allZero
      ? [1, 1, 1] // Equal placeholder values when all are zero
      : [userStats.completed, userStats.ongoing, userStats.unprocessed];

    return {
      labels: ['Completed', 'On-Going', 'Unprocessed'],
      datasets: [
        {
          data: data,
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
    cutout: '65%', // Make the chart more like a donut for modern look
    plugins: {
      legend: {
        position: 'right' as const,
        align: 'center' as const,
        labels: {
          boxWidth: 12,
          boxHeight: 12,
          padding: 15,
          font: {
            family: '"DM Sans", sans-serif',
            size: 12,
            weight: 'normal' as const
          },
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = userStats.total;

            // Check if we're using placeholder data (all zeros)
            const allZero = userStats.completed === 0 && userStats.ongoing === 0 && userStats.unprocessed === 0;

            if (allZero) {
              return `${label}: 0 (0%)`;
            }

            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    }
  };

  // Payment modals are now handled by ConfirmationModal component

  return (
    <div className="dashboard-container">
      <ConfirmationModal
        isOpen={showPaymentSuccessModal}
        title="Payment Successful!"
        message="Your payment has been processed and your stages have been updated."
        confirmText="Close"
        type="success"
        onConfirm={() => setShowPaymentSuccessModal(false)}
        onCancel={() => setShowPaymentSuccessModal(false)}
      />
      <ConfirmationModal
        isOpen={showPaymentErrorModal}
        title="Payment Error"
        message={paymentErrorMessage || 'An error occurred while processing your payment.'}
        confirmText="Close"
        type="error"
        onConfirm={() => setShowPaymentErrorModal(false)}
        onCancel={() => setShowPaymentErrorModal(false)}
      />
      <ConfirmationModal
        isOpen={showPaymentCancelModal}
        title="Payment Canceled"
        message={paymentCancelMessage || 'Your payment process was canceled.'}
        confirmText="Close"
        type="info"
        onConfirm={() => setShowPaymentCancelModal(false)}
        onCancel={() => setShowPaymentCancelModal(false)}
      />
      {/* Blocking Modal for Active Profile Setup - Only show for non-admin users */}
      {hasActiveProfileSetup && !isAdmin && (
        <CompleteProfileModal />
      )}
      {/* Blocking Modal for Active Payment - Only show for non-admin users */}
      {hasActivePayment && !isAdmin && (
        <CompletePaymentModal />
      )}
      {/* Main Content */}
      {/* Render different dashboard based on user role */}
      {!isAdmin ? (
        <UserDashboard
          statusProgress={statusProgress}
          formationDocuments={formationDocuments}
          loadingDocuments={loadingDocuments}
          currentPage={currentPage}
          documentsPerPage={documentsPerPage}
          handlePageChange={handlePageChange}
          getCurrentPageDocuments={getCurrentPageDocuments}
          getTotalPages={getTotalPages}
          handleDownload={handleDownload}
          additionalServices={additionalServices}
          loadingAdditionalServices={loadingAdditionalServices}
          additionalServicesPage={additionalServicesPage}
          servicesPerPage={servicesPerPage}
          handleServicesPageChange={handleServicesPageChange}
          getCurrentPageServices={getCurrentPageServices}
          getAdditionalServicesTotalPages={getAdditionalServicesTotalPages}
          taxes={taxes}
          loadingTaxes={loadingTaxes}
          userDocuments={userDocuments}
          loadingUserDocuments={loadingUserDocuments}
          mailForwarding={[]}
          handleViewDetails={handleViewDetails}
          userName={user?.name}
        />
      ) : (
        <AdminDashboard
          loadingStats={loadingStats}
          userStats={userStats}
          paymentStats={paymentStats}
          complianceStepStats={complianceStepStats}
          createPieChartData={createPieChartData}
          chartOptions={chartOptions}
        />
      )}
    </div>
  );
};

export default Dashboard;