import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import styles from './StateServiceRequests.module.css';
import LoadingSpinner from '../../Components/LoadingSpinner/LoadingSpinner';
import ConfirmationModal from '../../Components/ConfirmationModal/ConfirmationModal';

// Define interface for state service request
interface StateServiceRequest {
    id: number;
    user_id: number;
    email: string;
    company_name: string;
    state_of_registration: string;
    service_type: string;
    description: string;
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    terms_accepted_at: string;
    admin_notes?: string;
    completed_at?: string;
    assigned_to?: number;
    created_at: string;
    updated_at: string;
    user?: {
        id: number;
        name: string;
        email: string;
    };
    assigned_admin?: {
        id: number;
        name: string;
        email: string;
    };
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

const StateServiceRequests = () => {
    const { user, hasRole } = useAuth();
    const navigate = useNavigate();
    const isAdmin = hasRole('Admin');

    const [requests, setRequests] = useState<StateServiceRequest[]>([]);
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

    // Details modal state
    const [detailsModal, setDetailsModal] = useState({
        isOpen: false,
        request: null as StateServiceRequest | null
    });

    // Update status modal state
    const [updateModal, setUpdateModal] = useState({
        isOpen: false,
        request: null as StateServiceRequest | null,
        newStatus: '',
        adminNotes: ''
    });

    // Pagination state
    const [pagination, setPagination] = useState<PaginationData>({
        total: 0,
        per_page: 15,
        current_page: 1,
        last_page: 1,
        from: 0,
        to: 0
    });

    // Search and filter state
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [filterStatus, setFilterStatus] = useState<string>('');
    const [filterServiceType, setFilterServiceType] = useState<string>('');

    // Helper function to create modal state objects
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

    // Fetch state service requests
    const fetchRequests = useCallback(async (page = 1) => {
        if (!isAdmin) {
            navigate('/dashboard');
            return;
        }

        setLoading(true);
        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            const token = localStorage.getItem('auth_token');

            // Build query parameters
            const queryParams = new URLSearchParams();
            queryParams.append('page', page.toString());
            queryParams.append('per_page', pagination.per_page.toString());

            if (searchTerm) {
                queryParams.append('search', searchTerm);
            }

            if (filterStatus) {
                queryParams.append('status', filterStatus);
            }

            if (filterServiceType) {
                queryParams.append('service_type', filterServiceType);
            }

            const response = await fetch(`/api/admin/state-service-requests?${queryParams.toString()}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'X-CSRF-TOKEN': csrfToken || '',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin'
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch requests: ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                setRequests(data.data.data || []);
                setPagination({
                    total: data.data.total || 0,
                    per_page: data.data.per_page || 15,
                    current_page: data.data.current_page || 1,
                    last_page: data.data.last_page || 1,
                    from: data.data.from || 0,
                    to: data.data.to || 0
                });
            } else {
                throw new Error(data.message || 'Failed to fetch requests');
            }
        } catch (error: any) {
            console.error('Error fetching requests:', error);
            setError(error.message || 'Failed to load service requests. Please try again later.');
        } finally {
            setLoading(false);
        }
    }, [isAdmin, navigate, pagination.per_page, searchTerm, filterStatus, filterServiceType]);

    // Check authentication status
    useEffect(() => {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            console.error('No auth token found, redirecting to login');
            navigate('/login');
            return;
        }

        if (!user) {
            console.error('No user data found');
        }
    }, [navigate, user]);

    // Initial data fetch
    useEffect(() => {
        if (isAdmin) {
            fetchRequests();
        } else {
            navigate('/dashboard');
        }
    }, [isAdmin, navigate]);

    // Handle search and filter changes
    useEffect(() => {
        if (isAdmin) {
            const timer = setTimeout(() => {
                fetchRequests(1);
            }, 500);

            return () => clearTimeout(timer);
        }
    }, [searchTerm, filterStatus, filterServiceType, fetchRequests, isAdmin]);

    // Handle pagination change
    const handlePageChange = (page: number) => {
        fetchRequests(page);
    };

    // View request details
    const handleViewDetails = (request: StateServiceRequest) => {
        setDetailsModal({
            isOpen: true,
            request: request
        });
    };

    // Open update status modal
    const handleOpenUpdateModal = (request: StateServiceRequest) => {
        setUpdateModal({
            isOpen: true,
            request: request,
            newStatus: request.status,
            adminNotes: request.admin_notes || ''
        });
    };

    // Update request status
    const handleUpdateStatus = async () => {
        if (!updateModal.request) return;

        setLoading(true);
        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            const token = localStorage.getItem('auth_token');

            const response = await fetch(`/api/admin/state-service-requests/${updateModal.request.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'X-CSRF-TOKEN': csrfToken || '',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin',
                body: JSON.stringify({
                    status: updateModal.newStatus,
                    admin_notes: updateModal.adminNotes
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update request');
            }

            const data = await response.json();

            if (data.success) {
                setModalState(createModalState({
                    isOpen: true,
                    title: 'Success',
                    message: 'Request status updated successfully',
                    type: 'success',
                    onConfirm: () => {
                        setModalState({ ...modalState, isOpen: false });
                        setUpdateModal({ isOpen: false, request: null, newStatus: '', adminNotes: '' });
                        fetchRequests(pagination.current_page);
                    }
                }));
            } else {
                throw new Error(data.message || 'Failed to update request');
            }
        } catch (error: any) {
            console.error('Error updating request:', error);
            setModalState(createModalState({
                isOpen: true,
                title: 'Error',
                message: error.message || 'Failed to update request. Please try again.',
                type: 'error'
            }));
        } finally {
            setLoading(false);
        }
    };

    // Status options
    const statusOptions = [
        { value: '', label: 'All Statuses' },
        { value: 'pending', label: 'Pending' },
        { value: 'in_progress', label: 'In Progress' },
        { value: 'completed', label: 'Completed' },
        { value: 'cancelled', label: 'Cancelled' }
    ];

    // Service type options
    const serviceTypeOptions = [
        { value: '', label: 'All Service Types' },
        { value: 'Amendment', label: 'Amendment' },
        { value: 'Certificate of Good Standing', label: 'Certificate of Good Standing' },
        { value: 'Fictitious Name (DBA)', label: 'Fictitious Name (DBA)' },
        { value: 'Individual Taxpayer Identification Number (ITIN)', label: 'ITIN' },
        { value: 'Apostilled Document', label: 'Apostilled Document' },
        { value: 'Register a Trademark', label: 'Register a Trademark' },
        { value: 'Company Dissolution', label: 'Company Dissolution' },
        { value: 'EIN Registration', label: 'EIN Registration' },
        { value: 'Beneficial Ownership Information Report (BOI)', label: 'BOI Report' },
        { value: 'Registered Agents Subscription', label: 'Registered Agents Subscription' },
        { value: 'US Bank Account Registration', label: 'US Bank Account Registration' },
        { value: 'State Compliance Reporting', label: 'State Compliance Reporting' },
        { value: 'Change of Registered Agents', label: 'Change of Registered Agents' },
        { value: 'Virtual Address', label: 'Virtual Address' },
        { value: 'US Phone Number', label: 'US Phone Number' },
        { value: 'Annual Tax Return Filing (soon)', label: 'Annual Tax Return Filing' }
    ];

    // Format date for display
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Get status badge class
    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case 'pending':
                return styles.statusPending;
            case 'in_progress':
                return styles.statusInProgress;
            case 'completed':
                return styles.statusCompleted;
            case 'cancelled':
                return styles.statusCancelled;
            default:
                return '';
        }
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
                className={`${styles.paginationButton} ${pagination.current_page === 1 ? styles.disabled : ''}`}
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
                    className={`${styles.paginationButton} ${pagination.current_page === i ? styles.active : ''}`}
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
                className={`${styles.paginationButton} ${pagination.current_page === pagination.last_page ? styles.disabled : ''}`}
                onClick={() => pagination.current_page < pagination.last_page && handlePageChange(pagination.current_page + 1)}
                disabled={pagination.current_page === pagination.last_page}
            >
                &raquo;
            </button>
        );

        return (
            <div className={styles.paginationContainer}>
                <div className={styles.paginationInfo}>
                    Showing {pagination.from || 0} to {pagination.to || 0} of {pagination.total} entries
                </div>
                <div className={styles.paginationControls}>
                    {pages}
                </div>
            </div>
        );
    };

    // Details Modal
    const DetailsModal = () => {
        if (!detailsModal.isOpen || !detailsModal.request) return null;

        const request = detailsModal.request;

        return (
            <div className={styles.modalOverlay}>
                <div className={styles.detailsModal}>
                    <div className={styles.modalHeader}>
                        <h3>Service Request Details</h3>
                        <button
                            className={styles.closeButton}
                            onClick={() => setDetailsModal({ isOpen: false, request: null })}
                        >
                            &times;
                        </button>
                    </div>
                    <div className={styles.modalBody}>
                        <div className={styles.detailsGrid}>
                            <div className={styles.detailItem}>
                                <label>Request ID:</label>
                                <span>#{request.id}</span>
                            </div>
                            <div className={styles.detailItem}>
                                <label>Status:</label>
                                <span className={`${styles.statusBadge} ${getStatusBadgeClass(request.status)}`}>
                                    {request.status.replace('_', ' ')}
                                </span>
                            </div>
                            <div className={styles.detailItem}>
                                <label>Company Name:</label>
                                <span>{request.company_name}</span>
                            </div>
                            <div className={styles.detailItem}>
                                <label>Email:</label>
                                <span>{request.email}</span>
                            </div>
                            <div className={styles.detailItem}>
                                <label>Service Type:</label>
                                <span>{request.service_type}</span>
                            </div>
                            <div className={styles.detailItem}>
                                <label>State of Registration:</label>
                                <span>{request.state_of_registration.toUpperCase()}</span>
                            </div>
                            <div className={styles.detailItem}>
                                <label>Submitted By:</label>
                                <span>{request.user?.name || 'N/A'}</span>
                            </div>
                            <div className={styles.detailItem}>
                                <label>Submitted On:</label>
                                <span>{formatDate(request.created_at)}</span>
                            </div>
                            {request.assigned_admin && (
                                <div className={styles.detailItem}>
                                    <label>Assigned To:</label>
                                    <span>{request.assigned_admin.name}</span>
                                </div>
                            )}
                            {request.completed_at && (
                                <div className={styles.detailItem}>
                                    <label>Completed On:</label>
                                    <span>{formatDate(request.completed_at)}</span>
                                </div>
                            )}
                        </div>

                        <div className={styles.descriptionSection}>
                            <label>Description:</label>
                            <p>{request.description}</p>
                        </div>

                        {request.admin_notes && (
                            <div className={styles.notesSection}>
                                <label>Admin Notes:</label>
                                <p>{request.admin_notes}</p>
                            </div>
                        )}
                    </div>
                    <div className={styles.modalFooter}>
                        <button
                            className={styles.updateButton}
                            onClick={() => {
                                setDetailsModal({ isOpen: false, request: null });
                                handleOpenUpdateModal(request);
                            }}
                        >
                            Update Status
                        </button>
                        <button
                            className={styles.closeBtn}
                            onClick={() => setDetailsModal({ isOpen: false, request: null })}
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // Handle update with values passed from modal
    const handleUpdateStatusWithValues = async (status: string, notes: string) => {
        if (!updateModal.request) return;

        setLoading(true);
        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            const token = localStorage.getItem('auth_token');

            const response = await fetch(`/api/admin/state-service-requests/${updateModal.request.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'X-CSRF-TOKEN': csrfToken || '',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin',
                body: JSON.stringify({
                    status: status,
                    admin_notes: notes
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update request');
            }

            const data = await response.json();

            if (data.success) {
                setModalState(createModalState({
                    isOpen: true,
                    title: 'Success',
                    message: 'Request status updated successfully',
                    type: 'success',
                    onConfirm: () => {
                        setModalState({ ...modalState, isOpen: false });
                        setUpdateModal({ isOpen: false, request: null, newStatus: '', adminNotes: '' });
                        fetchRequests(pagination.current_page);
                    }
                }));
            } else {
                throw new Error(data.message || 'Failed to update request');
            }
        } catch (error: any) {
            console.error('Error updating request:', error);
            setModalState(createModalState({
                isOpen: true,
                title: 'Error',
                message: error.message || 'Failed to update request. Please try again.',
                type: 'error'
            }));
        } finally {
            setLoading(false);
        }
    };

    // Update Status Modal
    const UpdateStatusModal = () => {
        if (!updateModal.isOpen || !updateModal.request) return null;

        // Local state for form inputs
        const [localStatus, setLocalStatus] = useState(updateModal.newStatus);
        const [localNotes, setLocalNotes] = useState(updateModal.adminNotes);

        // Update local state when modal opens with new data
        useEffect(() => {
            setLocalStatus(updateModal.newStatus);
            setLocalNotes(updateModal.adminNotes);
        }, [updateModal.request?.id]); // Only update when request ID changes

        const handleSave = () => {
            // Update the parent state with local values before submitting
            setUpdateModal({
                ...updateModal,
                newStatus: localStatus,
                adminNotes: localNotes
            });

            // Call the update function with local values
            handleUpdateStatusWithValues(localStatus, localNotes);
        };

        return (
            <div className={styles.modalOverlay}>
                <div className={styles.updateModal}>
                    <div className={styles.modalHeader}>
                        <h3>Update Request Status</h3>
                        <button
                            className={styles.closeButton}
                            onClick={() => setUpdateModal({ isOpen: false, request: null, newStatus: '', adminNotes: '' })}
                        >
                            &times;
                        </button>
                    </div>
                    <div className={styles.modalBody}>
                        <div className={styles.formGroup}>
                            <label>Request ID:</label>
                            <span className={styles.requestId}>#{updateModal.request.id}</span>
                        </div>

                        <div className={styles.formGroup}>
                            <label>Status:</label>
                            <select
                                value={localStatus}
                                onChange={(e) => setLocalStatus(e.target.value)}
                                className={styles.statusSelect}
                            >
                                <option value="pending">Pending</option>
                                <option value="in_progress">In Progress</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>

                        <div className={styles.formGroup}>
                            <label>Admin Notes:</label>
                            <textarea
                                value={localNotes}
                                onChange={(e) => setLocalNotes(e.target.value)}
                                className={styles.notesTextarea}
                                rows={4}
                                placeholder="Add notes about this request..."
                            />
                        </div>
                    </div>
                    <div className={styles.modalFooter}>
                        <button
                            className={styles.saveButton}
                            onClick={handleSave}
                            disabled={loading}
                        >
                            {loading ? 'Updating...' : 'Save Changes'}
                        </button>
                        <button
                            className={styles.cancelBtn}
                            onClick={() => setUpdateModal({ isOpen: false, request: null, newStatus: '', adminNotes: '' })}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className={styles.container}>
            <div className={styles.controlsContainer}>
                <div className={styles.searchContainer}>
                    <input
                        type="text"
                        placeholder="Search by company name, email, or user..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={styles.searchInput}
                    />
                </div>

                <div className={styles.filtersContainer}>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className={styles.filterSelect}
                    >
                        {statusOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>

                    <select
                        value={filterServiceType}
                        onChange={(e) => setFilterServiceType(e.target.value)}
                        className={styles.filterSelect}
                    >
                        {serviceTypeOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Main content */}
            <div className={styles.contentContainer}>
                {error ? (
                    <div className={styles.errorMessage}>{error}</div>
                ) : (
                    <div className={styles.tableContainer}>
                        <table className={styles.requestsTable}>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Company</th>
                                    <th>Service Type</th>
                                    <th>Status</th>
                                    <th>Submitted By</th>
                                    <th>Submitted On</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={7}>
                                            <div className={styles.loadingContainer}>
                                                <LoadingSpinner size="large" color="#126654" />
                                            </div>
                                        </td>
                                    </tr>
                                ) : requests.length === 0 ? (
                                    <tr>
                                        <td colSpan={7}>
                                            <div className={styles.noDataMessage}>No service requests found.</div>
                                        </td>
                                    </tr>
                                ) : (
                                    requests.map((request) => (
                                        <tr key={request.id}>
                                            <td>#{request.id}</td>
                                            <td>{request.company_name}</td>
                                            <td>{request.service_type}</td>
                                            <td>
                                                <span className={`${styles.statusBadge} ${getStatusBadgeClass(request.status)}`}>
                                                    {request.status.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td>{request.user?.name || 'N/A'}</td>
                                            <td>{formatDate(request.created_at)}</td>
                                            <td>
                                                <div className={styles.actionButtons}>
                                                    <button
                                                        className={styles.viewButton}
                                                        onClick={() => handleViewDetails(request)}
                                                    >
                                                        View Details
                                                    </button>
                                                    <button
                                                        className={styles.updateStatusButton}
                                                        onClick={() => handleOpenUpdateModal(request)}
                                                    >
                                                        Update Status
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>

                        {/* Pagination */}
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

            <DetailsModal />
            <UpdateStatusModal />
        </div>
    );
};

export default StateServiceRequests;