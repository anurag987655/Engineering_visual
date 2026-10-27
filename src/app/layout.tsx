import type { Metadata } from "next";
import { Fraunces, Nunito, JetBrains_Mono } from "next/font/google";
import "katex/dist/katex.min.css";
import "./globals.css";
import { SiteNav } from "@/components/layout/site-nav";
import { SiteFooter } from "@/components/layout/site-footer";
import { ProgressProvider } from "@/lib/progress/provider";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "Engineering Visual",
    template: "%s · Engineering Visual",
  },
  description:
    "Intuition-first lessons for engineering students: every concept starts as a picture and ends as a tool.",
  applicationName: "Engineering Visual",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    type: "website",
    siteName: "Engineering Visual",
    title: "Engineering Visual",
    description:
      "Intuition-first lessons for engineering students: every concept starts as a picture and ends as a tool.",
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    title: "Engineering Visual",
    description:
      "Intuition-first lessons for engineering students: every concept starts as a picture and ends as a tool.",
  },
};

export const viewport = {
  themeColor: "#F7EBE1",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${nunito.variable} ${fraunces.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ProgressProvider>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[200] focus:rounded-full focus:border focus:border-[#181515] focus:bg-[#FBF4EC] focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-[#181515]"
          >
            Skip to content
          </a>
          <SiteNav />
          <main id="main" className="flex-1">
            {children}
          </main>
          <SiteFooter />
        </ProgressProvider>
      </body>
    </html>
  );
}