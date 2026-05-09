import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  requireAuth?: boolean;
  redirectTo?: string;
}

const ProtectedRoute = ({ 
  requireAuth = true, 
  redirectTo = '/login' 
}: ProtectedRouteProps) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: 'var(--bg-white)',
        color: 'var(--primary-color)'
      }}>
        Carregando...
      </div>
    );
  }

  // If requires auth and NOT logged in -> Login
  if (requireAuth && !user) {
    return <Navigate to={redirectTo} replace />;
  }

  // If DOES NOT require auth (ex: login/register) and IS logged in -> Dashboard
  if (!requireAuth && user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
