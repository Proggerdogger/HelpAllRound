
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




//Does ReCAPTCHA activating now mean fail?

//When you log in after refusing the initial, you have to press the log in button twice.

//Borrow Siobhan's number and see how Geeks2U handles new people. I want email. Do I need email?

 //There should be some kind of ping when I receive a callback request.

 