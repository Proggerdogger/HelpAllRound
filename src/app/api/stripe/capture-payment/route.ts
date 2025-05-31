import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import * as admin from 'firebase-admin';
import { Timestamp } from 'firebase-admin/firestore'; // Import Timestamp

// Helper to initialize Firebase Admin SDK (ensures it only runs once)
function initializeFirebaseAdmin() {
  console.log("Attempting to initialize Firebase Admin...");
  console.log("Is FIREBASE_SERVICE_ACCOUNT_JSON present?", !!process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  // console.log("Raw FIREBASE_SERVICE_ACCOUNT_JSON:", process.env.FIREBASE_SERVICE_ACCOUNT_JSON); // Be careful if logging this, it contains secrets.

  if (admin.apps.length === 0) {
    try {
      const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
      if (!serviceAccountString) {
        console.error("FIREBASE_SERVICE_ACCOUNT_JSON is not set or is empty!");
        throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON is not set!");
      }
      console.log("Service account string length:", serviceAccountString.length); // Check if it has content
      
      const serviceAccount = JSON.parse(serviceAccountString);
      console.log("Successfully parsed service account JSON. Project ID:", serviceAccount.project_id);

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log("Firebase Admin SDK initialized successfully.");
    } catch (e: any) {
      console.error("Failed to initialize Firebase Admin SDK:", e.message);
      // console.error("Full error during init:", e); // For more detailed error
      // If JSON.parse fails, the error message will indicate that.
      // If initializeApp fails, this will catch it too.
      throw e; // Re-throw the error to ensure build fails if init fails
    }
  }
  return admin.firestore();
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // apiVersion: '2023-10-16', // Replace with your desired API version
  typescript: true,
});

export async function POST(request: Request) {
  try {
    const { paymentIntentId, bookingId } = await request.json(); // Assume bookingId is passed from client

    if (!paymentIntentId) {
      return NextResponse.json({ error: 'PaymentIntent ID is required' }, { status: 400 });
    }
    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID is required to update status' }, { status: 400 });
    }

    // Retrieve the PaymentIntent to check its status and amount,
    // though capture itself will fail if not in a capturable state.
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId as string);

    if (paymentIntent.status === 'succeeded') {
        // Potentially update Firestore here too if it wasn't marked as captured previously
        // For idempotency, ensure you don't double-process if already succeeded AND captured in Firestore
        try {
            const db = initializeFirebaseAdmin();
            const bookingRef = db.collection('bookings').doc(bookingId as string);
            await bookingRef.update({
                status: 'payment_captured',
                paymentCapturedAt: Timestamp.now(), // Use serverTimestamp from admin SDK
            });
            console.log(`Booking ${bookingId} status updated to payment_captured (already succeeded on Stripe).`);
        } catch (dbError: any) {
            console.error("Firestore update error (for already succeeded PI):", dbError);
            // Don't fail the request if Stripe part was fine but DB update had issues here
            // Log it for monitoring.
        }
        return NextResponse.json({ 
            message: 'Payment has already been captured.',
            paymentIntent 
        }, { status: 200 });
    }

    if (paymentIntent.status !== 'requires_capture') {
      return NextResponse.json({ 
        error: 'PaymentIntent cannot be captured. Status: ' + paymentIntent.status 
      }, { status: 400 });
    }

    // Capture the payment
    const capturedPaymentIntent = await stripe.paymentIntents.capture(paymentIntentId as string);

    // Update booking status in Firestore
    try {
      const db = initializeFirebaseAdmin();
      const bookingRef = db.collection('bookings').doc(bookingId as string);
      await bookingRef.update({
        status: 'payment_captured',
        paymentCapturedAt: Timestamp.now(), // Use serverTimestamp from admin SDK
      });
      console.log(`Booking ${bookingId} status updated to payment_captured.`);
    } catch (dbError: any) {
      console.error("Firestore update error after capture:", dbError);
      // If Stripe capture succeeded but DB update fails, this is a critical issue to log.
      // You might want to return a specific error or have a retry mechanism.
      // For now, we'll let the success response go through but log the DB error.
    }

    return NextResponse.json({ 
      message: 'Payment captured successfully!',
      paymentIntent: capturedPaymentIntent 
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error capturing payment:', error);
    // Check if it's a Stripe error
    if (error.type && error.type.startsWith('Stripe')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 
