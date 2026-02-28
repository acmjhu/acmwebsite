import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { SessionProvider } from "next-auth/react";
import { DM_Sans } from "next/font/google";
import Layout from "@/components/layout/Layout";
import AdminLayout from "@/components/layout/AdminLayout";
import "@/styles/globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  const router = useRouter();
  const isAdmin = router.pathname.startsWith("/admin");

  const LayoutComponent = isAdmin ? AdminLayout : Layout;

  return (
    <SessionProvider session={session}>
      <div className={`${dmSans.variable} font-sans antialiased`}>
        <LayoutComponent>
          <Component {...pageProps} />
        </LayoutComponent>
      </div>
    </SessionProvider>
  );
}
