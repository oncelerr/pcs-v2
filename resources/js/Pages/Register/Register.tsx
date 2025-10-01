import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Register.css';

interface RegisterFormData {
  name: string;
  email: string;
  username: string;
  password: string;
  password_confirmation: string;
  role_id?: number;
}

interface OtpVerificationData {
  email: string;
  otp: string;
}

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<RegisterFormData>({
    name: '',
    email: '',
    username: '',
    password: '',
    password_confirmation: '',
    role_id: 2
  });
  const [otpData, setOtpData] = useState<OtpVerificationData>({
    email: '',
    otp: ''
  });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [showOtpForm, setShowOtpForm] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleGoogleSignUp = () => {
    const apiBase = (import.meta as any)?.env?.VITE_API_BASE_URL || '';
    const redirectAfter = `${window.location.origin}/dashboard`;
    const googleRedirectUrl = `${apiBase}/auth/google/redirect?redirect=${encodeURIComponent(redirectAfter)}`;
    window.location.href = googleRedirectUrl;
  };

  const handleAgreeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setAgreeToTerms(checked);
    if (checked && errors.agreeToTerms) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.agreeToTerms;
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors: Record<string, string[]> = {};

    if (!formData.name.trim()) {
      validationErrors.name = ['The name field is required.'];
    }

    if (!formData.email.trim()) {
      validationErrors.email = ['The email field is required.'];
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      validationErrors.email = ['Please enter a valid email address.'];
    }

    if (!formData.password) {
      validationErrors.password = ['The password field is required.'];
    } else if (formData.password.length < 8) {
      validationErrors.password = ['The password must be at least 8 characters.'];
    }

    if (formData.password !== formData.password_confirmation) {
      validationErrors.password_confirmation = ['The password confirmation does not match.'];
    } else if (formData.password_confirmation.length < 8) {
      validationErrors.password_confirmation = ['The password confirmation must be at least 8 characters.'];
    }

    if (!agreeToTerms) {
      validationErrors.agreeToTerms = ['You must agree to the Terms of Service and Privacy Policy.'];
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axios.post('/api/register', {
        name: formData.name,
        email: formData.email,
        username: formData.username || (formData.email ? formData.email.split('@')[0] : ''),
        password: formData.password,
        password_confirmation: formData.password_confirmation,
        role_id: formData.role_id
      });

      if (response.status === 200 || response.status === 201) {
        setOtpData({
          email: formData.email,
          otp: ''
        });
        setShowOtpForm(true);
        setRegisterSuccess(true);
      }
    } catch (error: any) {
      console.error('Registration error:', error);

      if (error.response && error.response.status === 422) {
        setErrors(error.response.data.errors || {});
      } else {
        setErrors({
          general: [error.response?.data?.message || 'Registration failed. Please try again.']
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setOtpData(prev => ({
      ...prev,
      otp: value
    }));
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otpData.otp) {
      setErrors({
        otp: ['Please enter the OTP']
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axios.post('/api/verify-otp', {
        email: otpData.email,
        otp: otpData.otp
      });

      if (response.status === 200) {
        navigate('/login', {
          state: {
            message: 'Email verified successfully! Please log in.',
            messageType: 'success'
          }
        });
      }
    } catch (error: any) {
      console.error('OTP verification error:', error);

      if (error.response && error.response.status === 422) {
        setErrors(error.response.data.errors || {});
      } else {
        setErrors({
          general: [error.response?.data?.message || 'OTP verification failed. Please try again.']
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      await axios.post('/api/resend-otp', {
        email: otpData.email
      });
      setErrors({
        general: ['New OTP has been sent to your email.']
      });
    } catch (error: any) {
      console.error('Resend OTP error:', error);
      setErrors({
        general: [error.response?.data?.message || 'Failed to resend OTP. Please try again.']
      });
    }
  };

  return (
    <>
      <div className="register-cont">
        <div className="register-left">
          <img className="register-logo" src="/assets/Logo.png" alt="" />
          <h1 className="register-title">{showOtpForm ? 'Verify Your Email' : 'Sign up'}</h1>
          <p className="register-subtitle">Get started for free today!</p>
          {registerSuccess && showOtpForm ? (
            <div className="otp-cont">
              <div className="otp-success">
                We've sent a verification code to {otpData.email}
              </div>

              <form onSubmit={handleVerifyOtp} className="otp-form">
                <div className="form-group">
                  <label htmlFor="otp" className="form-label">
                    Enter Verification Code
                  </label>
                  <input
                    type="text"
                    id="otp"
                    name="otp"
                    value={otpData.otp}
                    onChange={handleOtpChange}
                    maxLength={6}
                    placeholder="000000"
                    disabled={isSubmitting}
                    className="form-control"
                  />
                  {errors.otp && (
                    <div style={styles.errorText}>{errors.otp[0]}</div>
                  )}
                </div>

                <button
                  type="submit"
                  className="register-otp-button"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Verifying...' : 'Verify Email'}
                  {isSubmitting && <span></span>}
                </button>

                <div className="register-resend-otp">
                  Didn't receive a code?{' '}
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#106552',
                      cursor: 'pointer',
                      fontWeight: '500',
                      padding: '0',
                      margin: '0',
                    }}
                  >
                    Resend Code
                  </button>
                </div>
              </form>
            </div>
          ) : !showOtpForm && (
            <form onSubmit={handleSubmit} action="">
              <p className="register-name">Name *</p>
              <input
                className={`register-input-name ${errors.name ? 'input-error' : ''}`}
                type="text"
                placeholder="Enter your name"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={isSubmitting}
              />
              <p className="register-name">Email *</p>
              <input
                className={`register-input-email ${errors.email ? 'input-error' : ''}`}
                placeholder="Enter your email"
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={isSubmitting}
              />
              <p className="register-name">Password *</p>
              <input
                className={`register-input-password ${errors.password ? 'input-error' : ''}`}
                type="password"
                placeholder="Enter your password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                disabled={isSubmitting}
              />
              <p className="register-name">Confirm Password *</p>
              <input
                className={`register-input-confirm-password ${errors.password_confirmation ? 'input-error' : ''}`}
                type="password"
                placeholder="Confirm your password"
                id="password_confirmation"
                name="password_confirmation"
                value={formData.password_confirmation}
                onChange={handleChange}
                disabled={isSubmitting}
              /><br />
              <button
                className="register-button"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating Account...' : 'Create Account'}
                {isSubmitting && (
                  <span></span>
                )}
              </button>
              <div className="register-agree">
                <input
                  className={`register-agree-input ${errors.agreeToTerms ? 'input-error' : ''}`}
                  id="agreeToTerms"
                  type="checkbox"
                  checked={agreeToTerms}
                  onChange={handleAgreeChange}
                  disabled={isSubmitting}
                  style={{ marginRight: '8px' }}
                />
                <label className="register-agree-label" htmlFor="agreeToTerms">
                  I agree to the <a onClick={() => navigate('/terms')}>Terms of Service</a> and <a onClick={() => navigate('/privacy')}>Privacy Policy.</a>
                </label>
              </div>
              <div className="register-or"><div className="register-hr" /><p>OR</p><div className="register-hr" /></div>
              <button type="button" className="register-google" onClick={handleGoogleSignUp}><img src="/assets/google.png" alt="" />Sign Up with Google</button>
              <p className="register-already">Already have an account? <a onClick={() => navigate('/login')}>Login Here</a></p>
            </form>
          )}
        </div>
        <div className="register-right">
          <img src="/assets/register-right.png" alt="" />
        </div>
      </div>
    </>
  );
};

export default Register;
