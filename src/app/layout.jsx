import RootLayout from "@/components/layout/RootLayout";
import { JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata = {
  metadataBase: new URL('https://berztech.com'),
  title: {
    template: "%s | Berztech Inc.",
    default: "Berztech Inc. - Engineering Digital Excellence",
  },
  description: "Boutique development agency specializing in high-performance web applications, digital transformation, and scalable software solutions.",
  keywords: ["web development", "software engineering", "next.js", "react", "digital transformation", "app development", "boutique agency"],
  authors: [{ name: "Berztech Inc." }],
  creator: "Berztech Inc.",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://berztech.com",
    title: "Berztech Inc. - Engineering Digital Excellence",
    description: "Boutique development agency specializing in high-performance web applications and digital transformation.",
    siteName: "Berztech Inc.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Berztech Inc. - Engineering Digital Excellence",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Berztech Inc. - Engineering Digital Excellence",
    description: "Boutique development agency specializing in high-performance web applications and digital transformation.",
    images: ["/og-image.jpg"],
    creator: "@berztech",
  },
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
};

export default function Layout({ children }) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} h-full bg-neutral-950 text-base antialiased`}
    >
      <body className="flex min-h-full flex-col bg-neutral-950">
        <RootLayout>{children}</RootLayout>
      </body>
    </html>
  );
}
