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
  title: "MedAssist — Understand Your Lab Results",
  description: "Transform your confusing blood work PDFs into plain-English insights with AI-powered lab report analysis.",
  openGraph: {
    title: "MedAssist — Understand Your Lab Results",
    description: "AI-powered clinical intelligence for your lab reports.",
    url: "https://medassist.vercel.app",
    siteName: "MedAssist",
    images: [
      {
        url: "https://medassist.vercel.app/og-image.png",
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
    images: ["https://medassist.vercel.app/og-image.png"],
  },
  alternates: {
    canonical: "https://medassist.vercel.app",
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
