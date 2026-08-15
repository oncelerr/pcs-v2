import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './UserDocuments.css';
import LoadingSpinner from '../../Components/LoadingSpinner/LoadingSpinner';
import ConfirmationModal from '../../Components/ConfirmationModal/ConfirmationModal';
import UserDetailsModal from '../../Components/UserDetailsModal';

// Define interface for user document information
interface UserDocument {
  id: number;
  user_id: number;
  company_name: string;
  document_type: string;
  file_name: string;
  file_path: string;
  uploaded_at: string;
  uploaded_by: string;
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

// Define interface for user information
interface UserInformation {
  id: number;
  user_id: number;
  company_name: string;
  first_name: string;
  last_name: string;
  email_address?: string;
  contact_number?: string;
  // Add other fields as needed
}

const UserDocuments = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'confirm' as 'confirm' | 'success' | 'error' | 'info',
    onConfirm: () => { },
    onCancel: () => { }
  });

  // User details modal state
  const [userDetailsModal, setUserDetailsModal] = useState({
    isOpen: false,
    userData: null as UserInformation | null
  });

  // Document viewer modal state
  const [documentViewerModal, setDocumentViewerModal] = useState({
    isOpen: false,
    documentUrl: '',
    documentName: ''
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
  const [filterDocumentType, setFilterDocumentType] = useState<string>('');

  // Helper function to create modal state objects with all required properties
  const createModalState = ({
    isOpen = false,
    title = '',
    message = '',
    type = 'info' as 'confirm' | 'success' | 'error' | 'info',
    onConfirm = () => { },
    onCancel = () => { }
  }) => ({
    isOpen,
    title,
    message,
    type,
    onConfirm,
    onCancel
  });

  // Fetch user documents
  const fetchUserDocuments = useCallback(async (page = 1) => {
    if (!isAdmin) {
      navigate('/dashboard');
      return;
    }

    setLoading(true);
    try {
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

      // Build query parameters
      const queryParams = new URLSearchParams();
      queryParams.append('page', page.toString());
      queryParams.append('per_page', pagination.per_page.toString());

      if (searchTerm) {
        queryParams.append('search', searchTerm);
      }

      if (filterDocumentType) {
        queryParams.append('document_type', filterDocumentType);
      }

      // Get the auth token from localStorage
      const token = localStorage.getItem('auth_token');

      const response = await fetch(`/api/user-documents?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken || '',
          'X-Requested-With': 'XMLHttpRequest',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'same-origin'
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch user documents: ${response.status}`);
      }

      const data = await response.json();
      setDocuments(data.data);
      setPagination({
        total: data.total,
        per_page: data.per_page,
        current_page: data.current_page,
        last_page: data.last_page,
        from: data.from,
        to: data.to
      });
    } catch (error: any) {
      console.error('Error fetching user documents:', error);
      setError(error.message || 'Failed to load user documents. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [isAdmin, navigate, pagination.per_page, searchTerm, filterDocumentType]);

  // Check authentication status
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      console.error('No auth token found, redirecting to login');
      navigate('/login');
      return;
    }

    if (!user) {
      console.error('No user data found, may need to refresh auth state');
      // You might want to trigger a refresh of the auth state here
    }
  }, [navigate, user]);

  // Initial data fetch
  useEffect(() => {
    if (isAdmin) {
      fetchUserDocuments();
    } else {
      navigate('/dashboard');
    }
  }, [isAdmin, navigate]);

  // Handle search and filter changes
  useEffect(() => {
    if (isAdmin) {
      const timer = setTimeout(() => {
        fetchUserDocuments(1);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [searchTerm, filterDocumentType, fetchUserDocuments, isAdmin]);

  // Handle pagination change
  const handlePageChange = (page: number) => {
    fetchUserDocuments(page);
  };

  // View user details
  const handleViewUserDetails = (userId: number) => {
    const userToView = documents.find(doc => doc.user_id === userId);

    if (userToView) {
      setUserDetailsModal({
        isOpen: true,
        userData: {
          id: userToView.id,
          user_id: userToView.user_id,
          company_name: userToView.company_name,
          first_name: userToView.uploaded_by.split(' ')[0] || '',
          last_name: userToView.uploaded_by.split(' ')[1] || '',
          email_address: ''
        }
      });
    }
  };

  // Generate secure document URL
  const getSecureDocumentUrl = async (doc: UserDocument): Promise<string> => {
    try {
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      const token = localStorage.getItem('auth_token');

      // Map document types to the expected backend values
      // Backend only accepts: 'passport', 'proof_address', 'signature'
      let documentType = 'passport'; // Default to passport

      // Check file extension to determine document type
      const fileName = doc.file_name.toLowerCase();
      const isImage = /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(fileName);
      const isPdf = /\.pdf$/i.test(fileName);

      if (!isImage && !isPdf) {
        throw new Error('Only image files and PDFs are supported');
      }

      // Map document types based on the document_type field
      // This is a simplified mapping - adjust based on your actual document types
      if (doc.document_type.toLowerCase().includes('passport')) {
        documentType = 'passport';
      } else if (doc.document_type.toLowerCase().includes('address') ||
        doc.document_type.toLowerCase().includes('proof')) {
        documentType = 'proof_address';
      } else if (doc.document_type.toLowerCase().includes('signature')) {
        documentType = 'signature';
      }

      // Create a custom endpoint to handle file retrieval directly
      // We'll use the actual file path from the document record
      const response = await fetch('/api/get-document-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken || '',
          'X-Requested-With': 'XMLHttpRequest',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: doc.user_id,
          filePath: doc.file_path, // Use the actual file path from the document
          fileName: doc.file_name
        }),
        credentials: 'same-origin'
      });

      if (!response.ok) {
        // Try to get detailed error information
        const errorData = await response.json();
        if (errorData.errors && errorData.errors.documentType) {
          throw new Error('Invalid document type: ' + errorData.errors.documentType[0]);
        } else {
          throw new Error('Failed to get document URL: ' + (errorData.message || 'Unknown error'));
        }
      }

      const data = await response.json();
      return data.downloadUrl; // The endpoint returns downloadUrl, not url
    } catch (error: any) {
      console.error('Error getting document URL:', error);

      // Provide more specific error messages
      let errorMessage = 'Failed to access document. Please try again later.';

      if (error.message) {
        if (error.message.includes('Only image files and PDFs are supported')) {
          errorMessage = 'Only image files (JPG, PNG, etc.) and PDF documents are supported.';
        } else if (error.message.includes('Invalid document type')) {
          errorMessage = 'This document type is not supported. Only passport, proof of address, and signature documents are allowed.';
        }
      }

      setModalState(createModalState({
        isOpen: true,
        title: 'Document Error',
        message: errorMessage,
        type: 'error'
      }));
      return '';
    }
  };

  // Check if file is a supported type (image or PDF)
  const isSupportedFileType = (fileName: string): boolean => {
    const isImage = /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(fileName);
    const isPdf = /\.pdf$/i.test(fileName);
    return isImage || isPdf;
  };

  // View document
  const handleViewDocument = async (doc: UserDocument) => {
    setLoading(true);
    try {
      // Check if file type is supported before making API call
      if (!isSupportedFileType(doc.file_name)) {
        throw new Error('Only image files and PDFs are supported');
      }

      const secureUrl = await getSecureDocumentUrl(doc);

      if (secureUrl) {
        setDocumentViewerModal({
          isOpen: true,
          documentUrl: secureUrl,
          documentName: doc.file_name
        });
      }
    } catch (error: any) {
      console.error('Error viewing document:', error);

      // Provide more specific error messages
      let errorMessage = 'Failed to view document. Please try again later.';

      if (error.message) {
        if (error.message.includes('Only image files and PDFs are supported')) {
          errorMessage = 'Only image files (JPG, PNG, etc.) and PDF documents are supported.';
        } else if (error.message.includes('Invalid document type')) {
          errorMessage = 'This document type is not supported. Only passport, proof of address, and signature documents are allowed.';
        }
      }

      setModalState(createModalState({
        isOpen: true,
        title: 'Document Error',
        message: errorMessage,
        type: 'error'
      }));
    } finally {
      setLoading(false);
    }
  };
  // Download document
  const handleDownloadDocument = async (doc: UserDocument) => {
    setLoading(true);
    try {
      // Check if file type is supported before making API call
      if (!isSupportedFileType(doc.file_name)) {
        throw new Error('Only image files and PDFs are supported');
      }

      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      const token = localStorage.getItem('auth_token');

      // Create a direct download URL with the download parameter
      const response = await fetch('/api/get-document-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken || '',
          'X-Requested-With': 'XMLHttpRequest',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: doc.user_id,
          filePath: doc.file_path,
          fileName: doc.file_name,
          download: true
        }),
        credentials: 'same-origin'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error('Failed to get download URL: ' + (errorData.message || 'Unknown error'));
      }

      const data = await response.json();
      const downloadUrl = data.downloadUrl;

      if (downloadUrl) {
        // Use window.location for PDF downloads to ensure proper handling
        if (doc.file_name.toLowerCase().endsWith('.pdf')) {
          window.open(downloadUrl, '_blank');
        } else {
          // For non-PDF files, use the anchor element approach
          const link = document.createElement('a');
          link.href = downloadUrl;
          link.download = doc.file_name;
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      } else {
        throw new Error('Failed to download document. Please try again later.');
      }
    } catch (error: any) {
      console.error('Error downloading document:', error);

      // Provide more specific error messages
      let errorMessage = 'Failed to download document. Please try again later.';

      if (error.message) {
        if (error.message.includes('Only image files and PDFs are supported')) {
          errorMessage = 'Only image files (JPG, PNG, etc.) and PDF documents are supported.';
        } else if (error.message.includes('Invalid document type')) {
          errorMessage = 'This document type is not supported. Only passport, proof of address, and signature documents are allowed.';
        }
      }

      setModalState(createModalState({
        isOpen: true,
        title: 'Document Error',
        message: errorMessage,
        type: 'error'
      }));
    } finally {
      setLoading(false);
    }
  };

  // Close document viewer
  const closeDocumentViewer = () => {
    setDocumentViewerModal({
      isOpen: false,
      documentUrl: '',
      documentName: ''
    });
  };

  // Document type options - matching column_for values in ClientComplianceFile model
  const documentTypeOptions = [
    { value: '', label: 'All Document Types' },
    { value: 'state_registration', label: 'State Registration' },
    { value: 'boi_filing', label: 'BOI Filing' },
    { value: 'ein_filing', label: 'EIN Filing' },
    { value: 'bank_registration', label: 'Bank Registration' },
    { value: 'annual_franchise_tax', label: 'Annual Franchise Tax' },
    { value: 'annual_irs_tax', label: 'Annual IRS Tax' },
    { value: 'passport', label: 'Passport' },
    { value: 'proof_address', label: 'Proof of Address' },
    { value: 'signature', label: 'Signature' }
  ];

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Render pagination controls
  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, pagination.current_page - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(pagination.last_page, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Previous button
    pages.push(
      <button
        key="prev"
        className={`pagination-button ${pagination.current_page === 1 ? 'disabled' : ''}`}
        onClick={() => pagination.current_page > 1 && handlePageChange(pagination.current_page - 1)}
        disabled={pagination.current_page === 1}
      >
        &laquo;
      </button>
    );

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          className={`pagination-button ${pagination.current_page === i ? 'active' : ''}`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      );
    }

    // Next button
    pages.push(
      <button
        key="next"
        className={`pagination-button ${pagination.current_page === pagination.last_page ? 'disabled' : ''}`}
        onClick={() => pagination.current_page < pagination.last_page && handlePageChange(pagination.current_page + 1)}
        disabled={pagination.current_page === pagination.last_page}
      >
        &raquo;
      </button>
    );

    return (
      <div className="pagination-container">
        <div className="pagination-info">
          Showing {pagination.from || 0} to {pagination.to || 0} of {pagination.total} entries
        </div>
        <div className="pagination-controls">
          {pages}
        </div>
      </div>
    );
  }

  // Document Viewer Modal
  const DocumentViewerModal = () => {
    if (!documentViewerModal.isOpen) return null;

    const isImage = /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(documentViewerModal.documentName);
    const isPdf = /\.pdf$/i.test(documentViewerModal.documentName);

    return (
      <div className="modal-overlay">
        <div className="document-viewer-modal">
          <div className="document-viewer-header">
            <h3>{documentViewerModal.documentName}</h3>
            <button className="close-button" onClick={closeDocumentViewer}>&times;</button>
          </div>
          <div className="document-viewer-content">
            {isImage && (
              <img
                src={documentViewerModal.documentUrl}
                alt={documentViewerModal.documentName}
                className="document-image"
              />
            )}
            {isPdf && (
              <iframe
                src={documentViewerModal.documentUrl}
                title={documentViewerModal.documentName}
                className="document-pdf"
                width="100%"
                height="500px"
              />
            )}
            {!isImage && !isPdf && (
              <div className="document-download">
                <p>This document type cannot be previewed.</p>
                <button
                  onClick={() => {
                    const link = window.document.createElement('a');
                    link.href = documentViewerModal.documentUrl;
                    link.download = documentViewerModal.documentName;
                    link.target = '_blank';
                    link.rel = 'noopener noreferrer';
                    window.document.body.appendChild(link);
                    link.click();
                    window.document.body.removeChild(link);
                  }}
                  className="download-button"
                >
                  Download Document
                </button>
              </div>
            )}
          </div>
          <div className="document-viewer-footer">
            <button
              onClick={() => {
                const link = window.document.createElement('a');
                link.href = documentViewerModal.documentUrl;
                link.download = documentViewerModal.documentName;
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
                window.document.body.appendChild(link);
                link.click();
                window.document.body.removeChild(link);
              }}
              className="download-button"
            >
              Download Document
            </button>
            <button className="close-button" onClick={closeDocumentViewer}>Close</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="user-documents-container">
      <div className="controls-container">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search by company name or user..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-container">
          <select
            value={filterDocumentType}
            onChange={(e) => setFilterDocumentType(e.target.value)}
            className="filter-select"
          >
            {documentTypeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main content */}
      <div className="content-container">
        {error ? (
          <div className="error-message">{error}</div>
        ) : (
          <div className="table-container">
            <table className="documents-table">
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Document Type</th>
                  <th>File Name</th>
                  <th>Uploaded By</th>
                  <th>Upload Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6}>
                      <div className="table-loading-container">
                        <LoadingSpinner size="large" color="#126654" />
                      </div>
                    </td>
                  </tr>
                ) : documents.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <div className="no-data-message">No documents found.</div>
                    </td>
                  </tr>
                ) : (
                  documents.map((document) => (
                    <tr key={document.id}>
                      <td>{document.company_name}</td>
                      <td>
                        <span className="document-type-badge">
                          {document.document_type.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td>{document.file_name}</td>
                      <td>{document.uploaded_by}</td>
                      <td>{formatDate(document.uploaded_at)}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="view-button"
                            onClick={() => handleViewDocument(document)}
                          >
                            View Document
                          </button>
                          <button
                            className="download-button"
                            onClick={() => handleDownloadDocument(document)}
                          >
                            Download
                          </button>
                          <button
                            className="details-button"
                            onClick={() => handleViewUserDetails(document.user_id)}
                          >
                            User Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Pagination - only show when not loading and has multiple pages */}
            {!loading && pagination.last_page > 1 && renderPagination()}
          </div>
        )}
      </div>

      {/* Modals */}
      <ConfirmationModal
        isOpen={modalState.isOpen}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
        onConfirm={modalState.onConfirm}
        onCancel={modalState.onCancel}
      />

      {userDetailsModal.isOpen && userDetailsModal.userData && (
        <UserDetailsModal
          isOpen={userDetailsModal.isOpen}
          onClose={() => setUserDetailsModal({ isOpen: false, userData: null })}
          userData={userDetailsModal.userData}
        />
      )}

      {/* Document Viewer Modal */}
      <DocumentViewerModal />
    </div>
  );
};

export default UserDocuments;
