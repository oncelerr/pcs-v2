import React, { useState, FormEvent, ChangeEvent } from 'react';

interface FormData {
  name: string;
  email: string;
}

interface FormErrors {
  name?: boolean;
  email?: boolean;
  [key: string]: boolean | undefined;
}

interface AddCandidateModalProps {
  onClose: () => void;
  onSubmit: (data: FormData) => Promise<void>;
}

export default function AddCandidateModal({ onClose, onSubmit }: AddCandidateModalProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: false }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.name.trim()) newErrors.name = true;
    if (!formData.email.trim()) newErrors.email = true;
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email.trim() && !emailRegex.test(formData.email)) {
      newErrors.email = true;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        await onSubmit(formData);
        // Modal will be closed by parent component on success
      } catch (error) {
        console.error('Error submitting form:', error);
        setIsSubmitting(false);
      }
    }
  };

  return (
    <>
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '32px',
          maxWidth: '500px',
          width: '90%',
          maxHeight: '90vh',
          overflow: 'auto',
          position: 'relative'
        }}>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              color: '#666',
              padding: '4px 8px',
              lineHeight: 1,
              opacity: isSubmitting ? 0.5 : 1
            }}
          >
            ×
          </button>
          
          <div style={{
            borderBottom: '1px solid #e0e0e0',
            paddingBottom: '16px',
            marginBottom: '24px'
          }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
              Add New Candidate
            </h2>
          </div>

          <form onSubmit={handleSubmit}>
            <p style={{ marginBottom: '24px', color: '#666' }}>
              Please provide the candidate's basic information. They will need to complete their profile after creation.
            </p>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontWeight: '600',
                marginBottom: '8px'
              }}>
                Full Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('name', e.target.value)}
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: errors.name ? '2px solid #f44336' : '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  opacity: isSubmitting ? 0.6 : 1
                }}
                required
              />
              {errors.name && (
                <div style={{ color: '#f44336', fontSize: '12px', marginTop: '5px' }}>
                  Name is required
                </div>
              )}
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontWeight: '600',
                marginBottom: '8px'
              }}>
                Email Address *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('email', e.target.value)}
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: errors.email ? '2px solid #f44336' : '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  opacity: isSubmitting ? 0.6 : 1
                }}
                required
              />
              {errors.email && (
                <div style={{ color: '#f44336', fontSize: '12px', marginTop: '5px' }}>
                  Valid email is required
                </div>
              )}
            </div>

            <div style={{ 
              display: 'flex', 
              gap: '12px', 
              marginTop: '24px' 
            }}>
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#f5f5f5',
                  color: '#333',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  opacity: isSubmitting ? 0.5 : 1
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: isSubmitting ? '#999' : '#106552',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer'
                }}
              >
                {isSubmitting ? 'Adding...' : 'Add Candidate'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}