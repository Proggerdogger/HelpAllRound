// components/Confirmation.tsx
'use client';

import { useRouter } from "next/navigation";
import Link from "next/link";
import ProgressIndicator from "./ProgressIndicator";
import type { User } from 'firebase/auth'; // Import User type

interface FormDataValues {
  unitNumber?: string;
  streetNumber: string;
  streetName: string;
  suburb: string;
  state: string;
  postcode: string;

  arrivalInstructions: string;
  issueDescription: string;
  selectedDate: string;
  selectedTime: string;
  paymentIntentId: string | null;
  jobId?: string;
  bookingId?: string;
  contactPhoneNumber?: string;
}

interface ConfirmationProps {
  formData: FormDataValues;
  currentUser: User | null; // Add currentUser to props
}

const Confirmation: React.FC<ConfirmationProps> = ({ formData, currentUser }) => {
  const router = useRouter();

  const handleButtonClick = () => {
    if (currentUser && currentUser.isAnonymous) {
      router.push("/book/login"); // Anonymous users go to login page
    } else {
      router.push("/book/dashboard"); // Authenticated users go to dashboard
    }
  };

  const buttonText = currentUser && currentUser.isAnonymous 
    ? "Log In/Sign Up & View Dashboard"
    : "Return to Dashboard";

  const displayJobId = formData.jobId;

  const getFormattedAddress = () => {
    if (!formData.streetNumber && !formData.streetName) return "Address not provided";
    return `${formData.unitNumber ? formData.unitNumber + '/' : ''}${formData.streetNumber} ${formData.streetName}, ${formData.suburb}, ${formData.state.toUpperCase()} ${formData.postcode}`.replace(/^, |, $/g, '').replace(/ , /g, ', ').trim();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center p-6">
      {/* Main Content */}
      <div className="text-center w-full max-w-2xl">
        {/* Logo */}
        <Link href="/" passHref>
          <h1 className="text-3xl font-bold text-red-500 mb-8 cursor-pointer hover:opacity-80 transition-opacity">
            HelpAllRound
          </h1>
        </Link>

        {/* Form Container */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <ProgressIndicator currentStep={5} totalSteps={5} stepName="Confirmation" />
          
          {displayJobId ? (
            <>
              {/* Success Message */}
              <h2 className="text-2xl font-semibold mb-4 mt-6 text-green-600">Booking Confirmed!</h2>
              <p className="text-gray-700 mb-2">
                Thank you for your booking. Your Job ID is <span className="font-semibold">{displayJobId}</span>.
              </p>
              <p className="text-gray-700 mb-6">
                A Helper will arrive at the scheduled time. You can view your booking details in the dashboard.
              </p>

              {/* Booking Details Summary */}
              <div className="mb-6 mt-8 p-4 bg-gray-50 rounded-lg text-left">
                <h3 className="text-lg font-semibold mb-3 text-center text-gray-800">Booking Details</h3>
                <div className="space-y-2">
                  <p className="text-gray-700">
                    <span className="font-semibold">Address:</span> {getFormattedAddress()}
                  </p>
                  {formData.contactPhoneNumber && (
                    <p className="text-gray-700">
                      <span className="font-semibold">Contact Phone:</span> {formData.contactPhoneNumber}
                    </p>
                  )}
                  <p className="text-gray-700">
                    <span className="font-semibold">Arrival Instructions:</span> {formData.arrivalInstructions || 'N/A'}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-semibold">Issue:</span> {formData.issueDescription}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-semibold">Date:</span>{" "}
                    {new Date(formData.selectedDate + 'T00:00:00').toLocaleDateString("en-AU", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric"
                    })}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-semibold">Time:</span> {formData.selectedTime}
                  </p>
                </div>
              </div>

              {/* Return to Dashboard Button */}
              <div className="flex justify-center mt-8">
                <button
                  onClick={handleButtonClick}
                  className="w-auto px-6 py-3 rounded bg-red-500 text-white font-semibold hover:bg-red-600 cursor-pointer transition-colors"
                >
                  {buttonText}
                </button>
              </div>
            </>
          ) : (
             <div className="py-8">
              <h2 className="text-xl font-semibold mb-4">Finalizing Your Booking...</h2>
              <p className="text-gray-600">Please wait while we confirm your booking details.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Confirmation;