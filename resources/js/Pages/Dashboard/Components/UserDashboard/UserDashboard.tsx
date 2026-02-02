import React from 'react';
import LoadingSpinner from '../../../../Components/LoadingSpinner/LoadingSpinner';
import './UserDashboard.css';

interface StatusProgressItem {
  name: string;
  status: 'completed' | 'active' | 'pending';
}

interface StatusProgressStage {
  name: string;
  status: 'completed' | 'active' | 'pending';
  items: StatusProgressItem[];
}

interface StatusProgressData {
  percentage: number;
  stages: StatusProgressStage[];
}

interface DocumentRowProps {
  number: number;
  fileName: string;
  stage: string;
  onDownload: () => void;
}

interface UserDocument {
  id: number;
  fileName: string;
  stage: string;
  file_path?: string;
  validFrom?: string;
  expiry?: string;
}

interface UserDashboardProps {
  statusProgress: StatusProgressData;
  formationDocuments: UserDocument[];
  loadingDocuments: boolean;
  currentPage: number;
  documentsPerPage: number;
  handlePageChange: (page: number) => void;
  getCurrentPageDocuments: () => UserDocument[];
  getTotalPages: () => number;
  handleDownload: (filePath: string) => void;
  additionalServices: UserDocument[];
  loadingAdditionalServices: boolean;
  additionalServicesPage: number;
  servicesPerPage: number;
  handleServicesPageChange: (page: number) => void;
  getCurrentPageServices: () => UserDocument[];
  getAdditionalServicesTotalPages: () => number;
}

const DocumentRow: React.FC<DocumentRowProps> = ({ number, fileName, stage, onDownload }) => (
  <div className="table-row">
    <div>{number}</div>
    <div style={{ width: 168 }}>{fileName}</div>
    <div style={{ width: 141 }}>{stage}</div>
    <div style={{ width: 77 }}>
      <button className="download-button" onClick={onDownload}>
        Download
      </button>
    </div>
  </div>
);

interface Tax {
  id: number;
  title: string;
  date: string;
}

interface UserDoc {
  id: number;
  title: string;
  date?: string;
  file_path?: string;
}

interface MailItem {
  id: number;
  title: string;
}

interface ListItemProps {
  title: string;
  onAction: () => void;
}

const ListItem: React.FC<ListItemProps> = ({ title, onAction }) => (
  <div className="list-item">
    <div>{title}</div>
    <div className="action-link" onClick={onAction}>View Details</div>
  </div>
);

interface UserDashboardProps {
  statusProgress: StatusProgressData;
  formationDocuments: UserDocument[];
  loadingDocuments: boolean;
  currentPage: number;
  documentsPerPage: number;
  handlePageChange: (page: number) => void;
  getCurrentPageDocuments: () => UserDocument[];
  getTotalPages: () => number;
  handleDownload: (filePath: string) => void;
  additionalServices: UserDocument[];
  loadingAdditionalServices: boolean;
  additionalServicesPage: number;
  servicesPerPage: number;
  handleServicesPageChange: (page: number) => void;
  getCurrentPageServices: () => UserDocument[];
  getAdditionalServicesTotalPages: () => number;
  taxes: Tax[];
  loadingTaxes: boolean;
  userDocuments: UserDoc[];
  loadingUserDocuments: boolean;
  mailForwarding: MailItem[];
  handleViewDetails: (mail: MailItem) => void;
}

const UserDashboard: React.FC<UserDashboardProps> = ({
  statusProgress,
  formationDocuments,
  loadingDocuments,
  currentPage,
  documentsPerPage,
  handlePageChange,
  getCurrentPageDocuments,
  getTotalPages,
  handleDownload,
  additionalServices,
  loadingAdditionalServices,
  additionalServicesPage,
  servicesPerPage,
  handleServicesPageChange,
  getCurrentPageServices,
  getAdditionalServicesTotalPages,
  taxes,
  loadingTaxes,
  userDocuments,
  loadingUserDocuments,
  mailForwarding,
  handleViewDetails
}) => {
  return (
    <div className="user-dashboard">
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
            {loadingDocuments ? (
              <div className="loading-documents">
                <LoadingSpinner size="small" color="#126654" />
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
                    ← Previous
                  </button>
                  <span className="pagination-info">
                    Page {currentPage} of {getTotalPages()}
                  </span>
                  <button
                    className="pagination-button"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= getTotalPages()}
                  >
                    Next →
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
            <div className="table-header__col">No.</div>
            <div className="table-header__col" style={{ width: 168 }}>File Name</div>
            <div className="table-header__col" style={{ width: 141 }}>Valid From</div>
            <div className="table-header__col" style={{ width: 77 }}>Expiry</div>
            <div className="table-header__col" style={{ width: 77 }}>Action</div>
          </div>
          <div style={{ padding: '24px 0' }}>
            {loadingAdditionalServices ? (
              <div className="loading-documents">
                <LoadingSpinner size="small" color="#126654" />
              </div>
            ) : getCurrentPageServices().length > 0 ? (
              <>
                {/* Current page services */}
                {getCurrentPageServices().map((doc, idx) => (
                  <DocumentRow
                    key={doc.id}
                    number={(additionalServicesPage - 1) * servicesPerPage + idx + 1}
                    fileName={doc.fileName}
                    stage={`${doc.validFrom || 'N/A'} - ${doc.expiry || 'N/A'}`}
                    onDownload={() => handleDownload(doc.file_path || doc.fileName)}
                  />
                ))}

                {/* Pagination controls */}
                <div className="pagination-controls">
                  <button
                    className="pagination-button"
                    onClick={() => handleServicesPageChange(additionalServicesPage - 1)}
                    disabled={additionalServicesPage === 1}
                  >
                    ← Previous
                  </button>
                  <span className="pagination-info">
                    Page {additionalServicesPage} of {getAdditionalServicesTotalPages()}
                  </span>
                  <button
                    className="pagination-button"
                    onClick={() => handleServicesPageChange(additionalServicesPage + 1)}
                    disabled={additionalServicesPage >= getAdditionalServicesTotalPages()}
                  >
                    Next →
                  </button>
                </div>
              </>
            ) : (
              <div className="no-documents">
                <p style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                  No additional services found.
                </p>
              </div>
            )}
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
                <LoadingSpinner size="small" color="#126654" />
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
            {loadingUserDocuments ? (
              <div className="loading-documents">
                <LoadingSpinner size="small" color="#126654" />
              </div>
            ) : userDocuments.length > 0 ? (
              userDocuments.map((doc) => (
                <div key={doc.id} className="document-item">
                  <div className="document-item__content">
                    <div className="document-item__title">{doc.title}</div>
                    {doc.date && <div className="document-item__date">{doc.date}</div>}
                  </div>
                  {doc.file_path && (
                    <div className="document-item__action">
                      <button
                        className="download-button"
                        onClick={() => handleDownload(doc.file_path || '')}
                      >
                        Download
                      </button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="no-documents">
                <p style={{ textAlign: 'center', padding: '10px', color: '#666' }}>
                  No user documents found.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Mail Forwarding Card */}
        <div className="card">
          <div className="card__header">
            <div className="card__header-icon">✉️</div>
            <div className="card__header-title">Mail Forwarding</div>
          </div>
          <div className="card__body" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: 22 }}>
            {mailForwarding.length > 0 ? (
              mailForwarding.map((mail) => (
                <ListItem
                  key={mail.id}
                  title={mail.title}
                  onAction={() => handleViewDetails(mail)}
                />
              ))
            ) : (
              <div style={{ textAlign: 'center', color: '#666', padding: '16px 0' }}>
                No data
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default UserDashboard;