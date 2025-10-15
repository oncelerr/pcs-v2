import React, { ReactNode, useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../LoadingSpinner';

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
    return <LoadingSpinner fullPage size="medium" color="#126654" />;
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

  // console.log('user:', user);
  // console.log('requiredRoles:', requiredRoles);

  return children ? <>{children}</> : <Outlet />;
};

export default PrivateRoute;
