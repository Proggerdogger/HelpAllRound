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
      {/* <div className="text-center my-8">
        <button 
          onClick={() => setIsModalOpen(true)} 
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Request a Callback
        </button>
      </div>
      <CallbackModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} /> */}
      {/* Replace with the new component */}
      {/* <CallbackSection /> */}
    </div>
  );
}

export default App;


    
//Test job adding and invoices with dad or mum to see if it works.

//Upload all dis.