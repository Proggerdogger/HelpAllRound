'use client';

import { useState, useEffect } from "react";
import { useSearchParams } from 'next/navigation';
import Sidebar from "./Sidebar";
import Profile from "./Profile";
import Jobs from "./Jobs";
import Invoices from "./Invoices";
import RequestSupport from "./RequestSupport";
import PaymentMethod from "./PaymentMethod";
import Link from "next/link";

const DashboardContent = () => {
  const [currentPage, setCurrentPage] = useState("Dashboard");
  const searchParams = useSearchParams();

  useEffect(() => {
    const pageFromQuery = searchParams.get('page');
    if (pageFromQuery) {
      const validPages = ["Dashboard", "Profile", "Jobs", "Invoices", "Payment Method", "Request Support"];
      if (validPages.includes(pageFromQuery)) {
        setCurrentPage(pageFromQuery);
      }
    }
  }, [searchParams]);

  const PageHeader = ({ title }: { title: string }) => (
    <div className="text-center mb-8">
      <h1 className="text-2xl font-bold mb-4">{title}</h1>
      <div className="w-1/3 mx-auto border-b-2 border-gray-300"></div>
    </div>
  );

  const renderContent = () => {
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
            {/* <div>Profile Content Placeholder</div> */}
          </div>
        );
      case "Jobs":
        return (
          <div className="p-4">
            <PageHeader title="Jobs" />
            <Jobs />
            {/* <div>Jobs Content Placeholder</div> */}
          </div>
        );
      case "Invoices":
        return (
          <div className="p-4">
            <PageHeader title="Invoices" />
            <Invoices />
            {/* <div>Invoices Content Placeholder</div> */}
          </div>
        );
      case "Payment Method":
        return (
          <div className="p-4">
            <PageHeader title="Payment Method" />
            <PaymentMethod />
            {/* <div>Payment Method Content Placeholder</div> */}
          </div>
        );
      case "Request Support":
        return (
          <div className="p-4">
            <PageHeader title="Request Support" />
            <RequestSupport />
            {/* <div>Request Support Content Placeholder</div> */}
          </div>
        );
      case "Log Out":
        if (typeof window !== 'undefined') {
            window.location.href = "/book/welcome";
        }
        return null;
      default:
        return <div>Page not found</div>;
    }
  };

  return (
    <div className="flex">
      <Sidebar onSelect={setCurrentPage} />
      {/* <div>Sidebar Placeholder</div> */}
      <div className="flex-1">{renderContent()}</div>
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

