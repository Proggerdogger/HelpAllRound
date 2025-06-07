import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// Ensure your Stripe secret key is set in your environment variables
const stripeSecretKey = process.env.STRIPE_SECRET_KEY!;
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2025-05-28.basil', // Updated API version based on linter feedback
});

export async function POST(request: Request) {
  console.log("CREATE-PAYMENT-INTENT: API Route called.");
  console.log(`CREATE-PAYMENT-INTENT: Using Stripe Secret Key prefix: ${stripeSecretKey?.substring(0, stripeSecretKey?.startsWith("sk_test_") ? 11 : 10)}...${stripeSecretKey?.slice(-4)}`);
  try {
    const { customerId: initialCustomerId } = await request.json();
    console.log("CREATE-PAYMENT-INTENT: Initial customerId from request:", initialCustomerId);

    let customerToUse = initialCustomerId;

    if (!customerToUse) {
      console.log("CREATE-PAYMENT-INTENT: No customerId provided, creating new Stripe customer.");
      const newStripeCustomer = await stripe.customers.create({
        description: 'New customer for HelpAllRound booking (created by create-payment-intent)',
      });
      customerToUse = newStripeCustomer.id;
      console.log("CREATE-PAYMENT-INTENT: New Stripe customer created:", customerToUse);
    } else {
      console.log("CREATE-PAYMENT-INTENT: Using existing customerId:", customerToUse);
    }

    console.log("CREATE-PAYMENT-INTENT: Creating PaymentIntent with amount: 30000 AUD for customer:", customerToUse);
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 30000, // $300.00 AUD in cents
      currency: 'aud',
      customer: customerToUse,
      capture_method: 'manual',
      setup_future_usage: 'off_session',
    });

    console.log("CREATE-PAYMENT-INTENT: PaymentIntent created successfully. ID:", paymentIntent.id, "Client Secret (last 10 chars): ...", paymentIntent.client_secret?.slice(-10));

    const responsePayload = { 
      clientSecret: paymentIntent.client_secret,
      customerId: customerToUse 
    };
    console.log("CREATE-PAYMENT-INTENT: Sending response to client:", responsePayload);
    return NextResponse.json(responsePayload);

  } catch (error) {
    console.error('CREATE-PAYMENT-INTENT: Stripe API Error creating PaymentIntent or Customer:');
    console.error('CREATE-PAYMENT-INTENT: Full error object:', JSON.stringify(error, null, 2)); // Log the full error object
    const stripeError = error as Stripe.StripeRawError;
    // Provide a more specific error message if possible
    let errorMessage = 'Internal Server Error';
    if (stripeError && stripeError.message) {
      errorMessage = stripeError.message;
    } else if (error instanceof Error && error.message) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage, type: stripeError?.type, code: stripeError?.code, param: stripeError?.param }, { status: 500 });
  }
} 