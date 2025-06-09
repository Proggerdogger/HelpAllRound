'use client';

import React from 'react';
import CreateJobForm from './CreateJobForm';
import CreateInvoiceForm from './CreateInvoiceForm';
import UpdateInvoiceStatusForm from './UpdateInvoiceStatusForm';
import AdminControls from './AdminControls';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

const AdminPage = () => {
  const { currentUser, loadingAuthState } = useAuth();

  if (loadingAuthState) {
    return <div className="text-center p-10">Loading user status...</div>;
  }

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
  
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
        <p className="text-gray-600">Manage jobs, invoices, and system settings.</p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section>
          <CreateJobForm />
        </section>
        <section>
          <CreateInvoiceForm />
        </section>
        <section>
          <UpdateInvoiceStatusForm />
        </section>
        <section className="md:col-span-2">
            <AdminControls />
        </section>
      </div>
    </div>
  );
};

export default AdminPage; 