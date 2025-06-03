// page.tsx
'use client';

import { useState } from "react";
import BookingForm from "./bookingform";
import DescribeIssue from "./describeissue";
import SelectAppointment from "./selectAppointment";
import Payment from "./Payment";
import Confirmation from "./Confirmation";

// Define the shape of the form data
interface FormDataValues {
  address: string;
  arrivalInstructions: string;
  issueDescription: string;
  selectedDate: string;
  selectedTime: string;
  paymentIntentId: string | null;
}

type FormStep = "address" | "describe" | "select" | "payment" | "confirmation";

export default function BookingFormPage() {
  const [currentStep, setCurrentStep] = useState<FormStep>("address");
  const [formData, setFormData] = useState<FormDataValues>({
    address: "",
    arrivalInstructions: "",
    issueDescription: "",
    selectedDate: "",
    selectedTime: "",
    paymentIntentId: null,
  });

  const handleStepChange = (step: FormStep) => {
    setCurrentStep(step);
  };

  const handleFormDataUpdate = (data: Partial<FormDataValues>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const handlePaymentSuccess = (paymentIntentId: string) => {
    setFormData((prev) => ({ ...prev, paymentIntentId }));
    setCurrentStep("confirmation");
  };

  return (
    <div>
      {currentStep === "address" && (
        <BookingForm
          onNext={() => handleStepChange("describe")}
          onDataUpdate={handleFormDataUpdate}
          formData={formData}
        />
      )}
      {currentStep === "describe" && (
        <DescribeIssue
          onBack={() => handleStepChange("address")}
          onNext={() => handleStepChange("select")}
          onDataUpdate={handleFormDataUpdate}
          formData={formData}
        />
      )}
      {currentStep === "select" && (
        <SelectAppointment
          onBack={() => handleStepChange("describe")}
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