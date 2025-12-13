import { Suspense } from 'react';
import { RegisterForm } from '@/components/auth/register-form';

export const metadata = {
  title: 'Create Account',
  description: 'Create a new account',
};

export default function RegisterPage(): React.JSX.Element {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Suspense fallback={<div>Loading...</div>}>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
