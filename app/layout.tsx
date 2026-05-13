import type { Metadata, Viewport } from "next";
import "./globals.css";

const BASE_URL = "https://questify.renderlog.in";

export const viewport: Viewport = { themeColor: "#6366f1" };

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: "Questify — Headless Questionnaire Engine",
  description:
    "Zero-dependency questionnaire state machine for React, Vue, and vanilla JS. Compound conditional logic, per-type validation, step & all mode. Headless — no UI shipped.",
  keywords: [
    "questionnaire", "survey", "multi-step form", "headless form engine",
    "react hook", "vue composable", "conditional logic", "typescript",
    "form wizard", "step form", "dynamic form", "branching form",
  ],
  alternates: {
    canonical: BASE_URL,
  },
  openGraph: {
    type: "website",
    url: BASE_URL,
    siteName: "Questify",
    title: "Questify — Headless Questionnaire Engine",
    description:
      "Zero-dependency questionnaire engine for React, Vue, and vanilla JS. Bring your own UI, questify handles the rest.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Questify — Headless Questionnaire Engine",
    description: "Zero-dependency questionnaire engine. Conditional logic, validation, step & all mode.",
    creator: "@ashishcumar",
  },
};

const jsonLd = {
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
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
