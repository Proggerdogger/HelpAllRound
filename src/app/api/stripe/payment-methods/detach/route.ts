import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
});

export async function POST(request: Request) {
  try {
    const { paymentMethodId } = await request.json();

    if (!paymentMethodId) {
      return NextResponse.json({ error: 'Payment Method ID is required' }, { status: 400 });
    }

    // Detach the payment method from the customer
    // Note: This detaches it from any customer it might be attached to.
    // If you only want to detach if it's attached to a *specific* customer, you might need more complex logic
    // or ensure your frontend only calls this for payment methods verified to belong to the current customer.
    const paymentMethod = await stripe.paymentMethods.detach(paymentMethodId);

    return NextResponse.json({ success: true, message: 'Payment method detached.', detachedPaymentMethod: paymentMethod });

  } catch (error) {
    console.error('Stripe API Error - Detach Payment Method:', error);
    const stripeError = error as Stripe.StripeRawError;
    // Handle cases where the payment method is already detached or doesn't exist gracefully
    if (stripeError.code === 'payment_method_already_detached' || stripeError.code === 'resource_missing') {
        return NextResponse.json({ success: true, message: 'Payment method was already detached or not found.' });
    }
    return NextResponse.json({ error: stripeError.message || 'Internal Server Error' }, { status: 500 });
  }
} 