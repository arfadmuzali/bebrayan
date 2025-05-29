import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { Metadata } from "next";
import { ReactNode } from "react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const session = await auth();

  const users = await prisma.chat.findUnique({
    where: {
      id,
    },
    select: {
      user1: {
        select: {
          name: true,
        },
      },
      user2: {
        select: {
          name: true,
        },
      },
    },
  });

  return {
    title: `${
      users?.user1.name === session?.user?.name
        ? users?.user2.name
        : users?.user1.name
    } - Bebrayan`,
  };
}

export default async function MessageLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return <>{children}</>;
}
