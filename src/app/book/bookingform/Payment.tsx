// components/Payment.tsx
'use client';

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import ProgressIndicator from "./ProgressIndicator";
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { getFunctions, httpsCallable, type HttpsCallableResult } from "firebase/functions";

// Make sure to call loadStripe outside of a component's render to avoid
// recreating the Stripe object on every render.
// Use your publishable key here.
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// Re-define or import FormDataValues if it's not already available here
interface FormDataValues {
    address: string;
    arrivalInstructions: string;
    issueDescription: string;
    selectedDate: string; // YYYY-MM-DD
    selectedTime: string; // Should be the 1-hour slot like "9-10"
    paymentIntentId: string | null;
}

interface PaymentProps {
  onBack: () => void;
  onNext: (confirmationDetails: { paymentIntentId: string; jobId: string; bookingId: string; }) => void;
  formData: FormDataValues; // Added formData
}

interface StripePaymentMethod {
  id: string;
  card?: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
}

const CheckoutForm: React.FC<PaymentProps> = ({ onBack, onNext, formData }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { currentUser, userProfile, loadingAuthState } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [succeeded, setSucceeded] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  // State for saved cards
  const [savedCards, setSavedCards] = useState<StripePaymentMethod[]>([]);
  const [selectedSavedCardId, setSelectedSavedCardId] = useState<string | null>(null);
  const [showNewCardForm, setShowNewCardForm] = useState(false); // Initially false to show saved cards if available
  const [fetchingCards, setFetchingCards] = useState(false);

  const fetchSavedPaymentMethods = useCallback(async (customerId: string) => {
    setFetchingCards(true);
    try {
      const response = await fetch('/api/stripe/payment-methods/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId }),
      });
      const data = await response.json();
      if (data.error) {
        console.warn("Error fetching saved payment methods:", data.error);
        setSavedCards([]); // Clear or handle error appropriately
      } else {
        setSavedCards(data.paymentMethods || []);
        if (data.defaultPaymentMethodId && (data.paymentMethods || []).length > 0) {
          setSelectedSavedCardId(data.defaultPaymentMethodId);
          setShowNewCardForm(false); // Show saved cards by default if a default exists
        } else if ((data.paymentMethods || []).length > 0) {
            // If no default, but cards exist, select the first one
            setSelectedSavedCardId(data.paymentMethods[0].id);
            setShowNewCardForm(false);
        } else {
          setShowNewCardForm(true); // No saved cards, show new card form
        }
      }
    } catch (err) {
      console.warn("Failed to load saved payment methods:", err);
      setSavedCards([]);
      setShowNewCardForm(true); // Error fetching, default to new card form
    }
    setFetchingCards(false);
  }, []);

  useEffect(() => {
    if (loadingAuthState || !currentUser) {
      return;
    }

    const customerIdToUse = userProfile?.stripeCustomerId || null;

    fetch('/api/stripe/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ customerId: customerIdToUse }), 
    })
    .then(res => res.json())
    .then(async (data) => {
      if (data.error) {
        setError(data.error);
        console.error("Error creating PaymentIntent:", data.error);
      } else {
        setClientSecret(data.clientSecret);
        const currentStripeCustomerId = data.customerId || userProfile?.stripeCustomerId;

        if (currentStripeCustomerId) {
            fetchSavedPaymentMethods(currentStripeCustomerId);
        }

        if (data.customerId && currentUser) {
          if (!userProfile?.stripeCustomerId || userProfile.stripeCustomerId !== data.customerId) {
            try {
              const userRef = doc(db, 'users', currentUser.uid);
              await setDoc(userRef, { stripeCustomerId: data.customerId }, { merge: true });
              console.log("Stripe Customer ID updated in Firestore for user:", currentUser.uid);
              // Note: AuthContext will pick up this change and re-fetch profile if using onSnapshot
            } catch (firestoreError) {
              console.error("Failed to update Stripe Customer ID in Firestore:", firestoreError);
            }
          }
        }
      }
    })
    .catch(err => {
        console.error("Fetch error for PaymentIntent:", err);
        setError("Failed to initialize payment. Please try again.");
        setShowNewCardForm(true); // Default to new card form on PI error
    });
  }, [currentUser, userProfile?.stripeCustomerId, loadingAuthState, fetchSavedPaymentMethods]); // Added userProfile.stripeCustomerId and fetchSavedPaymentMethods

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      setError("Payment system is not ready. Please wait a moment and try again.");
      return;
    }
    if (!currentUser) {
      setError("User not authenticated. Please log in.");
      return;
    }

    setProcessing(true);
    setError(null);

    let paymentMethodOptions: any;

    if (!showNewCardForm && selectedSavedCardId) {
        console.log("Using saved card:", selectedSavedCardId);
        paymentMethodOptions = { payment_method: selectedSavedCardId };
    } else {
        const cardElement = elements.getElement(CardElement);
        if (!cardElement) {
            setError("Card details are not valid. Please check your input.");
            setProcessing(false);
            return;
        }
        console.log("Using new card details from CardElement.");
        paymentMethodOptions = {
            payment_method: {
                card: cardElement,
                // billing_details: { name: currentUser.displayName || userProfile?.displayName || 'Customer' },
            },
            setup_future_usage: 'off_session', // Save this new card
        };
    }

    const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
      clientSecret,
      paymentMethodOptions
    );

    if (stripeError) {
      let message = stripeError.message || "An unexpected error occurred.";
      if (stripeError.type === "card_error" || stripeError.type === "validation_error") {
        // message is already user-friendly
      } else {
        console.error("Stripe error:", stripeError);
        message = "An unexpected error occurred during payment. Please try again.";
      }
      setError(message);
      setProcessing(false);
      return;
    }

    if (paymentIntent && paymentIntent.status === 'requires_capture') {
      console.log("PaymentIntent authorized:", paymentIntent);
      if (paymentIntent.id && currentUser && formData) {
        console.log(`PaymentIntent ID ${paymentIntent.id} needs to be saved for booking by user ${currentUser.uid}`);
        setError(null);
        setSucceeded(true); // Indicate payment part succeeded

        // Create the booking in Firestore via Firebase Function
        try {
          const bookingPayload = {
            userId: currentUser.uid,
            selectedDate: formData.selectedDate, // Expects YYYY-MM-DD
            selectedTime: formData.selectedTime, // Expects e.g. "9-10"
            paymentIntentId: paymentIntent.id,
            bookingAddress: formData.address,
            issueDescription: formData.issueDescription,
            arrivalInstructions: formData.arrivalInstructions,
          };
          console.log("Payload being sent to createBooking:", bookingPayload); // Debugging line

          const functions = getFunctions();
          const createBookingFn = httpsCallable(functions, 'createBooking');

          const bookingResult: HttpsCallableResult<any> = await createBookingFn(bookingPayload);

          // Assuming bookingResult.data is { success: true, bookingId: string, jobId: string, paymentIntentId: string }
          if (bookingResult.data && bookingResult.data.success) {
            console.log("Booking created successfully via function:", bookingResult.data);
            onNext({
              paymentIntentId: bookingResult.data.paymentIntentId,
              jobId: bookingResult.data.jobId,
              bookingId: bookingResult.data.bookingId
            }); // Proceed to confirmation page
          } else {
            // If function returns an error or success: false
            const message = (bookingResult.data as any)?.message || "Failed to save your booking after payment. Please contact support.";
            console.error("Failed to create booking via function:", bookingResult.data);
            setError(message);
            setSucceeded(false); // Revert succeeded state if booking fails
          }
        } catch (bookingError: any) {
          console.error("Error calling createBooking function:", bookingError);
          let friendlyMessage = "An error occurred while saving your booking. Please contact support.";
          if (bookingError.code === 'functions/already-exists' || bookingError.code === 'functions/invalid-argument') {
            friendlyMessage = bookingError.message; // Use the specific message from the function
          } else if (bookingError.message) {
             console.error("Specific error from createBooking call:", bookingError.message);
          }
          setError(friendlyMessage);
          setSucceeded(false); // Revert succeeded state if booking fails
        }
        setProcessing(false); // Stop processing after booking attempt

      } else {
        setError("Payment authorization succeeded but PaymentIntent ID or user/form data is missing.");
        setProcessing(false);
      }
    } else if (paymentIntent) {
      console.warn("PaymentIntent status:", paymentIntent.status);
      setError("Payment requires further action or did not succeed as expected.");
      setProcessing(false);
    } else {
      setError("Payment failed for an unknown reason.");
      setProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        color: "#32325d",
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSmoothing: "antialiased",
        fontSize: "16px",
        "::placeholder": {
          color: "#aab7c4",
        },
      },
      invalid: {
        color: "#fa755a",
        iconColor: "#fa755a",
      },
    },
    hidePostalCode: true,
  };

  if (loadingAuthState) {
    return (
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-6 text-center">
            <h1 className="text-3xl font-bold text-red-500 mb-4">HelpAllRound</h1>
            <ProgressIndicator currentStep={4} totalSteps={5} stepName="Payment" />
            <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
                <p className="text-gray-700">Loading user information...</p>
            </div>
        </div>
    );
  }

  if (!currentUser) {
     return (
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-6 text-center">
            <h1 className="text-3xl font-bold text-red-500 mb-4">HelpAllRound</h1>
            <ProgressIndicator currentStep={4} totalSteps={5} stepName="Payment" />
            <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
                <h2 className="text-xl font-semibold text-red-600 mb-4">Authentication Required</h2>
                <p className="text-gray-700 mb-6">
                    Please <Link href="/book/login" className="text-red-500 hover:underline">log in</Link> to proceed with payment.
                </p>
            </div>
        </div>
    );
  }

  if (succeeded) {
    return (
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-6 text-center">
            <h1 className="text-3xl font-bold text-red-500 mb-4">HelpAllRound</h1>
            <ProgressIndicator currentStep={4} totalSteps={5} stepName="Payment" />
            <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
                <h2 className="text-2xl font-semibold text-green-600 mb-4">Payment Authorized!</h2>
                <p className="text-gray-700 mb-6">
                    Your card has been successfully authorized. 
                    You will be charged the final amount after the service is completed.
                </p>
                <p className="text-gray-600 text-sm">
                    Redirecting to confirmation...
                </p>
            </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center p-6">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="absolute top-4 left-4 text-gray-600 hover:text-gray-800 flex items-center cursor-pointer"
      >
        <svg
          className="w-5 h-5 mr-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      {/* Main Content */}
      <div className="text-center w-full max-w-2xl">
        {/* Logo */}
        <Link href="/" passHref>
          <h1 className="text-3xl font-bold text-red-500 mb-8 cursor-pointer hover:opacity-80 transition-opacity">
            HelpAllRound
          </h1>
        </Link>

        {/* Form Container */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <ProgressIndicator currentStep={4} totalSteps={5} stepName="Payment" />
          {/* Title */}
          <h2 className="text-xl font-semibold mb-2">Authorize Payment</h2>
          <p className="text-sm text-gray-600 mb-4">
            {userProfile?.displayName && <span className="block mb-1">Hi {userProfile.displayName}!</span>}
            Your card will be authorized. You will only be charged the final amount after the service is completed.
          </p>

          {!clientSecret && !error && !fetchingCards && (
            <div className="text-center py-4">
              <p className="text-gray-600">Initializing payment system for {currentUser.phoneNumber}...</p>
            </div>
          )}
          {fetchingCards && (
             <div className="text-center py-4">
              <p className="text-gray-600">Loading your saved payment methods...</p>
            </div>
          )}

          {clientSecret && !fetchingCards && (
            <form onSubmit={handleSubmit} className="space-y-6">
            {savedCards.length > 0 && !showNewCardForm && (
                <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Choose a saved card:
                    </label>
                    {savedCards.map(card => (
                        <div key={card.id} 
                             className={`p-3 border rounded-md cursor-pointer flex justify-between items-center ${selectedSavedCardId === card.id ? 'border-red-500 ring-2 ring-red-500' : 'border-gray-300'}`}
                             onClick={() => setSelectedSavedCardId(card.id)}>
                            <span>{card.card?.brand.toUpperCase()} ending in {card.card?.last4} (Expires {String(card.card?.exp_month).padStart(2, '0' )}/{card.card?.exp_year})</span>
                            {selectedSavedCardId === card.id && <span className="text-red-500 text-xs">Selected</span>}
                        </div>
                    ))}
                    <button type="button" onClick={() => { setShowNewCardForm(true); setSelectedSavedCardId(null); }} 
                            className="text-sm text-red-600 hover:underline mt-2">
                        Or use a new card
                    </button>
                </div>
            )}

            {(showNewCardForm || savedCards.length === 0) && (
              <div>
                <label htmlFor="card-element" className="block text-sm font-medium text-gray-700 mb-1">
                  {savedCards.length > 0 ? "New Card Details" : "Card Details"}
                </label>
                <div id="card-element" className="p-3 border border-gray-300 rounded-md shadow-sm">
                  <CardElement options={cardElementOptions} />
                </div>
                {savedCards.length > 0 && (
                    <button type="button" onClick={() => setShowNewCardForm(false)} 
                            className="text-sm text-red-600 hover:underline mt-2">
                       Back to saved cards
                    </button>
                )}
              </div>
            )}

              {error && (
                <div role="alert" className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={!stripe || !elements || processing || succeeded || !clientSecret}
                className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {processing ? "Processing..." : succeeded ? "Authorized!" : "Authorize Card"}
              </button>
            </form>
          )}

          {/* Show general error if clientSecret fetch failed */}
          {!clientSecret && error && (
             <div role="alert" className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                {error}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

// Wrapper component to provide Elements context
const PaymentPage: React.FC<PaymentProps> = (props) => {
  const options: StripeElementsOptions = {
    // clientSecret is set later when it's fetched
    // appearance: { theme: 'stripe' }, // Optional: customize appearance
    // loader: 'always', // Optional: control loader visibility
  };
  // Can't set clientSecret here directly in options as it's fetched async in CheckoutForm

  return (
    <Elements stripe={stripePromise} options={options}>
      <CheckoutForm {...props} />
    </Elements>
  );
};

export default PaymentPage;