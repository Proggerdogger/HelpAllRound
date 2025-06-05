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










//Login or sign up with just your phone number. Below that continue without signing in. Reduce friction.

//Address entering should be more professional. 

//Request Support should require email if the user doesn't yet have it added.

//When my website charges people it should have my business name. Maybe it already does!

//Borrow Siobhan's number and see how Geeks2U handles new people. I want email. Do I need email?

//I need to create a script for when people phone me. 