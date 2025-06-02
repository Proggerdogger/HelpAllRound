// components/Confirmation.tsx
'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ProgressIndicator from "./ProgressIndicator";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

interface FormDataValues {
  address: string;
  arrivalInstructions: string;
  issueDescription: string;
  selectedDate: string;
  selectedTime: string;
  paymentIntentId: string | null;
}

interface ConfirmationProps {
  formData: FormDataValues;
}

const Confirmation: React.FC<ConfirmationProps> = ({ formData }) => {
  const router = useRouter();
  const { currentUser } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);

  const handleReturnToDashboard = () => {
    router.push("/book/dashboard");
  };

  useEffect(() => {
    if (formData && formData.paymentIntentId && currentUser && !bookingId && !isSaving) {
      const saveBooking = async () => {
        setIsSaving(true);
        setSaveError(null);
        try {
          const bookingData = {
            ...formData,
            userId: currentUser.uid,
            createdAt: serverTimestamp(),
            status: "payment_authorized",
          };

          const docRef = await addDoc(collection(db, "bookings"), bookingData);
          setBookingId(docRef.id);
          console.log("Booking saved with ID: ", docRef.id);

        } catch (error) {
          console.error("Error saving booking: ", error);
          setSaveError("Failed to save your booking. Please try again or contact support.");
        }
        setIsSaving(false);
      };

      saveBooking();
    }
  }, [formData, currentUser, bookingId, isSaving]);

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
          
          {isSaving && (
            <div className="py-8">
              <h2 className="text-xl font-semibold mb-4">Saving Your Booking...</h2>
              <p className="text-gray-600">Please wait a moment.</p>
            </div>
          )}

          {saveError && (
            <div className="py-8">
              <h2 className="text-xl font-semibold text-red-600 mb-4">Booking Failed</h2>
              <p className="text-red-700 mb-6">{saveError}</p>
              <button
                  onClick={handleReturnToDashboard}
                  className="w-1/3 py-2 rounded bg-gray-500 text-white hover:bg-gray-600 cursor-pointer"
                >
                  Back to Dashboard
                </button>
            </div>
          )}

          {!isSaving && !saveError && bookingId && (
            <>
              {/* Success Message */}
              <h2 className="text-xl font-semibold mb-4">Booking Confirmed!</h2>
              <p className="text-gray-700 mb-2">
                Thank you for your booking. Your booking ID is <span className="font-semibold">{bookingId}</span>.
              </p>
              <p className="text-gray-700 mb-6">
                A Helper will arrive at the scheduled time. You can view your booking details in the dashboard.
              </p>

              {/* Return to Dashboard Button */}
              <div className="flex justify-center">
                <button
                  onClick={handleReturnToDashboard}
                  className="w-1/3 py-2 rounded bg-red-500 text-white hover:bg-red-600 cursor-pointer"
                >
                  Return to Dashboard
                </button>
              </div>
            </>
          )}

          {!isSaving && !saveError && !bookingId && (!currentUser || !formData.paymentIntentId) && (
             <div className="py-8">
              <h2 className="text-xl font-semibold mb-4">Finalizing...</h2>
              <p className="text-gray-600">Preparing your booking confirmation.</p>
              {!currentUser && <p className="text-sm text-yellow-600 mt-2">Waiting for user session...</p>}
              {currentUser && !formData.paymentIntentId && <p className="text-sm text-yellow-600 mt-2">Waiting for payment authorization details...</p>}
            </div>
          )}

          {!isSaving && !saveError && bookingId && (
            <>
              {/* Title */}
              <h2 className="text-xl font-semibold mb-4">Review Your Booking</h2>
              <p className="text-gray-700 mb-6">
                Please review your booking details below. We will save it automatically.
              </p>

              {/* Booking Details */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-semibold mb-2">Booking Summary</h3>
                <div className="space-y-2">
                  <p className="text-gray-700">
                    <span className="font-semibold">Address:</span> {formData.address}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-semibold">Arrival Instructions:</span> {formData.arrivalInstructions}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-semibold">Issue:</span> {formData.issueDescription}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-semibold">Date:</span>{" "}
                    {new Date(formData.selectedDate).toLocaleDateString("en-US", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    })}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-semibold">Time:</span> {formData.selectedTime}
                  </p>
                  {formData.paymentIntentId && (
                     <p className="text-gray-700">
                        <span className="font-semibold">Payment Authorization ID:</span> <span className="text-xs">{formData.paymentIntentId}</span>
                     </p>
                  )}
                  
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Confirmation;
