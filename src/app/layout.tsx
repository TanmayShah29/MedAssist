import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MedAssist — Patient Health Portal",
  description: "Manage your health data with clarity and confidence.",
};

import ScrollToTop from "@/components/ui/scroll-to-top";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased bg-[#F6F8FB] text-foreground font-sans selection:bg-emerald-100 selection:text-emerald-900`}>
        <ScrollToTop />
        <Navbar />
        <main className="max-w-[1200px] mx-auto px-6 pb-12 min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
