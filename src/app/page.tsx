// 'use client';

import React from "react";

import Slideshow from "@/app/slideshow";

import ReasonsSection from "@/app/Reasons";
import type { Metadata } from "next";

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








//Borrow Siobhan's number and see how Geeks2U handles new people. I want email. Do I need email?

 
