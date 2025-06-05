import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// Ensure your Stripe secret key is set in your environment variables
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil', // Updated API version based on linter feedback
});

export async function POST(request: Request) {
  try {
    // We might need a customer ID if you want to save cards for future use with setup_future_usage
    // For now, we'll create a new PaymentIntent each time.
    // Later, you might pass a customerId or retrieve/create one here.
    const { customerId } = await request.json(); // Optional: pass customerId if you have one

    let customer = customerId;

    if (!customer) {
        // Create a new Stripe customer if one isn't provided
        const newStripeCustomer = await stripe.customers.create({
            // You can add more details like email, name, etc.
            description: 'New customer for HelpAllRound booking',
        });
        customer = newStripeCustomer.id;
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: 30000, // $300.00 AUD in cents
      currency: 'aud',
      customer: customer, // Associate with a customer
      capture_method: 'manual', // Authorize now, capture later
      setup_future_usage: 'off_session', // Allows charging the saved card later
      // automatic_payment_methods: { enabled: true }, // Stripe can automatically manage payment method types
    });

    return NextResponse.json({ 
        clientSecret: paymentIntent.client_secret,
        customerId: customer // Return customerId so frontend can store it if needed
    });

  } catch (error) {
    console.error('Stripe API Error creating PaymentIntent:', error);
    const stripeError = error as Stripe.StripeRawError;
    return NextResponse.json({ error: stripeError.message || 'Internal Server Error' }, { status: 500 });
  }
} 