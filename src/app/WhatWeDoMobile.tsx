import React from 'react';

const WhatWeDoMobile = () => {
  // Ordered by importance, matching desktop view
  const services = [
    'Errands', 
    'Deliveries', 
    'Transport',
    'Senior Help',
    'Gardening', 
    'Cleaning', 
    'Removals', 
    'Appliance Help'
  ];

  return (
    <div className="md:hidden w-full bg-gray-100 pt-8 pb-12 px-4">
      <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">What We Do</h2>
      <div className="max-w-md mx-auto">
        <div className="grid grid-cols-2 gap-x-6 text-gray-700">
          <ul className="space-y-3 list-disc pl-5 text-base">
            {services.slice(0, 4).map((service) => (
              <li key={service}>{service}</li>
            ))}
          </ul>
          <ul className="space-y-3 list-disc pl-5 text-base">
            {services.slice(4).map((service) => (
              <li key={service}>{service}</li>
            ))}
          </ul>
        </div>
      </div>
      <p className="text-center mt-8 px-4">
        <span className="text-lg text-gray-800">...any task!</span>
        
        <span className="text-sm text-gray-600"> As long as it doesn't require a certification.</span>
      </p>
    </div>
  );
};

export default WhatWeDoMobile; 