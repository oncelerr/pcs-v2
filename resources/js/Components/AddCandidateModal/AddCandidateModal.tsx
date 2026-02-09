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
        zIndex: 1000,
        backdropFilter: 'blur(2px)'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '32px',
          maxWidth: '500px',
          width: '90%',
          maxHeight: '90vh',
          overflow: 'auto',
          position: 'relative',
          boxShadow: '0px 20px 60px rgba(0, 0, 0, 0.2)',
          border: '1px solid #E7E7E7',
          fontFamily: "'DM Sans', sans-serif"
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
              color: '#64748B',
              padding: '4px 8px',
              lineHeight: 1,
              opacity: isSubmitting ? 0.5 : 1,
              transition: 'color 0.2s ease',
              fontFamily: "'DM Sans', sans-serif"
            }}
            onMouseEnter={(e) => {
              if (!isSubmitting) {
                e.currentTarget.style.color = '#0F172A';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#64748B';
            }}
          >
            ×
          </button>
          
          <div style={{
            borderBottom: '1px solid #F1F5F9',
            paddingBottom: '16px',
            marginBottom: '24px'
          }}>
            <h2 style={{ 
              fontSize: '20px', 
              fontWeight: 600, 
              margin: 0,
              color: '#0F172A',
              fontFamily: "'DM Sans', sans-serif",
              letterSpacing: '0.2px'
            }}>
              Add New Candidate
            </h2>
          </div>

          <form onSubmit={handleSubmit}>
            <p style={{ 
              marginBottom: '24px', 
              color: '#475569',
              fontSize: '14px',
              lineHeight: '1.6',
              fontFamily: "'DM Sans', sans-serif"
            }}>
              Please provide the candidate's basic information. They will need to complete their profile after creation.
            </p>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontWeight: 500,
                marginBottom: '8px',
                fontSize: '14px',
                color: '#334155',
                letterSpacing: '0.2px',
                fontFamily: "'DM Sans', sans-serif"
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
                  padding: '12px 16px',
                  border: errors.name ? '1px solid #ef4444' : '1px solid #D9D9D9',
                  borderRadius: '8px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  opacity: isSubmitting ? 0.6 : 1,
                  fontFamily: "'Inter', sans-serif",
                  color: '#1E293B',
                  transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                  outline: 'none',
                  boxShadow: errors.name ? '0 0 0 3px rgba(239, 68, 68, 0.1)' : 'none'
                }}
                onFocus={(e) => {
                  if (!errors.name) {
                    e.currentTarget.style.borderColor = '#146755';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(20, 103, 85, 0.1)';
                  }
                }}
                onBlur={(e) => {
                  if (!errors.name) {
                    e.currentTarget.style.borderColor = '#D9D9D9';
                    e.currentTarget.style.boxShadow = 'none';
                  }
                }}
                required
              />
              {errors.name && (
                <div style={{ 
                  color: '#ef4444', 
                  fontSize: '12px', 
                  marginTop: '5px',
                  fontFamily: "'Inter', sans-serif"
                }}>
                  Name is required
                </div>
              )}
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontWeight: 500,
                marginBottom: '8px',
                fontSize: '14px',
                color: '#334155',
                letterSpacing: '0.2px',
                fontFamily: "'DM Sans', sans-serif"
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
                  padding: '12px 16px',
                  border: errors.email ? '1px solid #ef4444' : '1px solid #D9D9D9',
                  borderRadius: '8px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  opacity: isSubmitting ? 0.6 : 1,
                  fontFamily: "'Inter', sans-serif",
                  color: '#1E293B',
                  transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                  outline: 'none',
                  boxShadow: errors.email ? '0 0 0 3px rgba(239, 68, 68, 0.1)' : 'none'
                }}
                onFocus={(e) => {
                  if (!errors.email) {
                    e.currentTarget.style.borderColor = '#146755';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(20, 103, 85, 0.1)';
                  }
                }}
                onBlur={(e) => {
                  if (!errors.email) {
                    e.currentTarget.style.borderColor = '#D9D9D9';
                    e.currentTarget.style.boxShadow = 'none';
                  }
                }}
                required
              />
              {errors.email && (
                <div style={{ 
                  color: '#ef4444', 
                  fontSize: '12px', 
                  marginTop: '5px',
                  fontFamily: "'Inter', sans-serif"
                }}>
                  Valid email is required
                </div>
              )}
            </div>

            <div style={{ 
              display: 'flex', 
              gap: '12px', 
              marginTop: '32px',
              paddingTop: '24px',
              borderTop: '1px solid #F1F5F9'
            }}>
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                style={{
                  flex: 1,
                  padding: '12px 24px',
                  backgroundColor: 'white',
                  color: '#475569',
                  border: '1px solid #D9D9D9',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  opacity: isSubmitting ? 0.5 : 1,
                  transition: 'all 0.2s ease',
                  fontFamily: "'Inter', sans-serif",
                  minWidth: '100px'
                }}
                onMouseEnter={(e) => {
                  if (!isSubmitting) {
                    e.currentTarget.style.backgroundColor = '#F8FAFC';
                    e.currentTarget.style.borderColor = '#94A3B8';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                  e.currentTarget.style.borderColor = '#D9D9D9';
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  flex: 1,
                  padding: '12px 24px',
                  backgroundColor: isSubmitting ? '#94A3B8' : '#146755',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  fontFamily: "'Inter', sans-serif",
                  minWidth: '100px'
                }}
                onMouseEnter={(e) => {
                  if (!isSubmitting) {
                    e.currentTarget.style.backgroundColor = '#106552';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(20, 103, 85, 0.2)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSubmitting) {
                    e.currentTarget.style.backgroundColor = '#146755';
                    e.currentTarget.style.boxShadow = 'none';
                  }
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