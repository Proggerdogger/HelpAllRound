'use client'; 

import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide, useSwiper } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import CallbackModal from '@/app/CallbackModal';
import WhatWeDoMobile from './WhatWeDoMobile';
import 'swiper/css';
import 'swiper/css/pagination';

// Styles for Swiper
const swiperStyles = `
  .swiper {
    width: 100%;
    /* Height adjustments will be handled by content */
  }
  
  @media (max-width: 768px) {
    .swiper {
      /* Mobile height is auto */
    }
  }
  
  .swiper-pagination {
    bottom: 10px !important;
    left: 66% !important;
    right: 25% !important;
    width: auto !important;
    display: flex !important;
    justify-content: center !important;
  }
  
  @media (max-width: 768px) {
    .swiper-pagination {
      left: 0 !important;
      right: 0 !important;
      width: 100% !important;
    }
  }
  
  .swiper-pagination-bullet {
    width: 12px !important;
    height: 12px !important;
    background: #a6a6a6 !important;
    opacity: 0.5;
    margin: 0 12px !important;
  }
  .swiper-pagination-bullet-active {
    opacity: 1;
  }
  .custom-prev, .custom-next {
    width: 20px !important;
    height: 30px !important;
    position: absolute;
    top: 93%; // Adjusted vertical position for desktop
    transform: translateY(-50%);
    cursor: pointer;
    z-index: 10;
  }
  
  @media (max-width: 768px) {
    .custom-prev, .custom-next {
      display: none !important;
    }
  }
  
  .custom-prev:hover, .custom-next:hover {
    transform: scale(1.1);
  }
  .custom-prev {
    left: calc(66% - 30px);
  }
  .custom-next {
    right: calc(25% - 30px);
  }
`;

// Custom Left Arrow SVG
const LeftArrow = () => (
  <svg width="20" height="30" viewBox="0 0 20 30" fill="none" xmlns="http://www.w3.org/2000/svg" className="custom-prev">
    <path d="M14 7L7 15L14 23" stroke="#a6a6a6" strokeWidth="3" />
  </svg>
);

// Custom Right Arrow SVG
const RightArrow = () => (
  <svg width="20" height="30" viewBox="0 0 20 30" fill="none" xmlns="http://www.w3.org/2000/svg" className="custom-next">
    <path d="M6 7L13 15L6 23" stroke="#a6a6a6" strokeWidth="3" />
  </svg>
);

// Pixel-art phone SVG
const PhoneOvalIcon = () => (
  <svg viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg" className="!w-6 !h-6 md:!w-8 md:!h-8">
    <path
      fill="#fff" 
      d="M11.8,29.9c-0.1,0-0.1,0-0.2,0c-2.3-0.6-4.3-1.7-6-3.3c-1.7-1.6-2.8-3.6-3.5-5.8c-0.1-0.5,0.1-1,0.6-1.1
      c0.5-0.1,1,0.1,1.1,0.6c0.5,1.9,1.5,3.6,3,5c1.5,1.4,3.2,2.4,5.2,2.9c0.5,0.1,0.8,0.6,0.7,1.1C12.6,29.6,12.2,29.9,11.8,29.9z
      M12,26.4c-0.1,0-0.2,0-0.2,0c-1.4-0.4-2.7-1.1-3.7-2.1c-1-0.9-1.7-2.1-2.1-3.3c-0.2-0.5,0.1-1,0.6-1.1c0.5-0.2,1,0.1,1.1,0.6
      c0.3,1,0.9,1.8,1.6,2.6c0.8,0.8,1.8,1.4,2.9,1.7c0.5,0.1,0.8,0.6,0.6,1.1C12.7,26.1,12.4,26.4,12,26.4z M25.2,13.6
      c-0.4,0-0.7-0.3-0.9-0.6c-0.3-1.1-0.9-2-1.7-2.8c-0.8-0.7-1.7-1.3-2.7-1.6c-0.5-0.1-0.7-0.7-0.6-1.1c0.1-0.5,0.6-0.7,1.1-0.6
      c1.3,0.4,2.4,1.1,3.4,2c1,1,1.8,2.2,2.2,3.6c0.1,0.5-0.1,1-0.6,1.1C25.3,13.6,25.3,13.6,25.2,13.6z M28.8,13.4
      c-0.4,0-0.8-0.3-0.9-0.7c-0.5-1.9-1.5-3.6-3-5c-1.5-1.4-3.2-2.4-5.2-2.9c-0.5-0.1-0.8-0.6-0.6-1.1c0.1-0.5,0.6-0.8,1.1-0.6
      c2.3,0.6,4.3,1.7,6,3.3c1.7,1.7,2.9,3.6,3.5,5.8c0.1,0.5-0.2,1-0.6,1.1C29,13.4,28.9,13.4,28.8,13.4z"
    />
    <path
      fill="#dc2626" 
      stroke="#fff" 
      strokeWidth="1.5"
      d="M23.3,25.5c-3.4,0-7.1-1.8-10.5-5.1c-2.6-2.5-5.6-6.5-5.2-11.1C7.7,8,9.2,6.1,10.9,5.7c1.9-0.5,3,0.8,3.4,1.3
      c0.5,0.6,1.8,2.3,2.3,3.2c0.6,1.1,0.3,2.6-0.6,3.4c-0.2,0.2-0.3,0.5-0.3,0.8c0,0.3,0.1,0.5,0.3,0.7c0.8,0.7,1.1,1,1.2,1.1l1.1,1.1
      c0.6,0.6,1.4,0.2,1.6,0c0.9-0.9,2.3-1.2,3.5-0.6c0.9,0.4,2.7,1.7,3.3,2.2c1.2,1,1.7,2.1,1.3,3.3c-0.5,1.6-2.5,3.2-3.8,3.3
      C23.9,25.5,23.6,25.5,23.3,25.5z"
    />
  </svg>
);

// Pixel-art laptop SVG
const LaptopBlackIcon = () => (
  <svg viewBox="0 0 32 30" fill="none" xmlns="http://www.w3.org/2000/svg" className="!w-6 !h-6 md:!w-8 md:!h-8 inline-block">
    <path
      d="M6.28659 24.22C4.79992 24.22 3.59992 23.0267 3.59992 21.5533V7.33334C3.59992 5.86001 4.80659 4.66667 6.28659 4.66667H26.0066C27.4932 4.66667 28.6933 5.86001 28.6933 7.33334V21.5533C28.6933 23.0267 27.4932 24.22 26.0066 24.22M1.33325 24.22V26.1C1.33325 27.1333 2.13325 27.9667 3.12659 27.9667H29.1732C30.1599 27.9667 30.9666 27.1333 30.9666 26.1067V24.22H21.5666L19.7333 24.9333H12.5933L10.7999 24.22H1.33325Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M20.0198 15.3267L12.5198 11.5133C12.1932 11.3467 11.8398 11.6933 12.0132 12.0267L15.8265 19.52C15.9732 19.8 16.3798 19.7933 16.5132 19.5067L17.5398 17.2467C17.5798 17.1667 17.6465 17.1 17.7265 17.06L20.0132 16.0133C20.2998 15.88 20.3065 15.4733 20.0265 15.3333L20.0198 15.3267Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Pixel-art clock SVG
const ClockIcon = () => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="!w-6 !h-6 md:!w-8 md:!h-8">
    <path
      d="M42.95 24.48H36.54M24.48 42.9V36.48M6.01 24.43H12.42M33.71 8.48L31.96 11.52M40.47 15.25L37.44 17M40.47 33.72L37.44 31.97M33.72 40.48L31.97 37.44M15.25 40.48L17 37.44M8.49 33.71L11.53 31.96M8.48 15.24L11.52 16.99M15.24 8.48L16.99 11.52M24.47 6.01V12.42M42.95 24.48C42.95 34.68 34.68 42.95 24.48 42.95C14.28 42.95 6 34.68 6 24.48C6 14.28 14.27 6 24.47 6C34.67 6 42.94 14.27 42.94 24.47L42.95 24.48Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M14.83 18.98L24.47 24.47M31.6 20.3L24.47 24.47"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Mobile Left Arrow SVG
const MobileLeftArrow = () => {
  const swiper = useSwiper();
  return (
    <svg
      width="25"
      height="40"
      viewBox="0 0 25 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute left-4 top-[45%] transform -translate-y-[230%] z-20 cursor-pointer md:hidden block"
      onClick={() => swiper.slidePrev()}
      aria-label="Previous slide"
    >
      {/* Black border path */}
      <path d="M20 5L5 20L20 35" stroke="black" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Original white arrow path on top */}
      <path d="M20 5L5 20L20 35" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

// Mobile Right Arrow SVG
const MobileRightArrow = () => {
  const swiper = useSwiper();
  return (
    <svg
      width="25"
      height="40"
      viewBox="0 0 25 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute right-4 top-[45%] transform -translate-y-[230%] z-20 cursor-pointer md:hidden block"
      onClick={() => swiper.slideNext()}
      aria-label="Next slide"
    >
      {/* Black border path */}
      <path d="M5 5L20 20L5 35" stroke="black" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Original white arrow path on top */}
      <path d="M5 5L20 20L5 35" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

const Slideshow = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 768px)');
    const handleResize = () => setIsDesktop(mediaQuery.matches);
    
    mediaQuery.addEventListener('change', handleResize);
    handleResize(); // Initial check on client-side

    return () => mediaQuery.removeEventListener('change', handleResize);
  }, []);

  return (
    <>
      <div className="mt-4 relative">
        <style>{swiperStyles}</style>
        {/* Combined Swiper for Mobile and Desktop */}
        <div className="relative"> {/* Container for Swiper and desktop arrows */}
          <Swiper
            modules={[Navigation, Pagination]}
            spaceBetween={0}
            slidesPerView={1}
            navigation={{
              prevEl: '.custom-prev',
              nextEl: '.custom-next',
            }}
            pagination={{ clickable: true }}
            speed={500}
            loop
          >
            {/* Slide 1 */}
            <SwiperSlide>
              <div className="flex flex-col md:flex-row h-auto md:h-[80vh] relative bg-gray-100 md:bg-gray-300">
                {/* == Mobile Layout: Image + Curved Red Background == */}
                <div className="md:hidden relative flex flex-col items-center justify-start px-4 pt-8 pb-0 w-full bg-gray-100">
                  {/* Image positioned above */}
                  <div className="h-[240px] flex items-center justify-center mb-4 z-10">
                    <Image
                      src="/images/Helpallroundgood.png"
                      alt="Help All Round Slide 1"
                      width={330}
                      height={210}
                      className="w-60 h-auto object-contain"
                      
                    />
                  </div>
                  {/* Red background with upward curve */}
                  <div className="w-[110%] flex flex-col items-center relative z-0">
                    <div  
                      className="w-full bg-red-600 flex flex-col items-center pt-16 pb-0 relative overflow-hidden"
                      style={{ borderTopLeftRadius: '50%', borderTopRightRadius: '50%' }}
                    >
                      <p className="text-center text-2xl font-bold text-white mb-5 px-2">Do you have a problem you need solved?</p>
                      <Link href="/book" passHref>
                        <Button asChild className="bg-black text-base text-white rounded-full px-8 py-4 font-semibold shadow-md hover:scale-105 transition-transform w-full max-w-xs">
                          Book online now
                        </Button>
                      </Link>
                    </div>
                  </div>
                  {/* Mobile Only: Single Wide Black Button */}
                  <div className="w-[110%] flex flex-col items-center pt-6 pb-8 bg-gray-100">
                    <Link href="/book" passHref>
                      <Button asChild className="w-[110%] flex items-center justify-center gap-2 px-4 py-5 rounded-full text-xl font-semibold bg-black text-white border-none shadow-md max-w-sm mx-auto">
                        <span>
                          <PhoneOvalIcon />
                          <span>Call us or book online</span>
                        </span>
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* == Desktop Layout: Red Semicircle Left, Image Right == */}
                {/* Desktop: Red Area */}
                <div className="hidden md:flex bg-red-600 text-white flex-col justify-center items-start text-left p-8 h-full w-1/2 gap-20 relative z-10 rounded-tr-[9999px] rounded-br-[9999px]">
                  <p className="text-2xl md:text-5xl font-bold">Do you have a problem you need solved?</p>
                  {/* Desktop: Original Paragraph */}
                  <p className="text-lg">
                    You need HelpAllRound. From odd jobs around the house to errands, transport, deliveries, and more — we're here to help you. Our fast and friendly helpers are available to come to you, with same day service available. Get in touch today.
                  </p>
                  {/* Desktop: Original Button */}
                  <div className="flex justify-start">
                    <Link href="/book" passHref>
                      <Button asChild className="bg-black text-lg text-white rounded-full px-10 py-6 hover:scale-105 transition-transform max-w-[200px]">
                        Book online now
                      </Button>
                    </Link>
                  </div>
                </div>
                {/* Desktop: Image Area */}
                <div
                  className="hidden md:flex absolute top-0 h-full w-1/2 items-center justify-start bg-gray-300"
                  style={{ left: 'calc(50% + 5% - 20px)', zIndex: 5 }}
                >
                  <Image
                    src="/images/Helpallroundgood.png"
                    alt="Help All Round"
                    width={600}
                    height={400}
                    className="w-3/4 h-[90%] object-contain"
                    
                    onError={() => console.error('Failed to load image: /images/Helpallroundgood.png')}
                  />
                </div>
              </div>
            </SwiperSlide>
            {/* Slide 2 */}
            <SwiperSlide>
              <div className="flex flex-col md:flex-row h-auto md:h-[80vh] relative bg-black md:bg-black">
                {/* == Mobile Layout: SVG + Curved Red Background == */}
                <div className="md:hidden relative flex flex-col items-center justify-start pt-8 pb-0 w-full overflow-visible">
                  {/* Top Part (SVG + Curve) */} 
                  <div className="w-full bg-black pb-0"> 
                    {/* SVG container */}
                    <div className="mb-4 z-10 flex justify-center items-center h-[240px] w-[320px] mx-auto px-4"> {/* Increased h/w */} 
                      {/* Red Oval SVG */}
                      <svg
                        className="w-full h-full object-contain"
                        viewBox="0 0 320 240" 
                        preserveAspectRatio="xMidYMid meet"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          //Oval
                          d="M80 33 H240 A85 85 0 0 1 310 120 A85 85 0 0 1 240 206 H80 A85 85 0 0 1 11 120 A85 85 0 0 1 80 33 Z"
                          stroke="#dc2626"
                          strokeWidth="4"
                          fill="rgba(0, 0, 0, 0.1)"
                        />
                        {/* Text inside foreignObject */}
                        <foreignObject x="30" y="50" width="260" height="150">
                          <div
                            style={{
                              color: 'white',
                              fontWeight: 'bold',
                              lineHeight: '1.4',
                              overflow: 'hidden',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              height: '100%'
                            }}
                          >
                            <div style={{ textAlign: 'center' }}> 
                              <span style={{ fontSize: '24px', display: 'block' }}> If you're not happy with our results,</span>
                              <span style={{ fontSize: '29px', display: 'block' }}>we won't charge you a thing!</span>
                            </div>
                          </div>
                        </foreignObject>
                      </svg>
                    </div>
                    {/* Red background with upward curve */}
                    <div className="w-[100%] flex flex-col items-center relative z-0 mx-auto">
                      {/* Added px-4 here for content padding */} 
                      <div
                        className="w-full bg-red-600 flex flex-col items-center pt-16 pb-6 relative overflow-hidden px-4"
                        style={{ borderTopLeftRadius: '50%', borderTopRightRadius: '50%' }}
                      >
                        <p className="text-center text-2xl font-bold text-white mb-7">Satisfaction Guaranteed!</p>
                        <Link href="/book" passHref>
                          <Button asChild className="bg-black text-base text-white rounded-full px-8 py-4 font-semibold shadow-md hover:scale-105 transition-transform w-full max-w-xs">
                            Book online now
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                  
                  {/* Bottom Part (Button) with Grey Background */} 
                  {/* This div provides the full-width grey background */} 
                  <div className="w-full bg-gray-100 pt-6 pb-8"> 
                    {/* Added px-4 here for content padding */} 
                    <div className="px-4 flex flex-col items-center">
                      <Link href="/book" passHref>
                        <Button asChild className="w-full flex items-center justify-center gap-2 py-5 rounded-full text-xl font-semibold bg-black text-white border-none shadow-md max-w-sm mx-auto">
                          <span>
                            <PhoneOvalIcon />
                            <span>Call us or book online</span>
                          </span>
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* == Desktop Layout: Red Semicircle Left, SVG Right == */}
                {/* Desktop: Red Area */}
                <div className="hidden md:flex bg-red-600 text-white flex-col justify-center items-start text-left p-8 h-full w-1/2 gap-4 relative z-10 rounded-tr-[9999px] rounded-br-[9999px]">
                  <p className="text-2xl md:text-5xl font-bold">Satisfaction Guaranteed!</p>
                  {/* Desktop: Original Paragraph */}
                  <p className="text-lg">
                    We're so confident you'll love our services that we offer a satisfaction guarantee. If you're not happy with our results, we won't charge you a thing.
                  </p>
                  {/* Desktop: Original Button */}
                  <div className="flex justify-start">
                    <Link href="/book" passHref>
                      <Button asChild className="bg-black text-lg text-white rounded-full px-10 py-6 hover:scale-105 transition-transform max-w-[200px]">
                        Book online now
                      </Button>
                    </Link>
                  </div>
                </div>
                {/* Desktop: SVG Area */}
                <div className="hidden md:flex h-full w-1/2 items-center justify-center bg-black relative">
                  <svg
                    className="absolute w-3/4 h-1/2"
                    viewBox="0 0 300 150"
                    preserveAspectRatio="none"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M75 20 H225 A55 55 0 0 1 280 75 A55 55 0 0 1 225 130 H75 A55 55 0 0 1 20 75 A55 55 0 0 1 75 20 Z"
                      stroke="#dc2626"
                      strokeWidth="2"
                      fill="none"
                    />
                    <foreignObject x="30" y="40" width="240" height="90">
                      <div
                        style={{
                          color: 'white',
                          fontWeight: 'bold',
                          lineHeight: '1.2',
                          textAlign: 'center',
                          overflow: 'hidden',
                        }}
                      >
                        <span style={{ fontSize: '21px' }}>Satisfaction guarantee</span><br />
                        <span style={{ fontSize: '13px' }}>If you're not happy with our results</span><br />
                        <span style={{ fontSize: '16px' }}>we won't charge you a thing!</span>
                      </div>
                    </foreignObject>
                    <rect
                      x="114"
                      y="120"
                      width="72"
                      height="20"
                      fill="black"
                    />
                    <text
                      x="150"
                      y="130"
                      fill="white"
                      fontSize="10"
                      fontWeight="normal"
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      HelpAllRound
                    </text>
                  </svg>
                </div>
              </div>
            </SwiperSlide>
            {/* Slide 3: What We Do - DESKTOP ONLY */}
            {isDesktop && (
              <SwiperSlide>
                {/* Desktop: "What We Do" List Slide */}
                <div className="hidden md:flex flex-col justify-center items-center h-auto md:h-[80vh] relative bg-white text-black p-16">
                  <h2 className="text-5xl font-bold mb-10 text-gray-800">What we do</h2>
                  <div className="flex flex-row gap-x-20 text-left">
                    <ul className="space-y-4 text-xl list-disc pl-5">
                      <li>Errands & Shopping</li>
                      <li>Deliveries</li>
                      <li>Transport</li>
                      <li>Help for Seniors</li>
                      <li>Simple Tech Help & Tutoring</li>
                    </ul>
                    <ul className="space-y-4 text-xl list-disc pl-5">
                      <li>Gardening and Yard Work</li>
                      <li>Cleaning</li>
                      <li>Packing and Removals</li>
                      <li>Home Appliance Instruction</li>
                      <li>Amateur painting</li>
                      
                    </ul>
                  </div>
                  <p className="text-lg mt-10 italic text-gray-600">...Any task! As long as it doesn't require a certification.</p>
                </div>
              </SwiperSlide>
            )}
            {/* Custom Arrow - Mobile (MUST be inside Swiper)*/}
            <MobileLeftArrow />
            <MobileRightArrow />
          </Swiper>
          {/* Custom Arrows - Desktop */}
          <LeftArrow />
          <RightArrow />
        </div> {/* End of div className="relative" that wraps Swiper + Desktop Arrows */}

        {/* Mobile Scroll Down Indicator 1 */}
        <div className="md:hidden flex flex-col justify-center items-center pt-8 pb-4 bg-gray-100">
          <svg 
            className="animate-bounce w-8 h-8 text-red-600" 
            fill="none" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
            aria-hidden="true"
          >
            <path d="M19 9l-7 7-7-7"></path>
          </svg>
          <span className="mt-2 text-sm text-gray-700">Scroll to see what we do</span>
        </div>

        {/* "What We Do" Section for Mobile */}
        <WhatWeDoMobile />

        {/* Mobile Scroll Down Indicator 2 */}
        <div className="md:hidden flex flex-col justify-center items-center pt-4 pb-8 bg-gray-100">
          <svg 
            className="animate-bounce w-8 h-8 text-red-600" 
            fill="none" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
            aria-hidden="true"
          >
            <path d="M19 9l-7 7-7-7"></path>
          </svg>
          <span className="mt-2 text-sm text-gray-700">Scroll to see why you'll love us</span>
        </div>

        {/* Grey Square with Buttons - Desktop */}
        <div className="w-full bg-gray-200 hidden md:flex justify-center items-center gap-6 p-6">
          <a
            href="tel:1300396316"
            className="flex items-center justify-center gap-3 px-8 py-5 rounded-full font-semibold text-white bg-red-600 shadow-md transition-transform hover:scale-105"
          >
            <PhoneOvalIcon />
            <span className="text-lg">1300 396 316</span>
          </a>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-3 px-8 py-5 rounded-full font-semibold text-black bg-white shadow-md transition-transform hover:scale-105 hover:bg-gray-50 border-2 border-gray-300 cursor-pointer"
          >
            <ClockIcon />
            <span className="text-lg">Request Callback</span>
          </button>
          <Link
            href="/book"
            className="flex items-center justify-center gap-3 px-8 py-5 rounded-full font-semibold text-black bg-white shadow-md transition-transform hover:scale-105 hover:bg-gray-50 border-2 border-gray-300"
          >
            <LaptopBlackIcon />
            <span className="text-lg">Book Online</span>
          </Link>
        </div>
      </div>
      <CallbackModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};

export default Slideshow;

//my slider arrows are messed up on desktop mode.