'use client';
import React, { useState } from 'react';

interface CallbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CallbackModal: React.FC<CallbackModalProps> = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [postcode, setPostcode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  if (!isOpen) {
    return null;
  }

  const resetForm = () => {
    setName('');
    setEmail('');
    setPhone('');
    setPostcode('');
    setIsSubmitting(false);
    // submitMessage will be reset before closing or on new submission attempt
  };

  const handleCloseModal = () => {
    resetForm();
    setSubmitMessage(null); // Clear message when closing manually
    setIsError(false);
    onClose();
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage(null);
    setIsError(false);

    if (!name || !email || !phone || !postcode) {
      setSubmitMessage("Please fill in all required fields.");
      setIsError(true);
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/callback-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, postcode }),
      });

      const responseData = await response.json();

      if (response.ok) {
        setSubmitMessage(responseData.message || "Callback requested successfully! We\'ll be in touch soon.");
        setIsError(false);
        resetForm();
        setTimeout(() => {
          handleCloseModal();
        }, 3000); // Close modal after 3 seconds on success
      } else {
        setSubmitMessage(responseData.message || "Failed to submit callback request. Please try again.");
        setIsError(true);
      }
    } catch (error) {
      setSubmitMessage("An unexpected error occurred. Please check your connection and try again.");
      setIsError(true);
      console.error("Callback submission error:", error);
    }

    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Request a callback</h2>
          <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700 text-2xl" disabled={isSubmitting}>
            &times;
          </button>
        </div>
        {!submitMessage || isSubmitting ? (
          <>
            <p className="text-sm text-gray-600 mb-6">
              We usually respond in 3 hours or less. If you require service urgently, please call us!
            </p>
            {submitMessage && !isSubmitting && (
                <div className={`p-3 mb-4 rounded-lg text-sm ${isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    <p>{submitMessage}</p>
                </div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name*</label>
                <input 
                  type="text" 
                  id="name" 
                  name="name" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500" 
                  required 
                  disabled={isSubmitting}
                />
              </div>
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email*</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500" 
                  required 
                  disabled={isSubmitting}
                />
              </div>
              <div className="mb-4">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone*</label>
                <input 
                  type="tel" 
                  id="phone" 
                  name="phone" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500" 
                  required 
                  disabled={isSubmitting}
                />
              </div>
              <div className="mb-6">
                <label htmlFor="postcode" className="block text-sm font-medium text-gray-700 mb-1">Postcode*</label>
                <input 
                  type="text" 
                  id="postcode" 
                  name="postcode" 
                  value={postcode}
                  onChange={(e) => setPostcode(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500" 
                  required 
                  disabled={isSubmitting}
                />
              </div>
              <button 
                type="submit" 
                className="w-full bg-red-600 text-white py-3 rounded-md hover:bg-red-700 transition duration-150 font-semibold disabled:opacity-70"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>
            </form>
            <p className="text-xs text-gray-500 mt-6 text-center">
              This site is protected by reCAPTCHA and the Google Privacy Policy and Terms of Service apply.
            </p>
          </>
        ) : (
          <div className={`text-center py-8 p-3 rounded-lg ${isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            <p className="text-lg">{submitMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CallbackModal; 