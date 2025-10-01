import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css'
import { getStatusProgress } from './Components/StatusProgress';

const DocumentRow = ({ number, fileName, stage, onDownload }) => (
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

const ListItem = ({ title, subtitle, onAction }) => (
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

  // 👇 Local state instead of hardcoded IIFE
  const [statusProgress, setStatusProgress] = useState<{ stages: any[]; percentage: number }>({
    stages: [],
    percentage: 0
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

        const data = await getStatusProgress();
        setStatusProgress(data);

        localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
      } catch (err) {
        console.error("Failed to load progress:", err);
      }
    };

    fetchProgress();
  }, []);

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

  const handleDownload = (fileName) => {
    console.log('Downloading:', fileName);
  };

  const handleViewDetails = (item) => {
    console.log('View details:', item);
  };

  const handleLogout = () => {
    console.log('Logging out...');
  };

  return (
    <div className="dashboard">
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