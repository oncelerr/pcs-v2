import React, { useState, useRef, useEffect } from 'react';
import styles from './StateServiceRequestModal.module.css';
import LoadingSpinner from '../../../../Components/LoadingSpinner/LoadingSpinner';

interface FormData {
  email: string;
  companyName: string;
  stateOfRegistration: string;
  serviceType: string;
  briefDescription: string;
  termsAccepted: boolean;
}

interface ValidationErrors {
  [key: string]: boolean | string;
}

interface StateServiceRequestModalProps {
  onClose: () => void;
  onSubmit?: (data: FormData) => Promise<void>;
}

type FormStep = 'company-info' | 'service-type' | 'details';

const SERVICE_TYPES = [
  'Amendment',
  'Certificate of Good Standing',
  'Fictitious Name (DBA)',
  'Individual Taxpayer Identification Number (ITIN)',
  'Apostilled Document',
  'Register a Trademark',
  'Company Dissolution',
  'EIN Registration',
  'Beneficial Ownership Information Report (BOI)',
  'Registered Agents Subscription',
  'US Bank Account Registration',
  'State Compliance Reporting',
  'Change of Registered Agents',
  'Virtual Address',
  'US Phone Number',
  'Annual Tax Return Filing (soon)'
];

export default function StateServiceRequestModal({ 
  onClose, 
  onSubmit 
}: StateServiceRequestModalProps) {
  const [currentStep, setCurrentStep] = useState<FormStep>('company-info');
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [hasScrolledTerms, setHasScrolledTerms] = useState(false);
  const termsScrollRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState<FormData>({
    email: '',
    companyName: '',
    stateOfRegistration: '',
    serviceType: '',
    briefDescription: '',
    termsAccepted: false
  });

  const [errors, setErrors] = useState<ValidationErrors>({});

  const steps: FormStep[] = ['company-info', 'service-type', 'details'];
  const currentStepIndex = steps.indexOf(currentStep);
  const progressPercentage = ((currentStepIndex + 1) / steps.length) * 100;

  const stepRequiredFields: Record<FormStep, string[]> = {
    'company-info': ['email', 'companyName', 'stateOfRegistration'],
    'service-type': ['serviceType'],
    'details': ['briefDescription', 'termsAccepted']
  };

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: false }));
    }
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateStep = (step: FormStep): boolean => {
    const newErrors: ValidationErrors = {};
    let isValid = true;

    const fieldsToValidate = stepRequiredFields[step];
    
    fieldsToValidate.forEach(field => {
      const value = formData[field as keyof FormData];
      
      if (field === 'email') {
        if (!value || typeof value === 'string' && !value.trim()) {
          newErrors[field] = 'Email is required';
          isValid = false;
        } else if (typeof value === 'string' && !validateEmail(value)) {
          newErrors[field] = 'Please enter a valid email address';
          isValid = false;
        }
      } else if (field === 'briefDescription') {
        if (!value || typeof value === 'string' && value.trim().length < 20) {
          newErrors[field] = 'Please provide at least 20 characters';
          isValid = false;
        }
      } else if (field === 'termsAccepted') {
        if (!value) {
          newErrors[field] = 'You must accept the terms and conditions';
          isValid = false;
        }
      } else if (typeof value === 'string' && !value.trim()) {
        newErrors[field] = true;
        isValid = false;
      }
    });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep(currentStep)) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (onSubmit) {
        await onSubmit(formData);
      }
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Form submitted:', formData);
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if user has scrolled to bottom of terms
  const handleTermsScroll = () => {
    if (termsScrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = termsScrollRef.current;
      const scrolledToBottom = scrollHeight - scrollTop - clientHeight < 10;
      
      if (scrolledToBottom && !hasScrolledTerms) {
        setHasScrolledTerms(true);
      }
    }
  };

  const openTermsModal = () => {
    setShowTermsModal(true);
    setHasScrolledTerms(false);
  };

  const closeTermsModal = () => {
    setShowTermsModal(false);
  };

  const acceptTerms = () => {
    handleInputChange('termsAccepted', true);
    closeTermsModal();
  };

  const getStepTitle = (step: FormStep): string => {
    switch (step) {
      case 'company-info': return 'Company Information';
      case 'service-type': return 'Service Type';
      case 'details': return 'Request Details';
      default: return '';
    }
  };

  const renderCompanyInfo = () => (
    <div className={`${styles.stepContent} ${styles[slideDirection]}`}>
      <div className={styles.formSection}>
        <div className={styles.formInput}>
          <label className={styles.label}>Email Address *</label>
          <input
            type="email"
            className={`${styles.input} ${errors.email ? styles.errorField : ''}`}
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="your.email@company.com"
            required
          />
          {typeof errors.email === 'string' && (
            <div className={styles.errorMessage}>{errors.email}</div>
          )}
        </div>

        <div className={styles.formInput}>
          <label className={styles.label}>Company Name *</label>
          <input
            type="text"
            className={`${styles.input} ${errors.companyName ? styles.errorField : ''}`}
            value={formData.companyName}
            onChange={(e) => handleInputChange('companyName', e.target.value)}
            placeholder="Enter your company name"
            required
          />
          {typeof errors.companyName === 'string' && (
            <div className={styles.errorMessage}>{errors.companyName}</div>
          )}
        </div>

        <div className={styles.formInput}>
          <label className={styles.label}>State of Registration *</label>
          <select
            className={`${styles.input} ${errors.stateOfRegistration ? styles.errorField : ''}`}
            value={formData.stateOfRegistration}
            onChange={(e) => handleInputChange('stateOfRegistration', e.target.value)}
            required
          >
            <option value="">Select a state</option>
            <option value="delaware">Delaware</option>
            <option value="wyoming">Wyoming</option>
            <option value="florida">Florida</option>
            <option value="california">California</option>
            <option value="nevada">Nevada</option>
            <option value="texas">Texas</option>
            <option value="new-york">New York</option>
            <option value="other">Other</option>
          </select>
          {typeof errors.stateOfRegistration === 'string' && (
            <div className={styles.errorMessage}>{errors.stateOfRegistration}</div>
          )}
        </div>
      </div>
    </div>
  );

  const renderServiceType = () => (
    <div className={`${styles.stepContent} ${styles[slideDirection]}`}>
      <div className={styles.formSection}>
        <div className={styles.formInput}>
          <label className={styles.label}>Select Service Type *</label>
          <div className={styles.radioGroup}>
            {SERVICE_TYPES.map((service) => (
              <label key={service} className={styles.radioLabel}>
                <input
                  type="radio"
                  name="serviceType"
                  value={service}
                  checked={formData.serviceType === service}
                  onChange={(e) => handleInputChange('serviceType', e.target.value)}
                  className={styles.radioInput}
                />
                <span className={styles.radioCustom}></span>
                <span className={styles.radioText}>{service}</span>
              </label>
            ))}
          </div>
          {typeof errors.serviceType === 'string' && (
            <div className={styles.errorMessage}>{errors.serviceType}</div>
          )}
        </div>
      </div>
    </div>
  );

  const renderDetails = () => (
    <div className={`${styles.stepContent} ${styles[slideDirection]}`}>
      <div className={styles.formSection}>
        <div className={styles.formInput}>
          <label className={styles.label}>Brief Description *</label>
          <p className={styles.helperText}>
            Provide a detailed instruction of your request (minimum 20 characters)
          </p>
          <textarea
            className={`${styles.textarea} ${errors.briefDescription ? styles.errorField : ''}`}
            value={formData.briefDescription}
            onChange={(e) => handleInputChange('briefDescription', e.target.value)}
            placeholder="Please describe your request in detail..."
            rows={6}
            required
          />
          {typeof errors.briefDescription === 'string' && (
            <div className={styles.errorMessage}>{errors.briefDescription}</div>
          )}
        </div>

        <div className={styles.formInput}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={formData.termsAccepted}
              onChange={(e) => handleInputChange('termsAccepted', e.target.checked)}
              className={styles.checkbox}
            />
            <span className={styles.checkboxCustom}></span>
            <span className={styles.checkboxText}>
              I agree to the{' '}
              <button 
                type="button" 
                className={styles.termsLink}
                onClick={openTermsModal}
              >
                Terms & Conditions
              </button>
            </span>
          </label>
          {typeof errors.termsAccepted === 'string' && (
            <div className={styles.errorMessage}>{errors.termsAccepted}</div>
          )}
        </div>
      </div>
    </div>
  );

  const TermsModal = () => (
    <div className={styles.termsModalOverlay}>
      <div className={styles.termsModal}>
        <div className={styles.termsHeader}>
          <h2 className={styles.termsTitle}>Terms & Conditions</h2>
          <button
            type="button"
            onClick={closeTermsModal}
            className={styles.termsCloseBtn}
          >
            ×
          </button>
        </div>

        <div 
          className={styles.termsContent}
          ref={termsScrollRef}
          onScroll={handleTermsScroll}
        >
          <section className={styles.termsSection}>
            <h3 className={styles.termsSectionTitle}>Agreement to Terms</h3>
            <p className={styles.termsText}>
              By accessing and using our state service request platform Premium Corporate Solutions 
              (the "Service"), you acknowledge that you have read, understood, and agree to be bound 
              by these Terms and Conditions (the "Agreement"). If you do not agree to all terms, you 
              must refrain from using our Service.
            </p>
          </section>

          <section className={styles.termsSection}>
            <h3 className={styles.termsSectionTitle}>Services Provided</h3>
            <p className={styles.termsText}>
              Our platform offers business-related state services, including but not limited to:
            </p>
            <ul className={styles.termsList}>
              <li>Business Amendments</li>
              <li>Doing Business As (DBA) Filings</li>
              <li>Change of Registered Agent</li>
              <li>Trademark Filings</li>
              <li>Dissolution Services</li>
              <li>Reinstatements</li>
              <li>Certificate of Good Standing</li>
              <li>BOI Reporting</li>
              <li>EIN Registration</li>
              <li>Business Dissolution</li>
              <li>ITIN</li>
              <li>Bank Account Registration</li>
            </ul>
            <p className={styles.termsText}>
              We act as a third-party facilitator between you and state agencies or other applicable 
              authorities to process your request.
            </p>
          </section>

          <section className={styles.termsSection}>
            <h3 className={styles.termsSectionTitle}>Service Fees</h3>
            <p className={styles.termsText}>
              All fees for services, including state filing fees, processing fees, and other charges, 
              are provided at the time of purchase. Fees are non-refundable once the Service has been 
              initiated, unless otherwise specified in this Agreement or by law.
            </p>
          </section>

          <section className={styles.termsSection}>
            <h3 className={styles.termsSectionTitle}>User Responsibilities</h3>
            <p className={styles.termsText}>
              By using our Services, you agree to the following responsibilities:
            </p>
            <ul className={styles.termsList}>
              <li>You provide accurate, current, and complete information necessary for the processing 
                of your service request.</li>
              <li>You ensure that the information provided for state filings, DBA applications, or 
                trademark filings complies with state and federal laws.</li>
              <li>You understand that any false or misleading information may result in the rejection 
                of your application and possible legal consequences.</li>
            </ul>
          </section>

          <section className={styles.termsSection}>
            <h3 className={styles.termsSectionTitle}>Turnaround Times</h3>
            <p className={styles.termsText}>
              Turnaround times for state filings, amendments, or other business-related services are 
              dependent on the state's processing schedule. While we strive to process requests 
              promptly, we are not responsible for delays due to state agency backlogs, holidays, or 
              other factors beyond our control.
            </p>
          </section>

          <section className={styles.termsSection}>
            <h3 className={styles.termsSectionTitle}>No Legal Advice</h3>
            <p className={styles.termsText}>
              We are not a law firm and do not provide legal advice. The Services we offer are for 
              administrative and filing purposes only. You should seek independent legal counsel for 
              any questions related to your specific business or legal circumstances.
            </p>
          </section>

          <section className={styles.termsSection}>
            <h3 className={styles.termsSectionTitle}>Disclaimer of Warranties</h3>
            <p className={styles.termsText}>
              We provide our Services on an "as-is" basis without warranties of any kind, either 
              express or implied, including but not limited to merchantability, fitness for a 
              particular purpose, or non-infringement. We do not warrant that:
            </p>
            <ul className={styles.termsList}>
              <li>The Service will meet your specific requirements.</li>
              <li>The results obtained from using the Service will be accurate or reliable.</li>
              <li>The Service will be uninterrupted, timely, secure, or error-free.</li>
            </ul>
          </section>

          <section className={styles.termsSection}>
            <h3 className={styles.termsSectionTitle}>Limitation of Liability</h3>
            <p className={styles.termsText}>
              In no event shall we be liable for any indirect, incidental, special, consequential, 
              or punitive damages arising out of or in connection with your use of the Service. Our 
              total liability to you for any damages, losses, or causes of action shall not exceed 
              the amount paid for the specific Service in question.
            </p>
          </section>

          <section className={styles.termsSection}>
            <h3 className={styles.termsSectionTitle}>Amendments to Terms</h3>
            <p className={styles.termsText}>
              We reserve the right to modify or update these Terms at any time. Any changes will be 
              effective immediately upon posting on our website. Your continued use of the Service 
              after changes are posted constitutes your acceptance of the updated Terms.
            </p>
          </section>

          <section className={styles.termsSection}>
            <h3 className={styles.termsSectionTitle}>Cancellation and Refund Policy</h3>
            <p className={styles.termsText}>
              Cancellations may be requested before the service request is submitted to the state or 
              applicable authority. Once a request has been filed, it cannot be canceled, and no 
              refunds will be issued unless due to error on our part.
            </p>
          </section>

          <section className={styles.termsSection}>
            <h3 className={styles.termsSectionTitle}>Intellectual Property</h3>
            <p className={styles.termsText}>
              All content, software, designs, and materials provided on the platform are the exclusive 
              property of the Company. Unauthorized use, reproduction, or distribution of any content 
              or material is strictly prohibited.
            </p>
          </section>

          <section className={styles.termsSection}>
            <h3 className={styles.termsSectionTitle}>Governing Law</h3>
            <p className={styles.termsText}>
              These Terms are governed by and construed in accordance with the laws of the state of 
              Wyoming. Any disputes arising from the use of the Service will be resolved exclusively 
              in the courts located within the state of Wyoming.
            </p>
          </section>

          {!hasScrolledTerms && (
            <div className={styles.scrollIndicator}>
              <span>Please scroll to the bottom to continue</span>
              <div className={styles.scrollArrow}>↓</div>
            </div>
          )}
        </div>

        <div className={styles.termsFooter}>
          <button
            type="button"
            onClick={closeTermsModal}
            className={styles.termsDeclineBtn}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={acceptTerms}
            className={styles.termsAcceptBtn}
            disabled={!hasScrolledTerms}
          >
            I Accept
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {isSubmitting && (
        <div className={styles.loadingOverlay}>
          <LoadingSpinner size="large" fullPage={false} />
          <p className={styles.loadingText}>Submitting your request...</p>
        </div>
      )}

      {showTermsModal && <TermsModal />}

      <div className={styles.modalOverlay}>
        <div className={styles.modal}>
          <div className={styles.modalHeader}>
            <div className={styles.modalTitle}>State Service Request</div>
            <div className={styles.modalSubtitle}>
              Complete the form to submit your service request
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
              {currentStep === 'company-info' && renderCompanyInfo()}
              {currentStep === 'service-type' && renderServiceType()}
              {currentStep === 'details' && renderDetails()}
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
                  {isSubmitting ? 'Submitting...' : 'Submit Request'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </>
  );
}