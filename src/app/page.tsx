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

 
  
// Numbers need to work when pressed- bring up option to phone on mobile, otherwise for PC they can do nothing.

//Pricing needs to be accurate. From $60. Allow a booking once every 3 hours.

//Make sure that the time isn't locked until after they book to make sure that they can easily change the time

//Request callback does nothing. 

//Tapping the number brings up the option to call, but not the icon.

//Make the blue heart directly underneath the grey fox of Call us or book online.

//Payment Method page looks terrible on phone.

//my billing address is the same as my home address button does nothing. 

//There needs to be the option for people who have different addresses. Also, the box

//Should be auto ticked.



  

    
    

    
    