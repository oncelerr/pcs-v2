import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Register.css';

// Define the form data interface
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
    role_id: 2 // Default role (assuming 2 is for regular users)
  });
  const [otpData, setOtpData] = useState<OtpVerificationData>({
    email: '',
    otp: ''
  });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [showOtpForm, setShowOtpForm] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error for the field being edited
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic client-side validation
    const validationErrors: Record<string, string[]> = {};

    if (!formData.name.trim()) {
      validationErrors.name = ['The name field is required.'];
    }

    if (!formData.email.trim()) {
      validationErrors.email = ['The email field is required.'];
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      validationErrors.email = ['Please enter a valid email address.'];
    }

    if (!formData.username.trim()) {
      validationErrors.username = ['The username field is required.'];
    }

    if (!formData.password) {
      validationErrors.password = ['The password field is required.'];
    } else if (formData.password.length < 8) {
      validationErrors.password = ['The password must be at least 8 characters.'];
    }

    if (formData.password !== formData.password_confirmation) {
      validationErrors.password_confirmation = ['The password confirmation does not match.'];
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      // Make the registration request to the API endpoint
      const response = await axios.post('/api/register', {
        name: formData.name,
        email: formData.email,
        username: formData.username,
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
        // Handle validation errors from the server
        setErrors(error.response.data.errors || {});
      } else {
        // Handle other errors
        setErrors({
          general: [error.response?.data?.message || 'Registration failed. Please try again.']
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Inline styles
  const styles = {
    container: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: 'calc(100vh - 200px)',
      padding: '20px',
      backgroundColor: '#f5f5f5',
    },
    card: {
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      padding: '40px',
      width: '100%',
      maxWidth: '500px',
    },
    otpContainer: {
      textAlign: 'center' as const,
    },
    otpForm: {
      marginTop: '20px',
    },
    resendOtp: {
      marginTop: '20px',
      textAlign: 'center' as const,
      color: '#666',
    },
    title: {
      fontSize: '24px',
      fontWeight: 'bold',
      marginBottom: '20px',
      textAlign: 'center' as const,
      color: '#333',
    },
    formGroup: {
      marginBottom: '20px',
    },
    label: {
      display: 'block',
      marginBottom: '8px',
      fontWeight: '500',
      color: '#444',
    },
    input: {
      width: '100%',
      padding: '10px 12px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontSize: '16px',
      transition: 'border-color 0.3s',
    },
    inputError: {
      borderColor: '#e53e3e',
    },
    errorText: {
      color: '#e53e3e',
      fontSize: '14px',
      marginTop: '4px',
    },
    button: {
      width: '100%',
      padding: '12px',
      backgroundColor: '#106552',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      fontSize: '16px',
      fontWeight: '500',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative' as const,
    },
    buttonDisabled: {
      opacity: 0.7,
      cursor: 'not-allowed',
    },
    loading: {
      border: '2px solid rgba(255, 255, 255, 0.3)',
      borderTop: '2px solid white',
      borderRadius: '50%',
      width: '20px',
      height: '20px',
      animation: 'spin 1s linear infinite',
      marginLeft: '10px',
    },
    successMessage: {
      backgroundColor: '#e6fffa',
      color: '#2c7a7b',
      padding: '12px',
      borderRadius: '4px',
      marginBottom: '20px',
      textAlign: 'center' as const,
    },
    footer: {
      marginTop: '20px',
      textAlign: 'center' as const,
      color: '#666',
    },
    link: {
      color: '#106552',
      textDecoration: 'none',
      fontWeight: '500',
      marginLeft: '4px',
    },
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

      // Show success message
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
      <div className="register-cont"></div>
    </>
    // <div style={styles.container}>
    //   <div style={styles.card}>
    //     <h1 style={styles.title}>
    //       {showOtpForm ? 'Verify Your Email' : 'Create an Account'}
    //     </h1>

    //     {registerSuccess && showOtpForm ? (
    //       <div style={styles.otpContainer}>
    //         <div style={styles.successMessage}>
    //           We've sent a verification code to {otpData.email}
    //         </div>

    //         <form onSubmit={handleVerifyOtp} style={styles.otpForm}>
    //           <div style={styles.formGroup}>
    //             <label htmlFor="otp" style={styles.label}>
    //               Enter Verification Code
    //             </label>
    //             <input
    //               type="text"
    //               id="otp"
    //               name="otp"
    //               value={otpData.otp}
    //               onChange={handleOtpChange}
    //               maxLength={6}
    //               style={{
    //                 ...styles.input,
    //                 ...(errors.otp ? styles.inputError : {}),
    //                 textAlign: 'center',
    //                 letterSpacing: '8px',
    //                 fontSize: '24px',
    //                 fontWeight: 'bold'
    //               }}
    //               placeholder="000000"
    //               disabled={isSubmitting}
    //             />
    //             {errors.otp && (
    //               <div style={styles.errorText}>{errors.otp[0]}</div>
    //             )}
    //           </div>

    //           <button
    //             type="submit"
    //             style={{
    //               ...styles.button,
    //               ...(isSubmitting ? styles.buttonDisabled : {}),
    //             }}
    //             disabled={isSubmitting}
    //           >
    //             {isSubmitting ? 'Verifying...' : 'Verify Email'}
    //             {isSubmitting && <span style={styles.loading}></span>}
    //           </button>

    //           <div style={styles.resendOtp}>
    //             Didn't receive a code?{' '}
    //             <button
    //               type="button"
    //               onClick={handleResendOtp}
    //               style={{
    //                 background: 'none',
    //                 border: 'none',
    //                 color: '#106552',
    //                 cursor: 'pointer',
    //                 fontWeight: '500',
    //                 padding: '0',
    //                 margin: '0',
    //               }}
    //             >
    //               Resend Code
    //             </button>
    //           </div>
    //         </form>
    //       </div>
    //     ) : !showOtpForm && (
    //       <>
    //         {errors.general && (
    //           <div style={{
    //             backgroundColor: '#fff5f5',
    //             color: '#e53e3e',
    //             padding: '12px',
    //             borderRadius: '4px',
    //             marginBottom: '20px',
    //             textAlign: 'center',
    //           }}>
    //             {errors.general[0]}
    //           </div>
    //         )}

    //         <form onSubmit={handleSubmit}>
    //           <div style={styles.formGroup}>
    //             <label htmlFor="name" style={styles.label}>
    //               Full Name
    //             </label>
    //             <input
    //               type="text"
    //               id="name"
    //               name="name"
    //               value={formData.name}
    //               onChange={handleChange}
    //               style={{
    //                 ...styles.input,
    //                 ...(errors.name ? styles.inputError : {}),
    //               }}
    //               disabled={isSubmitting}
    //             />
    //             {errors.name && (
    //               <div style={styles.errorText}>{errors.name[0]}</div>
    //             )}
    //           </div>

    //           <div style={styles.formGroup}>
    //             <label htmlFor="email" style={styles.label}>
    //               Email Address
    //             </label>
    //             <input
    //               type="email"
    //               id="email"
    //               name="email"
    //               value={formData.email}
    //               onChange={handleChange}
    //               style={{
    //                 ...styles.input,
    //                 ...(errors.email ? styles.inputError : {}),
    //               }}
    //               disabled={isSubmitting}
    //             />
    //             {errors.email && (
    //               <div style={styles.errorText}>{errors.email[0]}</div>
    //             )}
    //           </div>

    //           <div style={styles.formGroup}>
    //             <label htmlFor="username" style={styles.label}>
    //               Username
    //             </label>
    //             <input
    //               type="text"
    //               id="username"
    //               name="username"
    //               value={formData.username}
    //               onChange={handleChange}
    //               style={{
    //                 ...styles.input,
    //                 ...(errors.username ? styles.inputError : {}),
    //               }}
    //               disabled={isSubmitting}
    //             />
    //             {errors.username && (
    //               <div style={styles.errorText}>{errors.username[0]}</div>
    //             )}
    //           </div>

    //           <div style={styles.formGroup}>
    //             <label htmlFor="password" style={styles.label}>
    //               Password
    //             </label>
    //             <input
    //               type="password"
    //               id="password"
    //               name="password"
    //               value={formData.password}
    //               onChange={handleChange}
    //               style={{
    //                 ...styles.input,
    //                 ...(errors.password ? styles.inputError : {}),
    //               }}
    //               disabled={isSubmitting}
    //             />
    //             {errors.password && (
    //               <div style={styles.errorText}>{errors.password[0]}</div>
    //             )}
    //           </div>

    //           <div style={styles.formGroup}>
    //             <label htmlFor="password_confirmation" style={styles.label}>
    //               Confirm Password
    //             </label>
    //             <input
    //               type="password"
    //               id="password_confirmation"
    //               name="password_confirmation"
    //               value={formData.password_confirmation}
    //               onChange={handleChange}
    //               style={{
    //                 ...styles.input,
    //                 ...(errors.password_confirmation ? styles.inputError : {}),
    //               }}
    //               disabled={isSubmitting}
    //             />
    //             {errors.password_confirmation && (
    //               <div style={styles.errorText}>{errors.password_confirmation[0]}</div>
    //             )}
    //           </div>

    //           <button
    //             type="submit"
    //             style={{
    //               ...styles.button,
    //               ...(isSubmitting ? styles.buttonDisabled : {}),
    //             }}
    //             disabled={isSubmitting}
    //           >
    //             {isSubmitting ? 'Creating Account...' : 'Create Account'}
    //             {isSubmitting && (
    //               <span style={styles.loading}></span>
    //             )}
    //           </button>
    //         </form>

    //         <div style={styles.footer}>
    //           Already have an account?{' '}
    //           <Link to="/login" style={styles.link}>
    //             Log in
    //           </Link>
    //         </div>
    //       </>
    //     )}
    //   </div>
    // </div>
  );
};

export default Register;
