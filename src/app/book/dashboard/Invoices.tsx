'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getFunctions, httpsCallable, FunctionsError } from 'firebase/functions';
import { app } from '@/lib/firebase'; // Corrected path

// Define the structure of an Invoice object based on your Firestore structure
interface Invoice {
  id: string; // Document ID from Firestore
  invoiceId: string; // The auto-generated ID stored in the document
  jobId: string;
  userId: string;
  amount: number;
  paymentIntentId?: string; // Might be from the original booking/job
  status: "Unpaid" | "Paid" | "Overdue" | "Cancelled";
  issuedDate: { seconds: number, nanoseconds: number }; // Firestore Timestamp
  dueDate?: { seconds: number, nanoseconds: number }; // Firestore Timestamp
  paidDate?: { seconds: number, nanoseconds: number } | null; // Firestore Timestamp
  appointmentTimestamp?: { seconds: number, nanoseconds: number }; // Copied from Job for reference
  location?: string; // Copied from Job for reference
  createdAt: { seconds: number, nanoseconds: number };
  updatedAt: { seconds: number, nanoseconds: number };
}

const Invoices = () => {
  const { currentUser, loadingAuthState } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoices = useCallback(async () => {
    if (!currentUser) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const functions = getFunctions(app);
      const getInvoicesForUserCallable = httpsCallable<{ userId: string }, { invoices: Invoice[] }>(functions, 'getInvoicesForUser');
      const result = await getInvoicesForUserCallable({ userId: currentUser.uid });
      
      // Sort invoices by issuedDate in descending order (most recent first)
      // Backend already sorts, but good practice for client-side consistency
      const sortedInvoices = result.data.invoices.sort((a, b) => {
        const dateA = new Date(a.issuedDate.seconds * 1000);
        const dateB = new Date(b.issuedDate.seconds * 1000);
        return dateB.getTime() - dateA.getTime();
      });
      setInvoices(sortedInvoices || []);

    } catch (err: any) {
      console.error("Error fetching invoices:", err);
      let errorMessage = "Failed to load invoices. Please try again.";
      if (err instanceof FunctionsError) {
        errorMessage = `Error: ${err.message} (Code: ${err.code})`;
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      setInvoices([]);
    }
    setIsLoading(false);
  }, [currentUser]);

  useEffect(() => {
    if (!loadingAuthState) {
      fetchInvoices();
    }
  }, [loadingAuthState, fetchInvoices]);

  const formatTimestampDate = (timestamp: { seconds: number, nanoseconds: number } | undefined | null) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString(); // Format as YYYY-MM-DD or similar as per locale
  };
  
  const formatCurrency = (amount: number) => {
    // Basic currency formatting, adjust as needed (e.g., for different locales/currencies)
    return `$${(amount / 100).toFixed(2)}`; // Assuming amount is in cents
  };

  if (loadingAuthState || isLoading) {
    return (
      <div className="flex justify-center p-4">
        <div className="bg-white rounded-lg shadow p-6 w-full max-w-2xl text-center">
          <p className="text-gray-600">Loading invoices...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center p-4">
        <div className="bg-white rounded-lg shadow p-6 w-full max-w-2xl text-center">
          <p className="text-red-500">Error loading invoices: {error}</p>
        </div>
      </div>
    );
  }

  if (invoices.length === 0) {
    return (
      <div className="flex justify-center p-4">
        <div className="bg-white rounded-lg shadow p-6 w-full max-w-2xl text-center">
          <p className="text-gray-600">You have no invoices.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center p-4">
      <div className="bg-white rounded-lg shadow p-6 w-full max-w-4xl space-y-6">
        {invoices.map((invoice) => (
          <div key={invoice.id || invoice.invoiceId} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
              <div className="md:col-span-2 space-y-2">
                <h3 className="text-xl font-semibold text-red-600">
                  Invoice ID: {invoice.invoiceId.substring(0,8)}...
                </h3>
                <p className="text-gray-700">
                  <span className="font-medium">Job ID:</span> {invoice.jobId.substring(0,8)}...
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Amount:</span> {formatCurrency(invoice.amount)} 
                  <span className={`ml-2 px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    invoice.status === 'Paid' ? 'bg-green-100 text-green-800' :
                    invoice.status === 'Unpaid' ? 'bg-yellow-100 text-yellow-800' :
                    invoice.status === 'Overdue' ? 'bg-red-100 text-red-800' :
                    invoice.status === 'Cancelled' ? 'bg-gray-100 text-gray-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {invoice.status}
                  </span>
                </p>
                {invoice.location && (
                    <p className="text-gray-700"><span className="font-medium">Location:</span> {invoice.location}</p>
                )}
              </div>
              <div className="space-y-2 md:text-right">
                 <p className="text-gray-700">
                  <span className="font-medium">Issued:</span> {formatTimestampDate(invoice.issuedDate)}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Due:</span> {invoice.dueDate ? formatTimestampDate(invoice.dueDate) : 'N/A'}
                </p>
                {invoice.appointmentTimestamp && (
                     <p className="text-sm text-gray-500"><span className="font-medium">Appointment:</span> {formatTimestampDate(invoice.appointmentTimestamp)}</p>
                )}
              </div>
            </div>
            {/* Add a Pay Now button if invoice.status is Unpaid or Overdue */}
            {(invoice.status === 'Unpaid' || invoice.status === 'Overdue') && (
              <div className="mt-4 text-right">
                <button 
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 cursor-pointer"
                  onClick={() => alert(`Payment for invoice ${invoice.invoiceId} would be processed here.`)}
                >
                  Pay Invoice
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Invoices;