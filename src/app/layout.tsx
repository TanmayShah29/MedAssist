import React from "react";
import { DM_Sans, Instrument_Serif } from "next/font/google";
import { ClientLayout } from "@/components/layout/ClientLayout";
import "./globals.css";

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

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-instrument",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://medassist-app.vercel.app";

export const metadata = {
  title: "MedAssist — Walk Into Your Doctor Visit Prepared",
  description: "Turn lab reports into plain-English insights, trend context, and a printable doctor-visit prep sheet.",
  openGraph: {
    title: "MedAssist — Walk Into Your Doctor Visit Prepared",
    description: "AI-powered appointment prep for your lab reports.",
    url: SITE_URL,
    siteName: "MedAssist",
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MedAssist — Walk Into Your Doctor Visit Prepared",
    description: "AI-powered appointment prep for your lab reports.",
    images: [`${SITE_URL}/og-image.png`],
  },
  alternates: {
    canonical: SITE_URL,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${dmSans.variable} ${instrumentSerif.variable}`} suppressHydrationWarning>
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, 
                   maximum-scale=1, viewport-fit=cover"
        />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0EA5E9" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icon-192.png" />
      </head>
      <body className="bg-[#FAFAF7] font-sans overflow-x-hidden">
        <ClientLayout 
          initialPathname={null}
          appShellRoutes={APP_SHELL_ROUTES}
          standaloneRoutes={STANDALONE_ROUTES}
        >
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
