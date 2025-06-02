'use client';

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "./header";
import Footer from "./Footer";
import { usePathname } from 'next/navigation';
import { AuthProvider } from '@/contexts/AuthContext';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const showHeaderFooter = !pathname.startsWith('/book');

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased overflow-x-hidden`}
      >
        <AuthProvider>
          {showHeaderFooter && <Header />}
          {children}
          {showHeaderFooter && <Footer />}
        </AuthProvider>
      </body>
    </html>
  );
}
