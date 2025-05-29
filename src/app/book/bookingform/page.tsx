// page.tsx
'use client';

import { useState } from "react";
import BookingForm from "./bookingform";
import DescribeIssue from "./describeissue";
import SelectAppointment from "./selectAppointment";
import Payment from "./Payment";
import Confirmation from "./Confirmation";

type FormStep = "address" | "describe" | "select" | "payment" | "confirmation";

export default function BookingFormPage() {
  const [currentStep, setCurrentStep] = useState<FormStep>("address");
  const [formData, setFormData] = useState({
    address: "",
    arrivalInstructions: "",
    issueDescription: "",
    selectedDate: "",
    selectedTime: "",
  });

  const handleStepChange = (step: FormStep) => {
    setCurrentStep(step);
  };

  const handleFormDataUpdate = (data: any) => {
    setFormData((prev) => ({ ...prev, ...data }));
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
          onNext={() => handleStepChange("confirmation")}
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