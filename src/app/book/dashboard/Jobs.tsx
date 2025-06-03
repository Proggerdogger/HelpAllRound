'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getFunctions, httpsCallable, FunctionsError } from 'firebase/functions';
import { app } from '@/lib/firebase'; // Corrected import path

// Define the structure of a Job object based on your Firestore structure
interface Job {
  id: string; // Document ID from Firestore
  jobId: string; // The auto-generated ID stored in the document
  bookingId: string;
  userId: string;
  helperId?: string | null;
  appointmentDate: string; // YYYY-MM-DD
  appointmentTimeSlot: string; // e.g., "9-10"
  appointmentTimestamp: { seconds: number, nanoseconds: number }; // Firestore Timestamp
  location: string;
  issueDescription: string;
  arrivalInstructions?: string;
  status: "Scheduled" | "InProgress" | "Completed" | "Cancelled";
  createdAt: { seconds: number, nanoseconds: number }; // Firestore Timestamp
  updatedAt: { seconds: number, nanoseconds: number }; // Firestore Timestamp
}

const Jobs = () => {
  const { currentUser, loadingAuthState } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = useCallback(async () => {
    if (!currentUser) {
      setIsLoading(false);
      // setError("User not authenticated."); // Or just show no jobs
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const functions = getFunctions(app);
      const getJobsForUser = httpsCallable<{ userId: string }, { jobs: Job[] }>(functions, 'getJobsForUser');
      const result = await getJobsForUser({ userId: currentUser.uid });
      
      // Sort jobs by appointmentTimestamp in descending order (most recent first)
      // The backend already sorts, but good practice for client-side consistency if needed.
      const sortedJobs = result.data.jobs.sort((a, b) => {
        const dateA = new Date(a.appointmentTimestamp.seconds * 1000);
        const dateB = new Date(b.appointmentTimestamp.seconds * 1000);
        return dateB.getTime() - dateA.getTime();
      });
      setJobs(sortedJobs || []);

    } catch (err: any) {
      console.error("Error fetching jobs:", err);
      let errorMessage = "Failed to load jobs. Please try again.";
      if (err instanceof FunctionsError) {
        errorMessage = `Error: ${err.message} (Code: ${err.code})`;
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      setJobs([]); // Clear jobs on error
    }
    setIsLoading(false);
  }, [currentUser]);

  useEffect(() => {
    if (!loadingAuthState) {
      fetchJobs();
    }
  }, [loadingAuthState, fetchJobs]);

  // Helper to format Firestore Timestamp to a readable date/time string
  const formatTimestamp = (timestamp: { seconds: number, nanoseconds: number } | undefined) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleString(); // Adjust format as needed, e.g., toLocaleDateString() or toLocaleTimeString()
  };
  
  const formatAppointmentDateTime = (dateStr: string, timeSlot: string) => {
    // Assuming dateStr is YYYY-MM-DD and timeSlot is "H-H" or "HH-HH"
    const [startHourString] = timeSlot.split('-');
    let startHour = parseInt(startHourString, 10);

    // Basic AM/PM conversion for display if needed, or keep as 24-hour
    if (startHour > 12) startHour -= 12;
    if (startHour === 0) startHour = 12; // Midnight case if applicable

    const dateObj = new Date(dateStr); // Uses local timezone by default
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    
    return `${dateObj.toLocaleDateString(undefined, options)} at ${startHourString}:00`; // Simpler: `${dateStr} at ${startHour}:00 ${ampm}` or use timeSlot directly
  };


  if (loadingAuthState || isLoading) {
    return (
      <div className="flex justify-center p-4">
        <div className="bg-white rounded-lg shadow p-6 w-full max-w-2xl text-center">
          <p className="text-gray-600">Loading jobs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center p-4">
        <div className="bg-white rounded-lg shadow p-6 w-full max-w-2xl text-center">
          <p className="text-red-500">Error loading jobs: {error}</p>
        </div>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="flex justify-center p-4">
        <div className="bg-white rounded-lg shadow p-6 w-full max-w-2xl text-center">
          <p className="text-gray-600">You have no scheduled jobs.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center p-4">
      <div className="bg-white rounded-lg shadow p-6 w-full max-w-4xl space-y-6">
        {jobs.map((job) => (
          <div key={job.id || job.jobId} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
              <div className="md:col-span-2 space-y-2">
                <h3 className="text-xl font-semibold text-red-600">
                  Job ID: {job.jobId.substring(0,8)}... {/* Shorten for display */}
                </h3>
                <p className="text-gray-700">
                  <span className="font-medium">Appointment:</span> {formatAppointmentDateTime(job.appointmentDate, job.appointmentTimeSlot)}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Location:</span> {job.location}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Issue:</span> {job.issueDescription}
                </p>
                {job.arrivalInstructions && (
                  <p className="text-sm text-gray-500">
                    <span className="font-medium">Arrival Instructions:</span> {job.arrivalInstructions}
                  </p>
                )}
              </div>
              <div className="space-y-2 md:text-right">
                <p className="text-gray-700">
                  <span className="font-medium">Status:</span> 
                  <span className={`ml-2 px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    job.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' :
                    job.status === 'Completed' ? 'bg-green-100 text-green-800' :
                    job.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                    job.status === 'InProgress' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {job.status}
                  </span>
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Helper:</span> {job.helperId || 'Not Assigned Yet'}
                </p>
                <p className="text-sm text-gray-500">
                  <span className="font-medium">Booked on:</span> {formatTimestamp(job.createdAt)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Jobs;
