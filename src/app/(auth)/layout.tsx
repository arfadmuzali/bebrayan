import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

export default async function AuthLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const session = await auth();

  if (session) {
    redirect("/");
  }

  return <>{children}</>;
}
