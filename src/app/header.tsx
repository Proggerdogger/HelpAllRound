import React from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import Link from "next/link";

// Pixel art phone SVG (36x36, red with black details)
const PhoneIcon = () => (
  <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 md:w-8 md:h-8">
    <g id="phone-black">
      <path
        fill="#ff0000"
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
        fill="#000"
        d="M23.3,25.5c-3.4,0-7.1-1.8-10.5-5.1c-2.6-2.5-5.6-6.5-5.2-11.1C7.7,8,9.2,6.1,10.9,5.7c1.9-0.5,3,0.8,3.4,1.3
        c0.5,0.6,1.8,2.3,2.3,3.2c0.6,1.1,0.3,2.6-0.6,3.4c-0.2,0.2-0.3,0.5-0.3,0.8c0,0.3,0.1,0.5,0.3,0.7c0.8,0.7,1.1,1,1.2,1.1l1.1,1.1
        c0.6,0.6,1.4,0.2,1.6,0c0.9-0.9,2.3-1.2,3.5-0.6c0.9,0.4,2.7,1.7,3.3,2.2c1.2,1,1.7,2.1,1.3,3.3c-0.5,1.6-2.5,3.2-3.8,3.3
        C23.9,25.5,23.6,25.5,23.3,25.5z M11.7,7.4c-0.1,0-0.2,0-0.3,0c-0.9,0.2-2,1.6-2,2.1c-0.4,3.9,2.3,7.4,4.7,9.6
        C16,21,19.8,24,24,23.7c0.5,0,1.9-1,2.2-2c0.1-0.4,0-0.8-0.7-1.4c-0.6-0.5-2.2-1.6-3-2c-0.5-0.2-1.1-0.1-1.4,0.2
        c-1,1-2.9,1.3-4.2,0.1l-1.1-1.1c0,0,0,0,0,0c0,0-0.2-0.2-1.1-1c-0.6-0.5-0.9-1.2-0.9-2c0-0.8,0.3-1.6,0.9-2.1
        c0.4-0.3,0.5-0.9,0.2-1.3c-0.3-0.7-1.5-2.2-2.1-2.9C12.5,7.6,12.1,7.4,11.7,7.4z"
      />
    </g>
  </svg>
);


const LaptopWithArrowIcon = () => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 32 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'inline-block' }}
      className="w-6 h-6 md:w-8 md:h-8"
    >
      <path
        d="M6.28659 24.22C4.79992 24.22 3.59992 23.0267 3.59992 21.5533V7.33334C3.59992 5.86001 4.80659 4.66667 6.28659 4.66667H26.0066C27.4932 4.66667 28.6933 5.86001 28.6933 7.33334V21.5533C28.6933 23.0267 27.4932 24.22 26.0066 24.22M1.33325 24.22V26.1C1.33325 27.1333 2.13325 27.9667 3.12659 27.9667H29.1732C30.1599 27.9667 30.9666 27.1333 30.9666 26.1067V24.22H21.5666L19.7333 24.9333H12.5933L10.7999 24.22H1.33325Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20.0198 15.3267L12.5198 11.5133C12.1932 11.3467 11.8398 11.6933 12.0132 12.0267L15.8265 19.52C15.9732 19.8 16.3798 19.7933 16.5132 19.5067L17.5398 17.2467C17.5798 17.1667 17.6465 17.1 17.7265 17.06L20.0132 16.0133C20.2998 15.88 20.3065 15.4733 20.0265 15.3333L20.0198 15.3267Z"
        stroke="#ff0000" // Red arrow
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

const Header = () => {
  return (
    <header className="p-4">
      {/* Desktop Header Layout */}
      <div className="hidden md:flex justify-between items-start">
        {/* Logo */}
        <Link href="/" passHref>
          <div className="text-4xl font-bold text-red-600 mt-4 ml-4 cursor-pointer hover:opacity-80 transition-opacity">
            HelpAllRound
          </div>
        </Link>

        {/* Right Section - Desktop */}
        <div className="flex flex-col items-end space-y-2">
          {/* Phone and Book Online */}
          <div className="flex items-center space-x-8">
            {/* Phone Section */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <div className="flex flex-col items-center">
                    <PhoneIcon />
                    <span className="text-base text-red-600 mt-1 relative group">
                      1300 396 316
                      <span className="absolute left-0 right-0 bottom-[-4px] h-[2px] bg-red-600 group-hover:hidden"></span>
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>call us</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            {/* Book Online Section */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Link href="/book">
                    <div className="flex flex-col items-center">
                      <LaptopWithArrowIcon />
                      <span className="text-base text-red-600 mt-1 relative group">
                        Book Online
                        <span className="absolute left-0 right-0 bottom-[-4px] h-[2px] bg-red-600 group-hover:hidden"></span>
                      </span>
                    </div>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Book Online</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* 7 Days a Week with Tooltip */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <div className="flex items-center space-x-1">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M8 0a8 8 0 100 16A8 8 0 008 0zm0 14a6 6 0 110-12 6 6 0 010 12zm1-5H7v2h2V9zm0-4H7v3h2V5z" fill="#000" />
                  </svg>
                  <span>7 days a week</span>
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-black text-white p-3 text-lg">
                <div>
                  <h3 className="font-bold text-white mb-2">HOURS</h3>
                  <p>
                    <span className="font-bold">MON-FRI:</span> 9am-5pm
                  </p>
                  <p>
                    <span className="font-bold">SAT + SUN:</span> 10am-5pm
                  </p>
                  <p>
                    <span className="font-bold">HOLIDAYS:</span> 10am-5pm
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

     
      {
      <div className="md:hidden flex justify-between items-center">
        <div className="w-6 h-6"></div> 
        <Link href="/" passHref>
          <div className="text-2xl font-bold text-red-600 cursor-pointer hover:opacity-80 transition-opacity">
            HelpAllRound
          </div>
        </Link>
        <a href="tel:1300396316" aria-label="Call 1300 396 316" className="w-6 h-6 flex items-center justify-center"> 
          <PhoneIcon />
        </a>
      </div>
      }
    </header>
  );
};

export default Header;