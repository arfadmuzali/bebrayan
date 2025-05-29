import Nav from "@/components/layouts/nav";
import { auth } from "@/lib/auth";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Text-Based Social Media App - Bebrayan",
};

export default async function LobbyLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <>
      <Nav />
      {children}
    </>
  );
}
