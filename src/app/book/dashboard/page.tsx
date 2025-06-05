'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Dashboard from './Dashboard';

export default function DashboardPage() {
  const { currentUser, loadingAuthState } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loadingAuthState && !currentUser) {
      router.push('/book/login');
    }
  }, [currentUser, loadingAuthState, router]);

  if (loadingAuthState) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!currentUser) {
    return null; // Will redirect in useEffect
  }

  return <Dashboard />;
}

