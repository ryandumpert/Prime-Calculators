import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Analytics } from "@/components/analytics";
import "./globals.css";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Non-QM Deal Calculators | Prime Loan Advisors",
  description:
    "Instant cashflow and profit insights for DSCR, Fix & Flip, refinance scenarios, bridge loans, and BRRRR strategy. Free Non-QM mortgage calculators.",
  keywords: [
    "DSCR calculator",
    "fix and flip calculator",
    "Non-QM mortgage",
    "bridge loan calculator",
    "BRRRR calculator",
    "investment property calculator",
    "cashflow calculator",
    "mortgage calculator",
  ],
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "Non-QM Deal Calculators | Prime Loan Advisors",
    description:
      "Instant cashflow and profit insights for DSCR, Fix & Flip, refinance scenarios, bridge loans, and BRRRR strategy.",
    images: ["/logo.png"],
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased`}>
        <TooltipProvider delayDuration={200}>{children}</TooltipProvider>
        <Analytics />
      </body>
    </html>
  );
}
