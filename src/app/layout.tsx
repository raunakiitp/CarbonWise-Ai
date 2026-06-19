import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";

export const metadata: Metadata = {
  title: {
    default: "CarbonWise AI — Your Personal Sustainability Coach",
    template: "%s | CarbonWise AI",
  },
  description:
    "Track, understand, and reduce your carbon footprint with AI-powered personalized insights. CarbonWise AI makes sustainability simple, measurable, and engaging.",
  keywords: [
    "carbon footprint",
    "sustainability",
    "climate change",
    "carbon tracker",
    "eco-friendly",
    "green living",
    "AI sustainability coach",
    "carbon calculator",
  ],
  authors: [{ name: "CarbonWise AI" }],
  creator: "CarbonWise AI",
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: process.env.NEXT_PUBLIC_APP_URL,
    title: "CarbonWise AI — Your Personal Sustainability Coach",
    description: "AI-powered carbon footprint tracker and sustainability coach",
    siteName: "CarbonWise AI",
  },
  twitter: {
    card: "summary_large_image",
    title: "CarbonWise AI",
    description: "AI-powered carbon footprint tracker",
  },
  robots: { index: true, follow: true },
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0f1e" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        {/* Accessibility: skip to main content */}
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
