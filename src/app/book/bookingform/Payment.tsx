// components/Payment.tsx
'use client';

import { useState, useEffect } from "react";
import { usePaymentContext } from "@/contexts/PaymentContext";
import Link from "next/link";
import ProgressIndicator from "./ProgressIndicator";

interface PaymentProps {
  onBack: () => void;
  onNext: () => void;
  formData: {
    address: string;
    arrivalInstructions: string;
    issueDescription: string;
    selectedDate: string;
    selectedTime: string;
  };
}

const Payment: React.FC<PaymentProps> = ({ onBack, onNext, formData }) => {
  const { savedCard } = usePaymentContext();

  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardholderName, setCardholderName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (savedCard) {
      setCardNumber(savedCard.cardNumber || "");
      setExpiryDate(savedCard.expiryDate || "");
      setCardholderName(savedCard.cardholderName || "");
      setCvv("");
    }
  }, [savedCard]);

  const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^0-9\/]/g, ''); // Remove non-numeric/non-slash characters

    if (value.length === 2 && expiryDate.length === 1 && !value.includes('/')) {
      value += '/';
    } else if (value.length === 2 && expiryDate.length === 3 && value.includes('/')) {
      // Handle backspace from MM/ to M
      value = value.charAt(0);
    } else if (value.length > 5) {
      value = value.slice(0, 5);
    }
    // Ensure format is MM/YY, allowing M/YY temporarily while typing month
    // Or M when starting to type
    // Or MM when starting to type
    // Or MM/Y when starting to type year

    // Prevent more than one slash
    const parts = value.split('/');
    if (parts.length > 2) {
        value = parts[0] + '/' + parts.slice(1).join('');
    }
    // Prevent slash as first char
    if (value.startsWith('/')) {
        value = '';
    }
    // Prevent month > 12
    if (parts[0] && parts[0].length <=2 && parseInt(parts[0], 10) > 12) {
        parts[0] = '12';
        value = parts.join('/');
    } else if (parts[0] && parts[0].length === 1 && parseInt(parts[0], 10) > 1 && expiryDate.endsWith('/')){
        // if user types '2/' then deletes '/' -> '2', then types for example '3', it should be 03 not 23
        // but this case is hard to catch perfectly without complex logic for caret position
        // For now, this is a simpler catch
    }

    setExpiryDate(value);
  };

  const handlePayNow = () => {
    // Basic validation for payment fields
    if (!cardNumber || !expiryDate || !cvv || !cardholderName) {
      setError("Please fill in all payment details, including cardholder name.");
      return;
    }
    if (!/^(?:\d{13,19})$/.test(cardNumber.replace(/\s/g, ''))) {
      setError("Card number must be 13-19 digits.");
      return;
    }
    if (!/^(0[1-9]|1[0-2])\/(\d{2})$/.test(expiryDate)) {
      setError("Expiry date must be in MM/YY format.");
      return;
    }
    // Check if expiry date is in the past
    const [month, year] = expiryDate.split('/').map(Number);
    const currentYear = new Date().getFullYear() % 100; // Get last two digits of current year
    const currentMonth = new Date().getMonth() + 1; // getMonth() is 0-indexed

    if (year < currentYear || (year === currentYear && month < currentMonth)) {
        setError("Card has expired.");
        return;
    }

    if (!/^\d{3,4}$/.test(cvv)) { // Allow 3 or 4 digit CVV
      setError("CVV must be 3 or 4 digits.");
      return;
    }

    // If validation passes, proceed to the Confirmation Page
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
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
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
          <ProgressIndicator currentStep={4} totalSteps={5} stepName="Payment" />
          {/* Title */}
          <h2 className="text-xl font-semibold mb-4">Payment Details</h2>
          <h3 className="text-sm font-semibold mb-4">
            Enter your payment information <span className="text-red-500">*</span>
          </h3>

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

          {/* Payment Form */}
          <div className="mb-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Cardholder Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={cardholderName}
                onChange={(e) => setCardholderName(e.target.value)}
                placeholder="Name on Card"
                className="w-full p-2 border rounded text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Card Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                placeholder="1234 5678 9012 3456"
                className="w-full p-2 border rounded text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div className="flex space-x-4">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">
                  Expiry Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={expiryDate}
                  onChange={handleExpiryDateChange}
                  placeholder="MM/YY"
                  className="w-full p-2 border rounded text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">
                  CVV <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                  placeholder="123"
                  className="w-full p-2 border rounded text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
              <p className="text-sm font-semibold">OOPS!</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Confirm Button */}
          <div className="flex justify-center">
            <button
              onClick={handlePayNow}
              className="w-1/3 py-2 rounded bg-red-500 text-white hover:bg-red-600 cursor-pointer"
            >
              Confirm my card details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;