import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../store/store';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { token } = useAppSelector((state) => state.auth);
  const location = useLocation();

  if (!token) {
    const currentPath = location.pathname + location.search;
    return <Navigate to={`/login?redirect=${encodeURIComponent(currentPath)}`} replace />;
  }

  return <>{children}</>;
}
