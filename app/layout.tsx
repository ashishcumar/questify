import type { Metadata, Viewport } from "next";
import "./globals.css";

const BASE_URL = "https://questify.renderlog.in";

// ── Viewport ──────────────────────────────────────────────────────────────────
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#6366f1" },
    { media: "(prefers-color-scheme: dark)",  color: "#818cf8" },
  ],
  colorScheme: "light dark",
  width: "device-width",
  initialScale: 1,
};

// ── Metadata ──────────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),

  title: {
    default: "Questify — Headless Questionnaire Engine",
    template: "%s | Questify",
  },
  description:
    "Zero-dependency questionnaire state machine for React, Vue, and vanilla JS. Compound conditional logic, per-type validation, step & all mode. Headless — no UI shipped.",

  keywords: [
    "questionnaire engine", "survey library", "multi-step form",
    "headless form", "react hook form", "vue composable",
    "conditional logic", "branching form", "form wizard",
    "dynamic form", "typescript form", "step form",
    "questify", "form state machine",
  ],

  authors: [
    { name: "Ashish Kumar", url: "https://github.com/ashishcumar" },
  ],

  creator: "Ashish Kumar",
  publisher: "Ashish Kumar",

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },

  alternates: {
    canonical: BASE_URL,
  },

  // ── Open Graph ──────────────────────────────────────────────────────────────
  openGraph: {
    type: "website",
    url: BASE_URL,
    siteName: "Questify",
    title: "Questify — Headless Questionnaire Engine",
    description:
      "Zero-dependency questionnaire engine for React, Vue, and vanilla JS. Bring your own UI — questify handles state, branching, and validation.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Questify — Headless Questionnaire Engine",
        type: "image/png",
      },
    ],
    locale: "en_US",
  },

  // ── Twitter / X ─────────────────────────────────────────────────────────────
  twitter: {
    card: "summary_large_image",
    title: "Questify — Headless Questionnaire Engine",
    description:
      "Zero-dependency questionnaire engine. Conditional logic, validation, step & all mode. Works with React, Vue, or vanilla JS.",
    creator: "@ashishcumar",
    images: ["/opengraph-image"],
  },

  // ── Manifest (declared here too for discoverability) ─────────────────────────
  manifest: "/manifest.webmanifest",

  // ── App metadata ────────────────────────────────────────────────────────────
  applicationName: "Questify",
  category: "technology",
  classification: "Developer Tools",
  referrer: "origin-when-cross-origin",
};

// ── JSON-LD structured data ───────────────────────────────────────────────────
const jsonLd = [
  // SoftwareApplication — tells Google this is an npm package / dev tool
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "questify",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Any",
    description:
      "Zero-dependency headless questionnaire state machine for React, Vue, and vanilla JS.",
    url: BASE_URL,
    downloadUrl: "https://npmjs.com/package/questify",
    softwareVersion: "1.0.0",
    license: "https://opensource.org/licenses/MIT",
    programmingLanguage: "TypeScript",
    codeRepository: "https://github.com/ashishcumar/questify",
    author: {
      "@type": "Person",
      name: "Ashish Kumar",
      url: "https://github.com/ashishcumar",
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  },
  // WebSite — enables Google Sitelinks search box + breadcrumbs
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Questify",
    url: BASE_URL,
    description:
      "Headless questionnaire engine for React, Vue, and vanilla JS.",
    author: {
      "@type": "Person",
      name: "Ashish Kumar",
      url: "https://github.com/ashishcumar",
    },
  },
];

// ── Layout ────────────────────────────────────────────────────────────────────
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {jsonLd.map((schema, i) => (
          <script
            key={i}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
          />
        ))}
      </head>
      <body>{children}</body>
    </html>
  );
}
