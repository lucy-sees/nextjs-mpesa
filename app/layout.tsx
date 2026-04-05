/**
 * Root layout — kept minimal so this integrates cleanly into an existing
 * Next.js application. Add your existing <Header>, <Footer>, providers,
 * GSAP context, etc. here as needed.
 * @author lucysees
 */

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "M-Pesa Payments",
    template: "%s | M-Pesa Payments",
  },
  description: "Secure M-Pesa payments powered by Safaricom Daraja API v3.0.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
