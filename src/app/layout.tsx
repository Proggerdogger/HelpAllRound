import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from '@/contexts/AuthContext';
import ConditionalLayout from "@/app/ConditionalLayout";
import type { Metadata } from "next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: '%s | HelpAllRound',
    default: 'HelpAllRound - Your reliable help for everyday tasks.',
  },
  description: "Your reliable help for everyday tasks in Canberra. From odd jobs to errands, transport, and deliveries, we're here to help you.",
  openGraph: {
    title: 'HelpAllRound',
    description: 'Your reliable help for everyday tasks.',
    url: 'https://helpallround.com.au',
    siteName: 'HelpAllRound',
    images: [
      {
        url: '/og-image.png', // Please add an Open Graph image to your /public directory
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_AU',
    type: 'website',
  },
  metadataBase: new URL('https://helpallround.com.au'),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/images/Logo.png" type="image/png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased overflow-x-hidden`}
      >
        <AuthProvider>
          <ConditionalLayout>{children}</ConditionalLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
