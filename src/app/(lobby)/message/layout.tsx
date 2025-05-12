"use client";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { BookUser } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { ReactNode, useState } from "react";

export interface Chat {
  id: string;
  user1Id: string;
  user2Id: string;
  createdAt: Date;
  user1: User;
  user2: User;
}

export interface User {
  image: string;
  name: string;
  id: string;
}

export default function MessageLayout({ children }: { children: ReactNode }) {
  const { data: session } = useSession();

  const [isContactOpen, setIsContactOpen] = useState(false);

  const { data: chats } = useQuery({
    queryKey: ["chats"],
    queryFn: async () => {
      const response = await axios.get<Chat[]>("/api/chat");

      return response.data;
    },
  });

  return (
    <div className="max-w-screen-2xl mx-auto px-2 md:px-12 lg:px-16 md:h-[85vh] h-[80vh]">
      <Sheet open={isContactOpen} onOpenChange={setIsContactOpen}>
        <SheetTrigger
          className="pb-1 w-full flex justify-end items-end md:hidden"
          asChild
        >
          <div>
            <BookUser />
          </div>
        </SheetTrigger>
        <SheetContent className="p-0">
          <VisuallyHidden>
            <SheetTitle></SheetTitle>
            <SheetDescription></SheetDescription>
          </VisuallyHidden>
          <div className="flex flex-col">
            <div className="border-b border-muted p-2">
              <Input placeholder="Search user..." />
            </div>
            <div className="overflow-y-auto w-full md:h-[75vh] h-[70vh]">
              {chats?.map((chat) => {
                return (
                  <div
                    key={chat.id}
                    onClick={() => {
                      setIsContactOpen(false);
                    }}
                  >
                    <User
                      id={chat.id}
                      image={
                        session?.user?.id !== chat.user1Id
                          ? chat.user1.image
                          : chat.user2.image
                      }
                      name={
                        session?.user?.id !== chat.user1Id
                          ? chat.user1.name
                          : chat.user2.name
                      }
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </SheetContent>
      </Sheet>
      <div className="border rounded-md border-primary flex h-full">
        {/* user list */}
        <div className="hidden md:flex min-w-96 max-w-[26rem] border-r-2 border-muted flex-col">
          <div className="border-b border-muted p-2">
            <Input placeholder="Search user..." />
          </div>
          <div className="overflow-y-auto w-full md:h-[75vh] h-[70vh]">
            {chats?.map((chat) => {
              return (
                <User
                  key={chat.id}
                  id={chat.id}
                  image={
                    session?.user?.id !== chat.user1Id
                      ? chat.user1.image
                      : chat.user2.image
                  }
                  name={
                    session?.user?.id !== chat.user1Id
                      ? chat.user1.name
                      : chat.user2.name
                  }
                />
              );
            })}
          </div>
        </div>
        {/* message */}

        <div className="w-full h-full">{children}</div>
      </div>
    </div>
  );
}

function User({
  image,
  name,
  id,
}: {
  image: string;
  name: string;
  id: string;
}) {
  return (
    <Link
      href={"/message/" + id}
      className="flex gap-2 p-2 items-center border-b border-muted hover:bg-muted"
    >
      <div className="relative h-12 w-12">
        <Image
          src={image ?? "/avatar-placeholder.svg"}
          alt={name}
          fill
          sizes="3rem"
          className="rounded-full"
        />
      </div>
      <h3 className="text-lg">{name}</h3>
    </Link>
  );
}
