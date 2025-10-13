import React, { useState } from 'react';
import './ServiceUploadModal.css';
import LoadingSpinner from '../../Components/LoadingSpinner';

interface ServiceUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (service: string, file: File | null) => void;
  userId: number;
  isUploading: boolean;
}

// Service options for dropdown
const SERVICE_OPTIONS = [
  // Business Formation stage items
  { value: 'compliance', label: 'Compliance' },
  { value: 'state_registration', label: 'State Registration' },
  { value: 'boi_filing', label: 'BOI Filing' },
  
  // Finalization stage items
  { value: 'ein_filing', label: 'EIN Filing' },
  { value: 'bank_registration', label: 'Bank Registration' },
  
  // Additional services
  { value: 'registration_agent_service', label: 'Registration Agent Service' },
  { value: 'business_license_research', label: 'Business License Research' },
  { value: 'trademark_registration', label: 'Trademark Registration' },
  { value: 'dba_registration', label: 'DBA Registration' },
  { value: 'copyright_registration', label: 'Copyright Registration' },
  { value: 'brand_strategy_consultation', label: 'Brand Strategy Consultation' },
  { value: 'business_address', label: 'Business Address' },
  { value: 'mail_forwarding', label: 'Mail Forwarding' },
  { value: 'meeting_room_access', label: 'Meeting Room Access' },
  { value: 'phone_answering_service', label: 'Phone Answering Service' },
  { value: 'virtual_receptionist', label: 'Virtual Receptionist' }
];

const ServiceUploadModal: React.FC<ServiceUploadModalProps> = ({
  isOpen,
  onClose,
  onUpload,
  userId,
  isUploading
}) => {
  const [selectedService, setSelectedService] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>('No file selected');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    setFileName(selectedFile ? selectedFile.name : 'No file selected');
  };

  const handleSubmit = () => {
    if (selectedService) {
      onUpload(selectedService, file);
    }
  };

  const handleReset = () => {
    setSelectedService('');
    setFile(null);
    setFileName('No file selected');
  };

  if (!isOpen) return null;

  return (
    <div className="service-upload-modal-overlay" onClick={onClose}>
      <div className="service-upload-modal" onClick={(e) => e.stopPropagation()}>
        <div className="service-upload-modal-header">
          <h2>Upload Document</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        
        <div className="service-upload-modal-content">
          <div className="service-upload-row">
            <label htmlFor="service-select">Service:</label>
            <select
              id="service-select"
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="service-select"
              disabled={isUploading}
            >
              <option value="">Select a service</option>
              {SERVICE_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="service-upload-row">
            <label>Document:</label>
            <div className="file-input-container">
              <input
                type="file"
                id="service-document"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                style={{ display: 'none' }}
                disabled={isUploading}
              />
              <button 
                className="file-select-button"
                onClick={() => document.getElementById('service-document')?.click()}
                disabled={isUploading}
              >
                Select File
              </button>
              <span className="file-name">{fileName}</span>
            </div>
          </div>
        </div>
        
        <div className="service-upload-modal-footer">
          <button 
            className="reset-button" 
            onClick={handleReset}
            disabled={isUploading}
          >
            Reset
          </button>
          <button 
            className="cancel-button" 
            onClick={onClose}
            disabled={isUploading}
          >
            Cancel
          </button>
          <button 
            className="upload-button" 
            onClick={handleSubmit}
            disabled={isUploading || !selectedService}
          >
            {isUploading ? <LoadingSpinner size="small" color="#ffffff" /> : 'Upload'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServiceUploadModal;
