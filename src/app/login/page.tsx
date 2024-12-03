'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import AuthLayout from '../../components/templates/AuthLayout';
import LoginForm from '../../components/organisms/LoginForm';
import LoginSkeleton from '../../components/atoms/LoginSkeleton';

export default function LoginPage() {
  const router = useRouter();
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated,
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    } else {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, router]);

  if (isAuthenticated) {
    return null;
  }

  return (
    <AuthLayout title="ログイン">
      {isLoading ? <LoginSkeleton /> : <LoginForm />}
    </AuthLayout>
  );
}
