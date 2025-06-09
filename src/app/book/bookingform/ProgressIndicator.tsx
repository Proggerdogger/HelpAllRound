'use client';

import React from 'react';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepName?: string; // Optional name for the current step
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ currentStep, totalSteps, stepName }) => {
  const progressPercentage = (currentStep / totalSteps) * 100;

  return (
    <div className="mb-6">
      <div className="relative pt-1">
        <div className="flex mb-2 items-center justify-between">
          <div className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-red-600 bg-red-200">
            Step {currentStep} of {totalSteps} {stepName && `- ${stepName}`}
          </div>
        </div>
        <div className="overflow-hidden h-4 mb-4 text-xs flex rounded bg-gray-200">
          <div
            style={{ width: `${progressPercentage}%` }}
            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-red-500 transition-all duration-500 ease-out"
          ></div>
        </div>
      </div>
    </div>
  );
};

export default ProgressIndicator; 