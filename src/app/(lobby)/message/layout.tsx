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
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { BookUser } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import Pusher from "pusher-js";
import { ReactNode, useEffect, useState } from "react";

export interface Chat {
  id: string;
  user1Id: string;
  user2Id: string;
  createdAt: Date;
  messages: Message[];
  user1: User;
  user2: User;
}

export interface Message {
  id: string;
  isRead: boolean;
  userId: string;
}

export interface PusherMessage {
  id: string;
  content: string;
  userId: string;
  chatId: string;
  isRead: boolean;
  createdAt: Date;
}

export interface User {
  image: string;
  name: string;
  id: string;
}

export default function MessageLayout({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  const [isContactOpen, setIsContactOpen] = useState(false);

  const { data: chats } = useQuery({
    queryKey: ["chats"],
    queryFn: async () => {
      const response = await axios.get<Chat[]>("/api/chat");

      return response.data;
    },
  });

  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY ?? "", {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER ?? "",
    });

    const channel = pusher.subscribe(session?.user?.id ?? "");

    channel.bind("chat", (data: PusherMessage) => {
      queryClient.setQueryData(["chat", data.chatId], (oldData: Chat) => {
        const newData: Chat = {
          ...oldData,
          messages: [...oldData.messages, data],
        };
        return newData;
      });

      queryClient.setQueryData(["chats"], (oldData: Chat[]) => {
        const newData: Chat[] = oldData.map((chat) => {
          if (chat.id === data.chatId) {
            return {
              ...chat,
              messages: [...chat.messages, data],
            };
          }
          return chat;
        });
        return newData;
      });
    });

    return () => {
      channel.unsubscribe();
      channel.unbind(session?.user?.id ?? "");
      pusher.disconnect();
    };
  }, [session?.user?.id, queryClient]);
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
                const unread = chat.messages.filter(
                  (message) =>
                    message.isRead == false &&
                    message.userId !== session?.user?.id
                );

                return (
                  <div
                    key={chat.id}
                    onClick={() => {
                      setIsContactOpen(false);
                    }}
                  >
                    <User
                      unread={unread.length}
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
              const unread = chat.messages.filter(
                (message) =>
                  message.isRead == false &&
                  message.userId !== session?.user?.id
              );
              return (
                <User
                  unread={unread.length}
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
  unread,
}: {
  image: string;
  name: string;
  id: string;
  unread: number;
}) {
  return (
    <Link
      href={"/message/" + id}
      className="flex gap-2 p-2 items-center border-b justify-between border-muted hover:bg-muted"
    >
      <div className="flex gap-2 items-center">
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
      </div>
      {!!unread && (
        <div className="items-center justify-end px-2 flex ">
          <span className="bg-destructive  rounded-full p-1 text-center text-xs w-6 h-6">
            {unread}
          </span>
        </div>
      )}
    </Link>
  );
}
