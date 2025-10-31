import type { Metadata } from "next";
import { Bricolage_Grotesque, Poppins } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import Script from "next/script";
import "./globals.css";

const bricolageGrotesque = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage-grotesque",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-poppins",
  display: "swap",
});

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
    <ClerkProvider
      appearance={{
        layout: {
          socialButtonsPlacement: "top",
          socialButtonsVariant: "blockButton",
          logoPlacement: "none",
        },
        variables: {
          colorPrimary: "#2f4f93",
          colorText: "#132341",
          colorTextSecondary: "#7286b0",
          colorBackground: "#ffffff",
          colorInputBackground: "#ffffff",
          colorInputText: "#132341",
          borderRadius: "16px",
          fontFamily: "var(--font-poppins)",
          fontFamilyButtons: "var(--font-bricolage-grotesque)",
        },
        elements: {
          rootBox: {
            width: "100%",
          },
          card: {
            backgroundColor: "#ffffff",
            boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
            borderRadius: "16px",
            padding: "32px",
            maxWidth: "400px",
            width: "100%",
          },
          headerTitle: {
            fontFamily: "var(--font-bricolage-grotesque)",
            fontSize: "28px",
            fontWeight: "600",
            color: "#2f4f93",
            textAlign: "center",
          },
          headerSubtitle: {
            fontFamily: "var(--font-poppins)",
            fontSize: "14px",
            fontWeight: "400",
            color: "#7286b0",
            textAlign: "center",
            marginTop: "8px",
            lineHeight: "1.5",
          },
          socialButtonsBlockButton: {
            borderRadius: "12px",
            border: "1px solid #d5d5d5",
            backgroundColor: "#ffffff",
            color: "#132341",
            fontFamily: "var(--font-poppins)",
            fontSize: "14px",
            padding: "12px 16px",
            height: "48px",
            "&:hover": {
              backgroundColor: "#f5f5f5",
              borderColor: "#2f4f93",
            },
          },
          socialButtonsBlockButtonText: {
            fontFamily: "var(--font-poppins)",
            fontSize: "14px",
            fontWeight: "500",
          },
          dividerLine: {
            backgroundColor: "#d5d5d5",
            height: "1px",
          },
          dividerText: {
            fontFamily: "var(--font-poppins)",
            fontSize: "12px",
            color: "#807f7f",
            textTransform: "capitalize",
          },
          formFieldInput: {
            borderRadius: "12px",
            border: "1px solid #cbcbcb",
            padding: "12px 16px",
            fontSize: "14px",
            fontFamily: "var(--font-poppins)",
            backgroundColor: "#ffffff",
            height: "48px",
            "&:focus": {
              borderColor: "#2f4f93",
              outline: "none",
              boxShadow: "0 0 0 1px #2f4f93",
            },
          },
          formFieldLabel: {
            fontFamily: "var(--font-poppins)",
            fontSize: "12px",
            color: "#132341",
            marginBottom: "6px",
            fontWeight: "500",
          },
          formButtonPrimary: {
            backgroundColor: "#2f4f93",
            borderRadius: "12px",
            padding: "12px 16px",
            fontSize: "16px",
            fontWeight: "500",
            fontFamily: "var(--font-bricolage-grotesque)",
            textTransform: "none",
            height: "48px",
            "&:hover": {
              backgroundColor: "#234080",
            },
          },
          footerActionLink: {
            color: "#2f4f93",
            fontFamily: "var(--font-poppins)",
            fontSize: "14px",
            textDecoration: "underline",
            "&:hover": {
              color: "#234080",
            },
          },
          footerActionText: {
            fontFamily: "var(--font-poppins)",
            fontSize: "14px",
            color: "#807f7f",
          },
          identityPreviewText: {
            fontFamily: "var(--font-poppins)",
          },
          identityPreviewEditButton: {
            color: "#2f4f93",
          },
          formFieldInputShowPasswordButton: {
            color: "#2f4f93",
          },
          otpCodeFieldInput: {
            borderColor: "#cbcbcb",
            borderRadius: "12px",
            "&:focus": {
              borderColor: "#2f4f93",
            },
          },
          modalBackdrop: {
            backdropFilter: "blur(2px)",
            backgroundColor: "rgba(0, 0, 0, 0.2)",
          },
          modalCloseButton: {
            color: "#132341",
            "&:hover": {
              backgroundColor: "#f5f5f5",
            },
          },
        },
      }}
      localization={{
        signIn: {
          start: {
            title: "Log in or sign up",
            subtitle: "Sign up to explore, connect, and be part of our growing community.",
            actionText: "Don't have an account?",
            actionLink: "Sign up",
          },
        },
        signUp: {
          start: {
            title: "Log in or sign up",
            subtitle: "Sign up to explore, connect, and be part of our growing community.",
            actionText: "Already have an account?",
            actionLink: "Log in",
          },
        },
      }}
    >
      <html lang="en">
        <body
          className={`${bricolageGrotesque.variable} ${poppins.variable} antialiased`}
        >
          {/* Google Analytics */}
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
