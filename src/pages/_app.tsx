import type { AppProps } from "next/app";
import { DM_Sans } from "next/font/google";
import Layout from "@/components/layout/Layout";
import "@/styles/globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className={`${dmSans.variable} font-sans antialiased`}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </div>
  );
}
