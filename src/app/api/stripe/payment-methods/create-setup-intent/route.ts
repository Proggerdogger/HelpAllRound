import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
});

export async function POST(request: Request) {
  try {
    const { customerId } = await request.json();

    if (!customerId) {
      return NextResponse.json({ error: 'Customer ID is required' }, { status: 400 });
    }

    // Create a SetupIntent for the customer
    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ['card'],
      usage: 'off_session', // Indicates that the payment method will be used for off-session payments
    });

    return NextResponse.json({ clientSecret: setupIntent.client_secret });

  } catch (error) {
    console.error('Stripe API Error - Create SetupIntent:', error);
    const stripeError = error as Stripe.StripeRawError;
    return NextResponse.json({ error: stripeError.message || 'Internal Server Error' }, { status: 500 });
  }
} 