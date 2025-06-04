'use client';

import React, { useState } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '@/lib/firebase'; // Ensure this path is correct
import { useAuth } from '@/contexts/AuthContext';

const VALID_INVOICE_STATUSES = ["Unpaid", "Paid", "Overdue", "Cancelled"];

const UpdateInvoiceStatusForm = () => {
  const { currentUser } = useAuth();
  const [invoiceId, setInvoiceId] = useState('');
  const [status, setStatus] = useState<typeof VALID_INVOICE_STATUSES[number]>(VALID_INVOICE_STATUSES[0]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!currentUser) {
      setError("You must be logged in as an admin to update an invoice.");
      return;
    }
    if (!invoiceId) {
        setError("Invoice ID is required.");
        return;
    }

    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);

    const functions = getFunctions(app);
    const adminUpdateInvoiceStatusFunction = httpsCallable(functions, 'adminUpdateInvoiceStatus');

    const payload = {
      invoiceId,
      status,
    };

    try {
      const result = await adminUpdateInvoiceStatusFunction(payload) as any;
      setSuccessMessage(result.data.message || 'Invoice status updated successfully!');
      setInvoiceId(''); // Optionally reset form
      setStatus(VALID_INVOICE_STATUSES[0]);
    } catch (err: any) {
      console.error("Error calling adminUpdateInvoiceStatus:", err);
      setError(err.message || 'Failed to update invoice status.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white shadow-md rounded-lg max-w-lg mx-auto my-6">
      <h2 className="text-xl font-semibold mb-4 text-center">Update Invoice Status (Admin)</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="updateInvoiceId" className="block text-sm font-medium text-gray-700">Invoice ID <span className="text-red-500">*</span></label>
          <input
            type="text"
            id="updateInvoiceId" // Changed ID to avoid conflict if on same page as create form
            value={invoiceId}
            onChange={(e) => setInvoiceId(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="invoiceStatus" className="block text-sm font-medium text-gray-700">New Status <span className="text-red-500">*</span></label>
          <select
            id="invoiceStatus"
            value={status}
            onChange={(e) => setStatus(e.target.value as typeof VALID_INVOICE_STATUSES[number])}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            {VALID_INVOICE_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {error && <p className="text-sm text-red-600 text-center">{error}</p>}
        {successMessage && <p className="text-sm text-green-600 text-center">{successMessage}</p>}

        <button
          type="submit"
          disabled={isLoading || !currentUser}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isLoading ? 'Updating Invoice Status...' : 'Update Invoice Status'}
        </button>
        {!currentUser && <p className="text-xs text-red-500 text-center mt-1">You must be logged in to update an invoice.</p>}
      </form>
    </div>
  );
};

export default UpdateInvoiceStatusForm; 