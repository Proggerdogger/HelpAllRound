// components/RequestSupport.tsx
'use client';

import React, { useState } from 'react';

const RequestSupport: React.FC = () => {
    const [enquiryText, setEnquiryText] = useState('');
    const [jobId, setJobId] = useState('');
    const [isSent, setIsSent] = useState(false);
    const charLimit = 750;

    const handleEnquiryChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        const text = event.target.value;
        if (text.length <= charLimit) {
            setEnquiryText(text);
        }
    };

    const handleJobIdChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setJobId(event.target.value);
    };

    const handleSubmit = () => {
        if (jobId && enquiryText.trim() !== '') {
            console.log("Submitting support request:", { jobId, enquiryText });
            setIsSent(true);
        } else {
            alert("Please select a Job ID and describe your issue.");
        }
    };

    return (
      <div className="flex justify-center">
        <div className="p-6 bg-white shadow-md rounded-lg max-w-md w-full">
          <h3 className="text-sm font-semibold mb-4 text-center">Please enter your enquiry details:</h3>
  
          {/* Job ID Dropdown */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1 text-center">
              Job ID <span className="text-red-500">*</span>
            </label>
            <select 
              className="w-full p-2 border rounded text-gray-500"
              value={jobId}
              onChange={handleJobIdChange}
              disabled={isSent}
            >
              <option value="">Please select</option>
              
            </select>
          </div>
  
          {/* How Can We Assist You Textarea */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1 text-center">
              How can we assist you? <span className="text-red-500">*</span>
            </label>
            <textarea
              className="w-full p-2 border rounded text-gray-500"
              rows={4}
              placeholder="Please describe your issue here"
              value={enquiryText}
              onChange={handleEnquiryChange}
              maxLength={charLimit}
              disabled={isSent}
            ></textarea>
          </div>
  
          {/* Character Counter and Continue Button */}
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">Number of characters {enquiryText.length}/{charLimit}</p>
            <button 
              className={`px-4 py-2 rounded text-white ${isSent ? 'bg-green-500' : 'bg-red-600 hover:bg-red-700'} cursor-pointer`}
              onClick={handleSubmit}
              disabled={isSent}
            >
              {isSent ? "Sent!" : "Continue"}
            </button>
          </div>
  
          {isSent && (
            <p className="mt-4 text-sm text-green-600 text-center">
              Your support request has been submitted successfully.
            </p>
          )}

          {/* Phone Support Link */}
          <p className="mt-4 text-sm text-gray-600 text-center">
            Or call us on{" "}
            <a href="tel:1300635811" className="text-blue-500 hover:underline cursor-pointer">
              1300 635 822
            </a>{" "}
            for help
          </p>
        </div>
      </div>
    );
  };
  
  export default RequestSupport;