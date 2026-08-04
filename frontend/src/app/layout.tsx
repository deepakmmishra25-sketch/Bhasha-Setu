import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: {
    default: "BhashaSetu AI — India's Multilingual Business AI Platform",
    template: "%s | BhashaSetu AI",
  },
  description:
    "BhashaSetu AI helps rural entrepreneurs, farmers, MSMEs, students, and small businesses grow using AI-powered mentorship in 13 Indian languages.",
  keywords: [
    "BhashaSetu", "multilingual AI", "India", "rural entrepreneurs",
    "MSME", "Hindi AI", "business mentor", "government schemes",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
