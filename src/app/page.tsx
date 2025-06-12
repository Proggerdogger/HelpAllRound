import React from "react";
// import Header from "@/app/header";
import Slideshow from "@/app/slideshow";
// import Footer from "@/app/Footer";
import ReasonsSection from "@/app/Reasons";
import type { Metadata } from "next";
// import CallbackModal from '@/app/CallbackModal'; Commented out or remove
// import CallbackSection from '@/app/CallbackSection'; // Import the new component

export const metadata: Metadata = {
  title: "Home",
  description: "Your reliable help for everyday tasks in Canberra. From odd jobs to errands, transport, and deliveries, we're here to help you.",
};

function HomePage() {
  // const [isModalOpen, setIsModalOpen] = useState(false); // Remove state from here

  return (
    <div className="min-h-screen bg-white">
      {/* <Header /> */}
      <Slideshow />
      <ReasonsSection />
      
    </div>
  );
}

export default HomePage;




//Does ReCAPTCHA activating now mean fail?

//Does Request Support work?


 