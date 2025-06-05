'use client';

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from 'next/navigation';
import Sidebar from "./Sidebar";
import Profile from "./Profile";
import Jobs from "./Jobs";
import Invoices from "./Invoices";
import RequestSupport from "./RequestSupport";
import PaymentMethod, { StripePaymentMethod } from "./PaymentMethod";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

const DashboardContent = () => {
  const [currentPage, setCurrentPage] = useState("Dashboard");
  const searchParams = useSearchParams();
  const { currentUser, userProfile, loadingAuthState } = useAuth();
  const router = useRouter();

  const [cards, setCards] = useState<StripePaymentMethod[]>([]);
  const [defaultPaymentMethodId, setDefaultPaymentMethodId] = useState<string | null>(null);
  const [isLoadingPaymentMethods, setIsLoadingPaymentMethods] = useState(true);
  const [paymentMethodsError, setPaymentMethodsError] = useState<string | null>(null);

  const fetchPaymentMethods = useCallback(async () => {
    if (!userProfile?.stripeCustomerId) {
      setIsLoadingPaymentMethods(false);
      setCards([]);
      setDefaultPaymentMethodId(null);
      return;
    }
    
    setIsLoadingPaymentMethods(true);
    setPaymentMethodsError(null);
    try {
      const response = await fetch('/api/stripe/payment-methods/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId: userProfile.stripeCustomerId }),
      });
      const data = await response.json();
      if (data.error) {
        setPaymentMethodsError(data.error);
        setCards([]);
        setDefaultPaymentMethodId(null);
      } else {
        setCards(data.paymentMethods || []);
        setDefaultPaymentMethodId(data.defaultPaymentMethodId || null);
      }
    } catch (err) {
      setPaymentMethodsError("Failed to load payment methods. Please try again.");
      console.error(err);
      setCards([]);
      setDefaultPaymentMethodId(null);
    }
    setIsLoadingPaymentMethods(false);
  }, [userProfile]);

  useEffect(() => {
    const pageFromQuery = searchParams.get('page');
    if (pageFromQuery) {
      const validPages = ["Dashboard", "Profile", "Jobs", "Invoices", "Payment Method", "Request Support", "Log Out"];
      if (validPages.includes(pageFromQuery)) {
        setCurrentPage(pageFromQuery);
      }
    }
  }, [searchParams]);

  useEffect(() => {
    if (currentPage === "Log Out") {
      const handleSignOut = async () => {
        try {
          await signOut(auth);
          console.log("User signed out successfully.");
          localStorage.clear();
          sessionStorage.clear();
          window.location.href = "/book/welcome";
        } catch (error) {
          console.error("Error signing out: ", error);
          setCurrentPage("Dashboard");
        }
      };
      handleSignOut();
    }
  }, [currentPage]);

  useEffect(() => {
    if (!loadingAuthState && currentUser && userProfile?.stripeCustomerId) {
      fetchPaymentMethods();
    } else if (!loadingAuthState && currentUser && !userProfile?.stripeCustomerId) {
      fetchPaymentMethods();
    } else if (!loadingAuthState && !currentUser) {
      setIsLoadingPaymentMethods(false);
      setPaymentMethodsError("User not authenticated. Please log in to manage payment methods.");
      setCards([]);
      setDefaultPaymentMethodId(null);
    }
  }, [loadingAuthState, currentUser, userProfile, fetchPaymentMethods]);

  const PageHeader = ({ title }: { title: string }) => (
    <div className="text-center mb-8 pt-4 md:pt-0">
      <h1 className="text-2xl font-bold mb-4">{title}</h1>
      <div className="w-1/3 mx-auto border-b-2 border-gray-300"></div>
    </div>
  );

  const renderContent = () => {
    if (currentPage === "Log Out") {
      return (
        <div className="flex-1 bg-gray-50 min-h-screen flex justify-center items-center">
          <p className="text-lg">Logging out...</p>
        </div>
      );
    }
    
    switch (currentPage) {
      case "Dashboard":
        return (
          <div className="h-screen flex flex-col">
            <PageHeader title="Dashboard" />
            <div className="flex-1 flex items-end justify-center pb-20">
              <Link href="/book/bookingform">
                <button className="w-64 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 cursor-pointer">
                  Start a new booking
                </button>
              </Link>
            </div>
          </div>
        );
      case "Profile":
        return (
          <div className="p-4">
            <PageHeader title="Profile" />
            <Profile />
          </div>
        );
      case "Jobs":
        return (
          <div className="p-4">
            <PageHeader title="Jobs" />
            <Jobs />
          </div>
        );
      case "Invoices":
        return (
          <div className="p-4">
            <PageHeader title="Invoices" />
            <Invoices />
          </div>
        );
      case "Payment Method":
        return (
          <div className="p-4">
            <PageHeader title="Payment Method" />
            <PaymentMethod
              cards={cards}
              defaultPaymentMethodId={defaultPaymentMethodId}
              isLoading={isLoadingPaymentMethods}
              error={paymentMethodsError}
              fetchPaymentMethods={fetchPaymentMethods}
            />
          </div>
        );
      case "Request Support":
        return (
          <div className="p-4">
            <PageHeader title="Request Support" />
            <RequestSupport />
          </div>
        );
      default:
        return <div className="pt-16 md:pt-4">Page not found or invalid state.</div>;
    }
  };

  return (
    <div className="flex">
      <Sidebar onSelect={setCurrentPage} />
      <div className="flex-1 bg-gray-50 min-h-screen">{renderContent()}</div>
    </div>
  );
};

export default DashboardContent;

/*
'use client';

import React from 'react';

const MinimalDashboardComponent = () => {
  return (
    <div>
      <h1>Minimal Dashboard Content</h1>
      <p>If you see this, the import is working.</p>
    </div>
  );
};

export default MinimalDashboardComponent; 
*/ 

