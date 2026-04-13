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

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://medassist.vercel.app';

export const metadata = {
  title: "MedAssist — Understand Your Lab Results",
  description: "Transform your confusing blood work PDFs into plain-English insights with AI-powered lab report analysis.",
  openGraph: {
    title: "MedAssist — Understand Your Lab Results",
    description: "AI-powered clinical intelligence for your lab reports.",
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
    title: "MedAssist — Understand Your Lab Results",
    description: "AI-powered clinical intelligence for your lab reports.",
    images: [`${SITE_URL}/og-image.png`],
  },
  alternates: {
    canonical: SITE_URL,
  },
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
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0EA5E9" />
        <link rel="apple-touch-icon" sizes="180x180" href="/og-image.png" />
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
