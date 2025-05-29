// components/Confirmation.tsx
'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ProgressIndicator from "./ProgressIndicator";

interface ConfirmationProps {
  formData: {
    address: string;
    arrivalInstructions: string;
    issueDescription: string;
    selectedDate: string;
    selectedTime: string;
  };
}

const Confirmation: React.FC<ConfirmationProps> = ({ formData }) => {
  const router = useRouter();
  const [isConfirmed, setIsConfirmed] = useState(false);

  const handleReturnToDashboard = () => {
    router.push("/book/dashboard");
  };

  const handleConfirm = () => {
    setIsConfirmed(true);
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
          {!isConfirmed ? (
            <>
              {/* Title */}
              <h2 className="text-xl font-semibold mb-4">Review Your Booking</h2>
              <p className="text-gray-700 mb-6">
                Please review your booking details below before confirming.
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
                  <p className="text-gray-700">
                    <span className="font-semibold">Price:</span> $100
                  </p>
                </div>
              </div>

              {/* Payment Notice */}
              <div className="mb-6 flex items-center justify-center space-x-2">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 1000 1000"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g transform="translate(-616.59052,664.22827)">
                    <g transform="matrix(7.545273,0,0,7.545273,-5983.2438,-2611.6783)">
                      <circle
                        r="65.266655"
                        cx="940.96454"
                        cy="324.36865"
                        fill="#f0f0f0"
                        stroke="#505050"
                        strokeWidth="2"
                      />
                      <ellipse
                        rx="8.1583309"
                        ry="13.053329"
                        cx="921.38452"
                        cy="301.52533"
                        fill="#505050"
                      />
                      <ellipse
                        transform="scale(-1,1)"
                        cy="301.52533"
                        cx="-960.54449"
                        ry="13.053329"
                        rx="8.1583309"
                        fill="#505050"
                      />
                      <path
                        d="m 901.80453,340.68534 a 44.054988,44.054988 0 0 0 78.31998,0 42.423322,42.423322 0 0 1 -78.31998,0"
                        fill="none"
                        stroke="#505050"
                        strokeWidth="2.44749928"
                      />
                    </g>
                  </g>
                </svg>
                <p className="text-sm text-gray-600">
                  You won't be charged until the service is completed
                </p>
              </div>

              {/* Confirm Button */}
              <div className="flex justify-center">
                <button
                  onClick={handleConfirm}
                  className="w-1/3 py-2 rounded bg-red-500 text-white hover:bg-red-600 cursor-pointer"
                >
                  Confirm Booking
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Success Message */}
              <h2 className="text-xl font-semibold mb-4">Booking Confirmed!</h2>
              <p className="text-gray-700 mb-6">
                Thank you for your booking. A Helper will arrive at the scheduled time.
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
        </div>
      </div>
    </div>
  );
};

export default Confirmation;