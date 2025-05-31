'use client';

import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, doc, updateDoc, Timestamp, orderBy } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';

interface Booking {
  id: string;
  userId: string;
  address: string;
  arrivalInstructions: string;
  issueDescription: string;
  selectedDate: string;
  selectedTime: string;
  paymentIntentId: string | null;
  status: string;
  createdAt: Timestamp;
  // Add other fields from your bookingData structure as needed for display
}

export default function AdminBookingsPage() {
  const { currentUser } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [captureStatus, setCaptureStatus] = useState<{[key: string]: string}>({}); // To track capture status per booking

  const fetchBookings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // TODO: Add admin check here in the future. For now, allow any logged-in user to see for testing.
      // if (!currentUser || currentUser.uid !== 'YOUR_ADMIN_UID') {
      //   setError('Unauthorized access.');
      //   setIsLoading(false);
      //   return;
      // }

      const bookingsRef = collection(db, 'bookings');
      // Fetch bookings that might need capture, or all for an admin view
      // const q = query(bookingsRef, where('status', '==', 'payment_authorized'), orderBy('createdAt', 'desc'));
      const q = query(bookingsRef, orderBy('createdAt', 'desc')); // Fetch all for now, sorted by newest
      const querySnapshot = await getDocs(q);
      const bookingsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Omit<Booking, 'id'>),
      }));
      setBookings(bookingsData);
    } catch (err: any) {
      console.error("Error fetching bookings: ", err);
      setError("Failed to fetch bookings. " + err.message);
    }
    setIsLoading(false);
  }, [currentUser]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleCapturePayment = async (bookingId: string, paymentIntentId: string) => {
    if (!paymentIntentId) {
      setCaptureStatus(prev => ({...prev, [bookingId]: 'Error: Missing PaymentIntent ID'}));
      return;
    }

    setCaptureStatus(prev => ({...prev, [bookingId]: 'Processing...'}));

    try {
      const response = await fetch('/api/stripe/capture-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentIntentId, bookingId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to capture payment.');
      }

      // Update booking status in Firestore
      const bookingRef = doc(db, 'bookings', bookingId);
      await updateDoc(bookingRef, {
        status: 'payment_captured',
        paymentCapturedAt: Timestamp.now(), // Optional: add a capture timestamp
      });

      setCaptureStatus(prev => ({...prev, [bookingId]: 'Success! Payment Captured.'}));
      // Refresh bookings to show updated status
      fetchBookings(); 

    } catch (err: any) {
      console.error("Error capturing payment for booking ", bookingId, err);
      setCaptureStatus(prev => ({...prev, [bookingId]: 'Error: ' + err.message}));
    }
  };

  if (isLoading) {
    return <div className="p-6 text-center">Loading bookings...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">Error: {error}</div>;
  }

  if (!currentUser) {
    return <div className="p-6 text-center">Please log in to view this page.</div>;
     // Basic auth check, will need proper admin role check later
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800">Admin - Manage Bookings</h1>
      
      {bookings.length === 0 ? (
        <p className="text-gray-600">No bookings found.</p>
      ) : (
        <div className="space-y-6">
          {bookings.map((booking) => (
            <div key={booking.id} className="bg-white shadow-lg rounded-lg p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-red-600 mb-3">Booking ID: {booking.id}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                <p><span className="font-medium">User ID:</span> {booking.userId}</p>
                <p><span className="font-medium">Status:</span> <span className={`font-semibold ${booking.status === 'payment_captured' ? 'text-green-600' : booking.status === 'payment_authorized' ? 'text-blue-600' : 'text-yellow-600'}`}>{booking.status.replace('_', ' ').toUpperCase()}</span></p>
                <p><span className="font-medium">Created:</span> {new Date(booking.createdAt.seconds * 1000).toLocaleString()}</p>
                <p><span className="font-medium">Address:</span> {booking.address}</p>
                <p><span className="font-medium">Date:</span> {booking.selectedDate}</p>
                <p><span className="font-medium">Time:</span> {booking.selectedTime}</p>
                <p><span className="font-medium">Payment Intent ID:</span> {booking.paymentIntentId || 'N/A'}</p>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                {booking.status === 'payment_authorized' && booking.paymentIntentId && (
                  <button
                    onClick={() => handleCapturePayment(booking.id, booking.paymentIntentId!)}
                    disabled={captureStatus[booking.id] === 'Processing...' || captureStatus[booking.id]?.includes('Success')}
                    className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-md shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-150 ease-in-out"
                  >
                    {captureStatus[booking.id] === 'Processing...' 
                      ? 'Capturing...' 
                      : captureStatus[booking.id]?.includes('Success') 
                        ? 'Captured' 
                        : 'Capture Payment ($300.00 AUD)'}
                  </button>
                )}
                {captureStatus[booking.id] && captureStatus[booking.id]?.includes('Error') && (
                  <p className="text-red-500 text-xs mt-2">{captureStatus[booking.id]}</p>
                )}
                {captureStatus[booking.id] && captureStatus[booking.id]?.includes('Success') && (
                  <p className="text-green-500 text-xs mt-2">{captureStatus[booking.id]}</p>
                )}
                {booking.status === 'payment_captured' && (
                    <p className="text-green-600 font-semibold mt-2">Payment has been successfully captured for this booking.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 
