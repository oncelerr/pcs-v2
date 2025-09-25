import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// Inline styles
const styles: {
  loginContainer: React.CSSProperties;
  loginCard: React.CSSProperties;
  title: React.CSSProperties;
  formGroup: React.CSSProperties;
  label: React.CSSProperties;
  input: React.CSSProperties;
  button: React.CSSProperties;
  buttonHover: React.CSSProperties;
  buttonDisabled: React.CSSProperties;
  errorMessage: React.CSSProperties;
  footer: React.CSSProperties;
  link: React.CSSProperties;
  loading: React.CSSProperties;
  successMessage: React.CSSProperties;
} = {
  loginContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 'calc(100vh - 200px)',
    padding: '20px',
    backgroundColor: '#f5f5f5',
  },
  loginCard: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '10px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: '400px',
  },
  title: {
    textAlign: 'center' as const,
    color: '#106552',
    marginBottom: '1.5rem',
  },
  formGroup: {
    marginBottom: '1.5rem',
  },
  label: {
    display: 'block',
    marginBottom: '0.5rem',
    color: '#333',
    fontWeight: '500',
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '1rem',
    boxSizing: 'border-box' as const,
  },
  button: {
    width: '100%',
    padding: '0.75rem',
    backgroundColor: '#106552',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  buttonHover: {
    backgroundColor: '#0d5445',
  },
  buttonDisabled: {
    backgroundColor: '#9e9e9e',
    cursor: 'not-allowed',
  },
  errorMessage: {
    color: '#d32f2f',
    margin: '0.5rem 0',
    fontSize: '0.875rem',
  },
  footer: {
    marginTop: '1.5rem',
    textAlign: 'center' as const,
    fontSize: '0.875rem',
    color: '#666',
  },
  link: {
    color: '#106552',
    textDecoration: 'none',
    fontWeight: '500',
    margin: '0 0.25rem',
  },
  loading: {
    display: 'inline-block',
    marginLeft: '0.5rem',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '50%',
    borderTopColor: '#fff',
    width: '16px',
    height: '16px',
    animation: 'spin 1s linear infinite',
    verticalAlign: 'middle',
  },
  successMessage: {
    color: '#2e7d32',
    margin: '1rem 0',
    textAlign: 'center' as const,
  },
};

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loginError, setLoginError] = useState<string | null>(null);
    const [loginSuccess, setLoginSuccess] = useState(false);
    const { login, error: authError, clearError } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Check for redirect from protected route
    useEffect(() => {
        if (location.state?.from) {
            setLoginError('Please log in to access that page.');
            // Clear the state to prevent showing the message again on refresh
            window.history.replaceState({}, document.title);
        }
        
        // Clear any auth errors when component mounts
        clearError();
    }, [location, clearError]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            setLoginError('Please enter both email and password');
            return;
        }
        
        setIsSubmitting(true);
        setLoginError(null);
        
        try {
            // Call login with credentials object
            await login({ email, password });
            
            // Set success state and redirect immediately
            setLoginSuccess(true);
            const redirectTo = location.state?.from?.pathname || '/dashboard';
            navigate(redirectTo, { replace: true });
        } catch (error: any) {
            console.error('Login failed:', error);
            setLoginError(
                error.message || 
                'Failed to log in. Please check your credentials and try again.'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div style={styles.loginContainer}>
            <div style={styles.loginCard}>
                <h1 style={styles.title}>Login</h1>
                
                {loginSuccess ? (
                    <div style={styles.successMessage}>
                        Login successful! Redirecting...
                    </div>
                ) : (
                    <>
                        {(loginError || authError) && (
                            <div style={styles.errorMessage}>
                                {loginError || authError}
                            </div>
                        )}
                        
                        <form onSubmit={handleSubmit}>
                            <div style={styles.formGroup}>
                                <label htmlFor="email" style={styles.label}>
                                    Email
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    style={styles.input}
                                    disabled={isSubmitting}
                                />
                            </div>
                            
                            <div style={styles.formGroup}>
                                <label htmlFor="password" style={styles.label}>
                                    Password
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    style={styles.input}
                                    disabled={isSubmitting}
                                />
                            </div>
                            
                            <button 
                                type="submit"
                                style={{
                                    ...styles.button,
                                    ...(isSubmitting ? styles.buttonDisabled : {}),
                                }}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <span>Logging in</span>
                                    <span style={styles.loading}></span>
                                  </span>
                                ) : 'Login'}
                            </button>
                        </form>
                        
                        <div style={styles.footer}>
                            <Link 
                                to="/forgot-password" 
                                style={styles.link}
                            >
                                Forgot Password?
                            </Link>
                            <span>
                                Don't have an account?{' '}
                                <Link 
                                    to="/register" 
                                    style={styles.link}
                                >
                                    Register
                                </Link>
                            </span>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Login;