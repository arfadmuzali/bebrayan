"use client";

import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/button";
import { useState } from "react";
import { AutoResizeTextarea } from "./ui/textarea";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { LoadingSpinner } from "./ui/loading-spinner";

interface User {
  id: string;
  name: string | null;
  image: string | null;
}

interface PostCount {
  reposts: number;
  likes: number;
  comments: number;
}

interface Post {
  id: string;
  content: string | null;
  createdAt: Date;
  userId: string;
  originalPostId: string | null;
  user: User;
  _count: PostCount;
}

interface Comment {
  id: string;
  content: string;
  createdAt: Date;
  userId: string;
  postId: string;
  user: User;
}

export default function Comment({ post }: { post: Post }) {
  const t = useTranslations("Post");
  const queryClient = useQueryClient();

  const limitComment = 280;
  const [comment, setComment] = useState("");
  const { data: session } = useSession();
  const [isCommentFocused, setIsCommentFocused] = useState(false);

  const commentMutation = useMutation({
    mutationFn: async () => {
      const response = await axios.post<Comment>("/api/comment", {
        postId: post.id,
        content: comment,
      });
      return response.data;
    },
    onError: async (error) => {
      toast.error(error.message);
    },
    onSuccess: async (data) => {
      setComment("");
      queryClient.setQueryData(
        ["commentList", post.id],
        (oldData: Comment[]) => {
          return [...oldData, data];
        }
      );
    },
  });

  return (
    <div className="border-b py-4 px-2 md:px-12 lg:px-16">
      <div className="max-w-screen-2xl flex gap-4 mx-auto w-full">
        <div className="relative h-12 min-w-12">
          <Image
            src={session?.user?.image ?? "/avatar-placeholder.svg"}
            alt={session?.user?.name ?? ""}
            fill
            sizes="15vw"
            className="rounded-full"
          />
        </div>
        <div className="flex flex-col w-full">
          <p className="">
            <span>{t("replyTo")}</span>{" "}
            <Link className="text-primary" href={"/profile/" + post.user.id}>
              {post.user.name}
            </Link>
          </p>
          <AutoResizeTextarea
            value={comment}
            onFocus={() => setIsCommentFocused(true)}
            onBlur={() => setIsCommentFocused(false)}
            onChange={(e) => {
              const newValue = e.target.value;
              if (newValue.length > limitComment) {
                toast.warning(t("commentLimitMessage"));
                return;
              }
              setComment(newValue);
            }}
            placeholder={t("yourReply") + "..."}
            // className="w-full bg-transparent placeholder-gray-500 outline-none border-none text-base py-3"
          />
          <div className="flex w-full gap-6 items-center justify-end">
            {isCommentFocused && (
              <p
                className={cn(
                  comment.length >= limitComment
                    ? "text-destructive"
                    : "text-primary",
                  "tracking-wide"
                )}
              >
                {comment.length}/{limitComment}
              </p>
            )}

            <Button
              className={cn(
                "relative",
                commentMutation.isPending && "text-primary"
              )}
              disabled={!comment || commentMutation.isPending}
              onClick={() => commentMutation.mutate()}
            >
              {commentMutation.isPending && (
                <LoadingSpinner className="stroke-muted w-12 h-12 absolute" />
              )}
              {t("reply")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
