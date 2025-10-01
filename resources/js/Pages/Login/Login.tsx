import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import '../Register/Register.css';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const { login, error: authError, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleGoogleSignIn = () => {
    const apiBase = (import.meta as any)?.env?.VITE_API_BASE_URL || '';
    const redirectAfter = `${window.location.origin}/dashboard`;
    const googleRedirectUrl = `${apiBase}/auth/google/redirect?redirect=${encodeURIComponent(redirectAfter)}`;
    window.location.href = googleRedirectUrl;
  };

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

  // If the auth context surfaces an error (e.g., when login resolves with an error),
  // mirror it to our local error so it renders in the login UI.
  useEffect(() => {
    if (authError) {
      setLoginError(authError);
    }
  }, [authError]);

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
      const result: any = await login({ email, password });

      // Handle cases where login does NOT throw but indicates failure via return value
      if (result === false || (result && result.success === false)) {
        setLoginError(result?.message || 'Invalid email/password combination. Please try again.');
        return;
      }

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
    <>
      <div className="register-cont">
        <div className="register-left">
          <img className="register-logo" src="/assets/Logo.png" alt="" />
          <h1 className="register-title">Welcome Back!</h1>
          <p className="register-subtitle">Login to your account</p>

          {loginSuccess ? (
            <div className="otp-success">Login successful! Redirecting...</div>
          ) : (
            <form onSubmit={handleSubmit}>
              {(loginError || authError) && (
                <div className="otp-success" style={{ background: '#fdecea', borderColor: '#f5c6cb', color: '#a94442' }}>
                  {loginError || authError}
                </div>
              )}

              <p className="register-name">Email Address*</p>
              <input
                className={`register-input-email ${loginError || authError ? 'input-error' : ''}`}
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
              />

              <p className="register-name">Password*</p>
              <input
                className={`register-input-password ${loginError || authError ? 'input-error' : ''}`}
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
              />
              <br />
              <button
                className="register-button"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Logging in...' : 'Login'}
                {isSubmitting && <span></span>}
              </button>
              
              <div className="register-or"><div className="register-hr" /><p>OR</p><div className="register-hr" /></div>
              <button type="button" className="register-google" onClick={handleGoogleSignIn}><img src="/assets/google.png" alt="" />Sign In with Google</button>
              <p className="register-already">
                Don't have an account? <a onClick={() => navigate('/register')}>Register</a>
              </p>
              <p className="register-already">
                <a onClick={() => navigate('/forgot-password')}>Forgot Password?</a>
              </p>
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

export default Login;