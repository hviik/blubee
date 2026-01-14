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
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#132341' },
  ],
};

const siteUrl = "https://www.blubeez.ai";
const siteName = "Blubeez";
const siteDescription = "Plan your perfect vacation with Blubeez, your AI-powered travel assistant. Create personalized day-by-day itineraries, discover amazing destinations, search and book hotels, and design custom travel plans through natural conversation. Explore Vietnam, Bali, Thailand, Peru, Maldives, and 190+ countries worldwide.";
const shortDescription = "AI-powered travel assistant that creates personalized itineraries, finds hotels, and helps you plan the perfect trip through natural conversation.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Blubeez | AI Travel Assistant - Plan Your Perfect Trip",
    template: "%s | Blubeez - AI Travel Planner"
  },
  description: siteDescription,
  keywords: [
    // Primary keywords
    "AI travel assistant",
    "AI trip planner",
    "travel planning AI",
    "smart travel planner",
    "AI itinerary generator",
    "personalized travel planning",
    // Action keywords
    "plan my trip",
    "create travel itinerary",
    "book hotels online",
    "find vacation destinations",
    "travel recommendations",
    // Feature keywords
    "day-by-day itinerary",
    "custom travel plans",
    "hotel search",
    "travel chatbot",
    "interactive travel map",
    // Destination keywords
    "Asia travel planner",
    "Europe trip planning",
    "South America vacations",
    "Vietnam travel guide",
    "Bali trip planner",
    "Thailand vacation",
    "Maldives holiday packages",
    "Peru travel itinerary",
    "Japan trip planner",
    "India travel guide",
    // Long-tail keywords
    "best AI for travel planning",
    "free trip planner app",
    "vacation planning assistant",
    "travel budget planner",
    "family vacation planner",
    "honeymoon trip planner",
    "solo travel planning",
    "backpacking trip planner"
  ],
  authors: [{ name: siteName, url: siteUrl }],
  creator: siteName,
  publisher: siteName,
  applicationName: "Blubeez",
  generator: "Next.js",
  referrer: "origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: siteUrl,
    languages: {
      'en-US': siteUrl,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: siteName,
    title: "Blubeez | AI Travel Assistant - Plan Your Perfect Trip",
    description: shortDescription,
    images: [
      {
        url: `${siteUrl}/api/og?title=${encodeURIComponent('AI Travel Assistant')}&description=${encodeURIComponent('Plan your perfect trip with personalized itineraries, hotel search, and expert recommendations')}`,
        width: 1200,
        height: 630,
        alt: "Blubeez - AI Travel Assistant",
        type: "image/png",
      },
    ],
    countryName: "United States",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blubeez | AI Travel Assistant - Plan Your Perfect Trip",
    description: shortDescription,
    images: [`${siteUrl}/api/og?title=${encodeURIComponent('AI Travel Assistant')}&description=${encodeURIComponent('Plan your perfect trip with personalized itineraries')}`],
    creator: "@blubeez",
    site: "@blubeez",
  },
  verification: {
    google: "google-site-verification-code",
    // Add other verifications as needed
    // yandex: "yandex-verification-code",
    // bing: "bing-verification-code",
  },
  category: "travel",
  classification: "Travel & Tourism",
  icons: {
    icon: [
      { url: '/assets/favicon/favicon.ico', sizes: 'any' },
      { url: '/assets/favicon/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/assets/favicon/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/assets/favicon/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'mask-icon', url: '/assets/favicon/safari-pinned-tab.svg', color: '#2d4e92' },
    ],
  },
  manifest: '/assets/favicon/site.webmanifest',
  appleWebApp: {
    capable: true,
    title: siteName,
    statusBarStyle: 'default',
  },
  other: {
    'msapplication-TileColor': '#2d4e92',
    'msapplication-config': '/assets/favicon/browserconfig.xml',
  },
};

// JSON-LD Structured Data
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    // Organization
    {
      '@type': 'Organization',
      '@id': `${siteUrl}/#organization`,
      name: siteName,
      url: siteUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/assets/logo.svg`,
        width: 112,
        height: 80,
      },
      sameAs: [
        'https://twitter.com/blubeez',
        // Add other social profiles
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        availableLanguage: 'English',
      },
    },
    // WebSite
    {
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      url: siteUrl,
      name: siteName,
      description: shortDescription,
      publisher: {
        '@id': `${siteUrl}/#organization`,
      },
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${siteUrl}/?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
      inLanguage: 'en-US',
    },
    // SoftwareApplication
    {
      '@type': 'SoftwareApplication',
      '@id': `${siteUrl}/#app`,
      name: 'Blubeez AI Travel Assistant',
      description: siteDescription,
      url: siteUrl,
      applicationCategory: 'TravelApplication',
      operatingSystem: 'Web Browser',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.8',
        ratingCount: '150',
        bestRating: '5',
        worstRating: '1',
      },
      featureList: [
        'AI-powered trip planning',
        'Personalized itinerary generation',
        'Hotel search and booking',
        'Interactive travel maps',
        'Destination discovery',
        'Trip saving and management',
        'Natural language conversation',
      ],
    },
    // WebPage (Home)
    {
      '@type': 'WebPage',
      '@id': `${siteUrl}/#webpage`,
      url: siteUrl,
      name: 'Blubeez | AI Travel Assistant - Plan Your Perfect Trip',
      description: shortDescription,
      isPartOf: {
        '@id': `${siteUrl}/#website`,
      },
      about: {
        '@id': `${siteUrl}/#app`,
      },
      primaryImageOfPage: {
        '@type': 'ImageObject',
        url: `${siteUrl}/og-image.png`,
      },
      inLanguage: 'en-US',
    },
    // FAQPage
    {
      '@type': 'FAQPage',
      '@id': `${siteUrl}/#faq`,
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What is Blubeez?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Blubeez is an AI-powered travel assistant that helps you plan personalized trip itineraries through natural conversation. Simply chat with our AI agent "blu" about where you want to go, and get a complete day-by-day travel plan with hotels, activities, and restaurants.',
          },
        },
        {
          '@type': 'Question',
          name: 'How does Blubeez help me plan my trip?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Blubeez uses AI to understand your travel preferences, budget, and interests. Through a friendly chat conversation, it creates customized itineraries, searches for hotels that match your criteria, shows interactive maps of your destinations, and helps you discover the best attractions and restaurants.',
          },
        },
        {
          '@type': 'Question',
          name: 'Is Blubeez free to use?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes! Blubeez is free to use for trip planning and itinerary creation. You can chat with our AI assistant, create unlimited itineraries, and explore destinations at no cost. Hotel bookings are made through Booking.com at their standard rates.',
          },
        },
        {
          '@type': 'Question',
          name: 'Which destinations can I plan trips to?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Blubeez supports trip planning to destinations worldwide, including popular locations in Asia (Vietnam, Thailand, Bali, Japan, India), Europe, South America (Peru, Brazil), the Maldives, and over 190 countries globally.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I book hotels through Blubeez?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes! Blubeez integrates with Booking.com to help you search and compare hotels. You can filter by price, rating, and amenities, then book directly through Booking.com with their best price guarantee.',
          },
        },
      ],
    },
    // BreadcrumbList
    {
      '@type': 'BreadcrumbList',
      '@id': `${siteUrl}/#breadcrumb`,
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: siteUrl,
        },
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider appearance={clerkAppearance} localization={clerkLocalization}>
      <html lang="en" dir="ltr">
        <head>
          {/* Structured Data */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
          {/* Preconnect to external domains for performance */}
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link rel="preconnect" href="https://www.googletagmanager.com" />
          <link rel="dns-prefetch" href="https://maps.googleapis.com" />
          <link rel="dns-prefetch" href="https://booking-com.p.rapidapi.com" />
          {/* Additional meta for AI/LLM indexing */}
          <meta name="ai-content-declaration" content="This website provides AI-powered travel planning services. Content is generated to help users plan trips." />
          <meta name="llms" content="/llms.txt" />
        </head>
        <body
          className={`${bricolageGrotesque.variable} ${poppins.variable} antialiased`}
        >
          {/* Skip to main content for accessibility */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-blue-600 focus:rounded-lg focus:shadow-lg"
          >
            Skip to main content
          </a>
          
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
              gtag('config', 'G-WHKJFJSQRW', {
                page_title: document.title,
                page_location: window.location.href,
              });
            `}
          </Script>
          
          <main id="main-content">
            {children}
          </main>
        </body>
      </html>
    </ClerkProvider>
  );
}
