'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface CardDetails {
  cardNumber: string;
  expiryDate: string;
  cardholderName: string;
  cvv?: string; // CVV is optional here as it might not be stored long-term
}

interface PaymentContextType {
  savedCard: CardDetails | null;
  saveCardDetails: (details: CardDetails) => void;
  clearSavedCard: () => void;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export const PaymentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [savedCard, setSavedCard] = useState<CardDetails | null>(null);

  const saveCardDetails = (details: CardDetails) => {
    // In a real app, you might prefer to only store a token or a reference,
    // not full card details in localStorage for security.
    // For this example, we'll store it in state. A more persistent solution
    // might involve localStorage or a backend.
    setSavedCard(details);
  };

  const clearSavedCard = () => {
    setSavedCard(null);
  };

  return (
    <PaymentContext.Provider value={{ savedCard, saveCardDetails, clearSavedCard }}>
      {children}
    </PaymentContext.Provider>
  );
};

export const usePaymentContext = () => {
  const context = useContext(PaymentContext);
  if (context === undefined) {
    throw new Error('usePaymentContext must be used within a PaymentProvider');
  }
  return context;
}; 