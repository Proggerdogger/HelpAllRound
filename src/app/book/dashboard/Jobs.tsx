'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getFunctions, httpsCallable, FunctionsError } from 'firebase/functions';
import { app } from '@/lib/firebase';

interface Job {
  id: string;
  jobId: string;
  bookingId: string;
  userId: string;
  helperId?: string | null;
  appointmentDate: string;
  appointmentTimeSlot: string;
  appointmentTimestamp: { seconds: number, nanoseconds: number };
  location: string;
  issueDescription: string;
  arrivalInstructions?: string;
  status: "Scheduled" | "InProgress" | "Completed" | "Cancelled";
  createdAt: { seconds: number, nanoseconds: number };
  updatedAt: { seconds: number, nanoseconds: number };
}

interface CancelBookingPayload {
  bookingId: string;
  jobId: string;
}

interface CancelBookingResponse {
  success: boolean;
  message: string;
  cancellationPolicy: {
    within24Hours: boolean;
    message: string;
  };
}

const Jobs = () => {
  const { currentUser, loadingAuthState } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingJobId, setCancellingJobId] = useState<string | null>(null);

  const fetchJobs = useCallback(async () => {
    if (!currentUser) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const functions = getFunctions(app);
      const getJobsForUser = httpsCallable<{ userId: string }, { jobs: Job[] }>(functions, 'getJobsForUser');
      const result = await getJobsForUser({ userId: currentUser.uid });
      
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
      setJobs([]);
    }
    setIsLoading(false);
  }, [currentUser]);

  useEffect(() => {
    if (!loadingAuthState) {
      fetchJobs();
    }
  }, [loadingAuthState, fetchJobs]);

  const handleCancelBooking = async (job: Job) => {
    if (!currentUser) {
      setError("You must be logged in to cancel a booking.");
      return;
    }
    if (!job.bookingId || !job.id) {
        setError("Cannot cancel: Missing booking or job document ID.");
        return;
    }

    if (job.status === 'Completed' || job.status === 'Cancelled') {
        alert(`This job is already ${job.status.toLowerCase()} and cannot be cancelled again.`);
        return;
    }

    const appointmentTimeMillis = job.appointmentTimestamp.seconds * 1000;
    const nowMillis = Date.now();
    const twentyFourHoursInMillis = 24 * 60 * 60 * 1000;
    let proceedToCancel = false;

    if (appointmentTimeMillis - nowMillis < twentyFourHoursInMillis && appointmentTimeMillis > nowMillis) {
      if (window.confirm("Cancellations within 24 hours of the job are not refunded. We can offer a $60 discount on your next booking. Do you still want to cancel?")) {
        proceedToCancel = true;
      } else {
        return;
      }
    } else if (appointmentTimeMillis <= nowMillis) {
      alert("This job's scheduled time has passed. It may not be cancellable or may have different cancellation terms.");
      if (window.confirm("This job's scheduled time has passed. Are you sure you want to attempt cancellation?")){
        proceedToCancel = true;
      } else {
        return;
      }
    } else {
      if (window.confirm(`Are you sure you want to cancel the booking for ${job.appointmentDate} at ${job.appointmentTimeSlot}?`)) {
        proceedToCancel = true;
      } else {
        return;
      }
    }

    if (!proceedToCancel) return;

    setCancellingJobId(job.jobId);
    setError(null);

    try {
      const functions = getFunctions(app);
      const cancelBookingFn = httpsCallable<CancelBookingPayload, CancelBookingResponse>(functions, 'cancelBooking');
      
      const result = await cancelBookingFn({ bookingId: job.bookingId, jobId: job.id });
      
      if (result.data.success) {
        alert(result.data.cancellationPolicy.message || result.data.message || "Booking cancelled successfully!");
        fetchJobs();
      } else {
        setError(result.data.message || "Cancellation was not successful. Please try again.");
      }

    } catch (err: any) {
      console.error("Error cancelling booking:", err);
      let errorMessage = "Failed to cancel booking. Please try again.";
      if (err instanceof FunctionsError) {
        errorMessage = `Error: ${err.message} (Code: ${err.code}, Details: ${err.details || 'N/A'})`;
      } else if (err.message) {
        errorMessage = err.message;
      }
      alert(`Error: ${errorMessage}`);
      setError(errorMessage);
    } finally {
      setCancellingJobId(null);
    }
  };

  const formatTimestamp = (timestamp: { seconds: number, nanoseconds: number } | undefined) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleString();
  };
  
  const formatAppointmentDateTime = (dateStr: string, timeSlot: string) => {
    const [startHourString] = timeSlot.split('-');
    const dateObj = new Date(dateStr + 'T00:00:00');
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return `${dateObj.toLocaleDateString(undefined, options)} at ${startHourString}:00`;
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
                  Job ID: {job.jobId}
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
                {(job.status === 'Scheduled') && (
                  <button 
                    onClick={() => handleCancelBooking(job)}
                    disabled={cancellingJobId === job.jobId}
                    className="mt-2 w-full md:w-auto bg-red-500 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded text-sm transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {cancellingJobId === job.jobId ? 'Cancelling...' : 'Cancel Booking'}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Jobs;