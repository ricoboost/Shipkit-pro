import { Suspense } from 'react';
import { LoginForm } from '@/components/auth/login-form';

export const metadata = {
  title: 'Sign In',
  description: 'Sign in to your account',
};

interface LoginPageProps {
  searchParams: Promise<{ callbackUrl?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps): Promise<React.JSX.Element> {
  const params = await searchParams;
  const callbackUrl = params.callbackUrl || '/dashboard';

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Suspense fallback={<div>Loading...</div>}>
        <LoginForm callbackUrl={callbackUrl} />
      </Suspense>
    </div>
  );
}
