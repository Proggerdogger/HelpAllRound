'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useAuth } from '@/contexts/AuthContext';

// Load Stripe outside of component render to avoid recreating on every render
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export interface StripePaymentMethod {
  id: string;
  card?: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
  // Add other fields if necessary based on Stripe API response
}

// Define props for PaymentMethodForm
interface PaymentMethodFormProps {
  cards: StripePaymentMethod[];
  defaultPaymentMethodId: string | null;
  isLoading: boolean;
  error: string | null;
  fetchPaymentMethods: () => Promise<void>; // Function to refresh payment methods
}

const PaymentMethodForm: React.FC<PaymentMethodFormProps> = ({
  cards,
  defaultPaymentMethodId,
  isLoading, // Use passed-in isLoading
  error,     // Use passed-in error
  fetchPaymentMethods // Use passed-in fetch function
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const { currentUser, userProfile, loadingAuthState } = useAuth(); // Still need for customerId and auth checks

  // Local state for the "Add Card" form specifically
  const [showAddCardForm, setShowAddCardForm] = useState(false);
  const [addCardError, setAddCardError] = useState<string | null>(null);
  const [isProcessingAddCard, setIsProcessingAddCard] = useState(false);
  const [addCardClientSecret, setAddCardClientSecret] = useState<string | null>(null);
  // Removed local useState for cards, defaultPaymentMethodId, isLoading, error as they are now props.
  // Removed fetchPaymentMethods useCallback and useEffect for fetching as it's done by parent.

  // setError (for card operations) should be a local state if it's different from the main error prop
  // For now, assuming main `error` prop can be used or specific add/set/delete errors are handled by `addCardError` or new specific states.
  // Let's introduce a localError for operations within this component if needed, or rename error prop to listError.
  // For now, let's assume actions will call `fetchPaymentMethods` which handles main error/loading states.
  const [operationError, setOperationError] = useState<string | null>(null);

  const handleSetupNewCard = async () => {
    if (!userProfile?.stripeCustomerId) {
        setAddCardError("Cannot add card without a customer ID.");
        return;
    }
    setAddCardError(null);
    setOperationError(null);
    setIsProcessingAddCard(true);
    try {
      const response = await fetch('/api/stripe/payment-methods/create-setup-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId: userProfile.stripeCustomerId }),
      });
      const data = await response.json();
      if (data.error) {
        setAddCardError(data.error);
      } else {
        setAddCardClientSecret(data.clientSecret);
        setShowAddCardForm(true);
      }
    } catch (err) {
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
    setOperationError(null);

    const { error: setupError, setupIntent } = await stripe.confirmCardSetup(addCardClientSecret, {
      payment_method: {
        card: cardElement,
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
      await fetchPaymentMethods(); // Refresh the list of cards using the passed function
      // Check current cards length from props *after* fetchPaymentMethods completes (it should update)
      // For simplicity, assume fetchPaymentMethods updates the `cards` prop effectively for the check below.
      // A more robust way would be to get the new list or check the payment_method from setupIntent.
      if (cards.length === 0 && setupIntent.payment_method) { // This might need adjustment if `cards` isn't updated immediately
        await handleSetDefault(setupIntent.payment_method as string);
      }
    } else {
      setAddCardError(setupIntent?.last_setup_error?.message || "Card setup failed for an unknown reason.");
    }
    setIsProcessingAddCard(false);
  };

  const handleSetDefault = async (paymentMethodId: string) => {
    if (!userProfile?.stripeCustomerId) return;
    setOperationError(null);
    // Potentially set a specific loading state for this operation if it feels slow
    try {
      const response = await fetch('/api/stripe/payment-methods/set-default', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId: userProfile.stripeCustomerId, paymentMethodId }),
      });
      const data = await response.json();
      if (data.error) {
        setOperationError(data.error);
      } else {
        await fetchPaymentMethods(); // Refresh to ensure UI consistency
      }
    } catch (err) {
      setOperationError("Failed to set default payment method.");
      console.error(err);
    }
  };

  const handleDeleteCard = async (paymentMethodId: string) => {
    setOperationError(null);
    // Potentially set a specific loading state for this operation
    try {
      const response = await fetch('/api/stripe/payment-methods/detach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentMethodId }),
      });
      const data = await response.json();
      if (data.error) {
        setOperationError(data.error);
      } else {
        await fetchPaymentMethods(); // Refresh the list
      }
    } catch (err) {
      setOperationError("Failed to delete payment method.");
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
    hidePostalCode: true,
  };

  // Display loading message based on general loadingAuthState first (from parent)
  // The `isLoading` prop is specific to payment method data fetching.
  if (loadingAuthState) { // This is for initial user auth loading
    return <div className="text-center p-6">Loading user data...</div>;
  }

  if (!currentUser) {
      return (
          <div className="p-6 bg-white shadow-md rounded-lg max-w-md w-full text-center">
              <p className="text-red-500">User not authenticated. Please log in to manage payment methods.</p>
          </div>
      );
  }
  
  // This condition now checks isLoading (for payment methods) OR if stripeCustomerId is missing *and* not loading user auth
  // If still loading payment methods (isLoading is true), show loading specific to payment methods.
  if (isLoading) { // This is for payment methods loading state passed from parent
    return <div className="text-center p-6">Loading payment methods...</div>;
  }

  // If not loading user data, and not loading payment methods, but no stripeCustomerId, show setup message
  if (!userProfile?.stripeCustomerId) { // This implies isLoading (for payment methods) is false
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
              {addCardError && (
                <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm mt-2">
                    <p>{addCardError}</p>
                </div>
              )}
              {showAddCardForm && addCardClientSecret && (
                <form onSubmit={handleSaveNewCard} className="border rounded-lg p-4 mt-6 space-y-4">
                  <h3 className="text-center font-semibold mb-2">Add New Card</h3>
                  {/* AddCardError is displayed above the form if button is clicked, or here if submit fails */}
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
                          setOperationError(null);
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

  // If we reach here, user is authenticated, stripeCustomerId exists, and payment methods are not loading.
  // Display general errors related to fetching/listing cards passed via `error` prop.
  // Display `operationError` for errors from set default/delete.

  return (
    <div className="flex justify-center">
      <div className="p-6 bg-white shadow-md rounded-lg max-w-xl w-full space-y-6">
        {error && ( // General error from parent (e.g., initial list fetching failed)
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
            <p>{error}</p>
          </div>
        )}
        {operationError && ( // Error from operations within this component
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
            <p>{operationError}</p>
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

        {!showAddCardForm && userProfile?.stripeCustomerId && cards.length < 5 && ( // Only show if customerId exists
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
                    setOperationError(null);
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
const PaymentMethodPage: React.FC<PaymentMethodFormProps> = (props) => { // Now accepts props
  const options: StripeElementsOptions = {
    // Appearance can be customized here if needed
    // appearance: { theme: 'stripe' }
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <PaymentMethodForm {...props} /> {/* Spread the props to PaymentMethodForm */}
    </Elements>
  );
};

export default PaymentMethodPage; 