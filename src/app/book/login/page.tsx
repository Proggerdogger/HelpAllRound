'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Planet from './planet';
import Link from 'next/link';
import { useState } from 'react';

// Payment logo paths
const mastercardLogo = '/images/Mastercard.png';
const visaLogo = '/images/Visa.png';

export default function LoginPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  // const [showOtpInput, setShowOtpInput] = useState(false); // Future state for OTP input

  const handleSubmitPhoneNumber = () => {
    // Placeholder: In a real app, send phone number to backend to trigger OTP
    console.log('Phone number submitted. In a real app, an OTP would be sent.');
    // For now, directly navigate. Later, this would show OTP input.
    // setShowOtpInput(true);
    router.push('/book/welcome'); // Temporary direct navigation
  };

  // const handleOtpSubmit = () => { // Future function for OTP submission
  //   console.log('OTP submitted.');
  //   router.push('/book/welcome');
  // };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 py-12">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md text-center">
        <Link href="/" passHref>
          <h1 className="text-4xl font-bold text-red-600 mb-6 cursor-pointer hover:opacity-80 transition-opacity">
            HelpAllRound
          </h1>
        </Link>

        <h2 className="text-2xl font-semibold mb-6">{isSignUp ? 'Create Account' : 'Log In'}</h2>

        {/* { !showOtpInput ? ( */} 
          <>
            <div className="text-left mb-6 space-y-4">
              {isSignUp && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">Full Name</label>
                    <input
                      type="text"
                      placeholder="Your full name"
                      className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input
                      type="email"
                      placeholder="your.email@example.com"
                      className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </>
              )}
              <div>
                <label className="block text-sm font-medium mb-1">
                  {isSignUp ? 'Enter your phone number to create an account' : 'Enter your phone number to log in'}
                </label>
                <div className="flex items-center border rounded-md mb-2 focus-within:ring-2 focus-within:ring-red-500">
                  <span className="p-2">
                    <Planet width={20} height={20} className="text-gray-400" />
                  </span>
                  <select className="w-full p-2 border-l rounded-r-md focus:outline-none bg-transparent">
                    <option>+61 Australia</option>
                  </select>
                </div>
                <div className="flex items-center border rounded-md focus-within:ring-2 focus-within:ring-red-500">
                  <span className="p-2">
                    <svg 
                      className="w-5 h-5 text-gray-400" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth="2" 
                        d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                      />
                    </svg>
                  </span>
                  <input
                    type="tel"
                    placeholder="Your phone number"
                    className="w-full p-2 border-l rounded-r-md focus:outline-none bg-transparent"
                  />
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-600 mb-6">
              By proceeding, you agree to our{' '}
              <a href="#" className="text-red-600 hover:underline">terms of service</a> and{' '}
              <a href="#" className="text-red-600 hover:underline">privacy policy</a>.
              We will send you a text message to verify your phone number.
            </p>

            <button
              onClick={handleSubmitPhoneNumber}
              className="w-full bg-red-600 text-white py-3 rounded-full font-semibold hover:bg-red-700 transition cursor-pointer mb-4"
            >
              {isSignUp ? 'SEND VERIFICATION CODE' : 'SEND VERIFICATION CODE'}
            </button>

            <p className="text-sm">
              {isSignUp ? (
                <>
                  Already have an account?{' '}
                  <button onClick={() => setIsSignUp(false)} className="text-red-600 hover:underline font-semibold">
                    Log In
                  </button>
                </>
              ) : (
                <>
                  Don't have an account?{' '}
                  <button onClick={() => setIsSignUp(true)} className="text-red-600 hover:underline font-semibold">
                    Sign Up
                  </button>
                </>
              )}
            </p>
          </>
        {/* ) : ( */} 
        {/* Future OTP Input Section
          <div className="text-left mb-6 space-y-4">
            <h3 className="text-xl font-semibold mb-4 text-center">Enter Verification Code</h3>
            <p className="text-sm text-gray-600 mb-4 text-center">
              A code has been sent to your phone number. Please enter it below.
            </p>
            <div>
              <label className="block text-sm font-medium mb-1">Verification Code</label>
              <input
                type="text"
                placeholder="Enter 6-digit code"
                maxLength={6} // Assuming a 6-digit code
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-center tracking-[0.5em]"
              />
            </div>
            <button
              onClick={handleOtpSubmit}
              className="w-full bg-red-600 text-white py-3 rounded-full font-semibold hover:bg-red-700 transition cursor-pointer mb-4"
            >
              VERIFY & PROCEED
            </button>
            <p className="text-sm text-center">
              Didn't receive a code?{' '}
              <button onClick={() => { 
                // setShowOtpInput(false); // Go back to phone input
                handleSubmitPhoneNumber(); // Resend code logic (placeholder)
              }} className="text-red-600 hover:underline font-semibold">
                Resend Code
              </button>
            </p>
          </div>
          */}
        {/* ) */}

        <div className="mt-8">
          <p className="text-sm text-gray-600 mb-2">We accept:</p>
          <div className="flex justify-center space-x-4">
            <Image src={mastercardLogo} alt="Mastercard" width={48} height={30} className="object-contain" />
            <Image src={visaLogo} alt="Visa" width={48} height={30} className="object-contain" />
          </div>
        </div>
      </div>
    </div>
  );
}