'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Dashboard from './Dashboard';

export default function DashboardPage() {
  const { currentUser, loadingAuthState, isLoggingOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Do not redirect if auth state is loading or a logout is in progress.
    if (loadingAuthState || isLoggingOut) {
      return;
    }

    if (!currentUser || currentUser.isAnonymous) {
      // If the user is not properly authenticated, redirect to login.
      console.log("[DashboardPage] User not authenticated or is anonymous, redirecting to login.");
      router.replace('/book/login');
    }
  }, [currentUser, loadingAuthState, isLoggingOut, router]);

  if (loadingAuthState || (!currentUser && !isLoggingOut)) {
    // Show loading text while auth state is resolving, or if we are about to redirect.
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if ((!currentUser || currentUser.isAnonymous) && !isLoggingOut) {
    // Render nothing while the redirect is happening to prevent flicker.
    return null;
  }

  return <Dashboard />;
}
