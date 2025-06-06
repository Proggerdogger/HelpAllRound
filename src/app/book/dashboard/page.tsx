'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Dashboard from './Dashboard';

export default function DashboardPage() {
  const { currentUser, loadingAuthState } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loadingAuthState) {
      if (!currentUser) {
        // If no user is authenticated, redirect to login
        router.replace('/book/login');
      } else if (currentUser.isAnonymous) {
        // If user is anonymous, redirect to login
        router.replace('/book/login');
      }
    }
  }, [currentUser, loadingAuthState, router]);

  if (loadingAuthState) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!currentUser || currentUser.isAnonymous) {
    return null; // Will redirect in useEffect
  }

  return <Dashboard />;
}

//This page does not look good on mobile.
