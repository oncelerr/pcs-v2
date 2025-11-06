import React, { useState, useEffect } from 'react';
import styles from './UserDetailsModal.module.css';
import axios from 'axios';

interface UserInformation {
  id: number;
  user_id: number;
  company_name: string;
  first_name: string;
  last_name: string;
  company_designator?: string;
  state_registration?: string;
  franchise?: string;
  irs?: string;
  email_address?: string;
  contact_number?: string;
  country?: string;
  address_one?: string;
  address_two?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  company_type?: string;
  company_industry?: string;
  company_website?: string;
  business_description?: string;
  ssn?: string;
  created_at?: string;
  updated_at?: string;
  // Document fields
  passport_file_name?: string;
  proof_address_file_name?: string;
  signature_file_name?: string;
}

interface UserDetailsModalProps {
  isOpen: boolean;
  userData: UserInformation | null;
  onClose: () => void;
}

const UserDetailsModal: React.FC<UserDetailsModalProps> = ({
  isOpen,
  userData,
  onClose
}) => {
  if (!isOpen || !userData) return null;

  // Format date to a readable format
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not available';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Simple state to track if documents are loading
  const [isLoading, setIsLoading] = useState(true);
  
  // State to store secure document URLs
  const [secureUrls, setSecureUrls] = useState<{
    passport?: string;
    proof_address?: string;
    signature?: string;
  }>({});
  
  // Generate secure document URLs when modal opens
  useEffect(() => {
    if (isOpen && userData) {
      setIsLoading(true);
      
      // Generate secure URLs for documents
      const fetchSecureUrls = async () => {
        try {
          // Request secure URLs from the server
          const response = await axios.post('/api/secure-document-urls', {
            userId: userData.user_id,
            documentTypes: ['passport', 'proof_address', 'signature']
          });
          
          if (response.data && response.data.urls) {
            setSecureUrls(response.data.urls);
          }
        } catch (error) {
          console.error('Error fetching secure document URLs:', error);
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchSecureUrls();
    }
  }, [isOpen, userData]);
  
  // Function to securely view/download a document
  const viewSecureDocument = async (documentType: string) => {
    try {
      // Request a one-time download token
      const response = await axios.post('/api/document-access-token', {
        userId: userData.user_id,
        documentType: documentType
      });
      
      if (response.data && response.data.downloadUrl) {
        // Open the secure download URL in a new tab
        window.open(response.data.downloadUrl, '_blank');
      }
    } catch (error) {
      console.error(`Error accessing ${documentType} document:`, error);
      alert('Unable to access document. Please try again later.');
    }
  };

  return (
    <div className={styles.userDetailsModalOverlay} onClick={onClose}>
      <div className={styles.userDetailsModal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.userDetailsModalHeader}>
          <h2>User Details</h2>
          <button className={styles.closeButton} onClick={onClose}>&times;</button>
        </div>
        <div className={styles.userDetailsModalContent}>
          <div className={styles.userDetailsSection}>
            <h3>Personal Information</h3>
            <div className={styles.userDetailsGrid}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>ID:</span>
                <span className={styles.detailValue}>{userData.user_id}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Name:</span>
                <span className={styles.detailValue}>{`${userData.first_name} ${userData.last_name}`}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Email:</span>
                <span className={styles.detailValue}>{userData.email_address || 'Not provided'}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Contact Number:</span>
                <span className={styles.detailValue}>{userData.contact_number || 'Not provided'}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>SSN:</span>
                <span className={styles.detailValue}>{userData.ssn || 'Not provided'}</span>
              </div>
            </div>
          </div>

          <div className={styles.userDetailsSection}>
            <h3>Company Information</h3>
            <div className={styles.userDetailsGrid}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Company Name:</span>
                <span className={styles.detailValue}>{userData.company_name || 'Not provided'}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Company Type:</span>
                <span className={styles.detailValue}>{userData.company_type || 'Not provided'}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Company Designator:</span>
                <span className={styles.detailValue}>{userData.company_designator || 'Not provided'}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Industry:</span>
                <span className={styles.detailValue}>{userData.company_industry || 'Not provided'}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Website:</span>
                <span className={styles.detailValue}>{userData.company_website || 'Not provided'}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>State Registration:</span>
                <span className={styles.detailValue}>{userData.state_registration || 'Not provided'}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Franchise Date:</span>
                <span className={styles.detailValue}>{userData.franchise || 'Not provided'}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>IRS Date:</span>
                <span className={styles.detailValue}>{userData.irs || 'Not provided'}</span>
              </div>
            </div>
            
            {/* Business Description - Full width section */}
            <div className={styles.fullWidthDetail}>
              <h4 className={styles.businessDescriptionTitle}>Business Description</h4>
              <div className={styles.businessDescriptionText}>
                {userData.business_description || 'Not provided'}
              </div>
            </div>
          </div>

          <div className={styles.userDetailsSection}>
            <h3>Address Information</h3>
            <div className={styles.userDetailsGrid}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Country:</span>
                <span className={styles.detailValue}>{userData.country || 'Not provided'}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Address Line 1:</span>
                <span className={styles.detailValue}>{userData.address_one || 'Not provided'}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Address Line 2:</span>
                <span className={styles.detailValue}>{userData.address_two || 'Not provided'}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>City:</span>
                <span className={styles.detailValue}>{userData.city || 'Not provided'}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>State:</span>
                <span className={styles.detailValue}>{userData.state || 'Not provided'}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>ZIP Code:</span>
                <span className={styles.detailValue}>{userData.zip_code || 'Not provided'}</span>
              </div>
            </div>
          </div>

          <div className={styles.userDetailsSection}>
            <h3>System Information</h3>
            <div className={styles.userDetailsGrid}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Created At:</span>
                <span className={styles.detailValue}>{formatDate(userData.created_at)}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Last Updated:</span>
                <span className={styles.detailValue}>{formatDate(userData.updated_at)}</span>
              </div>
            </div>
          </div>

          <div className={styles.userDetailsSection}>
            <h3>User Documents</h3>
            {isLoading ? (
              <div className={styles.documentsLoading}>
                <div className={styles.spinner}></div>
                <p>Loading documents...</p>
              </div>
            ) : (
              <div className={styles.documentsGrid}>
                <div className={styles.documentItem}>
                  <h4>Passport</h4>
                  <div className={styles.documentPreview}>
                    {secureUrls.passport ? (
                      <img 
                        src={secureUrls.passport}
                        alt="Passport"
                        onError={(e) => {
                          // Use document icon if image fails to load
                          e.currentTarget.src = '/assets/document-icon.svg';
                          e.currentTarget.classList.add('document-placeholder-img');
                          const parent = e.currentTarget.closest('.document-item');
                          if (parent) parent.classList.add('document-missing');
                          const link = parent?.querySelector('.document-link');
                          if (link) link.classList.add('hidden-link');
                        }}
                      />
                    ) : (
                      <div className={styles.documentPlaceholder}>
                        <img src="/assets/document-icon.svg" className={styles.documentPlaceholderImg} alt="No document" />
                        <span>No document available</span>
                      </div>
                    )}
                  </div>
                  {secureUrls.passport && (
                    <a 
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        viewSecureDocument('passport');
                      }}
                      className={styles.documentLink}
                    >
                      View Full Document
                    </a>
                  )}
                </div>

                <div className={styles.documentItem}>
                  <h4>Proof of Address</h4>
                  <div className={styles.documentPreview}>
                    {secureUrls.proof_address ? (
                      <img 
                        src={secureUrls.proof_address}
                        alt="Proof of Address"
                        onError={(e) => {
                          // Use document icon if image fails to load
                          e.currentTarget.src = '/assets/document-icon.svg';
                          e.currentTarget.classList.add('document-placeholder-img');
                          const parent = e.currentTarget.closest('.document-item');
                          if (parent) parent.classList.add('document-missing');
                          const link = parent?.querySelector('.document-link');
                          if (link) link.classList.add('hidden-link');
                        }}
                      />
                    ) : (
                      <div className={styles.documentPlaceholder}>
                        <img src="/assets/document-icon.svg" className={styles.documentPlaceholderImg} alt="No document" />
                        <span>No document available</span>
                      </div>
                    )}
                  </div>
                  {secureUrls.proof_address && (
                    <a 
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        viewSecureDocument('proof_address');
                      }}
                      className={styles.documentLink}
                    >
                      View Full Document
                    </a>
                  )}
                </div>

                <div className={styles.documentItem}>
                  <h4>Signature</h4>
                  <div className={styles.documentPreview}>
                    {secureUrls.signature ? (
                      <img 
                        src={secureUrls.signature}
                        alt="Signature"
                        onError={(e) => {
                          // Use document icon if image fails to load
                          e.currentTarget.src = '/assets/document-icon.svg';
                          e.currentTarget.classList.add(styles.documentPlaceholderImg);
                          const parent = e.currentTarget.closest(`.${styles.documentItem}`);
                          if (parent) parent.classList.add(styles.documentMissing);
                          const link = parent?.querySelector(`.${styles.documentLink}`);
                          if (link) link.classList.add(styles.hiddenLink);
                        }}
                      />
                    ) : (
                      <div className={styles.documentPlaceholder}>
                        <img src="/assets/document-icon.svg" className={styles.documentPlaceholderImg} alt="No document" />
                        <span>No document available</span>
                      </div>
                    )}
                  </div>
                  {secureUrls.signature && (
                    <a 
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        viewSecureDocument('signature');
                      }}
                      className={styles.documentLink}
                    >
                      View Full Document
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className={styles.userDetailsModalFooter}>
          <button className={styles.modalButton} onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default UserDetailsModal;