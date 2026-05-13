import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = { themeColor: "#6366f1" };

export const metadata: Metadata = {
  title: "Questify — Headless Questionnaire Engine",
  description:
    "Interactive playground for questify — a zero-dependency, headless questionnaire state machine for React, Vue, and Vanilla JS.",
  openGraph: {
    type: "website",
    title: "Questify — Headless Questionnaire Engine",
    description: "Zero-dependency questionnaire engine. Works everywhere.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
