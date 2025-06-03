// components/BookingForm.tsx
'use client';

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
  // Potentially add billingAddress fields here if needed later
  // billingAddress?: string;
  // isBillingSameAsHome?: boolean;
}

interface BookingFormProps {
  onNext: () => void;
  onDataUpdate: (data: Partial<FormDataValues>) => void;
  formData: FormDataValues;
}

const BookingForm: React.FC<BookingFormProps> = ({ onNext, onDataUpdate, formData }) => {
  const [arrivalInstructions, setArrivalInstructions] = useState(formData.arrivalInstructions || "Knock on the door");
  const [isEditingInstructions, setIsEditingInstructions] = useState(false);
  const [newInstructions, setNewInstructions] = useState(arrivalInstructions);
  
  const [address, setAddress] = useState(formData.address || "");
  const [isEditingAddress, setIsEditingAddress] = useState(!formData.address); // Start editing if no address
  const [newAddress, setNewAddress] = useState(formData.address || "");
  const [addressError, setAddressError] = useState("");

  const [isBillingSameAsHome, setIsBillingSameAsHome] = useState(true); // Default to true
  const [billingAddress, setBillingAddress] = useState(""); // For a separate billing address
  // const [isEditingBillingAddress, setIsEditingBillingAddress] = useState(false); // If needed for complex editing

  const handleSubmit = () => {
    if (!address.trim()) {
      setAddressError("Please enter the address for your helper.");
      setIsEditingAddress(true); // Open address editor if not already
      return;
    }
    setAddressError(""); // Clear error if address is provided

    // If billing is not the same, and no billing address is entered, that could be another validation
    // For now, just saving what we have.
    onDataUpdate({
      address,
      arrivalInstructions,
      // isBillingSameAsHome, // You might want to save this
      // billingAddress: isBillingSameAsHome ? address : billingAddress, // And the effective billing address
    });
    onNext();
  };

  const handleUpdateInstructions = () => {
    setArrivalInstructions(newInstructions);
    setIsEditingInstructions(false);
  };

  const handleUpdateAddress = () => {
    if (!newAddress.trim()) {
        setAddressError("Address cannot be empty.");
        return;
    }
    setAddress(newAddress);
    setAddressError("");
    setIsEditingAddress(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center p-6 relative">
      {/* Back to Dashboard Button */}
      <Link href="/book/dashboard" passHref>
        <button 
          className="absolute top-6 left-6 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 cursor-pointer text-sm flex items-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M15 19l-7-7 7-7"></path></svg>
          Back to Dashboard
        </button>
      </Link>

      {/* Main Content */}
      <div className="text-center w-full max-w-2xl mt-16">
        {/* Logo */}
        <Link href="/" passHref>
          <h1 className="text-3xl font-bold text-red-500 mb-8 cursor-pointer hover:opacity-80 transition-opacity">
            HelpAllRound
          </h1>
        </Link>

        {/* Form Container */}
        <div className="space-y-6">
          <ProgressIndicator currentStep={1} totalSteps={5} stepName="Address" />
          {/* Location Section */}
          <div className="bg-gray-200 p-6 rounded-lg">
            <div className="bg-white p-4 rounded-lg mb-4">
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <h3 className="text-sm font-semibold mb-1">
                    Please enter the address to send your Helper: <span className="text-red-500">*</span>
                  </h3>
                  {isEditingAddress ? (
                    <div className="space-y-2">
                      <textarea
                        value={newAddress}
                        onChange={(e) => setNewAddress(e.target.value)}
                        placeholder="Enter full address"
                        className={`w-full p-2 border rounded-lg ${addressError && !newAddress.trim() ? 'border-red-500' : 'border-gray-300'}`}
                        rows={2}
                      />
                      {addressError && !newAddress.trim() && <p className="text-red-500 text-xs">{addressError}</p>}
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={handleUpdateAddress}
                          className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 cursor-pointer"
                        >
                          Save Address
                        </button>
                        <button
                          onClick={() => {
                            setIsEditingAddress(false);
                            setNewAddress(address); // Reset to saved address
                            if (!address) setAddressError("Please enter the address for your helper."); // Keep error if was empty
                          }}
                          className="px-3 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600 cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-700 truncate">
                      {address || <span className="text-gray-400">No address entered</span>}
                    </p>
                  )}
                </div>
                {!isEditingAddress && (
                  <button 
                    onClick={() => {
                        setIsEditingAddress(true);
                        setNewAddress(address); // Pre-fill with current address for editing
                    }}
                    className="ml-4 bg-black text-white text-xs px-3 py-1 rounded flex items-center whitespace-nowrap"
                  >
                    {/* SVG Icon */}
                    <svg className="w-4 h-4 mr-1" viewBox="-1 -1 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill="#9C9C9C" d="M 28 195 L 58 195 L 58 203 L 28 203 L 28 195 Z" transform="matrix(0.35753950476646423, -0.4628666341304779, 0.6208510994911194, 0.47957393527030945, -122.2, -58.65)" /><path fill="#9C9C9C" d="M 265.250 79.200 L 270 80 L 266.750 87.800 L 265.250 79.200 Z" transform="matrix(1.0236241817474365, 0.7809885144233704, -0.4277697205543518, 0.5606682896614075, -229.35, -228.7)" /><path fill="#9C9C9C" d="M 28 195 L 58 195 L 58 203 L 28 203 L 28 195 Z" transform="matrix(0.10146887600421906, -0.13136045634746552, 0.6622411012649536, 0.5115455389022827, -111.7, -89.35)" /></svg>
                    <span className="font-semibold">{address ? "Edit" : "Add Address"}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Checkbox & Billing Address Input */}
            <div className="bg-white p-4 rounded-lg">
                <label className="flex items-center cursor-pointer mb-3">
                    <input 
                        type="checkbox" 
                        className="mr-2 w-5 h-5 accent-red-500"
                        checked={isBillingSameAsHome}
                        onChange={(e) => setIsBillingSameAsHome(e.target.checked)}
                    />
                    <span className="text-sm text-gray-700">
                        My billing address is the same as my home address
                    </span>
                </label>

                {!isBillingSameAsHome && (
                    <div className="mt-3">
                        <h3 className="text-sm font-semibold mb-1 text-gray-700">
                            Enter Billing Address: <span className="text-red-500">*</span>
                        </h3>
                        <textarea
                            value={billingAddress}
                            onChange={(e) => setBillingAddress(e.target.value)}
                            placeholder="Enter billing address"
                            className="w-full p-2 border border-gray-300 rounded-lg"
                            rows={2}
                        />
                        {/* Add validation for billingAddress if needed when form is submitted */}
                    </div>
                )}
            </div>
            {addressError && <p className="text-red-500 text-sm mt-2 text-center">{addressError}</p>}
          </div>

          {/* Arrival Instructions Section */}
          <div className="bg-gray-200 p-6 rounded-lg">
            <h3 className="text-sm font-semibold mb-4">Arrival instructions for your Helper.</h3>
            
            {isEditingInstructions ? (
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg">
                  <textarea
                    value={newInstructions}
                    onChange={(e) => setNewInstructions(e.target.value)}
                    className="w-full p-2 border rounded-lg"
                    rows={3}
                  />
                </div>
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={handleUpdateInstructions}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 cursor-pointer"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingInstructions(false);
                      setNewInstructions(arrivalInstructions);
                    }}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="bg-white p-4 rounded-lg mb-4">
                  <p className="text-gray-700 truncate">"{arrivalInstructions}"</p>
                </div>
                <button
                  onClick={() => setIsEditingInstructions(true)}
                  className="w-full py-3 bg-black text-white rounded-lg hover:bg-gray-800 cursor-pointer flex items-center justify-center"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    viewBox="-1 -1 36 36"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fill="#9C9C9C"
                      d="M 28 195 L 58 195 L 58 203 L 28 203 L 28 195 Z"
                      transform="matrix(0.35753950476646423, -0.4628666341304779, 0.6208510994911194, 0.47957393527030945, -122.2, -58.65)"
                    />
                    <path
                      fill="#9C9C9C"
                      d="M 265.250 79.200 L 270 80 L 266.750 87.800 L 265.250 79.200 Z"
                      transform="matrix(1.0236241817474365, 0.7809885144233704, -0.4277697205543518, 0.5606682896614075, -229.35, -228.7)"
                    />
                    <path
                      fill="#9C9C9C"
                      d="M 28 195 L 58 195 L 58 203 L 28 203 L 28 195 Z"
                      transform="matrix(0.10146887600421906, -0.13136045634746552, 0.6622411012649536, 0.5115455389022827, -111.7, -89.35)"
                    />
                  </svg>
                  Update arrival instructions
                </button>
              </>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-center">
            <button
              onClick={handleSubmit}
              disabled={!address.trim()} // Disable button if address is empty
              className="w-1/3 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              They are correct!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingForm;