"use client";

import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { AutoResizeTextarea } from "./ui/textarea";
import { useTranslations } from "next-intl";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import { toast } from "sonner";
import { LoadingSpinner } from "./ui/loading-spinner";

export default function CreatePost() {
  const t = useTranslations("Post");
  const { data: session } = useSession();
  const limitPost = 320;

  const [post, setPost] = useState("");
  const [isPostFocused, setIsPostFocused] = useState(false);

  const postMutation = useMutation({
    mutationFn: async () => {
      const response = await axios.post("/api/post", {
        content: post,
      });
      console.log(response.data);
      return response.data;
    },
    onError: async (error) => {
      toast.error(error.message);
    },
    onSettled: () => {
      setPost("");
    },
  });
  return (
    <div className="border rounded-md p-2 md:px-4">
      <div className="max-w-screen-2xl flex gap-4 mx-auto w-full">
        <Link
          href={`/profile/${session?.user?.id}`}
          className="relative h-10 min-w-10"
        >
          <Image
            src={session?.user?.image ?? "/avatar-placeholder.svg"}
            alt={session?.user?.name ?? ""}
            fill
            sizes="15vw"
            className="rounded-full"
          />
        </Link>
        <div className="flex flex-col w-full">
          <AutoResizeTextarea
            value={post}
            onFocus={() => setIsPostFocused(true)}
            onBlur={() => setIsPostFocused(false)}
            onChange={(e) => {
              const newValue = e.target.value;
              if (newValue.length > limitPost) {
                toast.warning(t("postLimitMessage"));
                return;
              }
              setPost(newValue);
            }}
            placeholder={t("makeAPost")}
            // className="w-full bg-transparent placeholder-gray-500 outline-none border-none text-base py-3"
          />
          <div className="flex w-full gap-6 items-center justify-end">
            {isPostFocused && (
              <p
                className={cn(
                  post.length >= limitPost
                    ? "text-destructive"
                    : "text-primary",
                  "tracking-wide"
                )}
              >
                {post.length}/{limitPost}
              </p>
            )}

            <Button
              className={cn(
                "relative",
                postMutation.isPending && "text-primary"
              )}
              disabled={!post || postMutation.isPending}
              onClick={() => postMutation.mutate()}
            >
              {postMutation.isPending && (
                <LoadingSpinner className="stroke-muted w-12 h-12 absolute" />
              )}
              {t("post")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
