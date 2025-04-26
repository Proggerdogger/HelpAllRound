'use client';
import React from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function HeroSlide() {
  return (
    <div className="w-full max-w-7xl mx-auto h-[500px] grid grid-cols-2 rounded-2xl shadow-xl overflow-hidden">
      {/* Left Side */}
      <div className="bg-[#d91e36] text-white flex flex-col justify-center px-12 py-8 rounded-r-[250px]">
        <h1 className="text-4xl font-bold mb-6 leading-tight">
          Is your tech causing chaos?
        </h1>
        <p className="text-lg mb-6">
          You need Geeks2U. Got a constantly crashing computer, weak Wi-Fi, or
          problematic printer? Our fast and friendly technicians are available to
          come to you, with same day service available.
        </p>
        <Button className="bg-black text-white px-6 py-4 rounded-full w-fit">
          Book online now
        </Button>
      </div>

      {/* Right Side */}
      <motion.div
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white flex items-center justify-center"
      >
        <img
          src="/Base.png"
          alt="Tech chaos graphic"
          className="h-full object-contain"
        />
      </motion.div>
    </div>
  );
}