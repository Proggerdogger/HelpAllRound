import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // apiVersion: '2023-10-16', // Replace with your desired API version
  typescript: true,
});

export async function POST(request: Request) {
  try {
    const { paymentIntentId } = await request.json();

    if (!paymentIntentId) {
      return NextResponse.json({ error: 'PaymentIntent ID is required' }, { status: 400 });
    }

    // Retrieve the PaymentIntent to check its status and amount,
    // though capture itself will fail if not in a capturable state.
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId as string);

    if (paymentIntent.status === 'succeeded') {
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

    // TODO: Update booking status in Firestore to 'payment_captured' or similar
    // For example:
    // const bookingRef = doc(db, 'bookings', bookingIdAssociatedWithPaymentIntentId);
    // await updateDoc(bookingRef, {
    //   status: 'payment_captured',
    //   paymentCapturedAt: serverTimestamp(),
    // });

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