import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import Script from "next/script";
import "./globals.css";
import { clerkAppearance, clerkLocalization } from "./clerkConfig";
import { bricolageGrotesque, poppins } from "./fonts";

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: {
    default: "Blubeez | AI Travel Assistant & Trip Planner",
    template: "%s | Blubeez"
  },
  description: "Plan your perfect vacation with Blubeez, your AI-powered travel assistant. Create personalized itineraries, discover destinations, and book trips to Vietnam, Malaysia, Peru, Philippines, Brazil, India, Maldives, and Laos. Chat with AI to design custom travel plans in minutes.",
  keywords: [
    "travel assistant",
    "AI travel planner",
    "trip planning",
    "vacation planner",
    "itinerary builder",
    "travel chatbot",
    "personalized travel",
    "custom itinerary",
    "travel destinations",
    "vacation packages",
    "Asia travel",
    "South America travel",
    "Vietnam tours",
    "Malaysia vacation",
    "Peru travel",
    "Philippines holiday",
    "Brazil trips",
    "India tours",
    "Maldives packages",
    "Laos travel",
    "AI trip planner",
    "smart travel planning",
    "destination explorer",
    "travel booking",
    "vacation ideas"
  ],
  authors: [{ name: "Blubeez" }],
  creator: "Blubeez",
  publisher: "Blubeez",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: "https://www.blubeez.ai"
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.blubeez.ai",
    siteName: "Blubeez",
    title: "Blubeez | AI Travel Assistant & Trip Planner",
    description: "Plan your perfect vacation with Blubeez AI travel assistant. Create personalized itineraries and explore amazing destinations worldwide.",
    images: [
      {
        url: "/assets/logo.svg",
        width: 1200,
        height: 630,
        alt: "Blubeez Travel Assistant"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Blubeez | AI Travel Assistant & Trip Planner",
    description: "Plan your perfect vacation with Blubeez AI travel assistant. Create personalized itineraries and explore amazing destinations worldwide.",
    images: ["/assets/logo.svg"],
    creator: "@blubeez"
  },
  verification: {
    google: "google-site-verification-code"
  },
  category: "travel",
  icons: {
    icon: [
      { url: '/assets/favicon/favicon.ico' },
      { url: '/assets/favicon/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/assets/favicon/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/assets/favicon/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'android-chrome', url: '/assets/favicon/android-chrome-192x192.png', sizes: '192x192' },
      { rel: 'android-chrome', url: '/assets/favicon/android-chrome-512x512.png', sizes: '512x512' },
    ],
  },
  manifest: '/assets/favicon/site.webmanifest',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider appearance={clerkAppearance} localization={clerkLocalization}>
      <html lang="en">
        <body
          className={`${bricolageGrotesque.variable} ${poppins.variable} antialiased`}
        >
          <Script
            src="https://www.googletagmanager.com/gtag/js?id=G-WHKJFJSQRW"
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-WHKJFJSQRW');
            `}
          </Script>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}