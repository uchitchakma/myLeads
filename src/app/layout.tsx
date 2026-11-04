import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://myleads.ucdreams.com"),
  title: {
    default: "myLeads — Autonomous B2B Lead Harvester & Client Acquisition Engine",
    template: "%s | myLeads"
  },
  description: "Harvest high-ticket clients, verified ad spenders, contractors, Shopify brands, and new business filings autonomously with technical audits and 1-click cold email outreach.",
  keywords: [
    "b2b lead generation",
    "lead harvester",
    "cold email outreach",
    "meta ad spenders",
    "google ads transparency",
    "high ticket contractors",
    "shopify store leads",
    "reputation management leads",
    "new business registrations",
    "client acquisition engine",
    "ucdreams"
  ],
  authors: [{ name: "Uchit Chakma", url: "https://ucdreams.com" }],
  creator: "UCDREAMS",
  publisher: "myLeads by UCDREAMS",
  formatDetection: {
    email: false,
    address: false,
    telephone: false
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "32x32" }
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png"
  },
  openGraph: {
    title: "myLeads — Autonomous B2B Lead Harvester & Client Engine",
    description: "Harvest high-converting B2B leads across 13 discovery channels with automated technical audits & 1-click cold outreach.",
    url: "https://myleads.ucdreams.com",
    siteName: "myLeads",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "myLeads - Autonomous B2B Lead Harvester & Client Acquisition Engine"
      }
    ],
    locale: "en_US",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "myLeads — Autonomous B2B Lead Harvester & Client Engine",
    description: "Harvest high-converting B2B leads across 13 discovery channels with automated technical audits & 1-click cold outreach.",
    images: ["/og-image.png"]
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1
    }
  }
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "name": "myLeads",
      "url": "https://myleads.ucdreams.com",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "All",
      "description": "Autonomous multi-channel B2B lead discovery and client acquisition engine with real-time website technical auditing and personalized cold outreach.",
      "author": {
        "@type": "Person",
        "name": "Uchit Chakma",
        "url": "https://ucdreams.com"
      },
      "publisher": {
        "@type": "Organization",
        "name": "UCDREAMS",
        "url": "https://ucdreams.com",
        "logo": "https://myleads.ucdreams.com/icon.png"
      },
      "offers": {
        "@type": "Offer",
        "price": "0.00",
        "priceCurrency": "USD"
      }
    },
    {
      "@type": "Organization",
      "name": "myLeads",
      "url": "https://myleads.ucdreams.com",
      "logo": "https://myleads.ucdreams.com/icon.png",
      "sameAs": [
        "https://ucdreams.com"
      ]
    }
  ]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="alternate icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[var(--bg-main)] text-[var(--text-main)]">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
