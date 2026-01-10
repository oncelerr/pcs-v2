import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Compliance.css'
import LoadingSpinner from '../../Components/LoadingSpinner';
import ConfirmationModal from '../../Components/ConfirmationModal';
import UserDetailsModal from '../../Components/UserDetailsModal';
import FileUploadModal from '../../Components/FileUploadModal/FileUploadModal';
import TaxInfoModal from '../../Components/TaxInfoModal/TaxInfoModal';
import ServiceUploadModal from '../../Components/ServiceUploadModal/ServiceUploadModal';
import AddCandidateButton from '../../Components/AddCandidateButton/AddCandidateButton';

// Define interface for compliance user information
interface ComplianceUser {
  id: number;
  user_id: number; // Added to match UserInformation
  company_name: string;
  compliance_status?: string;
  state_registration_status?: string;
  bio_filing_status?: string;
  ein_filing_status?: string;
  bank_registration_status?: string;
  annual_franchise_tax?: string;
  annual_irs_tax?: string;
  process_status?: string;
}

// Define status options
type StatusType = 'pending' | 'in progress' | 'done';

// Define status field names
type StatusField = 'compliance_status' | 'state_registration_status' | 'bio_filing_status' | 'ein_filing_status' | 'bank_registration_status' | 'process_status';

// Define interface for pagination data
interface PaginationData {
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
  from: number;
  to: number;
}

const Compliance: React.FC = () => {
  const { user, logout, hasRole } = useAuth();
  const isAdmin = hasRole('Admin');
  const navigate = useNavigate();

  const [userData, setUserData] = useState<ComplianceUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for status updates
  const [updatingStatus, setUpdatingStatus] = useState<boolean>(false);
  
  // State for file upload
  const [showFileUpload, setShowFileUpload] = useState<{userId: number, field: StatusField} | null>(null);
  const [uploadingFile, setUploadingFile] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State for file upload modal
  const [fileUploadModal, setFileUploadModal] = useState<{
    isOpen: boolean;
    userId: number;
    field: StatusField;
  }>({ isOpen: false, userId: 0, field: 'compliance_status' });
  
  // State for tax info modal
  const [taxInfoModal, setTaxInfoModal] = useState<{
    isOpen: boolean;
    userId: number;
  }>({ isOpen: false, userId: 0 });
  
  // State for tax info submission
  const [submittingTaxInfo, setSubmittingTaxInfo] = useState<boolean>(false);
  
  // State for service upload modal
  const [serviceUploadModal, setServiceUploadModal] = useState<{
    isOpen: boolean;
    userId: number;
  }>({ isOpen: false, userId: 0 });
  
  // State for service upload submission
  const [uploadingService, setUploadingService] = useState<boolean>(false);

  // Modal state
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'confirm' as 'confirm' | 'success' | 'error' | 'info',
    onConfirm: () => { },
    onCancel: () => { }
  });
  
  // Helper function to create modal state objects with all required properties
  const createModalState = ({
    isOpen = false,
    title = '',
    message = '',
    type = 'info' as 'confirm' | 'success' | 'error' | 'info',
    onConfirm = () => {},
    onCancel = () => {}
  }) => ({
    isOpen,
    title,
    message,
    type,
    onConfirm,
    onCancel
  });

  // User details modal state
  const [userDetailsModal, setUserDetailsModal] = useState({
    isOpen: false,
    userData: null as ComplianceUser | null
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
  const [showPendingOnly, setShowPendingOnly] = useState<boolean>(true); // Default to showing only pending process status

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Function to fetch compliance user data with pagination
  const fetchUserData = async () => {
    setLoading(true);
    try {
      // Get CSRF token from meta tag
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

      // Build query parameters
      const params = new URLSearchParams({
        page: pagination.current_page.toString(),
        per_page: pagination.per_page.toString(),
        sort_by: 'created_at',
        sort_order: 'desc'
      });
      
      // Add process_status filter if showPendingOnly is true
      if (showPendingOnly) {
        params.append('process_status', 'pending');
      }

      // Add search term if provided
      if (searchTerm) {
        params.append('search', searchTerm);
      }

      // Add filter if provided
      if (filterStatus) {
        params.append('company_type', filterStatus);
      }

      const response = await fetch(`/api/compliance-user?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken || '',
          'X-Requested-With': 'XMLHttpRequest',
        },
        credentials: 'same-origin'
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch compliance user data: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success) {
        setUserData(result.data);
        setPagination(result.pagination);
      } else {
        throw new Error(result.message || 'Failed to fetch compliance user data');
      }
    } catch (err) {
      console.error('Error fetching compliance user data:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Effect to fetch data when pagination, search, filter, or pending status filter changes
  useEffect(() => {
    fetchUserData();
  }, [pagination.current_page, pagination.per_page, searchTerm, filterStatus, showPendingOnly]);

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
    setPagination(prev => ({ ...prev, current_page: 1 })); // Reset to first page on new search
  };

  // Handle filter change
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterStatus(e.target.value);
    setPagination(prev => ({ ...prev, current_page: 1 })); // Reset to first page on new filter
  };
  
  // Handle toggle of pending process status filter
  const handlePendingFilterToggle = () => {
    setShowPendingOnly(prev => !prev);
    setPagination(prev => ({ ...prev, current_page: 1 })); // Reset to first page on filter change
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
    // Close dropdown
    setActiveDropdown(null);

    // Perform action based on selection
    switch (action) {
      case 'upload':
        // Show service upload modal
        setServiceUploadModal({
          isOpen: true,
          userId
        });
        break;
      case 'tax':
        // Show tax information modal
        setTaxInfoModal({
          isOpen: true,
          userId
        });
        break;
      default:
        break;
    }
  };
  
  // Status cell click is no longer needed as we're showing dropdowns directly
  
  // Handle status change
  const handleStatusChange = async (userId: number, field: StatusField, newStatus: StatusType) => {
    // Prevent changing process_status field (system-controlled only)
    if (field === 'process_status') {
      console.warn('Process status cannot be changed manually');
      return;
    }
    
    // If trying to set to 'done', show file upload modal
    if (newStatus === 'done') {
      setFileUploadModal({
        isOpen: true,
        userId,
        field
      });
      return;
    }
    
    await updateStatus(userId, field, newStatus);
  };
  
  // Get next available status based on current status
  const getNextStatus = (currentStatus: string): StatusType | null => {
    switch (currentStatus) {
      case 'pending':
      case 'N/A':
        return 'in progress';
      case 'in progress':
        return 'done';
      case 'done':
        return null; // No next status for 'done'
      default:
        return 'in progress';
    }
  };
  
  // Handle file upload for a single file (legacy method)  
  const handleFileUpload = async (userId: number, field: StatusField, file: File) => {
    setUploadingFile(true);
    try {
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      
      const formData = new FormData();
      formData.append('document', file);
      
      // Fix for bio_filing vs boi_filing mismatch
      let documentType = field.replace('_status', '');
      if (documentType === 'bio_filing') {
        documentType = 'boi_filing';
      }
      
      formData.append('document_type', documentType);
      
      const response = await fetch(`/api/compliance-user/${userId}/upload`, {
        method: 'POST',
        headers: {
          'X-CSRF-TOKEN': csrfToken || '',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: formData,
        credentials: 'same-origin'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to upload file: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        // After successful upload, update the status to 'done'
        await updateStatus(userId, field, 'done');
        setShowFileUpload(null);
        
        // Find the user in the current state
        const currentUser = userData.find(user => user.id === userId);
        
        // Check if all required statuses are now 'done' (including the one we just updated)
        if (currentUser && 
            areAllStatusesComplete(currentUser, field, 'done') && 
            currentUser.process_status !== 'done') {
          
          // Automatically update process_status to 'done'
          await updateProcessStatus(userId, 'done');
          
          // Update local state for process_status
          setUserData(prevData => 
            prevData.map(user => 
              user.id === userId ? { ...user, process_status: 'done' } : user
            )
          );
          
          // Show enhanced notification that includes process completion
          setModalState(createModalState({
            isOpen: true,
            title: 'Process Complete',
            message: 'File uploaded successfully and all requirements are now complete! Process status has been automatically updated to Complete.',
            type: 'success',
            onConfirm: () => setModalState(prev => ({ ...prev, isOpen: false }))
          }));
        } else {
          // Show regular file upload success notification
          setModalState(createModalState({
            isOpen: true,
            title: 'Success',
            message: 'File uploaded successfully and status updated to Done',
            type: 'success',
            onConfirm: () => setModalState(prev => ({ ...prev, isOpen: false }))
          }));
        }
      } else {
        throw new Error(result.message || 'Failed to upload file');
      }
    } catch (err) {
      console.error('Error uploading file:', err);
      setModalState(createModalState({
        isOpen: true,
        title: 'Error',
        message: err instanceof Error ? err.message : 'An unknown error occurred while uploading the file',
        type: 'error',
        onConfirm: () => setModalState(prev => ({ ...prev, isOpen: false }))
      }));
    } finally {
      setUploadingFile(false);
    }
  };
  
  // Handle multiple file uploads from modal
  const handleMultipleFileUpload = async (fieldName: string, files: File[], skipUpload?: boolean) => {
    // If admin is skipping upload, just update the status
    if (skipUpload && isAdmin && fileUploadModal.userId) {
      try {
        // Update the status to 'done' without requiring files
        await updateStatus(fileUploadModal.userId, fieldName as StatusField, 'done');
        // Close the modal
        setFileUploadModal(prev => ({ ...prev, isOpen: false }));
        // Refresh the user data
        fetchUserData();
        return;
      } catch (error) {
        console.error('Error updating status:', error);
        return;
      }
    }
    
    // Regular file upload flow
    if (files.length === 0 || !fileUploadModal.userId) return;
    
    setUploadingFile(true);
    const field = fileUploadModal.field;
    const userId = fileUploadModal.userId;
    
    try {
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      
      // Fix for bio_filing vs boi_filing mismatch
      let documentType = field.replace('_status', '');
      if (documentType === 'bio_filing') {
        documentType = 'boi_filing';
      }
      
      // Upload each file sequentially to ensure proper numbering
      const results: any[] = [];
      
      // Process files one by one to ensure sequential numbering
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('document', file);
        formData.append('document_type', documentType);
        
        // Use the title property if available (added by FileUploadModal)
        // TypeScript doesn't know about our custom property, so we need to use any type
        const anyFile = file as any;
        const fileTitle = anyFile.title || file.name.split('.')[0];
        formData.append('naming', fileTitle); // This will be saved to client_compliance_files table
        
        const response = await fetch(`/api/compliance-user/${userId}/upload`, {
          method: 'POST',
          headers: {
            'X-CSRF-TOKEN': csrfToken || '',
            'X-Requested-With': 'XMLHttpRequest',
          },
          body: formData,
          credentials: 'same-origin'
        });
        
        if (!response.ok) {
          throw new Error(`Failed to upload file ${file.name}: ${response.statusText}`);
        }
        
        const result = await response.json();
        results.push(result);
      }
      
      // Check if all uploads were successful
      const allSuccessful = results.every(result => result.success);
      
      if (allSuccessful) {
        // After successful upload, update the status to 'done'
        await updateStatus(userId, field, 'done');
        
        // Close the modal
        setFileUploadModal(prev => ({ ...prev, isOpen: false }));
        
        // Find the user in the current state
        const currentUser = userData.find(user => user.id === userId);
        
        // Check if all required statuses are now 'done' (including the one we just updated)
        if (currentUser && 
            areAllStatusesComplete(currentUser, field, 'done') && 
            currentUser.process_status !== 'done') {
          
          // Automatically update process_status to 'done'
          await updateProcessStatus(userId, 'done');
          
          // Update local state for process_status
          setUserData(prevData => 
            prevData.map(user => 
              user.id === userId ? { ...user, process_status: 'done' } : user
            )
          );
          
          // Show enhanced notification that includes process completion
          setModalState(createModalState({
            isOpen: true,
            title: 'Process Complete',
            message: `${files.length} files uploaded successfully and all requirements are now complete! Process status has been automatically updated to Complete.`,
            type: 'success',
            onConfirm: () => setModalState(prev => ({ ...prev, isOpen: false }))
          }));
        } else {
          // Show regular file upload success notification
          setModalState(createModalState({
            isOpen: true,
            title: 'Success',
            message: `${files.length} files uploaded successfully and status updated to Done`,
            type: 'success',
            onConfirm: () => setModalState(prev => ({ ...prev, isOpen: false }))
          }));
        }
      } else {
        throw new Error('One or more files failed to upload');
      }
    } catch (err) {
      console.error('Error uploading files:', err);
      setModalState(createModalState({
        isOpen: true,
        title: 'Error',
        message: err instanceof Error ? err.message : 'An unknown error occurred while uploading the files',
        type: 'error',
        onConfirm: () => setModalState(prev => ({ ...prev, isOpen: false }))
      }));
    } finally {
      setUploadingFile(false);
    }
  };
  
  // Update status in the database
  const updateStatus = async (userId: number, field: StatusField, newStatus: StatusType) => {
    setUpdatingStatus(true);
    try {
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      
      const response = await fetch(`/api/compliance-user/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken || '',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify({ [field]: newStatus }),
        credentials: 'same-origin'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update status: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        // Update local state
        setUserData(prevData => {
          const updatedData = prevData.map(user => 
            user.id === userId ? { ...user, [field]: newStatus } : user
          );
          
          // Find the updated user
          const updatedUser = updatedData.find(user => user.id === userId);
          
          // Check if all required statuses are 'done' and process_status is not already 'done'
          if (updatedUser && 
              areAllStatusesComplete(updatedUser, field, newStatus) && 
              updatedUser.process_status !== 'done') {
            
            // Automatically update process_status to 'done'
            updateProcessStatus(userId, 'done');
            
            // Show notification that process status is now complete
            setTimeout(() => {
              setModalState(createModalState({
                isOpen: true,
                title: 'Process Complete',
                message: 'All requirements are now complete! Process status has been automatically updated to Complete.',
                type: 'success',
                onConfirm: () => setModalState(prev => ({ ...prev, isOpen: false }))
              }));
            }, 500); // Small delay to ensure the status update is processed first
            
            // Update the local state immediately for a responsive UI
            return updatedData.map(user => 
              user.id === userId ? { ...user, process_status: 'done' } : user
            );
          }
          
          return updatedData;
        });
      } else {
        throw new Error(result.message || 'Failed to update status');
      }
    } catch (err) {
      console.error('Error updating status:', err);
      setModalState(createModalState({
        isOpen: true,
        title: 'Error',
        message: err instanceof Error ? err.message : 'An unknown error occurred while updating status',
        type: 'error',
        onConfirm: () => setModalState(prev => ({ ...prev, isOpen: false }))
      }));
    } finally {
      setUpdatingStatus(false);
    }
  };
  
  // Helper function to check if all required statuses are complete
  const areAllStatusesComplete = (user: ComplianceUser, currentField?: StatusField, newStatus?: StatusType): boolean => {
    if (!user) return false;
    
    // Check each status field, considering the current field being updated if provided
    const complianceStatus = currentField === 'compliance_status' ? newStatus : user.compliance_status;
    const stateRegistrationStatus = currentField === 'state_registration_status' ? newStatus : user.state_registration_status;
    const bioFilingStatus = currentField === 'bio_filing_status' ? newStatus : user.bio_filing_status;
    const einFilingStatus = currentField === 'ein_filing_status' ? newStatus : user.ein_filing_status;
    const bankRegistrationStatus = currentField === 'bank_registration_status' ? newStatus : user.bank_registration_status;
    
    // Return true only if all statuses are 'done'
    return complianceStatus === 'done' && 
           stateRegistrationStatus === 'done' && 
           bioFilingStatus === 'done' && 
           einFilingStatus === 'done' && 
           bankRegistrationStatus === 'done';
  };
  
  // Handle service document upload
  const handleServiceUpload = async (service: string, file: File | null) => {
    if (!serviceUploadModal.userId || !file) return;
    
    setUploadingService(true);
    try {
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      
      const formData = new FormData();
      formData.append('document', file);
      formData.append('document_type', service);
      
      // Create a proper display name for the document
      let displayName = service.replace(/_/g, ' ');
      
      // Special case for BOI filing
      if (service === 'boi_filing') {
        displayName = 'BOI Filing';
      }
      
      formData.append('naming', `${displayName} Document`);
      
      const response = await fetch(`/api/compliance-user/${serviceUploadModal.userId}/upload`, {
        method: 'POST',
        headers: {
          'X-CSRF-TOKEN': csrfToken || '',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: formData,
        credentials: 'same-origin'
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        // Handle validation errors specifically
        if (response.status === 422 && result.errors) {
          const errorMessages = Object.values(result.errors)
            .flat()
            .join('\n');
          throw new Error(`Validation failed: ${errorMessages}`);
        }
        throw new Error(`Failed to upload document: ${result.message || response.statusText}`);
      }
      
      if (result.success) {
        // Close the modal
        setServiceUploadModal(prev => ({ ...prev, isOpen: false }));
        
        // Show success notification
        setModalState(createModalState({
          isOpen: true,
          title: 'Success',
          message: 'Document uploaded successfully',
          type: 'success',
          onConfirm: () => setModalState(prev => ({ ...prev, isOpen: false }))
        }));
      } else {
        throw new Error(result.message || 'Failed to upload document');
      }
    } catch (err) {
      console.error('Error uploading document:', err);
      setModalState(createModalState({
        isOpen: true,
        title: 'Error',
        message: err instanceof Error ? err.message : 'An unknown error occurred while uploading the document',
        type: 'error',
        onConfirm: () => setModalState(prev => ({ ...prev, isOpen: false }))
      }));
    } finally {
      setUploadingService(false);
    }
  };
  
  // Handle tax information submission
  const handleTaxInfoSubmit = async (franchiseTaxDate: string, irsTaxDate: string, franchiseTaxFile: File | null, irsTaxFile: File | null) => {
    if (!taxInfoModal.userId) return;
    
    setSubmittingTaxInfo(true);
    try {
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      
      const formData = new FormData();
      formData.append('annual_franchise_tax', franchiseTaxDate);
      formData.append('annual_irs_tax', irsTaxDate);
      
      if (franchiseTaxFile) {
        formData.append('franchise_tax_document', franchiseTaxFile);
      }
      
      if (irsTaxFile) {
        formData.append('irs_tax_document', irsTaxFile);
      }
      
      const response = await fetch(`/api/compliance-user/${taxInfoModal.userId}/tax`, {
        method: 'POST',
        headers: {
          'X-CSRF-TOKEN': csrfToken || '',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: formData,
        credentials: 'same-origin'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update tax information: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        // Update local state with new tax information
        setUserData(prevData => 
          prevData.map(user => 
            user.id === taxInfoModal.userId ? { 
              ...user, 
              annual_franchise_tax: franchiseTaxDate,
              annual_irs_tax: irsTaxDate 
            } : user
          )
        );
        
        // Close the modal
        setTaxInfoModal(prev => ({ ...prev, isOpen: false }));
        
        // Show success notification
        setModalState(createModalState({
          isOpen: true,
          title: 'Success',
          message: 'Tax information updated successfully',
          type: 'success',
          onConfirm: () => setModalState(prev => ({ ...prev, isOpen: false }))
        }));
      } else {
        throw new Error(result.message || 'Failed to update tax information');
      }
    } catch (err) {
      console.error('Error updating tax information:', err);
      setModalState(createModalState({
        isOpen: true,
        title: 'Error',
        message: err instanceof Error ? err.message : 'An unknown error occurred while updating tax information',
        type: 'error',
        onConfirm: () => setModalState(prev => ({ ...prev, isOpen: false }))
      }));
    } finally {
      setSubmittingTaxInfo(false);
    }
  };
  
  // Helper function to update process_status specifically
  const updateProcessStatus = async (userId: number, newStatus: StatusType) => {
    try {
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      
      const response = await fetch(`/api/compliance-user/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken || '',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify({ process_status: newStatus }),
        credentials: 'same-origin'
      });
      
      if (!response.ok) {
        console.error(`Failed to update process status: ${response.statusText}`);
      }
    } catch (err) {
      console.error('Error updating process status:', err);
    }
  };
  
  // Get status cell style based on status
  const getStatusCellStyle = (status: string) => {
    // Debug the status value being used for styling
    console.log(`Getting style for status: '${status}'`);
    
    // Common style properties
    const baseStyle = {
      padding: '5px 10px',
      borderRadius: '4px',
      textAlign: 'center' as const,
      cursor: 'default'
    };
    
    // Force status to lowercase for consistent matching
    const normalizedStatus = (status || '').toLowerCase();
    
    switch (normalizedStatus) {
      case 'pending':
        return {
          ...baseStyle,
          backgroundColor: '#f8d7da',
          color: '#721c24',
        };
      case 'in progress':
        return {
          ...baseStyle,
          backgroundColor: '#fff3cd',
          color: '#856404',
        };
      case 'done':
        return {
          ...baseStyle,
          backgroundColor: '#d4edda',
          color: '#155724',
        };
      default:
        console.log(`Using default style for unrecognized status: '${normalizedStatus}'`);
        return {
          ...baseStyle,
          backgroundColor: '#f8d7da', // Default to pending/red
          color: '#721c24',
        };
    }
  };

  // Render status cell with dropdown
  const renderStatusCell = (userId: number, field: StatusField, currentStatus: string = 'pending') => {
    // Normalize status value to ensure consistent matching
    const normalizedStatus = currentStatus?.toLowerCase() || 'pending';
    
    // Debug the status value
    console.log(`Cell ${field} for user ${userId} has status: '${normalizedStatus}'`);
    
    const isUploading = showFileUpload?.userId === userId && showFileUpload?.field === field;
    const nextStatus = getNextStatus(normalizedStatus);
    const cellStyle = getStatusCellStyle(normalizedStatus);
    
    // If field is process_status, never allow editing (system-controlled only)
    if (field === 'process_status') {
      return (
        <div style={cellStyle}>
          {currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}
        </div>
      );
    }
    
    // If status is 'done', show a button to upload more files
    if (normalizedStatus === 'done') {
      return (
        <div style={{...cellStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <span>{currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}</span>
          {field !== 'process_status' as StatusField && (
            <button 
              className="upload-more-btn"
              onClick={() => {
                setFileUploadModal({
                  isOpen: true,
                  userId,
                  field
                });
              }}
            >
              +
            </button>
          )}
        </div>
      );
    }
    
    if (isUploading) {
      return (
        <div className="file-upload-container">
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileUpload(userId, field, e.target.files[0]);
              }
            }}
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            disabled={uploadingFile}
          />
          {uploadingFile && <LoadingSpinner size="small" color="#126654" />}
          <div className="file-upload-actions">
            <button 
              onClick={() => fileInputRef.current?.click()} 
              disabled={uploadingFile}
              className="file-select-btn"
            >
              Select File
            </button>
            <button 
              onClick={() => setShowFileUpload(null)} 
              disabled={uploadingFile}
              className="file-cancel-btn"
            >
              Cancel
            </button>
          </div>
        </div>
      );
    }
    
    // Always show dropdown for editable statuses
    if (nextStatus) {
      // Set dropdown background color based on current status
      let backgroundColor = '#ffffff';
      let textColor = '#333333';
      
      if (normalizedStatus === 'pending') {
        backgroundColor = '#f8d7da'; // Red background for pending
        textColor = '#721c24';
      } else if (normalizedStatus === 'in progress') {
        backgroundColor = '#fff3cd'; // Yellow background for in progress
        textColor = '#856404';
      }
      
      const dropdownStyle = {
        width: '100%',
        padding: '5px',
        borderRadius: '4px',
        border: 'none',
        outline: 'none',
        backgroundColor: backgroundColor,
        color: textColor
        // Removed appearance: none to restore native dropdown icon
      };
      
      return (
        <select 
          value={currentStatus} 
          onChange={(e) => handleStatusChange(userId, field, e.target.value as StatusType)}
          disabled={updatingStatus}
          style={dropdownStyle}
        >
          <option value={currentStatus}>{currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}</option>
          <option value={nextStatus}>{nextStatus.charAt(0).toUpperCase() + nextStatus.slice(1)}</option>
        </select>
      );
    }
    
    // Fallback for any other case
    return (
      <div style={cellStyle}>
        {currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}
      </div>
    );
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

  return (
    <div className="all-users-container">
      <div className="personal-deets-cont">
        <div className="personal-deets-header">
          <img className="personal-deets-header-img" src="/assets/paper-icon.png" alt="" />
          <h3 className="h3-title">All Compliance Users</h3>
        </div>
        <div className="tool-bar">
          <input
            className="search-bar"
            type="text"
            placeholder="Search by Company Name"
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <button 
            className={`filter-toggle-btn ${showPendingOnly ? 'filter-toggle-btn-active' : ''}`}
            onClick={handlePendingFilterToggle}
          >
            {showPendingOnly ? 'Showing Pending Only' : 'Show All Records'}
          </button>
          <input className="status-bar" type="text" placeholder="Status" />
          <AddCandidateButton onCandidateAdded={fetchUserData} />
        </div>
        <table className="all-users-table">
          <thead>
            <tr>
              <th>Company Name</th>
              <th>Compliance</th>
              <th>State Registration</th>
              <th>BOI Filing</th>
              <th>EIN Filing</th>
              <th>Bank Registration</th>
              <th>Status</th>
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
                <td colSpan={7} style={{ textAlign: 'center', padding: '20px' }}>No compliance user data found</td>
              </tr>
            ) : (
              // Use API data if available, fallback to mock data for development
              userData.map((user, index) => (
                <tr key={user.id || index}>
                  <td>{user.company_name}</td>
                  <td>{renderStatusCell(user.id, 'compliance_status', user.compliance_status)}</td>
                  <td>{renderStatusCell(user.id, 'state_registration_status', user.state_registration_status)}</td>
                  <td>{renderStatusCell(user.id, 'bio_filing_status', user.bio_filing_status)}</td>
                  <td>{renderStatusCell(user.id, 'ein_filing_status', user.ein_filing_status)}</td>
                  <td>{renderStatusCell(user.id, 'bank_registration_status', user.bank_registration_status)}</td>
                  <td>{renderStatusCell(user.id, 'process_status', user.process_status)}</td>
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
                          <button onClick={() => handleAction('upload', user.id)}>Upload Other Files</button>
                          <button onClick={() => handleAction('tax', user.id)}>Add Tax</button>
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
              // Logic to show limited page buttons with ellipsis
              const currentPage = pagination.current_page;
              const lastPage = pagination.last_page;
              const delta = 2; // Number of pages to show before and after current page

              let pages = [];

              // Always include first page
              pages.push(1);

              // Calculate range around current page
              const rangeStart = Math.max(2, currentPage - delta);
              const rangeEnd = Math.min(lastPage - 1, currentPage + delta);

              // Add ellipsis after first page if needed
              if (rangeStart > 2) {
                pages.push('ellipsis-start');
              }

              // Add pages in the calculated range
              for (let i = rangeStart; i <= rangeEnd; i++) {
                pages.push(i);
              }

              // Add ellipsis before last page if needed
              if (rangeEnd < lastPage - 1) {
                pages.push('ellipsis-end');
              }

              // Always include last page if it's not the first page
              if (lastPage > 1) {
                pages.push(lastPage);
              }

              // Render the page buttons
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
      
      {/* File Upload Modal */}
      <FileUploadModal
        isOpen={fileUploadModal.isOpen}
        onClose={() => setFileUploadModal(prev => ({ ...prev, isOpen: false }))}
        onUpload={handleMultipleFileUpload}
        userId={fileUploadModal.userId}
        fieldName={fileUploadModal.field}
        isUploading={uploadingFile}
        isAdmin={isAdmin}
      />
      
      {/* Tax Info Modal */}
      <TaxInfoModal
        isOpen={taxInfoModal.isOpen}
        onClose={() => setTaxInfoModal(prev => ({ ...prev, isOpen: false }))}
        onSave={handleTaxInfoSubmit}
        userId={taxInfoModal.userId}
        isSubmitting={submittingTaxInfo}
      />
      
      {/* Service Upload Modal */}
      <ServiceUploadModal
        isOpen={serviceUploadModal.isOpen}
        onClose={() => setServiceUploadModal(prev => ({ ...prev, isOpen: false }))}
        onUpload={handleServiceUpload}
        userId={serviceUploadModal.userId}
        isUploading={uploadingService}
      />
      
      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={modalState.isOpen}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
        onConfirm={modalState.onConfirm}
        onCancel={modalState.onCancel}
      />
    </div>
  );
};

export default Compliance;
