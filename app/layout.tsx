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
  title: "Blubeez - Your Travel Assistant",
  description: "Create your perfect itinerary by just chatting with us",
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