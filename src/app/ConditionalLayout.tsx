'use client';

import Header from "./header";
import Footer from "./Footer";
import { usePathname } from 'next/navigation';
import React from "react";

export default function ConditionalLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    const pathname = usePathname();
    const showHeaderFooter = !pathname.startsWith('/book');

    return (
        <>
            {showHeaderFooter && <Header />}
            {children}
            {showHeaderFooter && <Footer />}
        </>
    )
} 