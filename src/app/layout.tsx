import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/layouts/theme-provider";
import { getLocale, getMessages } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import ProgressBarProvider from "@/components/layouts/progress-sidebar";
import { SessionProvider } from "next-auth/react";
import QueryProvider from "@/components/layouts/query-provider";
import { auth } from "@/lib/auth";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Bebrayan",
  description:
    "Bebrayan is a lightweight text-based social media platform to connect and share easily.",

  authors: [{ name: "Arfad Muzali" }],
  keywords: [
    "bebrayan",
    "social media",
    "text-based",
    "minimalist",
    "indonesia",
  ],
  openGraph: {
    title: "Bebrayan",
    description:
      "Join Bebrayan, a simple and clean text-based social media platform.",
    url: "https://bebrayan.vercel.app",
    siteName: "Bebrayan",
    images: [
      {
        url: "/favicon.ico",
        width: 1200,
        height: 630,
        alt: "Logo Bebrayan",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bebrayan",
    description:
      "Join Bebrayan, a simple and clean text-based social media platform.",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const session = await auth();
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${nunito.className} antialiased`}>
        <SessionProvider session={session} refetchOnWindowFocus={false}>
          <QueryProvider>
            <NextIntlClientProvider messages={messages}>
              <ProgressBarProvider>
                <ThemeProvider
                  attribute="class"
                  defaultTheme="system"
                  enableSystem
                  disableTransitionOnChange
                >
                  {children}
                </ThemeProvider>
              </ProgressBarProvider>
            </NextIntlClientProvider>
          </QueryProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
