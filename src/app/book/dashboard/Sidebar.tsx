'use client';

// components/Sidebar.tsx
import { useState } from "react";
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface SidebarProps {
  onSelect: (page: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onSelect }) => {
  const [activePage, setActivePage] = useState("Dashboard");
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const router = useRouter();

  const menuItems = [
    "Dashboard",
    "Profile",
    "Jobs",
    "Invoices",
    "Payment Method",
    "Request Support",
    "Log Out",
  ];

  const handleClick = (item: string) => {
    if (item === "Log Out") {
      router.push('/');
    } else {
      setActivePage(item);
      onSelect(item);
    }
    if (window.innerWidth < 768) {
      setIsMobileNavOpen(false);
    }
  };

  return (
    <>
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-gray-800 text-white rounded"
        onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
        aria-label="Open navigation"
      >
        {isMobileNavOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        )}
      </button>

      <div
        className={`
          bg-black text-white p-4 flex flex-col items-center
          fixed md:static top-0 left-0 h-full z-40
          transition-transform duration-300 ease-in-out
          ${isMobileNavOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 w-64
        `}
      >
        <Link href="/" className="mt-12 md:mt-0">
          <div className="text-red-500 text-xl font-bold mb-8 text-center cursor-pointer hover:opacity-80 transition-opacity">
            HelpAllRound
          </div>
        </Link>
        <ul className="w-full">
          {menuItems.map((item) => (
            <li
              key={item}
              className={`p-2 mb-2 cursor-pointer rounded text-center ${
                activePage === item ? "bg-gray-700" : "hover:bg-gray-600"
              }`}
              onClick={() => handleClick(item)}
            >
              {item}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default Sidebar;