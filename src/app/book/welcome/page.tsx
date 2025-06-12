import React from 'react';
import Link from 'next/link';

const LoginPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 text-center p-4">
        <Link href="/" passHref>
          <h1 className="text-4xl font-bold text-red-600 cursor-pointer hover:opacity-80 transition-opacity">
            HelpAllRound
          </h1>
        </Link>
      </div>

      {/* Main Card */}
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full text-center">
        <h2 className="text-2xl font-bold mb-4">Log-In Successful</h2>
        <p className="text-gray-600 mb-6">Welcome User!</p>

        {/* Buttons */}
        <Link href="/book/bookingform">
          <button className="w-full bg-red-600 text-white py-3 rounded-lg mb-4 hover:bg-red-700 cursor-pointer">
            Start a new booking
          </button>
        </Link>
        <p className="text-sm text-gray-600 mb-4 px-2">
          Need assistance regarding your recent job?{' '}
          <Link href="/book/dashboard?page=Request%20Support" className="text-blue-500 hover:underline cursor-pointer">
            Request help here!
          </Link>
        </p>
        <Link href="/book/dashboard">
          <button className="w-full bg-black text-white py-3 rounded-lg mb-4 hover:bg-gray-800 cursor-pointer">
            Go to my dashboard
          </button>
        </Link>

        {/* Footer Links */}
        <div className="space-y-2">
          <p className="text-gray-600">Not you?</p>
          <Link href="/book/login" className="text-blue-500 hover:underline block cursor-pointer">
            Try another phone number
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;