'use client'; // Layouts in app directory for context providers need to be client components

import { PaymentProvider } from '@/contexts/PaymentContext';
import React from 'react';

export default function BookLayout({ children }: { children: React.ReactNode }) {
  return (
    <PaymentProvider>
      {children}
    </PaymentProvider>
  );
} 