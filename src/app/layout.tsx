import React from "react";
import { headers } from "next/headers";
import { Instrument_Serif, DM_Sans } from "next/font/google";
import { ClientLayout } from "@/components/layout/ClientLayout";
import "./globals.css";

const instrumentSerif = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-instrument",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

// Pages that should show the full app shell
const APP_SHELL_ROUTES = [
  "/dashboard",
  "/results",
  "/assistant",
  "/profile",
  "/settings",
];

// Pages that are completely standalone (no nav, no sidebar)
const STANDALONE_ROUTES = [
  "/",
  "/auth",
  "/onboarding",
];

export const metadata = {
  title: "MedAssist - Your Lab Results, Explained.",
  description: "AI-powered health insights for your lab reports.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname");

  return (
    <html lang="en" suppressHydrationWarning className={`${instrumentSerif.variable} ${dmSans.variable}`}>
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, 
                   maximum-scale=1, viewport-fit=cover"
        />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0EA5E9" />
        <link rel="apple-touch-icon" href="/window.svg" />
      </head>
      <body className="bg-[#FAFAF7] font-sans overflow-x-hidden">
        <ClientLayout 
          initialPathname={pathname}
          appShellRoutes={APP_SHELL_ROUTES}
          standaloneRoutes={STANDALONE_ROUTES}
        >
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
