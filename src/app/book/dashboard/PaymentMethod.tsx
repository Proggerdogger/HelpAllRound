'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useAuth } from '@/contexts/AuthContext';

// Load Stripe outside of component render to avoid recreating on every render
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface StripePaymentMethod {
  id: string;
  card?: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
  // Add other fields if necessary based on Stripe API response
}

type PaymentMethodDisplayProps = Record<string, never>;

const PaymentMethodForm: React.FC<PaymentMethodDisplayProps> = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { currentUser, userProfile, loadingAuthState } = useAuth();

  const [cards, setCards] = useState<StripePaymentMethod[]>([]);
  const [defaultPaymentMethodId, setDefaultPaymentMethodId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [showAddCardForm, setShowAddCardForm] = useState(false);
  const [addCardError, setAddCardError] = useState<string | null>(null);
  const [isProcessingAddCard, setIsProcessingAddCard] = useState(false);
  const [addCardClientSecret, setAddCardClientSecret] = useState<string | null>(null);

  const fetchPaymentMethods = useCallback(async () => {
    if (!userProfile?.stripeCustomerId) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/stripe/payment-methods/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId: userProfile.stripeCustomerId }),
      });
      const data = await response.json();
      if (data.error) {
        setError(data.error);
      } else {
        setCards(data.paymentMethods || []);
        setDefaultPaymentMethodId(data.defaultPaymentMethodId || null);
      }
    } catch (err) {
      setError("Failed to load payment methods. Please try again.");
      console.error(err);
    }
    setIsLoading(false);
  }, [userProfile]);

  useEffect(() => {
    if (!loadingAuthState && currentUser && userProfile?.stripeCustomerId) {
      fetchPaymentMethods();
    } else if (!loadingAuthState && currentUser && !userProfile?.stripeCustomerId) {
      setIsLoading(false); 
    } else if (!loadingAuthState && !currentUser) {
      setIsLoading(false);
      setError("User not authenticated. Please log in.");
    }
    if (loadingAuthState) {
        setIsLoading(true);
    }

  }, [loadingAuthState, currentUser, userProfile, fetchPaymentMethods]);

  const handleSetupNewCard = async () => {
    console.log('[PaymentMethod.tsx] handleSetupNewCard triggered.');
    console.log('[PaymentMethod.tsx] userProfile:', userProfile);
    console.log('[PaymentMethod.tsx] userProfile?.stripeCustomerId:', userProfile?.stripeCustomerId);

    if (!userProfile?.stripeCustomerId) {
        console.error('[PaymentMethod.tsx] Missing stripeCustomerId.');
        setAddCardError("Cannot add card without a customer ID.");
        return;
    }
    setAddCardError(null);
    setIsProcessingAddCard(true);
    try {
      console.log('[PaymentMethod.tsx] Fetching /api/stripe/payment-methods/create-setup-intent with customerId:', userProfile.stripeCustomerId);
      const response = await fetch('/api/stripe/payment-methods/create-setup-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId: userProfile.stripeCustomerId }),
      });
      const data = await response.json();
      console.log('[PaymentMethod.tsx] API response data:', data);

      if (data.error) {
        console.error('[PaymentMethod.tsx] API returned error:', data.error);
        setAddCardError(data.error);
      } else {
        console.log('[PaymentMethod.tsx] API success, clientSecret:', data.clientSecret);
        setAddCardClientSecret(data.clientSecret);
        setShowAddCardForm(true);
      }
    } catch (err) {
      console.error('[PaymentMethod.tsx] Fetch catch error:', err);
      setAddCardError("Failed to initialize card setup. Please try again.");
    }
    setIsProcessingAddCard(false);
  };

  const handleSaveNewCard = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!stripe || !elements || !addCardClientSecret) {
      setAddCardError("Stripe is not ready or setup is incomplete.");
      return;
    }
    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setAddCardError("Card details not found.");
      return;
    }

    setIsProcessingAddCard(true);
    setAddCardError(null);

    const { error: setupError, setupIntent } = await stripe.confirmCardSetup(addCardClientSecret, {
      payment_method: {
        card: cardElement,
        // billing_details: { name: 'User Name' }, // Add if needed
      },
    });

    if (setupError) {
      setAddCardError(setupError.message || "Failed to save card.");
      setIsProcessingAddCard(false);
      return;
    }

    if (setupIntent && setupIntent.status === 'succeeded') {
      setAddCardError(null);
      setShowAddCardForm(false);
      setAddCardClientSecret(null);
      fetchPaymentMethods(); // Refresh the list of cards
      // Optionally set as default if it's the first card or by user choice
      if (cards.length === 0 && setupIntent.payment_method) {
        await handleSetDefault(setupIntent.payment_method as string);
      }
    } else {
      setAddCardError(setupIntent?.last_setup_error?.message || "Card setup failed for an unknown reason.");
    }
    setIsProcessingAddCard(false);
  };

  const handleSetDefault = async (paymentMethodId: string) => {
    if (!userProfile?.stripeCustomerId) return;
    setError(null);
    try {
      const response = await fetch('/api/stripe/payment-methods/set-default', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId: userProfile.stripeCustomerId, paymentMethodId }),
      });
      const data = await response.json();
      if (data.error) {
        setError(data.error);
      } else {
        setDefaultPaymentMethodId(paymentMethodId);
        fetchPaymentMethods(); // Refresh to ensure UI consistency if needed
      }
    } catch (err) {
      setError("Failed to set default payment method.");
      console.error(err);
    }
  };

  const handleDeleteCard = async (paymentMethodId: string) => {
    setError(null);
    try {
      const response = await fetch('/api/stripe/payment-methods/detach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentMethodId }),
      });
      const data = await response.json();
      if (data.error) {
        setError(data.error);
      } else {
        fetchPaymentMethods(); // Refresh the list
      }
    } catch (err) {
      setError("Failed to delete payment method.");
      console.error(err);
    }
  };
  
  const cardElementOptions = {
    style: {
      base: {
        color: "#32325d",
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSmoothing: "antialiased",
        fontSize: "16px",
        "::placeholder": { color: "#aab7c4" },
      },
      invalid: { color: "#fa755a", iconColor: "#fa755a" },
    },
  };

  if (loadingAuthState) {
    return <div className="text-center p-6">Loading user data...</div>;
  }

  if (!currentUser) {
      return (
          <div className="p-6 bg-white shadow-md rounded-lg max-w-md w-full text-center">
              <p className="text-red-500">User not authenticated. Please log in to manage payment methods.</p>
          </div>
      );
  }
  
  if (!userProfile?.stripeCustomerId && !isLoading) {
      return (
          <div className="p-6 bg-white shadow-md rounded-lg max-w-xl w-full text-center space-y-4">
              <p className="text-gray-700">
                  It seems you don&apos;t have any payment methods set up with Stripe yet.
              </p>
              <p className="text-sm text-gray-500">
                  You can add a payment method during your first booking, or add one now if you prefer.
              </p>
               <button
                onClick={handleSetupNewCard}
                disabled={isProcessingAddCard || showAddCardForm}
                className="mt-4 py-2 px-4 bg-red-500 text-white rounded hover:bg-red-600 cursor-pointer disabled:opacity-50"
              >
                {isProcessingAddCard ? 'Initializing...' : '+ Add New Card'}
              </button>
              {showAddCardForm && addCardClientSecret && (
                <form onSubmit={handleSaveNewCard} className="border rounded-lg p-4 mt-6 space-y-4">
                  <h3 className="text-center font-semibold mb-2">Add New Card</h3>
                  {addCardError && (
                    <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                      <p>{addCardError}</p>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium mb-1">Card Details <span className="text-red-500">*</span></label>
                    <div className="p-2 border rounded">
                      <CardElement options={cardElementOptions} />
                    </div>
                  </div>
                  <div className="flex justify-center space-x-2">
                    <button
                      type="submit"
                      disabled={!stripe || !elements || isProcessingAddCard}
                      className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 cursor-pointer disabled:opacity-50"
                    >
                      {isProcessingAddCard ? 'Saving...' : 'Save Card'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                          setShowAddCardForm(false); 
                          setAddCardClientSecret(null); 
                          setAddCardError(null);
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
          </div>
      );
  }

  if (isLoading) {
    return <div className="text-center p-6">Loading payment methods...</div>;
  }

  return (
    <div className="flex justify-center">
      <div className="p-6 bg-white shadow-md rounded-lg max-w-xl w-full space-y-6">
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
            <p>{error}</p>
          </div>
        )}

        {cards.length === 0 && !showAddCardForm && (
          <p className="text-center text-gray-600">No payment methods saved.</p>
        )}

        {cards.map(card => (
          <div key={card.id} className={`border rounded-lg p-4 ${card.id === defaultPaymentMethodId ? 'border-red-500 ring-2 ring-red-500' : 'border-gray-300'}`}>
            <div className="flex justify-between items-center">
                <div>
                    <p className="font-semibold text-gray-800">
                        {card.card?.brand.toUpperCase()} ending in {card.card?.last4}
                    </p>
                    <p className="text-sm text-gray-600">
                        Expires: {String(card.card?.exp_month).padStart(2, '0' )}/{card.card?.exp_year}
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row items-end sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                    {card.id !== defaultPaymentMethodId && (
                        <button 
                        onClick={() => handleSetDefault(card.id)}
                        className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 cursor-pointer text-xs whitespace-nowrap"
                        >
                        Set as Default
                        </button>
                    )}
                    <button 
                        onClick={() => handleDeleteCard(card.id)}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 cursor-pointer text-xs"
                    >
                        Delete
                    </button>
                </div>
            </div>
            {card.id === defaultPaymentMethodId && (
                <p className="text-xs text-red-600 mt-1">Default payment method</p>
            )}
          </div>
        ))}

        {!showAddCardForm && cards.length < 5 && ( // Limit number of saved cards if desired
          <button
            onClick={handleSetupNewCard}
            disabled={isProcessingAddCard}
            className="w-full mt-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 cursor-pointer disabled:opacity-50"
          >
            {isProcessingAddCard ? 'Initializing...' : '+ Add New Card'}
          </button>
        )}

        {showAddCardForm && addCardClientSecret && (
          <form onSubmit={handleSaveNewCard} className="border rounded-lg p-4 mt-6 space-y-4">
            <h3 className="text-center font-semibold mb-2">Add New Card</h3>
            {addCardError && (
              <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                <p>{addCardError}</p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-1">Card Details <span className="text-red-500">*</span></label>
              <div className="p-2 border rounded">
                <CardElement options={cardElementOptions} />
              </div>
            </div>
            <div className="flex justify-center space-x-2">
              <button
                type="submit"
                disabled={!stripe || !elements || isProcessingAddCard}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 cursor-pointer disabled:opacity-50"
              >
                {isProcessingAddCard ? 'Saving...' : 'Save Card'}
              </button>
              <button
                type="button"
                onClick={() => {
                    setShowAddCardForm(false); 
                    setAddCardClientSecret(null); 
                    setAddCardError(null);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

// Wrapper component to provide Elements context
const PaymentMethodPage: React.FC = () => {
  const options: StripeElementsOptions = {
    // Appearance can be customized here if needed
    // appearance: { theme: 'stripe' }
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <PaymentMethodForm />
    </Elements>
  );
};

export default PaymentMethodPage; 
