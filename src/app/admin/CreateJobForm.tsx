'use client';

import React, { useState } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '@/lib/firebase'; // Ensure this path is correct for your Firebase app initialization
import { useAuth } from '@/contexts/AuthContext'; // To ensure an admin is logged in

// Define valid job statuses - should match your backend
const VALID_JOB_STATUSES = ["Scheduled", "InProgress", "Completed", "Cancelled", "Rescheduled"];
const ALL_AVAILABLE_TIME_SLOTS = ["9-10", "10-11", "11-12", "12-1", "1-2", "2-3", "3-4"];


const CreateJobForm = () => {
  const { currentUser } = useAuth();
  const [userId, setUserId] = useState('');
  const [appointmentDate, setAppointmentDate] = useState(''); // YYYY-MM-DD
  const [appointmentTimeSlot, setAppointmentTimeSlot] = useState(ALL_AVAILABLE_TIME_SLOTS[0]);
  const [location, setLocation] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [arrivalInstructions, setArrivalInstructions] = useState('');
  const [status, setStatus] = useState(VALID_JOB_STATUSES[0]);
  const [helperId, setHelperId] = useState(''); // Optional
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!currentUser) {
      setError("You must be logged in as an admin to create a job.");
      return;
    }

    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);

    const functions = getFunctions(app);
    const adminCreateJobFunction = httpsCallable(functions, 'adminCreateJob');

    const payload = {
      userId,
      appointmentDate,
      appointmentTimeSlot,
      location,
      issueDescription,
      arrivalInstructions: arrivalInstructions || undefined, // Send undefined if empty
      status: status as typeof VALID_JOB_STATUSES[number], // Cast to JobStatus type
      helperId: helperId || null, // Send null if empty
    };

    try {
      const result = await adminCreateJobFunction(payload) as any;
      setSuccessMessage(result.data.message || 'Job created successfully!');
      // Reset form or redirect as needed
      setUserId('');
      setAppointmentDate('');
      setLocation('');
      setIssueDescription('');
      setArrivalInstructions('');
      setHelperId('');
      setStatus(VALID_JOB_STATUSES[0]);
      setAppointmentTimeSlot(ALL_AVAILABLE_TIME_SLOTS[0]);
    } catch (err: any) {
      console.error("Error calling adminCreateJob:", err);
      setError(err.message || 'Failed to create job.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white shadow-md rounded-lg max-w-lg mx-auto my-6">
      <h2 className="text-xl font-semibold mb-4 text-center">Create New Job (Admin)</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="userId" className="block text-sm font-medium text-gray-700">Customer User ID <span className="text-red-500">*</span></label>
          <input
            type="text"
            id="userId"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="appointmentDate" className="block text-sm font-medium text-gray-700">Appointment Date (YYYY-MM-DD) <span className="text-red-500">*</span></label>
          <input
            type="date" // Using date type for easier input, ensure format YYYY-MM-DD is sent
            id="appointmentDate"
            value={appointmentDate}
            onChange={(e) => setAppointmentDate(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        
        <div>
          <label htmlFor="appointmentTimeSlot" className="block text-sm font-medium text-gray-700">Appointment Time Slot <span className="text-red-500">*</span></label>
          <select
            id="appointmentTimeSlot"
            value={appointmentTimeSlot}
            onChange={(e) => setAppointmentTimeSlot(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            {ALL_AVAILABLE_TIME_SLOTS.map(slot => <option key={slot} value={slot}>{slot}</option>)}
          </select>
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location / Address <span className="text-red-500">*</span></label>
          <textarea
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
            rows={3}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="issueDescription" className="block text-sm font-medium text-gray-700">Issue Description <span className="text-red-500">*</span></label>
          <textarea
            id="issueDescription"
            value={issueDescription}
            onChange={(e) => setIssueDescription(e.target.value)}
            required
            rows={3}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        
        <div>
          <label htmlFor="arrivalInstructions" className="block text-sm font-medium text-gray-700">Arrival Instructions</label>
          <textarea
            id="arrivalInstructions"
            value={arrivalInstructions}
            onChange={(e) => setArrivalInstructions(e.target.value)}
            rows={2}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            {VALID_JOB_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div>
          <label htmlFor="helperId" className="block text-sm font-medium text-gray-700">Helper User ID (Optional)</label>
          <input
            type="text"
            id="helperId"
            value={helperId}
            onChange={(e) => setHelperId(e.target.value)}
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
          {isLoading ? 'Creating Job...' : 'Create Job'}
        </button>
        {!currentUser && <p className="text-xs text-red-500 text-center mt-1">You must be logged in to create a job.</p>}
      </form>
    </div>
  );
};

export default CreateJobForm; 