'use client';

// components/DescribeIssue.tsx
import { useState } from "react";
import Link from "next/link";
import ProgressIndicator from "./ProgressIndicator";

// Assuming FormDataValues will be imported or defined in a shared types file
interface FormDataValues {
  address: string;
  arrivalInstructions: string;
  issueDescription: string;
  selectedDate: string;
  selectedTime: string;
}

interface DescribeIssueProps {
  onBack: () => void;
  onNext: () => void;
  onDataUpdate: (data: Partial<FormDataValues>) => void;
  formData: FormDataValues;
}

const DescribeIssue: React.FC<DescribeIssueProps> = ({ onBack, onNext, onDataUpdate, formData }) => {
  const [issueDescription, setIssueDescription] = useState(formData.issueDescription || "");
  const isFormValid = issueDescription.length >= 1;

  const handleContinue = () => {
    if (!isFormValid) return;
    onDataUpdate({ issueDescription });
    onNext();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center p-6">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="absolute top-4 left-4 text-gray-600 hover:text-gray-800 flex items-center cursor-pointer"
      >
        <svg
          className="w-5 h-5 mr-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back
      </button>

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
          <ProgressIndicator currentStep={2} totalSteps={5} stepName="Describe Issue" />
          {/* Address Summary */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-semibold mb-2">Selected Address:</h3>
            <p className="text-gray-700">{formData.address}</p>
            <h3 className="text-sm font-semibold mt-4 mb-2">Arrival Instructions:</h3>
            <p className="text-gray-700">"{formData.arrivalInstructions}"</p>
          </div>

          {/* Describe the Issue Section */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold mb-2">
              Describe the issue so we can pair you with the best Helper{" "}
              <span className="text-red-500">*</span>
            </h3>
            <textarea
              className="w-full p-2 border rounded text-gray-700"
              rows={4}
              value={issueDescription}
              onChange={(e) => setIssueDescription(e.target.value)}
              placeholder="Please describe your issue here"
            ></textarea>
          </div>

          {/* Continue Button */}
          <div className="flex justify-center">
            <button
              onClick={handleContinue}
              disabled={!isFormValid}
              className={`w-1/3 py-3 rounded-lg text-white ${
                isFormValid
                  ? "bg-red-500 hover:bg-red-600 cursor-pointer"
                  : "bg-gray-300 cursor-not-allowed"
              }`}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DescribeIssue;