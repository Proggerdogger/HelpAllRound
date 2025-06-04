'use client';

import React, { useState } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '@/lib/firebase'; // Ensure this path is correct
import { useAuth } from '@/contexts/AuthContext';

const CreateInvoiceForm = () => {
  const { currentUser } = useAuth();
  const [jobId, setJobId] = useState('');
  const [amount, setAmount] = useState(''); // Amount in cents
  const [dueDate, setDueDate] = useState(''); // Optional, YYYY-MM-DD

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!currentUser) {
      setError("You must be logged in as an admin to create an invoice.");
      return;
    }
    if (!jobId || !amount) {
        setError("Job ID and Amount are required.");
        return;
    }
    const numericAmount = parseInt(amount, 10);
    if (isNaN(numericAmount) || numericAmount <= 0) {
        setError("Amount must be a positive number (in cents).");
        return;
    }

    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);

    const functions = getFunctions(app);
    const createInvoiceFunction = httpsCallable(functions, 'createInvoiceForJob');

    const payload: { jobId: string; amount: number; dueDate?: string } = {
      jobId,
      amount: numericAmount,
    };
    if (dueDate) {
      payload.dueDate = dueDate;
    }

    try {
      const result = await createInvoiceFunction(payload) as any;
      setSuccessMessage(result.data.message || 'Invoice created successfully!');
      setJobId('');
      setAmount('');
      setDueDate('');
    } catch (err: any) {
      console.error("Error calling createInvoiceForJob:", err);
      setError(err.message || 'Failed to create invoice.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white shadow-md rounded-lg max-w-lg mx-auto my-6">
      <h2 className="text-xl font-semibold mb-4 text-center">Create New Invoice (Admin)</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="jobId" className="block text-sm font-medium text-gray-700">Job ID <span className="text-red-500">*</span></label>
          <input
            type="text"
            id="jobId"
            value={jobId}
            onChange={(e) => setJobId(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount (in cents) <span className="text-red-500">*</span></label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            min="1"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">Due Date (YYYY-MM-DD, Optional)</label>
          <input
            type="date"
            id="dueDate"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        {error && <p className="text-sm text-red-600 text-center">{error}</p>}
        {successMessage && <p className="text-sm text-green-600 text-center">{successMessage}</p>}

        <button
          type="submit"
          disabled={isLoading || !currentUser}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isLoading ? 'Creating Invoice...' : 'Create Invoice'}
        </button>
        {!currentUser && <p className="text-xs text-red-500 text-center mt-1">You must be logged in to create an invoice.</p>}
      </form>
    </div>
  );
};

export default CreateInvoiceForm; 