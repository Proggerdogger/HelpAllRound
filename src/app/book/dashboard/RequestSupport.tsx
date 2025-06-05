// components/RequestSupport.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getFunctions, httpsCallable, FunctionsError } from 'firebase/functions';
import { app } from '@/lib/firebase';
import { getFirestore, doc, updateDoc } from 'firebase/firestore'; // Added for Firestore updates

// Simplified Job interface for display purposes in the dropdown
interface DisplayJob {
  jobId: string;
  displayInfo: string; // e.g., "Job regarding 'Broken Sink' on 2023-10-26"
}

// Full Job interface (if needed for more details, similar to Jobs.tsx)
interface Job {
    id: string; // Firestore document ID
    jobId: string; // The human-readable/sequential Job ID
    bookingId: string;
    userId: string;
    helperId?: string | null;
    appointmentDate: string; // YYYY-MM-DD
    appointmentTimeSlot: string; // e.g., "9-10"
    appointmentTimestamp: { seconds: number, nanoseconds: number };
    location: string;
    issueDescription: string;
    arrivalInstructions?: string;
    status: "Scheduled" | "InProgress" | "Completed" | "Cancelled";
    createdAt: { seconds: number, nanoseconds: number };
    updatedAt: { seconds: number, nanoseconds: number };
  }

// Interface for the data sent to the cloud function
interface CreateSupportTicketPayload {
    jobId: string;
    enquiryText: string;
    overrideEmail?: string; // Added to pass email if not in auth token
}

// Interface for the expected successful response from the cloud function
interface CreateSupportTicketResponse {
    success: boolean;
    ticketId: string;
    ticketNumber?: string; // Added based on recent backend changes
    message: string;
}

const RequestSupport: React.FC = () => {
    const { currentUser, userProfile, loadingAuthState } = useAuth();
    const [enquiryText, setEnquiryText] = useState('');
    const [selectedJobId, setSelectedJobId] = useState('');
    const [isSent, setIsSent] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const charLimit = 750;

    const [userJobs, setUserJobs] = useState<DisplayJob[]>([]);
    const [isLoadingJobs, setIsLoadingJobs] = useState(true);
    const [jobsError, setJobsError] = useState<string | null>(null);

    // States for email prompt
    const [needsEmailPrompt, setNeedsEmailPrompt] = useState(false);
    const [inputEmail, setInputEmail] = useState('');
    const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
    const [emailUpdateError, setEmailUpdateError] = useState<string | null>(null);
    const [emailUpdateSuccessMessage, setEmailUpdateSuccessMessage] = useState<string | null>(null);
    const [submittedEmailForThisSession, setSubmittedEmailForThisSession] = useState<string | null>(null);

    const formatJobForDisplay = (job: Job): string => {
        const date = new Date(job.appointmentTimestamp.seconds * 1000);
        const formattedDate = date.toLocaleDateString('en-AU', { year: 'numeric', month: 'short', day: 'numeric' });
        const shortIssue = job.issueDescription.length > 30 ? job.issueDescription.substring(0, 27) + '...' : job.issueDescription;
        return `Job ID: ${job.jobId} - ${shortIssue} (${formattedDate})`;
    };

    const fetchUserJobs = useCallback(async () => {
        if (!currentUser) {
            setIsLoadingJobs(false);
            setUserJobs([]);
            return;
        }
        setIsLoadingJobs(true);
        setJobsError(null);
        try {
            const functions = getFunctions(app);
            // Ensure the callable function name and payload/result types match Jobs.tsx
            const getJobsForUser = httpsCallable<{ userId: string }, { jobs: Job[] }>(functions, 'getJobsForUser');
            const result = await getJobsForUser({ userId: currentUser.uid });
            
            const displayJobs = result.data.jobs
                .sort((a, b) => b.appointmentTimestamp.seconds - a.appointmentTimestamp.seconds) // Sort by most recent first
                .map(job => ({
                    jobId: job.jobId,
                    displayInfo: formatJobForDisplay(job)
                }));
            setUserJobs(displayJobs);
        } catch (err: any) {
            console.error("Error fetching jobs for support form:", err);
            let errorMessage = "Failed to load your jobs. Please try again.";
            if (err instanceof FunctionsError) {
                errorMessage = `Error: ${err.message} (Code: ${err.code})`;
            } else if (err.message) {
                errorMessage = err.message;
            }
            setJobsError(errorMessage);
            setUserJobs([]);
        } finally {
            setIsLoadingJobs(false);
        }
    }, [currentUser]);

    useEffect(() => {
        if (!loadingAuthState) {
            fetchUserJobs();
        }
    }, [loadingAuthState, fetchUserJobs]);

    useEffect(() => {
        // Determine if email prompt is needed
        if (!loadingAuthState && currentUser) {
            const profileEmailMissing = !userProfile || !userProfile.email;
            const authEmailMissing = !currentUser.email;
            if (authEmailMissing && profileEmailMissing) {
                setNeedsEmailPrompt(true);
            } else {
                setNeedsEmailPrompt(false);
            }
        } else if (!currentUser && !loadingAuthState) {
            // Not logged in, clear prompt
            setNeedsEmailPrompt(false);
        }
    }, [currentUser, userProfile, loadingAuthState]);

    const handleEnquiryChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        const text = event.target.value;
        if (text.length <= charLimit) {
            setEnquiryText(text);
        }
         if (submitError) setSubmitError(null); // Clear error on input change
         if (isSent) setIsSent(false); // Allow re-submission if they change text after a successful send
         if (successMessage) setSuccessMessage(null);
    };

    const handleJobIdChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedJobId(event.target.value);
        if (submitError) setSubmitError(null); // Clear error on input change
        if (isSent) setIsSent(false); // Allow re-submission
        if (successMessage) setSuccessMessage(null);
    };

    const handleEmailInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInputEmail(event.target.value);
        if (emailUpdateError) setEmailUpdateError(null);
        if (emailUpdateSuccessMessage) setEmailUpdateSuccessMessage(null);
    };

    const handleEmailUpdate = async () => {
        if (!inputEmail || !inputEmail.includes('@')) {
            setEmailUpdateError("Please enter a valid email address.");
            return;
        }
        if (!currentUser) {
            setEmailUpdateError("You must be logged in to update your email.");
            return;
        }

        setIsUpdatingEmail(true);
        setEmailUpdateError(null);
        setEmailUpdateSuccessMessage(null);

        try {
            const firestoreDB = getFirestore(app);
            const userDocRef = doc(firestoreDB, "users", currentUser.uid);
            await updateDoc(userDocRef, { email: inputEmail });
            
            setSubmittedEmailForThisSession(inputEmail); // Store for immediate use
            setEmailUpdateSuccessMessage("Email updated successfully! You can now submit your support request.");
            setNeedsEmailPrompt(false); // Hide email form
            // userProfile will update via onSnapshot from AuthContext
        } catch (error: any) {
            console.error("Error updating email in Firestore:", error);
            setEmailUpdateError(error.message || "Failed to update email. Please try again.");
        } finally {
            setIsUpdatingEmail(false);
        }
    };

    const handleSubmit = async () => {
        if (!selectedJobId || enquiryText.trim() === '') {
            setSubmitError("Please select a Job ID and describe your issue.");
            return;
        }
        if (!currentUser) {
            setSubmitError("You must be logged in to submit a request.");
            return;
        }

        // If email prompt was shown and not yet successfully submitted, prevent submission.
        if (needsEmailPrompt && !emailUpdateSuccessMessage) {
             setSubmitError("Please provide your email address before submitting the request.");
             return;
        }
        
        setIsSubmitting(true);
        setSubmitError(null);
        setSuccessMessage(null);
        setIsSent(false);

        const payload: CreateSupportTicketPayload = {
            jobId: selectedJobId,
            enquiryText: enquiryText.trim(),
        };

        // Use the email just submitted if it exists, otherwise cloud function relies on token
        if (submittedEmailForThisSession) {
            payload.overrideEmail = submittedEmailForThisSession;
        } else if (currentUser.email) {
            // Email is in token, no override needed.
        } else if (userProfile?.email) {
            // Fallback: email in profile but not token (less likely for fresh logins)
            payload.overrideEmail = userProfile.email;
        }
        // If no email is available at this point (neither in token, nor profile, nor submitted now),
        // the backend will reject because it now requires an email.

        try {
            const functionsInstance = getFunctions(app);
            const callCreateSupportTicket = httpsCallable<
                CreateSupportTicketPayload, 
                CreateSupportTicketResponse
            >(functionsInstance, 'createSupportTicket');

            const result = await callCreateSupportTicket(payload);

            if (result.data.success) {
                setIsSent(true);
                // Use ticketNumber in success message if available
                const ticketMsg = result.data.ticketNumber 
                    ? `Support ticket ${result.data.ticketNumber} created successfully.`
                    : (result.data.message || "Support request submitted successfully!");
                setSuccessMessage(ticketMsg);
            } else {
                setSubmitError(result.data.message || "Failed to submit support request. Please try again.");
            }
        } catch (error: any) {
            console.error("Error calling createSupportTicket function:", error);
            let friendlyMessage = "An unexpected error occurred. Please try again.";
            if (error instanceof FunctionsError) {
                 friendlyMessage = `Error: ${error.message} (Details: ${error.details || 'N/A'})`;
            } else if (error.message) {
                friendlyMessage = error.message;
            }
            setSubmitError(friendlyMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loadingAuthState) {
        return <div className="p-6 text-center"><p>Loading user information...</p></div>;
    }

    if (!currentUser) {
        return (
            <div className="p-6 text-center">
                <p>Please log in to request support.</p>
                {/* Optionally, add a login button/link here */}
            </div>
        );
    }
    
    // Show email prompt if needed
    if (needsEmailPrompt) {
        return (
            <div className="flex justify-center">
                <div className="p-6 bg-white shadow-md rounded-lg max-w-md w-full">
                    <h3 className="text-lg font-semibold mb-4 text-center text-gray-800">Email Required</h3>
                    <p className="mb-4 text-sm text-gray-600 text-center">
                        We need your email address to send you updates about your support request.
                    </p>
                    <div className="mb-4">
                        <label htmlFor="emailInput" className="block text-sm font-medium text-gray-700 mb-1">
                            Your Email Address <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="email"
                            id="emailInput"
                            className="w-full p-2 border rounded text-gray-700 focus:ring-red-500 focus:border-red-500"
                            value={inputEmail}
                            onChange={handleEmailInputChange}
                            placeholder="you@example.com"
                            disabled={isUpdatingEmail}
                        />
                    </div>

                    {emailUpdateError && (
                        <p className="mb-2 text-sm text-red-600 text-center">{emailUpdateError}</p>
                    )}
                    {emailUpdateSuccessMessage && (
                        <p className="mb-2 text-sm text-green-600 text-center">{emailUpdateSuccessMessage}</p>
                    )}

                    <button
                        className={`w-full px-4 py-2 rounded text-white ${
                            isUpdatingEmail || !inputEmail.includes('@')
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-red-600 hover:bg-red-700'
                        } cursor-pointer`}
                        onClick={handleEmailUpdate}
                        disabled={isUpdatingEmail || !inputEmail.includes('@')}
                    >
                        {isUpdatingEmail ? "Saving Email..." : "Save Email & Continue"}
                    </button>
                </div>
            </div>
        );
    }

    return (
      <div className="flex justify-center">
        <div className="p-6 bg-white shadow-md rounded-lg max-w-md w-full">
          <h3 className="text-sm font-semibold mb-4 text-center">Please enter your enquiry details:</h3>
  
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1 text-center">
              Related Job ID <span className="text-red-500">*</span>
            </label>
            {isLoadingJobs ? (
                <p className="text-center text-gray-500">Loading your jobs...</p>
            ) : jobsError ? (
                <p className="text-center text-red-500">{jobsError}</p>
            ) : (
                <select 
                  className="w-full p-2 border rounded text-gray-700 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                  value={selectedJobId}
                  onChange={handleJobIdChange}
                  disabled={isSent || isSubmitting || userJobs.length === 0}
                >
                  <option value="">{userJobs.length === 0 ? "No jobs found" : "Please select a job"}</option>
                  {userJobs.map(job => (
                    <option key={job.jobId} value={job.jobId}>
                      {job.displayInfo}
                    </option>
                  ))}
                </select>
            )}
          </div>
  
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1 text-center">
              How can we assist you? <span className="text-red-500">*</span>
            </label>
            <textarea
              className="w-full p-2 border rounded text-gray-700 disabled:bg-gray-100 disabled:cursor-not-allowed"
              rows={4}
              placeholder="Please describe your issue here"
              value={enquiryText}
              onChange={handleEnquiryChange}
              maxLength={charLimit}
              disabled={isSent || isSubmitting}
            ></textarea>
          </div>
            
          {/* Display submission error if any */}
          {submitError && (
            <p className="mb-2 text-sm text-red-600 text-center">{submitError}</p>
          )}
          {/* Display success message */}
          {successMessage && !submitError && (
             <p className="mb-2 text-sm text-green-600 text-center">{successMessage}</p>
          )}

          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">Characters: {enquiryText.length}/{charLimit}</p>
            <button 
              className={`px-4 py-2 rounded text-white ${
                isSent 
                    ? 'bg-green-500 cursor-not-allowed' 
                    : (selectedJobId && enquiryText.trim() !== '' && !isSubmitting && (!needsEmailPrompt || emailUpdateSuccessMessage)
                        ? 'bg-red-600 hover:bg-red-700' 
                        : 'bg-gray-400 cursor-not-allowed')
              } cursor-pointer`}
              onClick={handleSubmit}
              disabled={isSent || isSubmitting || !selectedJobId || enquiryText.trim() === '' || (needsEmailPrompt && !emailUpdateSuccessMessage)}
            >
              {isSubmitting ? "Submitting..." : (isSent ? "Sent!" : "Submit Request")}
            </button>
          </div>
  
          {/* Conditional message based on isSent state, now using successMessage for more specific feedback*/}
          {/* {isSent && (
            <p className="mt-4 text-sm text-green-600 text-center">
              Your support request has been logged for review. We will be in touch if needed.
            </p>
          )} */}

          <p className="mt-4 text-sm text-gray-600 text-center">
            Or call us on{" "}
            <a href="tel:1300635811" className="text-blue-500 hover:underline cursor-pointer">
              1300 635 822
            </a>{" "}
            for help
          </p>
        </div>
      </div>
    );
  };
  
  export default RequestSupport;