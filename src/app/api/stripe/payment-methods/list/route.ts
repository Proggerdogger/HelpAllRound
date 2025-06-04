import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil', // Match the API version used elsewhere
});

export async function POST(request: Request) {
  try {
    const { customerId } = await request.json();

    if (!customerId) {
      return NextResponse.json({ error: 'Customer ID is required' }, { status: 400 });
    }

    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: 'card',
    });

    // Additionally, fetch the customer to identify the default payment method
    const customer = await stripe.customers.retrieve(customerId);
    const defaultPaymentMethodId = customer.deleted ? null : (customer as Stripe.Customer).invoice_settings?.default_payment_method;

    return NextResponse.json({ 
      paymentMethods: paymentMethods.data,
      defaultPaymentMethodId 
    });

  } catch (error) {
    console.error('Stripe API Error - List Payment Methods:', error);
    const stripeError = error as Stripe.StripeRawError;
    return NextResponse.json({ error: stripeError.message || 'Internal Server Error' }, { status: 500 });
  }
} 