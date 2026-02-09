import React, { useState, useRef, useEffect } from 'react';
import styles from './CompleteProfileModal.module.css';
import { useAuth } from '../../../../contexts/AuthContext';
import Modal from '../../../../Components/Modal/Modal';
import { COUNTRIES } from '../../../../data/countries';
import LoadingSpinner from '../../../../Components/LoadingSpinner/LoadingSpinner';
// @ts-ignore - SignaturePad doesn't have TypeScript definitions
import SignaturePad from 'signature_pad';

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
  otherStateRegistration: string;
  businessDescription: string;
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
  candidateUserId?: number;
}

type FormStep = 'personal' | 'address' | 'business' | 'documents';

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

export default function CompleteProfileModal({ onClose, candidateUserId }: CompleteProfileModalProps = {}) {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<FormStep>('personal');
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDrawSignature, setIsDrawSignature] = useState(false);
  const [showOtherStateInput, setShowOtherStateInput] = useState(false);
  const signaturePadRef = useRef<HTMLDivElement>(null);
  const signaturePad = useRef<any>(null);
  
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
    otherStateRegistration: '',
    businessDescription: '',
    passport_file_name: '',
    proof_address_file_name: '',
    signature_file_name: '',
  });

  const [errors, setErrors] = useState<ValidationErrors>({});

  // Define required fields for each step
  const stepRequiredFields: Record<FormStep, string[]> = {
    personal: ['firstName', 'lastName', 'emailAddress', 'contactNumber', 'ssn'],
    address: ['country', 'streetAddress', 'city', 'state', 'zipCode'],
    business: ['companyName', 'companyType', 'companyIndustry', 'businessDescription'],
    documents: ['passport_file_name', 'proof_address_file_name']
  };

  // Calculate progress percentage
  const steps: FormStep[] = ['personal', 'address', 'business', 'documents'];
  const currentStepIndex = steps.indexOf(currentStep);
  const progressPercentage = ((currentStepIndex + 1) / steps.length) * 100;

  // Function to count words in a string
  const countWords = (text: string): number => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    if (field === 'businessDescription') {
      const wordCount = countWords(value);
      if (wordCount < 20) {
        setErrors(prev => ({ ...prev, [field]: `Please provide at least 20 words. Current count: ${wordCount} words` }));
      } else {
        setErrors(prev => ({ ...prev, [field]: false }));
      }
    }

    if (field === 'stateRegistration') {
      setShowOtherStateInput(value === 'others');
      if (value !== 'others') {
        setFormData(prev => ({ ...prev, otherStateRegistration: '' }));
      }
    }

    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: false }));
    }
  };

  const isValidFileType = (file: File): boolean => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    return allowedTypes.includes(file.type);
  };

  const isValidFileSize = (file: File): boolean => {
    const maxSizeInBytes = 4 * 1024 * 1024;
    return file.size <= maxSizeInBytes;
  };

  useEffect(() => {
    if (isDrawSignature && signaturePadRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = signaturePadRef.current.clientWidth;
      canvas.height = 200;
      canvas.style.width = '100%';
      canvas.style.height = '200px';
      canvas.style.backgroundColor = '#fff';
      
      if (signaturePadRef.current.firstChild) {
        signaturePadRef.current.removeChild(signaturePadRef.current.firstChild);
      }
      
      signaturePadRef.current.appendChild(canvas);
      
      signaturePad.current = new SignaturePad(canvas, {
        backgroundColor: '#fff',
        penColor: '#000'
      });
    }
  }, [isDrawSignature]);

  const clearSignature = () => {
    if (signaturePad.current) {
      signaturePad.current.clear();
    }
  };

  const getSignatureAsFile = async (): Promise<File | null> => {
    if (!isDrawSignature || !signaturePad.current || signaturePad.current.isEmpty()) {
      return null;
    }
    
    try {
      const dataURL = signaturePad.current.toDataURL('image/png');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      const imageLoaded = new Promise<void>((resolve) => {
        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx?.drawImage(img, 0, 0);
          resolve();
        };
      });
      
      img.src = dataURL;
      await imageLoaded;
      
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => {
          if (b) resolve(b);
          else resolve(new Blob([], { type: 'image/png' }));
        }, 'image/png');
      });
      
      const fileName = `signature_${Date.now()}.png`;
      const file = new File([blob], fileName, { type: 'image/png' });
      
      return file;
    } catch (error) {
      console.error('Error converting signature to file:', error);
      return null;
    }
  };

  const compressImageIfNeeded = async (file: File): Promise<File | Blob> => {
    if (!file.type.startsWith('image/')) {
      return file;
    }
    
    if (file.size <= 1 * 1024 * 1024) {
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
          
          canvas.toBlob(
            (blob) => {
              if (blob) {
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
            file.size > 3 * 1024 * 1024 ? 0.5 : 0.7
          );
        };
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileChange = async (field: keyof FormData, file: File | null) => {
    if (file) {
      if (!isValidFileType(file)) {
        setErrors(prev => ({ 
          ...prev, 
          [field]: 'Only PDF, JPG, JPEG, and PNG files are allowed'
        }));
        return;
      }

      if (!isValidFileSize(file)) {
        setErrors(prev => ({ 
          ...prev, 
          [field]: 'File size must be less than 4MB. Please select a smaller file or compress it first.'
        }));
        return;
      }
      
      try {
        if (file.size > 1 * 1024 * 1024 && file.type.startsWith('image/')) {
          setErrors(prev => ({
            ...prev,
            [field]: 'Compressing image, please wait...'
          }));
        }
        
        const processedFile = file.type.startsWith('image/') 
          ? await compressImageIfNeeded(file)
          : file;
          
        let finalFile: File;
        if (processedFile instanceof Blob && !(processedFile instanceof File)) {
          finalFile = new File([processedFile], file.name, { type: file.type });
        } else {
          finalFile = processedFile as File;
        }
          
        const fileField = field.replace('_file_name', '_file') as keyof FormData;
        setFormData(prev => ({ 
          ...prev, 
          [field]: finalFile.name,
          [fileField]: finalFile
        }));
        
        if (errors[field]) {
          setErrors(prev => ({ ...prev, [field]: false }));
        }
        
      } catch (error) {
        console.error('Error processing file:', error);
        setErrors(prev => ({
          ...prev,
          [field]: 'Error processing file. Please try a different file.'
        }));
      }
    } else {
      const fileField = field.replace('_file_name', '_file') as keyof FormData;
      setFormData(prev => ({ 
        ...prev, 
        [field]: '',
        [fileField]: null
      }));
    }
  };

  const validateStep = (step: FormStep): boolean => {
    const newErrors: ValidationErrors = {};
    let isValid = true;

    const fieldsToValidate = stepRequiredFields[step];
    
    fieldsToValidate.forEach(field => {
      const value = formData[field as keyof FormData];
      if (typeof value === 'string' && !value.trim()) {
        newErrors[field] = field === 'businessDescription' ? 'Business description is required' : true;
        isValid = false;
      }
    });
    
    // Special validations
    if (step === 'business') {
      if (formData.businessDescription.trim() && countWords(formData.businessDescription) < 20) {
        const wordCount = countWords(formData.businessDescription);
        newErrors.businessDescription = `Please provide at least 20 words. Current count: ${wordCount} words`;
        isValid = false;
      }
      
      if (formData.stateRegistration === 'others' && !formData.otherStateRegistration.trim()) {
        newErrors.otherStateRegistration = 'Please specify the state';
        isValid = false;
      }
    }
    
    if (step === 'documents') {
      if (isDrawSignature) {
        if (!signaturePad.current || signaturePad.current.isEmpty()) {
          newErrors.signature_file_name = 'Please draw your signature';
          isValid = false;
        }
      } else {
        if (!formData.signature_file) {
          newErrors.signature_file_name = 'Please upload a signature file';
          isValid = false;
        }
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      const currentIndex = steps.indexOf(currentStep);
      if (currentIndex < steps.length - 1) {
        setSlideDirection('right');
        setCurrentStep(steps[currentIndex + 1]);
      }
    }
  };

  const handleBack = () => {
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setSlideDirection('left');
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const navigateToStepWithErrors = (errorFields: string[]) => {
    // Find which step has errors
    for (const step of steps) {
      const stepFields = stepRequiredFields[step];
      const hasError = errorFields.some(field => stepFields.includes(field));
      if (hasError) {
        const targetIndex = steps.indexOf(step);
        const currentIndex = steps.indexOf(currentStep);
        setSlideDirection(targetIndex > currentIndex ? 'right' : 'left');
        setCurrentStep(step);
        break;
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate current step first
    if (!validateStep(currentStep)) {
      return;
    }

    // Validate all steps
    let allValid = true;
    const allErrors: ValidationErrors = {};
    
    for (const step of steps) {
      const fieldsToValidate = stepRequiredFields[step];
      fieldsToValidate.forEach(field => {
        const value = formData[field as keyof FormData];
        if (typeof value === 'string' && !value.trim()) {
          allErrors[field] = true;
          allValid = false;
        }
      });
    }

    if (!allValid) {
      setErrors(allErrors);
      const errorFields = Object.keys(allErrors);
      navigateToStepWithErrors(errorFields);
      return;
    }

    setIsSubmitting(true);

    const targetUserId = candidateUserId || user?.id;
    
    if (!targetUserId) {
      setErrorMessage('User ID is required to submit this form.');
      setShowErrorModal(true);
      setIsSubmitting(false);
      return;
    }

    try {
      if (isDrawSignature) {
        const signatureFile = await getSignatureAsFile();
        if (signatureFile) {
          setFormData(prevData => ({
            ...prevData,
            signature_file: signatureFile
          }));
          await new Promise(resolve => setTimeout(resolve, 100));
        } else {
          setErrors(prev => ({
            ...prev,
            signature_file_name: 'Failed to process signature. Please try again.'
          }));
          setIsSubmitting(false);
          return;
        }
      }
      
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      const submitFormData = new FormData();
      
      Object.keys(formData).forEach(key => {
        if (!key.includes('_file')) {
          submitFormData.append(key, formData[key as keyof FormData] as string);
        }
      });
      
      submitFormData.append('user_id', targetUserId.toString());
      
      // Add files with secure naming
      if (formData.passport_file) {
        const fileExt = formData.passport_file.name.split('.').pop() || 'pdf';
        const secureFilename = `passport_${Date.now()}_${Math.random().toString(36).substring(2, 10)}.${fileExt}`;
        
        if (formData.passport_file && typeof formData.passport_file === 'object') {
          submitFormData.append('passport_file', formData.passport_file);
          submitFormData.append('passport_file_path', `client_${targetUserId}/passport/${secureFilename}`);
        }
      }
      
      if (formData.proof_address_file) {
        const fileExt = formData.proof_address_file.name.split('.').pop() || 'pdf';
        const secureFilename = `proof_address_${Date.now()}_${Math.random().toString(36).substring(2, 10)}.${fileExt}`;
        
        if (formData.proof_address_file && typeof formData.proof_address_file === 'object') {
          submitFormData.append('proof_address_file', formData.proof_address_file);
          submitFormData.append('proof_address_file_path', `client_${targetUserId}/proof_address/${secureFilename}`);
        }
      }
      
      if (formData.signature_file) {
        const fileExt = formData.signature_file.name.split('.').pop() || 'png';
        const secureFilename = `signature_${Date.now()}_${Math.random().toString(36).substring(2, 10)}.${fileExt}`;
        
        if (formData.signature_file && typeof formData.signature_file === 'object') {
          submitFormData.append('signature_file', formData.signature_file);
          submitFormData.append('signature_file_path', `client_${targetUserId}/signature/${secureFilename}`);
        }
      } else if (isDrawSignature) {
        const signatureFile = await getSignatureAsFile();
        if (signatureFile) {
          const secureFilename = `signature_${Date.now()}_${Math.random().toString(36).substring(2, 10)}.png`;
          submitFormData.append('signature_file', signatureFile);
          submitFormData.append('signature_file_path', `client_${targetUserId}/signature/${secureFilename}`);
        }
      }

      const endpoint = candidateUserId ? '/api/submit-form-for-candidate' : '/api/submit-form';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'X-CSRF-TOKEN': csrfToken || '',
          'X-Requested-With': 'XMLHttpRequest',
        },
        credentials: 'same-origin',
        body: submitFormData,
      });

      if (response.ok) {
        setShowSuccessModal(true);
        localStorage.removeItem('statusProgress');
        
        setTimeout(() => {
          if (onClose) {
            onClose();
          }
          if (!candidateUserId) {
            window.location.reload();
          }
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
    } finally {
      setIsSubmitting(false);
    }
  };

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

  const renderPersonalInfo = () => (
    <div className={`${styles.stepContent} ${styles[slideDirection]}`}>
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
          <h3 className={styles.h3Title}>Middle Name <span className={styles.optTag}>(Optional)</span></h3>
          <input 
            className={styles.pdFn}
            type="text" 
            value={formData.middleName || ''}
            onChange={(e) => handleInputChange('middleName', e.target.value)}
          />
        </div>
      </div>
      <div className={styles.personalDeetsSection}>
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
          <h3 className={styles.h3Title}>Suffix Name <span className={styles.optTag}>(Optional)</span></h3>
          <input 
            className={styles.pdFn}
            type="text"
            value={formData.suffixName || ''}
            onChange={(e) => handleInputChange('suffixName', e.target.value)}
          />
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
      </div>
    </div>
  );

  const renderAddressInfo = () => (
    <div className={`${styles.stepContent} ${styles[slideDirection]}`}>
      <div className={styles.personalDeetsSection}>
        <div className={styles.personalDeetsInput}>
          <h3 className={styles.h3Title}>Country</h3>
          <select
            className={`${styles.pdFn} ${errors.country ? styles.errorField : ''}`}
            value={formData.country}
            onChange={(e) => handleInputChange('country', e.target.value)}
            required
          >
            <option value="" disabled>Select a country</option>
            {COUNTRIES.map((c: any) => (
              <option key={c.code} value={c.code}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>
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
          <h3 className={styles.h3Title}>Street Address Line 2 <span className={styles.optTag}>(Optional)</span></h3>
          <input 
            className={styles.pdFn} 
            type="text"
            value={formData.streetAddressLine2}
            onChange={(e) => handleInputChange('streetAddressLine2', e.target.value)}
          />
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
        </div>
      </div>
    </div>
  );

  const renderBusinessInfo = () => (
    <div className={`${styles.stepContent} ${styles[slideDirection]}`}>
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
          <h3 className={styles.h3Title}>Company Website <span className={styles.optTag}>(Optional)</span></h3>
          <input
            className={styles.pdFn}
            type="text"
            value={formData.companyWebsite}
            onChange={(e) => handleInputChange('companyWebsite', e.target.value)}
          />
        </div>
        <div className={styles.personalDeetsInput}>
          <h3 className={styles.h3Title}>Company Industry</h3>
          <input
            className={`${styles.pdFn} ${errors.companyIndustry ? styles.errorField : ''}`}
            type="text"
            value={formData.companyIndustry}
            onChange={(e) => handleInputChange('companyIndustry', e.target.value)}
            required
          />
        </div>
      </div>
      <div className={styles.personalDeetsSection} style={{ flexDirection: 'column', width: '100%' }}>
        <div className={styles.personalDeetsInput} style={{ width: '100%' }}>
          <h3 className={styles.h3Title}>Business Description</h3>
          <textarea
            className={`${styles.pdFn} ${errors.businessDescription ? styles.errorField : ''}`}
            value={formData.businessDescription}
            onChange={(e) => handleInputChange('businessDescription', e.target.value)}
            placeholder="Tell me about your business in minimum 20 words"
            style={{ minHeight: '120px', width: 'calc(100% - 42px)', resize: 'vertical' }}
            required
          />
          {errors.businessDescription && (
            <div style={errorMessageStyle}>{errors.businessDescription}</div>
          )}
        </div>
      </div>
      <div className={styles.personalDeetsSection}>
        <div className={styles.personalDeetsInput}>
          <h3 className={styles.h3Title}>Company Designator</h3>
          <select
            className={styles.pdFn}
            value={formData.companyDesignator}
            onChange={(e) => handleInputChange('companyDesignator', e.target.value)}
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
          {!showOtherStateInput ? (
            <select
              className={styles.pdFn}
              value={formData.stateRegistration}
              onChange={(e) => handleInputChange('stateRegistration', e.target.value)}
            >
              <option value="" disabled>Select a State Registration</option>
              <option value="delaware">DELAWARE</option>
              <option value="wyoming">WYOMING</option>
              <option value="florida">FLORIDA</option>
              <option value="california">CALIFORNIA</option>
              <option value="nevada">NEVADA</option>
              <option value="others">Others</option>
            </select>
          ) : (
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input
                className={`${styles.pdFn} ${errors.otherStateRegistration ? styles.errorField : ''}`}
                type="text"
                value={formData.otherStateRegistration}
                onChange={(e) => handleInputChange('otherStateRegistration', e.target.value)}
                placeholder="Please specify state"
                required
                style={{ flex: 1 }}
              />
              <button
                type="button"
                onClick={() => {
                  setShowOtherStateInput(false);
                  setFormData(prev => ({ ...prev, stateRegistration: '', otherStateRegistration: '' }));
                }}
                className={styles.backToDropdownBtn}
              >
                Back to dropdown
              </button>
            </div>
          )}
          {errors.otherStateRegistration && (
            <div style={errorMessageStyle}>{errors.otherStateRegistration}</div>
          )}
        </div>
      </div>
    </div>
  );

  const renderDocuments = () => (
    <div className={`${styles.stepContent} ${styles[slideDirection]}`}>
      <div className={styles.personalDeetsSection}>
        <div className={styles.personalDeetsInput}>
          <h3 className={styles.h3Title}>Main Applicant's Passport</h3>
          <input
            className={`${styles.pdFn} ${errors.passport_file_name ? styles.errorField : ''}`}
            type="file"
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
      </div>
      <div className={styles.personalDeetsSection} style={{ flexDirection: 'column' }}>
        <div className={styles.personalDeetsInput}>
          <h3 className={styles.h3Title}>Main Applicant's Signature</h3>
          
          <div className={styles.signatureOptions}>
            <button 
              type="button" 
              className={`${styles.signatureOptionBtn} ${!isDrawSignature ? styles.signatureOptionActive : ''}`}
              onClick={() => setIsDrawSignature(false)}
            >
              Upload File
            </button>
            <button 
              type="button" 
              className={`${styles.signatureOptionBtn} ${isDrawSignature ? styles.signatureOptionActive : ''}`}
              onClick={() => setIsDrawSignature(true)}
            >
              Draw/Write Signature
            </button>
          </div>
          
          {!isDrawSignature && (
            <>
              <input
                className={`${styles.pdFn} ${errors.signature_file_name ? styles.errorField : ''}`}
                type="file"
                onChange={async (e) => await handleFileChange('signature_file_name', e.target.files?.[0] || null)}
                accept=".pdf,.jpg,.jpeg,.png"
              />
              <div style={fileRestrictionStyle}>
                Allowed file types: PDF, JPG, JPEG, PNG. Max size: 4MB (images will be automatically compressed)
              </div>
            </>
          )}
          
          {isDrawSignature && (
            <div className={styles.signaturePadContainer}>
              <div 
                ref={signaturePadRef} 
                className={styles.signaturePad}
                style={errors.signature_file_name ? {borderColor: '#f44336'} : {}}
              />
              <div className={styles.signaturePadControls}>
                <button 
                  type="button" 
                  className={styles.clearSignatureBtn} 
                  onClick={clearSignature}
                >
                  Clear
                </button>
              </div>
            </div>
          )}
          
          {typeof errors.signature_file_name === 'string' && (
            <div style={errorMessageStyle}>{errors.signature_file_name}</div>
          )}
        </div>
      </div>
    </div>
  );

  const getStepTitle = (step: FormStep): string => {
    switch (step) {
      case 'personal': return 'Personal Information';
      case 'address': return 'Address Information';
      case 'business': return 'Business Information';
      case 'documents': return 'Supporting Documents';
      default: return '';
    }
  };

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
      
      {isSubmitting && (
        <div className={styles.loadingOverlay}>
          <LoadingSpinner size="large" fullPage={false} />
          <p className={styles.loadingText}>Submitting your profile...</p>
        </div>
      )}
      
      <div className={styles.modalOverlay}>
        <div className={styles.modal}>
          <div className={styles.modalHeader}>
            <div className={styles.modalTitle}>Profile Setup Required</div>
            <div className={styles.modalSubtitle}>
              Please complete your Profile Setup to continue
            </div>
          </div>

          {/* Progress Bar */}
          <div className={styles.progressBarContainer}>
            <div 
              className={styles.progressBar} 
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          {/* Step Indicator */}
          <div className={styles.stepIndicator}>
            <div className={styles.stepTitle}>
              <img className={styles.stepIcon} src="/assets/paper-icon.png" alt="" />
              {getStepTitle(currentStep)}
            </div>
            <div className={styles.stepCount}>
              Step {currentStepIndex + 1} of {steps.length}
            </div>
          </div>

          <form onSubmit={handleSubmit} className={styles.modalForm}>
            <div className={styles.formContent}>
              {currentStep === 'personal' && renderPersonalInfo()}
              {currentStep === 'address' && renderAddressInfo()}
              {currentStep === 'business' && renderBusinessInfo()}
              {currentStep === 'documents' && renderDocuments()}
            </div>

            {/* Navigation Buttons */}
            <div className={styles.navigationButtons}>
              {currentStepIndex > 0 && (
                <button
                  type="button"
                  className={styles.backButton}
                  onClick={handleBack}
                  disabled={isSubmitting}
                >
                  Back
                </button>
              )}
              
              <div className={styles.buttonSpacer} />
              
              {currentStepIndex < steps.length - 1 ? (
                <button
                  type="button"
                  className={styles.nextButton}
                  onClick={handleNext}
                  disabled={isSubmitting}
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Profile'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </>
  );
}