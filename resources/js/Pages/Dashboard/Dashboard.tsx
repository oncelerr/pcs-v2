import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Dashboard.css'
import { getStatusProgress } from './Components/StatusProgress';
import CompleteProfileModal from './Components/CompleteProfileModal/CompleteProfileModal';
import CompletePaymentModal from './Components/CompletePaymentModal/CompletePaymentModal';
import Modal from '../../Components/Modal/Modal';

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
  const { user } = useAuth();
  const [showPaymentSuccessModal, setShowPaymentSuccessModal] = useState(false);
  const [showPaymentErrorModal, setShowPaymentErrorModal] = useState(false);
  const [paymentErrorMessage, setPaymentErrorMessage] = useState('');

  // 👇 Local state instead of hardcoded IIFE
  const [statusProgress, setStatusProgress] = useState<StatusProgress>({
    stages: [],
    percentage: 0,
  });

  const CACHE_KEY = 'statusProgress';
  const CACHE_EXPIRY = 1000 * 60 * 60; // 1 hour

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

        const data = (await getStatusProgress()) as StatusProgress;
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

  const formationDocuments = [
    { id: 1, fileName: 'Operating Agreement', stage: 'Stage Registration' },
    { id: 2, fileName: 'Operating Agreement', stage: 'Stage Registration' },
    { id: 3, fileName: 'BOI Filing Confirmation', stage: 'Stage Registration' }
  ];

  const additionalServices = [
    { id: 1, fileName: 'CSTF Mandatory Training Certificate', validFrom: '10/11/2022', expiry: '10/11/2023' },
    { id: 2, fileName: 'Fit to Work Annual Certificate', validFrom: '10/11/2022', expiry: '10/11/2023' },
    { id: 3, fileName: 'CSTF Mandatory Training Certificate', validFrom: '10/11/2022', expiry: '10/11/2023' }
  ];

  const taxes = [
    { id: 1, title: 'Annual Franchise Due', date: 'July 08, 2025' },
    { id: 2, title: 'IRS Annual Tax Return Due', date: 'July 08, 2025' },
    { id: 3, title: 'IRS Annual Tax Return Due', date: 'July 08, 2025' }
  ];

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

  const handleDownload = (fileName: string) => {
    console.log('Downloading:', fileName);
  };

  const handleViewDetails = (item: any) => {
    console.log('View details:', item);
  };

  const handleLogout = () => {
    console.log('Logging out...');
  };

  // Payment Success Modal
  const PaymentSuccessModal = () => (
    <div className="modal-overlay">
      <div className="success-modal">
        <div className="success-icon">
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="32" cy="32" r="32" fill="#106552"/>
            <path d="M20 32L28 40L44 24" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h3 className="success-title">Payment Successful!</h3>
        <p className="success-message">Your payment has been processed and your stages have been updated.</p>
        <div className="success-actions">
          <button className="success-button" onClick={() => setShowPaymentSuccessModal(false)}>Close</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="dashboard-container">
      {showPaymentSuccessModal && <Modal modalType="success" paymentErrorMessage={paymentErrorMessage} setShowModal={setShowPaymentSuccessModal} />}
      {showPaymentErrorModal && <Modal modalType="error" paymentErrorMessage={paymentErrorMessage} setShowModal={setShowPaymentErrorModal} />}
      {/* Blocking Modal for Active Profile Setup */}
      {hasActiveProfileSetup && (
        <CompleteProfileModal />
      )}
      {hasActivePayment && (
        <CompletePaymentModal />
      )}
      {/* Main Content */}
      <div className="content-grid">
        <div className="content-left">
          {/* Status Progress Card */}
          <div className="card">
            <div className="card__header">
              <div className="card__header-icon">📄</div>
              <div className="card__header-title">Status Progress</div>
            </div>
            <div className="card__body">
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
              {formationDocuments.map((doc, idx) => (
                <DocumentRow
                  key={doc.id}
                  number={doc.id}
                  fileName={doc.fileName}
                  stage={doc.stage}
                  onDownload={handleDownload}
                />
              ))}
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
              {taxes.map((tax, idx) => (
                <ListItem
                  key={tax.id}
                  title={tax.title}
                  subtitle={tax.date}
                  onAction={() => handleViewDetails(tax)}
                />
              ))}
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