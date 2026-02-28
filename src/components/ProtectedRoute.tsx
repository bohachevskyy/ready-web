import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../store/store';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { token } = useAppSelector((state) => state.auth);
  const location = useLocation();

  if (!token) {
    return <Navigate to="/welcome" replace state={{ from: location.pathname + location.search }} />;
  }

  return <>{children}</>;
}
