'use client';

import { Suspense } from "react";
import DashboardContent from "./Dashboard"; // Changed to DashboardContent

// The main export for the page, wrapping the content with Suspense
export default function DashboardPage() {
  return (
    <Suspense fallback={<div>Loading page content...</div>}>
      <DashboardContent />
    </Suspense>
  );
}

//This page does not look good on mobile.