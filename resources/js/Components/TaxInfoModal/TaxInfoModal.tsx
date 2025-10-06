import React, { useState } from 'react';
import './TaxInfoModal.css';
import LoadingSpinner from '../../Components/LoadingSpinner';

interface TaxInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (franchiseTaxDate: string, irsTaxDate: string, franchiseTaxFile: File | null, irsTaxFile: File | null) => void;
  userId: number;
  isSubmitting: boolean;
}

const TaxInfoModal: React.FC<TaxInfoModalProps> = ({
  isOpen,
  onClose,
  onSave,
  userId,
  isSubmitting
}) => {
  const [franchiseTaxDate, setFranchiseTaxDate] = useState<string>('');
  const [irsTaxDate, setIrsTaxDate] = useState<string>('');
  const [franchiseTaxFile, setFranchiseTaxFile] = useState<File | null>(null);
  const [irsTaxFile, setIrsTaxFile] = useState<File | null>(null);
  const [franchiseFileName, setFranchiseFileName] = useState<string>('No file selected');
  const [irsFileName, setIrsFileName] = useState<string>('No file selected');

  const handleFranchiseTaxFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFranchiseTaxFile(file);
    setFranchiseFileName(file ? file.name : 'No file selected');
  };

  const handleIrsTaxFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setIrsTaxFile(file);
    setIrsFileName(file ? file.name : 'No file selected');
  };

  const handleSubmit = () => {
    onSave(franchiseTaxDate, irsTaxDate, franchiseTaxFile, irsTaxFile);
  };

  if (!isOpen) return null;

  return (
    <div className="tax-info-modal-overlay" onClick={onClose}>
      <div className="tax-info-modal" onClick={(e) => e.stopPropagation()}>
        <div className="tax-info-modal-header">
          <h2>Tax Information</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        
        <div className="tax-info-modal-content">
          <div className="tax-info-section">
            <h3>Annual Franchise Tax</h3>
            <div className="tax-info-row">
              <label>Due Date:</label>
              <input
                type="date"
                value={franchiseTaxDate}
                onChange={(e) => setFranchiseTaxDate(e.target.value)}
                className="tax-date-input"
              />
            </div>
            <div className="tax-info-row">
              <label>Document:</label>
              <div className="file-input-container">
                <input
                  type="file"
                  id="franchise-tax-file"
                  onChange={handleFranchiseTaxFileChange}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  style={{ display: 'none' }}
                />
                <button 
                  className="file-select-button"
                  onClick={() => document.getElementById('franchise-tax-file')?.click()}
                >
                  Select File
                </button>
                <span className="file-name">{franchiseFileName}</span>
              </div>
            </div>
          </div>
          
          <div className="tax-info-section">
            <h3>IRS Annual Tax Return</h3>
            <div className="tax-info-row">
              <label>Due Date:</label>
              <input
                type="date"
                value={irsTaxDate}
                onChange={(e) => setIrsTaxDate(e.target.value)}
                className="tax-date-input"
              />
            </div>
            <div className="tax-info-row">
              <label>Document:</label>
              <div className="file-input-container">
                <input
                  type="file"
                  id="irs-tax-file"
                  onChange={handleIrsTaxFileChange}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  style={{ display: 'none' }}
                />
                <button 
                  className="file-select-button"
                  onClick={() => document.getElementById('irs-tax-file')?.click()}
                >
                  Select File
                </button>
                <span className="file-name">{irsFileName}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="tax-info-modal-footer">
          <button className="cancel-button" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </button>
          <button 
            className="save-button" 
            onClick={handleSubmit}
            disabled={isSubmitting || (!franchiseTaxDate && !irsTaxDate)}
          >
            {isSubmitting ? <LoadingSpinner size="small" color="#ffffff" /> : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaxInfoModal;
