import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import Layout from "@/components/layout/Layout";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ACM@JHU",
  description: "Johns Hopkins University ACM Chapter",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} antialiased`}>
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}
