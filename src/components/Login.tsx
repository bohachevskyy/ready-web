import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from './ui/card';
import { AuthForm } from './AuthForm';

export function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl mx-auto p-8 bg-card shadow-lg">
        <AuthForm onSuccess={() => navigate(redirect, { replace: true })} />
      </Card>
    </div>
  );
}
