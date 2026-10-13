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
  title: {
    default: "Engineering Visual",
    template: "%s · Engineering Visual",
  },
  description:
    "Intuition-first lessons for engineering students: every concept starts as a picture and ends as a tool.",
  icons: {
    icon: "/favicon.ico",
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
          <SiteNav />
          <div className="flex-1">{children}</div>
          <SiteFooter />
        </ProgressProvider>
      </body>
    </html>
  );
}