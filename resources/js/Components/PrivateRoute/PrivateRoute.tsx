import React, { ReactNode, useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface PrivateRouteProps {
  children?: ReactNode;
  redirectTo?: string;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ 
  children, 
  redirectTo = '/login' 
}) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  const [shouldRender, setShouldRender] = useState(false);

  // Wait for auth check to complete before rendering
  useEffect(() => {
    if (!loading) {
      setShouldRender(true);
    }
  }, [loading]);

  if (loading || !shouldRender) {
    // Show a loading spinner or skeleton while checking auth status
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid rgba(0, 0, 0, 0.1)',
          borderLeftColor: '#106552',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }}></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login page with the current location to return after login
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // If user is authenticated, render the children or the outlet
  return children ? <>{children}</> : <Outlet />;
};

export default PrivateRoute;
