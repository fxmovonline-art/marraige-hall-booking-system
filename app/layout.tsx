import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import HeaderHero from "@/components/header-hero";
import AuthSessionProvider from "@/components/AuthSessionProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MHBS",
  description: "Marriage Hall Booking System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthSessionProvider>
          <HeaderHero />
          <div id="page-content" className="transition-[filter] duration-300">
            {children}
          </div>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
