import React, { useState } from 'react';
import styles from './CompleteProfileModal.module.css';
import { useAuth } from '../../../../contexts/AuthContext';
import Modal from '../../../../Components/Modal/Modal';
import { COUNTRIES } from '../../../../data/countries';

interface FormData {
  firstName: string;
  middleName: string;
  lastName: string;
  suffixName: string;
  emailAddress: string;
  contactNumber: string;
  ssn: string;
  country: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  companyName: string;
  companyType: string;
  companyWebsite: string;
  companyIndustry: string;
  companyDesignator: string;
  stateRegistration: string;
  streetAddressLine2: string;
  passport_file_name: string;
  proof_address_file_name: string;
  signature_file_name: string;
  passport_file?: File | null;
  proof_address_file?: File | null;
  signature_file?: File | null;
}

interface ValidationErrors {
  [key: string]: boolean | string;
}

interface CompleteProfileModalProps {
  onClose?: () => void;
}

// Add CSS styles for file restrictions and error messages
const fileRestrictionStyle: React.CSSProperties = {
  fontSize: '12px',
  color: '#666',
  marginTop: '5px'
};

const errorMessageStyle: React.CSSProperties = {
  color: 'red',
  fontSize: '12px',
  marginTop: '5px'
};

const helperTextStyle: React.CSSProperties = {
  fontSize: '11px',
  color: '#666',
  marginTop: '3px',
  fontStyle: 'italic'
};

export default function CompleteProfileModal({ onClose }: CompleteProfileModalProps = {}) {
  const { user } = useAuth();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    middleName: '',
    lastName: '',
    suffixName: '',
    emailAddress: '',
    contactNumber: '',
    ssn: '',
    country: '',
    streetAddress: '',
    streetAddressLine2: '',
    city: '',
    state: '',
    zipCode: '',
    companyName: '',
    companyType: '',
    companyWebsite: '',
    companyIndustry: '',
    companyDesignator: '',
    stateRegistration: '',
    passport_file_name: '',
    proof_address_file_name: '',
    signature_file_name: '',
  });

  const [errors, setErrors] = useState<ValidationErrors>({});

  const requiredFields = [
    'firstName', 'lastName', 'emailAddress', 'contactNumber', 'ssn', 'country',
    'streetAddress', 'city', 'state', 'zipCode', 'companyName', 'companyType', 'companyWebsite',
    'passport_file_name', 'proof_address_file_name', 'signature_file_name'
  ];

  // Validation functions
  const isLettersOnly = (value: string): boolean => {
    return /^[A-Za-z\s'-]+$/.test(value);
  };

  const isNumbersOnly = (value: string): boolean => {
    return /^[0-9]+$/.test(value);
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    // Apply field-specific validation
    if (['firstName', 'middleName', 'lastName', 'suffixName', 'city', 'state'].includes(field)) {
      // For name fields, city and state, only allow letters
      if (value && !isLettersOnly(value)) {
        setErrors(prev => ({ ...prev, [field]: 'Only letters, spaces, hyphens and apostrophes allowed' }));
        return;
      }
    } else if (field === 'contactNumber') {
      // For contact number, only allow numbers
      if (value && !isNumbersOnly(value)) {
        setErrors(prev => ({ ...prev, [field]: 'Only numbers allowed' }));
        return;
      }
    } else if (field === 'zipCode') {
      // For zip code, only allow numbers
      if (value && !isNumbersOnly(value)) {
        setErrors(prev => ({ ...prev, [field]: 'Only numbers allowed' }));
        return;
      }
    }

    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: false }));
    }
  };

  // Check if file type is allowed (PDF, JPG, JPEG, PNG)
  const isValidFileType = (file: File): boolean => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    return allowedTypes.includes(file.type);
  };

  // Check if file size is under 4MB
  const isValidFileSize = (file: File): boolean => {
    const maxSizeInBytes = 4 * 1024 * 1024; // 4MB
    return file.size <= maxSizeInBytes;
  };
  
  // Function to compress image files if they're too large
  const compressImageIfNeeded = async (file: File): Promise<File | Blob> => {
    // Only compress image files
    if (!file.type.startsWith('image/')) {
      return file;
    }
    
    // Always compress images to ensure they're under 4MB
    if (file.size <= 1 * 1024 * 1024) { // Only skip compression for very small files (< 1MB)
      return file;
    }
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Calculate new dimensions while maintaining aspect ratio
          // Use smaller dimensions for larger files
          const maxDimension = file.size > 3 * 1024 * 1024 ? 1200 : 1600;
          if (width > height && width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Convert to blob with reduced quality
          canvas.toBlob(
            (blob) => {
              if (blob) {
                // Create a new file from the blob
                const compressedFile = new File(
                  [blob],
                  file.name,
                  { type: file.type, lastModified: Date.now() }
                );
                resolve(compressedFile);
              } else {
                reject(new Error('Failed to compress image'));
              }
            },
            file.type,
            file.size > 3 * 1024 * 1024 ? 0.5 : 0.7 // 50% quality for large files, 70% for smaller ones
          );
        };
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileChange = async (field: keyof FormData, file: File | null) => {
    if (file) {
      // Validate file type
      if (!isValidFileType(file)) {
        setErrors(prev => ({ 
          ...prev, 
          [field]: 'Only PDF, JPG, JPEG, and PNG files are allowed'
        }));
        return;
      }

      // Validate file size
      if (!isValidFileSize(file)) {
        setErrors(prev => ({ 
          ...prev, 
          [field]: 'File size must be less than 4MB. Please select a smaller file or compress it first.'
        }));
        return;
      }
      
      try {
        // Show loading indicator for files that need processing
        if (file.size > 1 * 1024 * 1024 && file.type.startsWith('image/')) {
          // Set a temporary loading state
          setErrors(prev => ({
            ...prev,
            [field]: 'Compressing image, please wait...'
          }));
        }
        
        // Compress image if needed
        const processedFile = file.type.startsWith('image/') 
          ? await compressImageIfNeeded(file)
          : file;
          
        // Store both file name and file object
        const fileField = field.replace('_file_name', '_file') as keyof FormData;
        setFormData(prev => ({ 
          ...prev, 
          [field]: file.name,
          [fileField]: processedFile
        }));
        
        // Clear error when user selects a valid file
        if (errors[field]) {
          setErrors(prev => ({ ...prev, [field]: false }));
        }
        
        // Log file size information
        console.log(`File ${field} - Original size: ${(file.size / 1024 / 1024).toFixed(2)}MB, ` + 
                    `Processed size: ${(processedFile.size / 1024 / 1024).toFixed(2)}MB`);
        
      } catch (error) {
        console.error('Error processing file:', error);
        setErrors(prev => ({
          ...prev,
          [field]: 'Error processing file. Please try a different file.'
        }));
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};
    let isValid = true;

    requiredFields.forEach(field => {
      const value = formData[field as keyof FormData];
      // Check if value is a string and if it's empty
      if (typeof value === 'string' && !value.trim()) {
        newErrors[field] = true;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if user is authenticated
    if (!user?.id) {
      setErrorMessage('You must be logged in to submit this form.');
      setShowErrorModal(true);
      return;
    }

    if (validateForm()) {
      try {
        // Get CSRF token from meta tag
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        
        // Create FormData object for file uploads
        const submitFormData = new FormData();
        
        // Add all text fields
        Object.keys(formData).forEach(key => {
          if (!key.includes('_file')) {
            submitFormData.append(key, formData[key as keyof FormData] as string);
          }
        });
        
        // Add user_id
        submitFormData.append('user_id', user.id.toString());
        
        // Add files with secure naming convention to private storage
        if (formData.passport_file) {
          const fileExt = formData.passport_file.name.split('.').pop() || 'pdf';
          // Generate a more secure filename with random component
          const secureFilename = `passport_${Date.now()}_${Math.random().toString(36).substring(2, 10)}.${fileExt}`;
          submitFormData.append('passport_file', formData.passport_file);
          submitFormData.append('passport_file_path', `client_${user.id}/passport/${secureFilename}`);
        }
        
        if (formData.proof_address_file) {
          const fileExt = formData.proof_address_file.name.split('.').pop() || 'pdf';
          // Generate a more secure filename with random component
          const secureFilename = `proof_address_${Date.now()}_${Math.random().toString(36).substring(2, 10)}.${fileExt}`;
          submitFormData.append('proof_address_file', formData.proof_address_file);
          submitFormData.append('proof_address_file_path', `client_${user.id}/proof_address/${secureFilename}`);
        }
        
        if (formData.signature_file) {
          const fileExt = formData.signature_file.name.split('.').pop() || 'pdf';
          // Generate a more secure filename with random component
          const secureFilename = `signature_${Date.now()}_${Math.random().toString(36).substring(2, 10)}.${fileExt}`;
          submitFormData.append('signature_file', formData.signature_file);
          submitFormData.append('signature_file_path', `client_${user.id}/signature/${secureFilename}`);
        }

        const response = await fetch('/api/submit-form', {
          method: 'POST',
          headers: {
            'X-CSRF-TOKEN': csrfToken || '',
            'X-Requested-With': 'XMLHttpRequest',
          },
          credentials: 'same-origin',
          body: submitFormData,
        });

        if (response.ok) {
          // Show success modal instead of alert
          setShowSuccessModal(true);
          localStorage.removeItem('statusProgress');
          
          // Delay page reload to allow user to see the success message
          setTimeout(() => {
            if (onClose) {
              onClose();
            }
            window.location.reload();
          }, 2000);
        } else {
          const error = await response.json();
          console.error('Server error:', error);
          setErrorMessage('Submission failed: ' + (error.message || 'Unknown error'));
          setShowErrorModal(true);
        }
      } catch (error) {
        console.error('Error submitting form:', error);
        setErrorMessage('An error occurred while submitting the form.');
        setShowErrorModal(true);
      }
    } else {
      const errorFields = Object.keys(errors).filter(field => errors[field]);
      const missingFields = errorFields.map(field => {
        const fieldNames: { [key: string]: string } = {
          firstName: 'First Name',
          lastName: 'Last Name',
          emailAddress: 'Email Address',
          contactNumber: 'Contact Number',
          ssn: 'SSN',
          country: 'Country',
          streetAddress: 'Street Address',
          city: 'City',
          state: 'State/Province',
          zipCode: 'Postal/Zip Code',
          companyName: 'Company Name',
          companyType: 'Company Type',
          companyWebsite: 'Company Website',
          passport_file_name: 'Passport File Name',
          proof_address_file_name: 'Proof Address File Name',
          signature_file_name: 'Signature File Name',
        };
        return fieldNames[field] || field;
      });

      setErrorMessage(`Please fill in the following required fields:\n\n${missingFields.join('\n')}`);
      setShowErrorModal(true);
    }
  };

  // Success modal component
  const SuccessModal = () => (
    <div className={styles.modalOverlay} style={{ zIndex: 10001 }}>
      <div className={styles.successModal}>
        <div className={styles.successIcon}>
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="32" cy="32" r="32" fill="#106552"/>
            <path d="M20 32L28 40L44 24" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h3 className={styles.successTitle}>Success!</h3>
        <p className={styles.successMessage}>Your profile has been submitted successfully.</p>
      </div>
    </div>
  );

  return (
    <>
      {showSuccessModal && <SuccessModal />}
      {showErrorModal && (
        <Modal
          modalType="error"
          paymentErrorMessage={errorMessage}
          setShowModal={setShowErrorModal}
        />
      )}
      <div className={styles.modalOverlay} aria-hidden={false}>
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-setup-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <div id="profile-setup-modal-title" className={styles.modalTitle}>Profile Setup Required</div>
        </div>
        <form onSubmit={handleSubmit} className={styles.mpWrp}>
          <div className={styles.modalBody}>
            Please complete your Profile Setup to continue. This dialog cannot be closed until the task is completed.
            <button type="submit" className={styles.modalBodyBtn}>
              Submit Profile
            </button>
          </div>

          <div className={styles.personalDeetsCont}>
            <div className={styles.personalDeetsHeader}>
              <img className={styles.personalDeetsHeaderImg} src="/assets/paper-icon.png" alt="" />
              <h3 className={styles.h3Title}>Personal Details</h3>
            </div>
            <div className={styles.mpHr} />
            <div className={styles.personalDeetsField}>
              <h3 className={styles.h3Title}>Personal Details</h3>
              <div className={styles.mpHr} />
              <div className={styles.personalDeetsSection}>
                <div className={styles.personalDeetsInput}>
                  <h3 className={styles.h3Title}>First Name</h3>
                  <input
                    className={`${styles.pdFn} ${errors.firstName ? styles.errorField : ''}`}
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    required
                  />
                  {typeof errors.firstName === 'string' && (
                    <div style={errorMessageStyle}>{errors.firstName}</div>
                  )}
                </div>
                <div className={styles.personalDeetsInput}>
                  <h3 className={styles.h3Title}>Middle Name <span className="opt-tag">(Optional)</span></h3>
                  <input 
                    className={`${styles.pdFn} ${errors.middleName ? styles.errorField : ''}`}
                    type="text" 
                    value={formData.middleName || ''}
                    onChange={(e) => handleInputChange('middleName', e.target.value)}
                  />
                  {typeof errors.middleName === 'string' && (
                    <div style={errorMessageStyle}>{errors.middleName}</div>
                  )}
                </div>
                <div className={styles.personalDeetsInput}>
                  <h3 className={styles.h3Title}>Last Name</h3>
                  <input
                    className={`${styles.pdFn} ${errors.lastName ? styles.errorField : ''}`}
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    required
                  />
                  {typeof errors.lastName === 'string' && (
                    <div style={errorMessageStyle}>{errors.lastName}</div>
                  )}
                </div>
                <div className={styles.personalDeetsInput}>
                  <h3 className={styles.h3Title}>Suffix Name <span className="opt-tag">(Optional)</span></h3>
                  <input 
                    className={`${styles.pdFn} ${errors.suffixName ? styles.errorField : ''}`}
                    type="text"
                    value={formData.suffixName || ''}
                    onChange={(e) => handleInputChange('suffixName', e.target.value)}
                  />
                  {typeof errors.suffixName === 'string' && (
                    <div style={errorMessageStyle}>{errors.suffixName}</div>
                  )}
                </div>
              </div>
              <div className={styles.personalDeetsSection}>
                <div className={styles.personalDeetsInput}>
                  <h3 className={styles.h3Title}>Email Address</h3>
                  <input
                    className={`${styles.pdFn} ${errors.emailAddress ? styles.errorField : ''}`}
                    type="email"
                    value={formData.emailAddress}
                    onChange={(e) => handleInputChange('emailAddress', e.target.value)}
                    required
                  />
                </div>
                <div className={styles.personalDeetsInput}>
                  <h3 className={styles.h3Title}>Contact Number</h3>
                  <input
                    className={`${styles.pdFn} ${errors.contactNumber ? styles.errorField : ''}`}
                    type="tel"
                    value={formData.contactNumber}
                    onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                    required
                  />
                  {typeof errors.contactNumber === 'string' && (
                    <div style={errorMessageStyle}>{errors.contactNumber}</div>
                  )}
                </div>
              </div>
              <div className={styles.personalDeetsSection}>
                <div className={styles.personalDeetsInput}>
                  <h3 className={styles.h3Title}>SSN</h3>
                  <input
                    className={`${styles.pdFn} ${errors.ssn ? styles.errorField : ''}`}
                    type="text"
                    value={formData.ssn}
                    onChange={(e) => handleInputChange('ssn', e.target.value)}
                    required
                  />
                </div>
                <div className={styles.personalDeetsInput}>
                  <h3 className={styles.h3Title}>Country</h3>
                  <select
                    className={`${styles.pdFn} ${errors.country ? styles.errorField : ''}`}
                    value={formData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    required
                  >
                    <option value="" disabled>Select a country</option>
                    {COUNTRIES.map((c: Country) => (
                      <option key={c.code} value={c.code}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
          <div className={styles.personalDeetsCont}>
            <div className={styles.personalDeetsHeader}>
              <img className={styles.personalDeetsHeaderImg} src="/assets/paper-icon.png" alt="" />
              <h3 className={styles.h3Title}>Address Information</h3>
            </div>
            <div className={styles.mpHr} />
            <div className={styles.personalDeetsField}>
              <div className={styles.personalDeetsSection}>
                <div className={styles.personalDeetsInput}>
                  <h3 className={styles.h3Title}>Street Address</h3>
                  <input
                    className={`${styles.pdFn} ${errors.streetAddress ? styles.errorField : ''}`}
                    type="text"
                    value={formData.streetAddress}
                    onChange={(e) => handleInputChange('streetAddress', e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className={styles.personalDeetsSection}>
                <div className={styles.personalDeetsInput}>
                  <h3 className={styles.h3Title}>Street Address Line 2</h3>
                  <input className={styles.pdFn} type="text" name="" id="" />
                </div>
              </div>
              <div className={styles.personalDeetsSection}>
                <div className={styles.personalDeetsInput}>
                  <h3 className={styles.h3Title}>City</h3>
                  <input
                    className={`${styles.pdFn} ${errors.city ? styles.errorField : ''}`}
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    required
                  />
                  {typeof errors.city === 'string' && (
                    <div style={errorMessageStyle}>{errors.city}</div>
                  )}
                </div>
                <div className={styles.personalDeetsInput}>
                  <h3 className={styles.h3Title}>State / Province</h3>
                  <input
                    className={`${styles.pdFn} ${errors.state ? styles.errorField : ''}`}
                    type="text"
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    required
                  />
                  {typeof errors.state === 'string' && (
                    <div style={errorMessageStyle}>{errors.state}</div>
                  )}
                </div>
                <div className={styles.personalDeetsInput}>
                  <h3 className={styles.h3Title}>Postal / Zip Code</h3>
                  <input
                    className={`${styles.pdFn} ${errors.zipCode ? styles.errorField : ''}`}
                    type="text"
                    value={formData.zipCode}
                    onChange={(e) => handleInputChange('zipCode', e.target.value)}
                    required
                  />
                  {typeof errors.zipCode === 'string' && (
                    <div style={errorMessageStyle}>{errors.zipCode}</div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className={styles.personalDeetsCont}>
            <div className={styles.personalDeetsHeader}>
              <img className={styles.personalDeetsHeaderImg} src="/assets/paper-icon.png" alt="" />
              <h3 className={styles.h3Title}>Company Information</h3>
            </div>
            <div className={styles.mpHr} />
            <div className={styles.personalDeetsField}>
              <div className={styles.personalDeetsSection}>
                <div className={styles.personalDeetsInput}>
                  <h3 className={styles.h3Title}>Company Name</h3>
                  <input
                    className={`${styles.pdFn} ${errors.companyName ? styles.errorField : ''}`}
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                    required
                  />
                </div>
                <div className={styles.personalDeetsInput}>
                  <h3 className={styles.h3Title}>Company Type</h3>
                  <select
                    className={`${styles.pdFn} ${errors.companyType ? styles.errorField : ''}`}
                    value={formData.companyType}
                    onChange={(e) => handleInputChange('companyType', e.target.value)}
                    required
                  >
                    <option value="" disabled>Select a Company Type</option>
                    <option value="llc">LLC</option>
                    <option value="nonprofit">Non-profit</option>
                    <option value="subsidiary">Subsidiary</option>
                    <option value="inc">Inc</option>
                    <option value="corporation">Corporation</option>
                  </select>
                </div>
              </div>
              <div className={styles.personalDeetsSection}>
                <div className={styles.personalDeetsInput}>
                  <h3 className={styles.h3Title}>Company Website</h3>
                  <input
                    className={`${styles.pdFn} ${errors.companyName ? styles.errorField : ''}`}
                    type="text"
                    value={formData.companyWebsite}
                    onChange={(e) => handleInputChange('companyWebsite', e.target.value)}
                    required
                  />
                </div>
                <div className={styles.personalDeetsInput}>
                  <h3 className={styles.h3Title}>Company Industry</h3>
                  <input
                    className={`${styles.pdFn} ${errors.companyName ? styles.errorField : ''}`}
                    type="text"
                    value={formData.companyIndustry}
                    onChange={(e) => handleInputChange('companyIndustry', e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className={styles.personalDeetsSection}>
                <div className={styles.personalDeetsInput}>
                  <h3 className={styles.h3Title}>Company Designator</h3>
                  <select
                    className={`${styles.pdFn} ${errors.companyName ? styles.errorField : ''}`}
                    value={formData.companyDesignator}
                    onChange={(e) => handleInputChange('companyDesignator', e.target.value)}
                    required
                  >
                    <option value="" disabled>Select a Company Designator</option>
                    <option value="llc">LLC</option>
                    <option value="nonprofit">Non-profit</option>
                    <option value="subsidiary">Subsidiary</option>
                    <option value="inc">Inc</option>
                    <option value="corporation">Corporation</option>
                  </select>
                </div>
                <div className={styles.personalDeetsInput}>
                  <h3 className={styles.h3Title}>State Registration</h3>
                  <select
                    className={`${styles.pdFn} ${errors.companyName ? styles.errorField : ''}`}
                    value={formData.stateRegistration}
                    onChange={(e) => handleInputChange('stateRegistration', e.target.value)}
                    required
                  >
                    <option value="" disabled>Select a State Registration</option>
                    <option value="llc">DELAWARE</option>
                    <option value="nonprofit">WYOMING</option>
                    <option value="subsidiary">FLORIDA</option>
                    <option value="inc">CALIFORNIA</option>
                    <option value="corporation">NEVADA</option>
                    <option value="corporation">Others</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          <div className={styles.personalDeetsCont}>
            <div className={styles.personalDeetsHeader}>
              <img className={styles.personalDeetsHeaderImg} src="/assets/paper-icon.png" alt="" />
              <h3 className={styles.h3Title}>Company Information</h3>
            </div>
            <div className={styles.mpHr} />
            <div className={styles.personalDeetsField}>
              <div className={styles.personalDeetsSection}>
                <div className={styles.personalDeetsInput}>
                  <h3 className={styles.h3Title}>Main Applicant's Passport</h3>
                  <input
                    className={`${styles.pdFn} ${errors.passport_file_name ? styles.errorField : ''}`}
                    type="file"
                    name="passport_file_name"
                    id="passport_file_name"
                    onChange={async (e) => await handleFileChange('passport_file_name', e.target.files?.[0] || null)}
                    accept=".pdf,.jpg,.jpeg,.png"
                    required
                  />
                  {typeof errors.passport_file_name === 'string' && (
                    <div style={errorMessageStyle}>{errors.passport_file_name}</div>
                  )}
                  <div style={fileRestrictionStyle}>
                    Allowed file types: PDF, JPG, JPEG, PNG. Max size: 4MB (images will be automatically compressed)
                  </div>
                </div>
                <div className={styles.personalDeetsInput}>
                  <h3 className={styles.h3Title}>Main Applicant's Proof of Address</h3>
                  <input
                    className={`${styles.pdFn} ${errors.proof_address_file_name ? styles.errorField : ''}`}
                    type="file"
                    name="proof_address_file_name"
                    id="proof_address_file_name"
                    onChange={async (e) => await handleFileChange('proof_address_file_name', e.target.files?.[0] || null)}
                    accept=".pdf,.jpg,.jpeg,.png"
                    required
                  />
                  {typeof errors.proof_address_file_name === 'string' && (
                    <div style={errorMessageStyle}>{errors.proof_address_file_name}</div>
                  )}
                  <div style={fileRestrictionStyle}>
                    Allowed file types: PDF, JPG, JPEG, PNG. Max size: 4MB (images will be automatically compressed)
                  </div>
                </div>
                <div className={styles.personalDeetsInput}>
                  <h3 className={styles.h3Title}>Main Applicant's Signature</h3>
                  <input
                    className={`${styles.pdFn} ${errors.signature_file_name ? styles.errorField : ''}`}
                    type="file"
                    name="signature_file_name"
                    id="signature_file_name"
                    onChange={async (e) => await handleFileChange('signature_file_name', e.target.files?.[0] || null)}
                    accept=".pdf,.jpg,.jpeg,.png"
                    required
                  />
                  {typeof errors.signature_file_name === 'string' && (
                    <div style={errorMessageStyle}>{errors.signature_file_name}</div>
                  )}
                  <div style={fileRestrictionStyle}>
                    Allowed file types: PDF, JPG, JPEG, PNG. Max size: 4MB (images will be automatically compressed)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
    </>
  );
}