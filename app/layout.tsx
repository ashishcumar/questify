import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = { themeColor: "#6366f1" };

export const metadata: Metadata = {
  title: "Questify — Headless Questionnaire Engine",
  description:
    "Zero-dependency questionnaire state machine for React, Vue, and vanilla JS. Compound conditional logic, per-type validation, step & all mode. Headless — no UI shipped.",
  keywords: [
    "questionnaire", "survey", "multi-step form", "headless", "react hook",
    "vue composable", "conditional logic", "typescript", "form engine",
  ],
  openGraph: {
    type: "website",
    url: "https://questify.renderlog.in",
    title: "Questify — Headless Questionnaire Engine",
    description:
      "Zero-dependency questionnaire engine for React, Vue, and vanilla JS. Bring your own UI, questify handles the rest.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Questify — Headless Questionnaire Engine",
    description: "Zero-dependency questionnaire engine. Conditional logic, validation, step & all mode.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
