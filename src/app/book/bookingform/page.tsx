// page.tsx
'use client';

import { useState, useEffect } from "react";
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth
import BookingForm from "./bookingform";
import DescribeIssue from "./describeissue";
import SelectAppointment from "./selectAppointment";
import Payment from "./Payment";
import Confirmation from "./Confirmation";
import { useRouter } from 'next/navigation'; // Import for potential redirection

// Define the shape of the form data
interface FormDataValues {
  address: string;
  arrivalInstructions: string;
  issueDescription: string;
  selectedDate: string;
  selectedTime: string;
  paymentIntentId: string | null;
  jobId?: string; // Add optional jobId
  bookingId?: string; // Add optional bookingId
}

type FormStep = "describe" | "address" | "select" | "payment" | "confirmation";

export default function BookingFormPage() {
  const { currentUser, loadingAuthState } = useAuth();
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState<FormStep>("describe");
  const [formData, setFormData] = useState<FormDataValues>({
    address: "",
    arrivalInstructions: "",
    issueDescription: "",
    selectedDate: "",
    selectedTime: "",
    paymentIntentId: null,
    jobId: undefined,
    bookingId: undefined,
  });

  useEffect(() => {
    if (!loadingAuthState && !currentUser) {
      router.push('/book/login'); // Redirect if not logged in
    }
  }, [currentUser, loadingAuthState, router]);

  const handleStepChange = (step: FormStep) => {
    setCurrentStep(step);
  };

  const handleFormDataUpdate = (data: Partial<FormDataValues>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const handlePaymentSuccess = (confirmationDetails: { paymentIntentId: string; jobId: string; bookingId: string; }) => {
    setFormData((prev) => ({
      ...prev,
      paymentIntentId: confirmationDetails.paymentIntentId,
      jobId: confirmationDetails.jobId,
      bookingId: confirmationDetails.bookingId,
    }));
    setCurrentStep("confirmation");
  };

  if (loadingAuthState) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
        <p className="text-gray-700 text-lg">Loading user information...</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
        <p className="text-gray-700 text-lg">Redirecting to login...</p>
      </div>
    );
  }

  // Original booking form steps
  return (
    <div>
      {currentStep === "describe" && (
        <DescribeIssue
          onNext={() => handleStepChange("address")}
          onDataUpdate={handleFormDataUpdate}
          formData={formData}
        />
      )}
      {currentStep === "address" && (
        <BookingForm
          onBack={() => handleStepChange("describe")}
          onNext={() => handleStepChange("select")}
          onDataUpdate={handleFormDataUpdate}
          formData={formData}
        />
      )}
      {currentStep === "select" && (
        <SelectAppointment
          onBack={() => handleStepChange("address")}
          onNext={() => handleStepChange("payment")}
          onDataUpdate={handleFormDataUpdate}
          formData={formData}
        />
      )}
      {currentStep === "payment" && (
        <Payment
          onBack={() => handleStepChange("select")}
          onNext={handlePaymentSuccess}
          formData={formData}
        />
      )}
      {currentStep === "confirmation" && (
        <Confirmation
          formData={formData}
        />
      )}
    </div>
  );
}