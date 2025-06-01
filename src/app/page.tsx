// 'use client';

import React from "react";
// import Header from "@/app/header";
import Slideshow from "@/app/slideshow";
// import Footer from "@/app/Footer";
import ReasonsSection from "@/app/Reasons";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HelpAllRound | Home",
  description: "Your reliable help for everyday tasks.",
};

function App() {
  return (
    <div className="min-h-screen bg-white">
      {/* <Header /> */}
      <Slideshow />
      <ReasonsSection />
      
    </div>
  );
}

export default App;

 
  

  // Numbers need to work when pressed- bring up option to phone on mobile, otherwise for PC they can do nothing.

  //Log in needs to actually make people make an account
 
  //Pricing needs to be accurate. From $60. Allow a booking once every 3 hours.

  //Make sure that the time isn't locked until after they book to make sure that they can easily change the time

  //Needs proper payment processing, and secure login.

  // Need to get rid of automatic profile details.

//Request callback does nothing. 

//On mobile it needs to be more obvious you can scroll down.

//Tapping the number brings up the optio to call, but not the icon.

//credit or debit card.

//Add third page to Slider instead of reasons.

//Payment Method page looks terrible on phone.

  

    
    

    
    