'use client';

// components/DescribeIssue.tsx
import { useState } from "react";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import ProgressIndicator from "./ProgressIndicator";

// Updated FormDataValues to match the parent
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
  contactPhoneNumber?: string; // Keep other fields consistent even if not directly used by this component
}

interface DescribeIssueProps {
  onNext: () => void;
  onDataUpdate: (data: Partial<FormDataValues>) => void;
  formData: FormDataValues;
}

const DescribeIssue: React.FC<DescribeIssueProps> = ({ onNext, onDataUpdate, formData }) => {
  const [issueDescription, setIssueDescription] = useState(formData.issueDescription || "");
  const isFormValid = issueDescription.length >= 1;
  const router = useRouter();

  const handleContinue = () => {
    if (!isFormValid) return;
    onDataUpdate({ issueDescription });
    onNext();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center p-6 relative">
      {/* Back to Choices Button */}
      <button
        onClick={() => router.push('/book/choice')}
        className="absolute top-6 left-6 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 cursor-pointer text-sm flex items-center z-10"
      >
        <svg className="w-4 h-4 mr-2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M15 19l-7-7 7-7"></path></svg>
        Back to Choices
      </button>

      {/* Main Content */}
      <div className="text-center w-full max-w-2xl mt-12 md:mt-0">
        {/* Logo */}
        <Link href="/" passHref>
          <h1 className="text-3xl font-bold text-red-500 mb-8 cursor-pointer hover:opacity-80 transition-opacity">
            HelpAllRound
          </h1>
        </Link>

        {/* Form Container */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <ProgressIndicator currentStep={1} totalSteps={5} stepName="Describe Your Issue" />
          
          {/* Address Summary - This might need to be removed or conditionally rendered if address isn't set yet */}
          {/* For now, leaving it, but it will show empty strings initially */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-semibold mb-2">Previously Entered Details (if any):</h3>
            {/* Updated to display structured address if available */}
            <p className="text-gray-700"><span className="font-medium">Address:</span> 
              {formData.streetNumber && formData.streetName ? 
                `${formData.unitNumber ? formData.unitNumber + '/' : ''}${formData.streetNumber} ${formData.streetName}, ${formData.suburb || ''}, ${formData.state || ''} ${formData.postcode || ''}`.replace(/ , |, $/g, '').trim()
                : "-"}
            </p>
            <p className="text-gray-700"><span className="font-medium">Arrival Instructions:</span> {formData.arrivalInstructions ? `"${formData.arrivalInstructions}"` : "-"}</p>
          </div>

          {/* Describe the Issue Section */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold mb-2">
              Describe the issue so we can pair you with the best Helper{" "}
              <span className="text-red-500">*</span>
            </h3>
            
            <textarea
              className="w-full p-2 border rounded text-gray-700"
              rows={5}
              value={issueDescription}
              onChange={(e) => setIssueDescription(e.target.value)}
              placeholder="e.g., Fix leaky tap in kitchen, assemble flat-pack bookshelf, mow front lawn..."
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