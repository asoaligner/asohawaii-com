import type { Metadata } from "next";
import {
  Inter,
  Fraunces,
  JetBrains_Mono,
  Source_Code_Pro,
  Source_Serif_4,
} from "next/font/google";
import "./globals.css";
import "@/styles/variants.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// Source Serif 4 — primary serif for Original variant.
// Neutral, classical letterforms (no quirky F / J / R swashes).
const serif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
  axes: ["opsz"],
});

// Fraunces — kept only for the Claude variant (/claude) which is designed
// around its distinctive warm display character. Not used on Original.
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["opsz"],
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

const sourceCode = Source_Code_Pro({
  subsets: ["latin"],
  variable: "--font-source-code",
  display: "swap",
});

const SITE_URL = "https://www.asohawaii.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "ASO International Hawaii | Digital Case Submission with EasyRx",
  description:
    "Trusted orthodontic lab in Honolulu offering clear aligners, retainers, splints, expanders, and premium digital appliances. Accepts scans from every major IOS scanner via EasyRx. HIPAA-compliant, full case history, fast turnaround.",
  keywords: [
    "ASO Hawaii",
    "EasyRx",
    "orthodontic lab",
    "digital case submission",
    "iTero",
    "Medit",
    "3Shape TRIOS",
    "Primescan",
    "DEXIS",
    "Honolulu orthodontic lab",
  ],
  authors: [{ name: "ASO International Hawaii, Inc." }],
  openGraph: {
    title: "ASO International Hawaii — Submit cases digitally with EasyRx",
    description:
      "Zero hassle digital case submission for orthodontic practices in Hawaii and beyond.",
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "ASO International Hawaii",
    images: [
      {
        url: "/images/og-default.png",
        width: 1200,
        height: 630,
        alt: "ASO International Hawaii — Honolulu orthodontic laboratory",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ASO International Hawaii",
    description:
      "Honolulu orthodontic lab — clear aligners, retainers, splints, and digital appliances with EasyRx case submission.",
    images: ["/images/og-default.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

/** JSON-LD Local Business schema — shown to Google crawlers on every page.
 * Powers rich results on Google Search, Maps, and the local pack. */
const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "MedicalBusiness",
  "@id": `${SITE_URL}/#organization`,
  name: "ASO International Hawaii, Inc.",
  alternateName: "ASO Hawaii Orthodontic Laboratory",
  description:
    "Honolulu-based orthodontic laboratory providing clear aligners, retainers, splints, expanders, and digital appliances. Digital case submission via EasyRx.",
  url: SITE_URL,
  logo: `${SITE_URL}/images/aso/aso-logo.png`,
  image: `${SITE_URL}/images/og-default.png`,
  telephone: "+1-808-957-0111",
  faxNumber: "+1-808-957-0222",
  email: "aso-digital@outlook.com",
  address: {
    "@type": "PostalAddress",
    streetAddress: "1441 Kapiolani Blvd #1112",
    addressLocality: "Honolulu",
    addressRegion: "HI",
    postalCode: "96814",
    addressCountry: "US",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 21.2931,
    longitude: -157.8438,
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
      ],
      opens: "08:00",
      closes: "16:30",
    },
  ],
  sameAs: [
    "https://www.instagram.com/aso.orthodonticslab.honolulu/",
  ],
  medicalSpecialty: "Orthodontic",
  areaServed: {
    "@type": "State",
    name: "Hawaii",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${serif.variable} ${fraunces.variable} ${jetbrains.variable} ${sourceCode.variable}`}
    >
      <body className="font-sans antialiased bg-white text-navy">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(localBusinessJsonLd),
          }}
        />
        {children}
      </body>
    </html>
  );
}
