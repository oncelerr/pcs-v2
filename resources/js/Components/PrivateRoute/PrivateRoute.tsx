import React, { ReactNode, useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface PrivateRouteProps {
  children?: ReactNode;
  redirectTo?: string;
  requiredRoles?: string | string[]; // 👈 optional role requirement(s)
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({
  children,
  redirectTo = '/login',
  requiredRoles
}) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (!loading) {
      setShouldRender(true);
    }
  }, [loading]);

  if (loading || !shouldRender) {
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
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // ✅ Role-based protection
  if (requiredRoles) {
    const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
    const hasAccess = roles.some(r => user?.role?.name?.toLowerCase() === r.toLowerCase());

    if (!hasAccess) {
      return <Navigate to="/403" replace />; // 🔒 or "/dashboard"
    }
  }

  console.log('user:', user);
  console.log('requiredRoles:', requiredRoles);

  return children ? <>{children}</> : <Outlet />;
};

export default PrivateRoute;
