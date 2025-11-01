import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import Script from "next/script";
import "./globals.css";
import { clerkAppearance, clerkLocalization } from "./clerkConfig";
import { bricolageGrotesque, poppins } from "./fonts";

export const metadata: Metadata = {
  title: "Blubeez - Your Travel Assistant",
  description: "Create your perfect itinerary by just chatting with us",
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