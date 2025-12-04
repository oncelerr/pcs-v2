import React, { useState, useEffect } from 'react';
import './FileUploadModal.css';
import LoadingSpinner from '../../Components/LoadingSpinner';

interface FileRow {
  id: string;
  title: string;
  file: File | null;
}

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (title: string, files: File[], skipUpload?: boolean) => Promise<void> | void;
  userId: number;
  fieldName: string;
  isUploading: boolean;
  isAdmin?: boolean;
}

const FileUploadModal: React.FC<FileUploadModalProps> = ({
  isOpen,
  onClose,
  onUpload,
  userId,
  fieldName,
  isUploading,
  isAdmin = false
}) => {
  const [fileRows, setFileRows] = useState<FileRow[]>([
    { id: '1', title: '', file: null }
  ]);
  const [skipFileUpload, setSkipFileUpload] = useState<boolean>(false);

  // Reset modal state to initial values
  const resetModal = () => {
    setFileRows([{ id: '1', title: '', file: null }]);
    setSkipFileUpload(false);
  };

  // Reset modal when it opens (only when transitioning from closed to open)
  useEffect(() => {
    if (isOpen) {
      // Only reset if we're not currently uploading
      if (!isUploading) {
        resetModal();
      }
    }
  }, [isOpen, isUploading]);

  const handleTitleChange = (id: string, value: string) => {
    setFileRows(prev => 
      prev.map(row => 
        row.id === id ? { ...row, title: value } : row
      )
    );
  };

  const handleFileChange = (id: string, file: File | null) => {
    setFileRows(prev => 
      prev.map(row => 
        row.id === id ? { ...row, file } : row
      )
    );
  };

  const addFileRow = () => {
    const newId = String(Date.now());
    setFileRows(prev => [...prev, { id: newId, title: '', file: null }]);
  };

  const removeFileRow = (id: string) => {
    if (fileRows.length > 1) {
      setFileRows(prev => prev.filter(row => row.id !== id));
    }
  };

  const handleSubmit = async () => {
    try {
      // If admin is skipping file upload
      if (skipFileUpload && isAdmin) {
        await onUpload(fieldName, [], true);
        resetModal(); // Reset after successful skip
        return;
      }
      
      // Filter out rows with no files
      const validFiles = fileRows
        .filter(row => row.file !== null)
        .map(row => {
          // If a file exists, rename it with the title
          if (row.file) {
            const fileExtension = row.file.name.split('.').pop();
            const newFileName = `${row.title || 'document'}.${fileExtension}`;
            
            // Create a new File object with the title in the name
            const newFile = new File([row.file], newFileName, { type: row.file.type });
            
            // Add a custom property to store the title
            Object.defineProperty(newFile, 'title', {
              value: row.title || 'document',
              writable: true,
              enumerable: true
            });
            
            return newFile;
          }
          return null;
        })
        .filter(Boolean) as File[];

      if (validFiles.length > 0) {
        await onUpload(fieldName, validFiles);
        resetModal(); // Reset after successful upload
      }
    } catch (error) {
      // Don't reset on error - let user retry or manually close
      console.error('Upload failed:', error);
    }
  };

  const handleClose = () => {
    resetModal(); // Reset when closing
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="file-upload-modal-overlay" onClick={handleClose}>
      <div className="file-upload-modal" onClick={(e) => e.stopPropagation()}>
        <div className="file-upload-modal-header">
          <h2>Upload Documents for {fieldName.replace('_status', '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</h2>
          <button className="close-button" onClick={handleClose}>&times;</button>
        </div>
        
        <div className="file-upload-modal-content">
          <p>Please provide a title and select files to upload</p>
          
          {fileRows.map((row) => (
            <div key={row.id} className="file-row">
              <input
                type="text"
                placeholder="Document Title"
                value={row.title}
                onChange={(e) => handleTitleChange(row.id, e.target.value)}
                className="file-title-input"
              />
              <div className="file-input-container">
                <input
                  type="file"
                  id={`file-${row.id}`}
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    handleFileChange(row.id, file);
                  }}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  style={{ display: 'none' }}
                />
                <button 
                  className="file-select-button"
                  onClick={() => document.getElementById(`file-${row.id}`)?.click()}
                >
                  Select File
                </button>
                <span className="file-name">
                  {row.file ? row.file.name : 'No file selected'}
                </span>
              </div>
              <button 
                className="remove-row-button"
                onClick={() => removeFileRow(row.id)}
                disabled={fileRows.length <= 1}
              >
                &times;
              </button>
            </div>
          ))}
          
          <button className="add-row-button" onClick={addFileRow}>
            + Add Another File
          </button>
        </div>
        
        <div className="file-upload-modal-footer">
          {isAdmin && (
            <div className="admin-skip-upload">
              <input
                type="checkbox"
                id="skip-upload-checkbox"
                checked={skipFileUpload}
                onChange={(e) => setSkipFileUpload(e.target.checked)}
              />
              <label htmlFor="skip-upload-checkbox">Continue without uploading files</label>
            </div>
          )}
          <div className="modal-buttons">
            <button className="cancel-button" onClick={handleClose} disabled={isUploading}>
              Cancel
            </button>
            <button 
              className="upload-button" 
              onClick={handleSubmit}
              disabled={isUploading || (!skipFileUpload && fileRows.every(row => !row.file))}
            >
              {isUploading ? 
                <LoadingSpinner size="small" color="#ffffff" /> : 
                (skipFileUpload ? 'Continue' : 'Upload Files')
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUploadModal;
