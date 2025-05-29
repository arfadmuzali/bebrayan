import { auth } from "@/lib/auth";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Login - Bebrayan",
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

export default async function AuthLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const session = await auth();

  if (session) {
    redirect("/");
  }

  return <>{children}</>;
}
