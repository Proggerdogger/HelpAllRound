// 'use client';

import React from "react";
// import Header from "@/app/header";
import Slideshow from "@/app/slideshow";
// import Footer from "@/app/Footer";
import ReasonsSection from "@/app/Reasons";
import type { Metadata } from "next";
// import CallbackModal from '@/app/CallbackModal'; Commented out or remove
// import CallbackSection from '@/app/CallbackSection'; // Import the new component

export const metadata: Metadata = {
  title: "HelpAllRound | Home",
  description: "Your reliable help for everyday tasks.",
};

function App() {
  // const [isModalOpen, setIsModalOpen] = useState(false); // Remove state from here

  return (
    <div className="min-h-screen bg-white">
      {/* <Header /> */}
      <Slideshow />
      <ReasonsSection />
      
    </div>
  );
}

export default App;







//Profile details should actually update.

//Ask name at some point

//Should start with fill in some profile details if it is a new customer.

//Request Support doesn't add jobs, so you can't use it. 

//Then, once they request support they need a support ticket and an email.

//order cancellation.

//Booking ID is way too long. Deal with tomorrow when I can deploy again.

//We are giving the person a payment authorization ID for no reason. Deal with tomorrow.

//Verify last, not first. Verify when payment comes. Big job.

//When my website charges people it should have my business name. Maybe it already does!

//Login is probably broken.