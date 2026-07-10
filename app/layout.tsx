import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BizReach - Website Audit & Lead Generation",
  description: "Discover website issues and connect with business owners through intelligent outreach",
  keywords: "website audit, lead generation, business outreach, SEO analysis",
  authors: [{ name: "BizReach" }],
  openGraph: {
    title: "BizReach - Website Audit & Lead Generation",
    description: "Discover website issues and connect with business owners through intelligent outreach",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50`}>
        {children}
      </body>
    </html>
  );
}