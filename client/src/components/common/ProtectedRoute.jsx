import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import AppLoadingSkeleton from './AppLoadingSkeleton';

const ProtectedRoute = ({ allowedRoles, children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <AppLoadingSkeleton title="Loading secure area..." />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles?.length && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
