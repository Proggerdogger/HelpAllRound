'use client';

import React, { useState } from 'react';
import Image from 'next/image';

const ReasonsSection = () => {
  // State to manage which section is expanded
  const [expanded, setExpanded] = useState<number | null>(null);

  const toggleSection = (index: number) => {
    setExpanded(expanded === index ? null : index);
  };

  const reasons = [
    {
      title: 'Same day service, 7-days a week',
      description:
        'When something goes wrong, it can throw off your whole day. Whether it\'s at home or at work, you want things back to normal as quickly as possible. That\'s where HelpAllRound comes in. We offer same-day service, 7 days a week to help solve your everyday problems—fast.',
    },
    {
      title: 'Jack of all trades',
      description:
        'Often, our customers have more than one issue that they need assistance with. Luckily, our Helpers have experience in a variety of different situations, so you can use our service to sort out all of your issues in one go.',
    },
    {
      title: 'Guaranteed quality of service',
      description:
        'We recognize that the problems that occur in every day life can be stressful, and you want a guaranteed solution. That\'s why we have a guaranteed quality of service or your money back. So you can know that a professional and helpful human is going to come and help you with your problem.',
    },
  ];

  return (
    <section className="pt-8 pb-12 md:py-12 px-4 bg-white">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8">
        {/* Left Side: Image */}
        <div className="md:w-1/3 flex justify-center">
          <Image
            src="/images/Huge_heart.png"
            alt="Help All Round"
            width={300}
            height={300}
            className="object-contain"
            onError={() => console.error('Failed to load image: /images/Huge_heart.png')}
          />
        </div>
        {/* Right Side: Reasons */}
        <div className="md:w-2/3 px-4 md:px-0">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-6 text-center">
            3 Reasons Why You'll Love HelpAllRound
          </h2>
          {reasons.map((reason, index) => (
            <div key={index} className="mb-4 border-b border-gray-200">
              {/* Heading with Arrow */}
              <button
                className="flex items-center justify-between w-full py-4 text-left cursor-pointer"
                onClick={() => toggleSection(index)}
              >
                <h3 className="text-xl font-semibold text-black">
                  {reason.title}
                </h3>
                <span
                  className={`transform transition-transform duration-300`}
                >
                  {expanded === index ? '▲' : '▼'}
                </span>
              </button>
              {/* Collapsible Content */}
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  expanded === index ? 'max-h-96 py-4' : 'max-h-0 py-0'
                }`}
              >
                <p className="text-lg md:text-base text-gray-700">{reason.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ReasonsSection;


