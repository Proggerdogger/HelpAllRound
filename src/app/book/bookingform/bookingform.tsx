// components/BookingForm.tsx
'use client';

import { useState, useEffect } from "react";
import ProgressIndicator from "./ProgressIndicator";
import { useAuth } from '@/contexts/AuthContext';
// import { db } from '@/lib/firebase'; // Removed as per ESLint error
// import { doc, updateDoc } from 'firebase/firestore'; // Removed as per ESLint error
import type { User } from 'firebase/auth'; // Import User type

// Updated FormDataValues interface
interface FormDataValues {
  // address: string; // Old field
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
  contactPhoneNumber?: string;
}

interface BookingFormProps {
  onBack: () => void;
  onNext: () => void;
  onDataUpdate: (data: Partial<FormDataValues>) => void;
  formData: FormDataValues;
  currentUser: User | null;
}

const BookingForm: React.FC<BookingFormProps> = ({ onBack, onNext, onDataUpdate, formData, currentUser }) => {
  const { userProfile, loadingAuthState } = useAuth();

  const [arrivalInstructions, setArrivalInstructions] = useState(formData.arrivalInstructions || "Knock on the door");
  const [isEditingInstructions, setIsEditingInstructions] = useState(false);
  const [newInstructions, setNewInstructions] = useState(arrivalInstructions);
  
  // State for structured address fields
  const [unitNumber, setUnitNumber] = useState(formData.unitNumber || "");
  const [streetNumber, setStreetNumber] = useState(formData.streetNumber || "");
  const [streetName, setStreetName] = useState(formData.streetName || "");
  const [suburb, setSuburb] = useState(formData.suburb || "");
  const [addressState, setAddressState] = useState(formData.state || ""); // Renamed to avoid conflict with React's state
  const [postcode, setPostcode] = useState(formData.postcode || "");

  const [isEditingAddress, setIsEditingAddress] = useState(
    !formData.streetNumber && !formData.streetName && !formData.suburb && !formData.state && !formData.postcode
  );
  const [addressError, setAddressError] = useState(""); // General address error
  // Individual field errors (optional, can use a single addressError and highlight fields)
  const [streetNumberError, setStreetNumberError] = useState("");
  const [streetNameError, setStreetNameError] = useState("");
  const [suburbError, setSuburbError] = useState("");
  const [stateError, setStateError] = useState("");
  const [postcodeError, setPostcodeError] = useState("");

  // State for contact phone number for anonymous users
  const [contactPhoneNumber, setContactPhoneNumber] = useState(formData.contactPhoneNumber || "");
  const [contactPhoneNumberError, setContactPhoneNumberError] = useState("");

  const [isBillingSameAsHome, setIsBillingSameAsHome] = useState(true);
  const [billingAddress, setBillingAddress] = useState("");

  const [showNameForm, setShowNameForm] = useState(false);
  // const [inputFirstName, setInputFirstName] = useState(""); // Removed as per ESLint error
  // const [inputLastName, setInputLastName] = useState(""); // Removed as per ESLint error

  // Pre-fill address form if editing for the first time and fields are empty
  useEffect(() => {
    if (isEditingAddress) {
      setUnitNumber(formData.unitNumber || "");
      setStreetNumber(formData.streetNumber || "");
      setStreetName(formData.streetName || "");
      setSuburb(formData.suburb || "");
      setAddressState(formData.state || "");
      setPostcode(formData.postcode || "");
    }
  }, [isEditingAddress, formData.unitNumber, formData.streetNumber, formData.streetName, formData.suburb, formData.state, formData.postcode]); // Depend on individual formData fields

  useEffect(() => {
    if (!loadingAuthState && currentUser && userProfile) {
      if (!userProfile.firstName || !userProfile.lastName) {
        setShowNameForm(true);
        if (userProfile.displayName) {
          const nameParts = userProfile.displayName.split(' ');
          // setInputFirstName(nameParts[0] || ""); // Removed as per ESLint error
          if (nameParts.length > 1) {
            // setInputLastName(nameParts.slice(1).join(' ') || ""); // Removed as per ESLint error
          }
        }
      } else {
        setShowNameForm(false);
      }
    } else if (!loadingAuthState && !currentUser) {
      // Parent handles redirection
    }
  }, [userProfile, currentUser, loadingAuthState]);

  const validateAddress = (): boolean => {
    let isValid = true;
    setAddressError("");
    setStreetNumberError("");
    setStreetNameError("");
    setSuburbError("");
    setStateError("");
    setPostcodeError("");

    if (!streetNumber.trim()) {
      setStreetNumberError("Street number is required.");
      isValid = false;
    }
    if (!streetName.trim()) {
      setStreetNameError("Street name is required.");
      isValid = false;
    }
    if (!suburb.trim()) {
      setSuburbError("Suburb is required.");
      isValid = false;
    }
    if (!addressState.trim()) {
      setStateError("State is required.");
      isValid = false;
    } else if (addressState.trim().length < 2 || addressState.trim().length > 4) { // Allow 2-4 for states/territories
      setStateError("Enter a valid state (e.g., NSW, VIC, QLD).");
      isValid = false;
    }
    if (!postcode.trim()) {
      setPostcodeError("Postcode is required.");
      isValid = false;
    } else if (!/^\d{4}$/.test(postcode.trim())) {
      setPostcodeError("Enter a valid 4-digit postcode.");
      isValid = false;
    }
    if (!isValid && !addressError) {
        setAddressError("Please correct the highlighted address fields.");
    }
    return isValid;
  };

  const handleSubmit = () => {
    if (isEditingAddress && !validateAddress()) {
      return; // Stop if editing address and validation fails
    }

    if (currentUser && currentUser.isAnonymous) {
      if (!contactPhoneNumber.trim()) {
        setContactPhoneNumberError("Please provide a contact phone number for this booking.");
        return;
      } else if (!/^(\+61|0)[2-57-8](\d{8})$/.test(contactPhoneNumber.replace(/\s/g, '')) && !/^\+?\d{10,15}$/.test(contactPhoneNumber.replace(/\s/g, ''))) {
        setContactPhoneNumberError("Please enter a valid phone number (e.g., 04xx xxx xxx or +61 4xx xxx xxx).");
        return;
      }
    }
    setContactPhoneNumberError("");

    onDataUpdate({
      unitNumber: unitNumber.trim(),
      streetNumber: streetNumber.trim(),
      streetName: streetName.trim(),
      suburb: suburb.trim(),
      state: addressState.trim().toUpperCase(),
      postcode: postcode.trim(),
      arrivalInstructions,
      contactPhoneNumber: currentUser && currentUser.isAnonymous ? contactPhoneNumber.trim() : undefined,
    });
    onNext();
  };

  const handleUpdateInstructions = () => {
    setArrivalInstructions(newInstructions);
    setIsEditingInstructions(false);
  };

  const handleSaveAddress = () => {
    if (validateAddress()) {
      setIsEditingAddress(false);
      setAddressError(""); // Clear general error on successful save
    }
  };

  const handleCancelAddressEdit = () => {
    setIsEditingAddress(false);
    setUnitNumber(formData.unitNumber || "");
    setStreetNumber(formData.streetNumber || "");
    setStreetName(formData.streetName || "");
    setSuburb(formData.suburb || "");
    setAddressState(formData.state || "");
    setPostcode(formData.postcode || "");
    setAddressError(""); setStreetNumberError(""); setStreetNameError(""); 
    setSuburbError(""); setStateError(""); setPostcodeError("");
  };

  // Loading and no-user states...
  if (loadingAuthState) { /* ... */ }
  if (!currentUser) { /* ... */ }
  if (showNameForm) { /* ... existing name form JSX ... */ }

  const getFormattedAddress = () => {
    if (!streetNumber && !streetName && !suburb && !addressState && !postcode && !unitNumber) return "No address entered";
    return `${unitNumber ? unitNumber + '/' : ''}${streetNumber} ${streetName}, ${suburb}, ${addressState.toUpperCase()} ${postcode}`.replace(/^, |, $/g, '').replace(/ , /g, ', ').trim();
  };

  // Original BookingForm content (address, instructions)
  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center p-6 relative">
      <button 
        onClick={onBack}
        className="absolute top-6 left-6 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 cursor-pointer text-sm flex items-center"
      >
        <svg className="w-4 h-4 mr-2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M15 19l-7-7 7-7"></path></svg>
        Back
      </button>

      <div className="text-center w-full max-w-2xl mt-16">
        <h1 className="text-3xl font-bold text-red-500 mb-8">
          HelpAllRound
        </h1>
        <div className="space-y-6">
          <ProgressIndicator currentStep={2} totalSteps={5} stepName="Service Address & Instructions" />
          <div className="mb-4 p-4 bg-gray-50 rounded-lg text-left">
            <h3 className="text-sm font-semibold mb-1">Issue Described:</h3>
            <p className="text-gray-700 text-sm italic">
              {formData.issueDescription || <span className="text-gray-400">No issue description provided.</span>}
            </p>
          </div>

          <div className="bg-gray-200 p-6 rounded-lg">
            <div className="bg-white p-4 rounded-lg mb-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-semibold">
                  Service Address <span className="text-red-500">*</span>
                </h3>
                {!isEditingAddress && (
                  <button 
                    onClick={() => setIsEditingAddress(true)}
                    className="ml-4 bg-black text-white text-xs px-3 py-1 rounded flex items-center whitespace-nowrap"
                  >
                    <svg className="w-4 h-4 mr-1" viewBox="-1 -1 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill="#9C9C9C" d="M 28 195 L 58 195 L 58 203 L 28 203 L 28 195 Z" transform="matrix(0.35753950476646423, -0.4628666341304779, 0.6208510994911194, 0.47957393527030945, -122.2, -58.65)" /><path fill="#9C9C9C" d="M 265.250 79.200 L 270 80 L 266.750 87.800 L 265.250 79.200 Z" transform="matrix(1.0236241817474365, 0.7809885144233704, -0.4277697205543518, 0.5606682896614075, -229.35, -228.7)" /><path fill="#9C9C9C" d="M 28 195 L 58 195 L 58 203 L 28 203 L 28 195 Z" transform="matrix(0.10146887600421906, -0.13136045634746552, 0.6622411012649536, 0.5115455389022827, -111.7, -89.35)" /></svg>
                    <span className="font-semibold">{ getFormattedAddress() !== "No address entered" ? "Edit" : "Add Address"}</span>
                  </button>
                )}
              </div>

              {isEditingAddress ? (
                <div className="space-y-3 text-left">
                  <div>
                    <label htmlFor="unitNumber" className="block text-xs font-medium text-gray-700">Unit/Apartment Number (Optional)</label>
                    <input type="text" id="unitNumber" value={unitNumber} onChange={(e) => setUnitNumber(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="streetNumber" className="block text-xs font-medium text-gray-700">Street Number <span className="text-red-500">*</span></label>
                      <input type="text" id="streetNumber" value={streetNumber} onChange={(e) => { setStreetNumber(e.target.value); setStreetNumberError(""); }} required className={`mt-1 block w-full px-3 py-2 border ${streetNumberError ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm`} />
                      {streetNumberError && <p className="text-xs text-red-500 mt-1">{streetNumberError}</p>}
                    </div>
                    <div>
                      <label htmlFor="streetName" className="block text-xs font-medium text-gray-700">Street Name <span className="text-red-500">*</span></label>
                      <input type="text" id="streetName" value={streetName} onChange={(e) => { setStreetName(e.target.value); setStreetNameError(""); }} required className={`mt-1 block w-full px-3 py-2 border ${streetNameError ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm`} />
                      {streetNameError && <p className="text-xs text-red-500 mt-1">{streetNameError}</p>}
                    </div>
                  </div>
                  <div>
                    <label htmlFor="suburb" className="block text-xs font-medium text-gray-700">Suburb <span className="text-red-500">*</span></label>
                    <input type="text" id="suburb" value={suburb} onChange={(e) => { setSuburb(e.target.value); setSuburbError(""); }} required className={`mt-1 block w-full px-3 py-2 border ${suburbError ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm`} />
                    {suburbError && <p className="text-xs text-red-500 mt-1">{suburbError}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="addressState" className="block text-xs font-medium text-gray-700">State <span className="text-red-500">*</span></label>
                      <input type="text" id="addressState" value={addressState} onChange={(e) => { setAddressState(e.target.value); setStateError(""); }} required placeholder="e.g., NSW" className={`mt-1 block w-full px-3 py-2 border ${stateError ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm`} />
                      {stateError && <p className="text-xs text-red-500 mt-1">{stateError}</p>}
                    </div>
                    <div>
                      <label htmlFor="postcode" className="block text-xs font-medium text-gray-700">Postcode <span className="text-red-500">*</span></label>
                      <input type="text" id="postcode" value={postcode} onChange={(e) => { setPostcode(e.target.value); setPostcodeError(""); }} required maxLength={4} placeholder="e.g., 2000" className={`mt-1 block w-full px-3 py-2 border ${postcodeError ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm`} />
                      {postcodeError && <p className="text-xs text-red-500 mt-1">{postcodeError}</p>}
                    </div>
                  </div>
                  {addressError && <p className="text-red-500 text-xs mt-2">{addressError}</p>}
                  <div className="flex justify-end space-x-2 mt-4">
                    <button
                      onClick={handleSaveAddress}
                      className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 cursor-pointer"
                    >
                      Save Address
                    </button>
                    <button
                      onClick={handleCancelAddressEdit}
                      className="px-3 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-700 truncate text-left">
                  {getFormattedAddress()}
                </p>
              )}
            </div>

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
                    </div>
                )}
            </div>
          </div>

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

          {currentUser && currentUser.isAnonymous && (
            <div className="bg-gray-200 p-6 rounded-lg">
              <div className="bg-white p-4 rounded-lg">
                <h3 className="text-sm font-semibold mb-2 text-left">
                  Contact Phone Number for this Booking <span className="text-red-500">*</span>
                </h3>
                <p className="text-xs text-gray-600 mb-3 text-left">
                  As you are proceeding anonymously, please provide a phone number we can use to contact you regarding this specific booking.
                </p>
                <input
                  type="tel"
                  value={contactPhoneNumber}
                  onChange={(e) => {
                    setContactPhoneNumber(e.target.value);
                    if (contactPhoneNumberError) setContactPhoneNumberError("");
                  }}
                  placeholder="e.g., 0412 345 678"
                  className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 ${contactPhoneNumberError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-red-500'}`}
                />
                {contactPhoneNumberError && (
                  <p className="text-xs text-red-600 mt-1 text-left">{contactPhoneNumberError}</p>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-center">
            <button
              onClick={handleSubmit}
              disabled={isEditingAddress}
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
