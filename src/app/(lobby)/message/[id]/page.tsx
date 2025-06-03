"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { cn } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import axios from "axios";
import { Send } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { use, useEffect, useState } from "react";
import { toast } from "sonner";

export interface Chat {
  id: string;
  user1Id: string;
  user2Id: string;
  createdAt: Date;
  user1: User;
  user2: User;
  messages: Message[];
}

export interface Message {
  id: string;
  content: string;
  userId: string;
  chatId: string;
  isRead: boolean;
  createdAt: Date;
}

export interface User {
  id: string;
  name: string;
  image: string;
}

export default function MessageDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  const { id } = use(params);

  const { data, isLoading } = useQuery({
    queryKey: ["chat", id],
    queryFn: async () => {
      const response = await axios.get<Chat>("/api/chat/" + id);

      return response.data;
    },
    enabled: !!id,
  });

  const [message, setMessage] = useState("");

  const chatMutation = useMutation({
    mutationFn: async () => {
      const response = await axios.post("/api/chat/" + id, {
        content: message,
      });

      return response.data;
    },
    onError: async (error) => {
      toast.error(error.message);
    },
    onSuccess: async () => {
      setMessage("");
    },
  });

  useEffect(() => {
    queryClient.setQueryData(["chats"], (oldData: Chat[]) => {
      const newData = oldData?.map((chat) => {
        if (chat.id === id) {
          return {
            ...chat,
            messages: chat.messages.map((message) => ({
              ...message,
              isRead: true,
            })),
          };
        }
        return chat;
      });
      return newData;
    });
  }, [queryClient, data, id]);

  return (
    <div className="w-full h-full relative ">
      <div className="p-2 border-b gap-2 border-muted flex items-center h-[57px]">
        <div className="relative h-10 w-10 flex items-center">
          <Image
            src={
              (session?.user?.id !== data?.user1Id
                ? data?.user1.image
                : data?.user2.image) ?? "/avatar-placeholder.svg"
            }
            fill
            alt={"name"}
            sizes="3rem"
            className="rounded-full"
          />
        </div>
        <h3 className="font-semibold">
          {session?.user?.id !== data?.user1Id
            ? data?.user1.name
            : data?.user2.name}
        </h3>
      </div>

      <div className="overflow-y-auto space-y-2 p-2 md:pb-14 pb-24 max-h-[75vh]">
        {isLoading && (
          <div className="w-full h-full flex items-center justify-center">
            <LoadingSpinner className="h-12 w-12" />
          </div>
        )}

        {!data && !isLoading && (
          <div className="w-full h-full flex items-center justify-center">
            Chat not found
          </div>
        )}

        {data?.messages.map((message) => {
          return (
            <div
              key={message.id}
              className={cn(
                "w-full flex gap-2",
                message.userId !== session?.user?.id
                  ? "justify-end flex-row-reverse"
                  : "justify-end flex-row"
              )}
            >
              <div className="flex items-center justify-center text-sm">
                {format(new Date(message.createdAt), "d MMMM")}
              </div>
              <div
                className={cn(
                  "p-2 border flex gap-2 rounded-md w-fit",
                  message.userId !== session?.user?.id
                    ? "rounded-ss-none"
                    : "rounded-se-none"
                )}
              >
                <div>{message.content}</div>
                <div className="flex items-end justify-end text-xs text-muted-foreground">
                  {format(new Date(message.createdAt), "KK:mm aaa ")}
                  <span></span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!message) {
            return;
          }
          chatMutation.mutate();
        }}
        className="absolute z-20 p-2 w-full flex gap-2 bottom-0"
      >
        <Input
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
          }}
          placeholder="Message..."
        />{" "}
        <Button onClick={() => {}} disabled={chatMutation.isPending}>
          <Send />
        </Button>
      </form>
    </div>
  );
}
