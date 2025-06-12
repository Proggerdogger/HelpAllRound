import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
});

export async function POST(request: Request) {
  try {
    const { customerId, paymentMethodId } = await request.json();

    if (!customerId || !paymentMethodId) {
      return NextResponse.json({ error: 'Customer ID and Payment Method ID are required' }, { status: 400 });
    }

    // Update the customer's default payment method
    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    return NextResponse.json({ success: true, message: 'Default payment method updated.' });

  } catch (error) {
    console.error('Stripe API Error - Set Default Payment Method:', error);
    const stripeError = error as Stripe.StripeRawError;
    return NextResponse.json({ error: stripeError.message || 'Internal Server Error' }, { status: 500 });
  }
} 