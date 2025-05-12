"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { cn } from "@/lib/utils";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Send } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { use, useState } from "react";
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

  const { id } = use(params);

  const { data, isLoading, refetch } = useQuery({
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
      await refetch();
    },
  });

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

      <div className="overflow-y-auto space-y-2 p-2 max-h-[75vh]">
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
                "w-full flex",
                message.userId !== session?.user?.id
                  ? "justify-start"
                  : "justify-end"
              )}
            >
              <div
                className={cn(
                  "p-2 text-sm border rounded-md w-fit",
                  message.userId !== session?.user?.id
                    ? "rounded-ss-none"
                    : "rounded-se-none"
                )}
              >
                {message.content}
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
