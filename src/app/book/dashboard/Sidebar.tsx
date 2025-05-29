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
  };

  return (
    <div className="w-64 h-screen bg-black text-white p-4 flex flex-col items-center">
      <Link href="/" passHref>
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
  );
};

export default Sidebar;