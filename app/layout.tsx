import type { Metadata } from "next";
import { Fraunces, Poppins } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { site } from "@/data/site";

const bodyFont = Poppins({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const displayFont = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} | Healthy Ageing & Elderly Care in Nigeria`,
    template: `%s | ${site.name}`,
  },
  description:
    "Healthy Golden Years Initiative promotes healthy ageing, preventive health and self-care for older adults across Nigeria through community health outreach, education and elderly support programs.",
  keywords: [
    "healthy ageing Nigeria",
    "elderly care Nigeria",
    "preventive health Nigeria",
    "healthy ageing programs",
    "elderly support Nigeria",
    "senior citizen health Nigeria",
    "community health outreach",
    "elderly wellness Nigeria",
    "self-care for older adults",
    "NGO elderly care Nigeria",
  ],
  authors: [{ name: site.name }],
  openGraph: {
    type: "website",
    locale: site.locale,
    url: site.url,
    siteName: site.name,
    title: `${site.name} | Healthy Ageing & Elderly Care in Nigeria`,
    description: site.tagline,
    images: [{ url: "/image/logo.jpg", width: 1200, height: 1200, alt: site.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} | Healthy Ageing & Elderly Care in Nigeria`,
    description: site.tagline,
    images: ["/image/logo.jpg"],
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NGO",
    name: site.name,
    url: site.url,
    logo: `${site.url}/image/logo.jpg`,
    description: site.mission,
    slogan: site.tagline,
    areaServed: "Nigeria",
    address: {
      "@type": "PostalAddress",
      addressCountry: "NG",
    },
  };

  return (
    <html
      lang="en"
      className={`${bodyFont.variable} ${displayFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-cream">
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Navbar />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
