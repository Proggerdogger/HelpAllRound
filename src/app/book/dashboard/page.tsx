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

export default function Home() {
  const [currentPage, setCurrentPage] = useState("Dashboard");
  const searchParams = useSearchParams();

  useEffect(() => {
    const pageFromQuery = searchParams.get('page');
    if (pageFromQuery) {
      // A simple validation to ensure the pageFromQuery is a valid page name
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
            <PaymentMethod />
          </div>
        );
      case "Request Support":
        return (
          <div className="p-4">
            <PageHeader title="Request Support" />
            <RequestSupport />
          </div>
        );
      case "Log Out":
        // Handle logout logic here
        window.location.href = "/book/welcome";
        return null;
      default:
        return <div>Page not found</div>;
    }
  };

  return (
    <div className="flex">
      <Sidebar onSelect={setCurrentPage} />
      <div className="flex-1">{renderContent()}</div>
    </div>
  );
}