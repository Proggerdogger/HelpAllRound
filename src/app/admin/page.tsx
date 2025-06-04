'use client';

import React from 'react';
import CreateJobForm from './CreateJobForm';
import CreateInvoiceForm from './CreateInvoiceForm';
import UpdateInvoiceStatusForm from './UpdateInvoiceStatusForm';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

const AdminPage = () => {
  const { currentUser, loadingAuthState } = useAuth();

  if (loadingAuthState) {
    return <div className="text-center p-10">Loading user status...</div>;
  }

  // Basic check if user is logged in. 
  // You'll want to add a more robust admin check here on the client-side, 
  // potentially calling a cloud function that verifies against the 'admins' Firestore collection.
  if (!currentUser) {
    return (
      <div className="text-center p-10">
        <p className="mb-4">You must be logged in as an administrator to view this page.</p>
        <Link href="/auth/login" className="text-indigo-600 hover:text-indigo-800">
          Go to Login
        </Link>
      </div>
    );
  }
  
  // Add a client-side check for admin role here for better UX,
  // though the Cloud Functions provide the true security.
  // For example, you might have: if (!userProfile?.isAdmin) return <p>Access Denied</p>;

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
        <p className="text-gray-600">Manage jobs and invoices.</p>
      </header>

      {/* You might want to add a check here to only show forms if the user is confirmed admin client-side */}
      {/* For now, assuming if currentUser exists, they might be an admin for UI display purposes */}
      {/* The actual security is in the Cloud Functions */}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section>
          <CreateJobForm />
        </section>
        <section>
          <CreateInvoiceForm />
          {/* You can add more admin components here, e.g., for updating jobs/invoices */}
        </section>
        <section>
          <UpdateInvoiceStatusForm />
        </section>
      </div>
    </div>
  );
};

export default AdminPage; 