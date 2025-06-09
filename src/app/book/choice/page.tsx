'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext'; // Assuming you have AuthContext
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ChoicePage() {
  const { currentUser, loadingAuthState } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loadingAuthState && !currentUser) {
      router.push('/book/login'); // Redirect to login if not authenticated
    }
  }, [currentUser, loadingAuthState, router]);

  if (loadingAuthState || !currentUser) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
        <p className="text-gray-700 text-lg">Loading user information...</p>
        {/* You can add a spinner or a more sophisticated loading indicator here */}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <header className="absolute top-0 left-0 right-0 p-6 flex justify-center">
        <Link href="/" passHref>
          <h1 className="text-3xl font-bold text-red-600 hover:opacity-80 transition-opacity">
            HelpAllRound
          </h1>
        </Link>
      </header>
      
      <main className="flex flex-col items-center justify-center space-y-8 bg-white p-10 rounded-lg shadow-xl max-w-md w-full">
        <h2 className="text-2xl font-semibold text-gray-800 text-center">
          What would you like to do?
        </h2>
        
        <div className="w-full space-y-4">
          <Link href="/book/bookingform" passHref className="block w-full">
            <button className="w-full bg-red-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-red-700 transition duration-150 ease-in-out text-lg">
              Start New Booking
            </button>
          </Link>
          
          {currentUser && currentUser.isAnonymous ? (
            <Link href="/book/login" passHref className="block w-full">
              <button className="w-full bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg hover:bg-gray-800 transition duration-150 ease-in-out text-lg">
                Log In and Go to Dashboard
              </button>
            </Link>
          ) : (
            <Link href="/book/dashboard" passHref className="block w-full">
              <button className="w-full bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg hover:bg-gray-800 transition duration-150 ease-in-out text-lg">
                Go to My Dashboard
              </button>
            </Link>
          )}
        </div>
        
        {/* Optional: Add a logout button or other navigation here */}
      </main>
      
      <footer className="absolute bottom-0 left-0 right-0 p-6 text-center">
        <p className="text-sm text-gray-600">
          &copy; {new Date().getFullYear()} HelpAllRound. All rights reserved.
        </p>
      </footer>
    </div>
  );
} 