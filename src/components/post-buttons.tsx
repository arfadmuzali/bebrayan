"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import debounce from "lodash.debounce";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import TooltipWrap from "./ui/tooltip-wrap";
import { Heart, MessageCircle, Repeat2, Share } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
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

interface Like {
  isUserLiked: boolean;
}

interface Repost {
  reposted: boolean;
}
export default function PostButtons({ post }: { post: Post }) {
  const queryClient = useQueryClient();

  const t = useTranslations("Post");

  const [likesCount, setLikesCount] = useState(post._count.likes);
  const [repostCount, setRepostCount] = useState(post._count.reposts);

  const { data } = useQuery({
    queryKey: ["likes", post.id],
    queryFn: async () => {
      const response = await axios.get<Like>("/api/post/like/" + post.id);
      return response.data;
    },
  });

  const mutation = useMutation({
    mutationFn: async () => {
      await axios.post(`/api/post/like/${post.id}`, {
        like: data?.isUserLiked,
      });
    },
  });

  const debouncedMutate = useMemo(
    () => debounce(mutation.mutate, 400),
    [mutation.mutate]
  );

  const { data: repostData } = useQuery({
    queryKey: ["repostPost", post.id],
    queryFn: async () => {
      const response = await axios.get<Repost>("/api/post/repost/" + post.id);
      return response.data;
    },
  });

  const repostMutation = useMutation({
    mutationFn: async () => {
      const response = await axios.post<Repost>("/api/post/repost/" + post.id);
      return response.data;
    },
    onSuccess: async (data) => {
      if (data.reposted) {
        setRepostCount((prev) => prev + 1);
      } else {
        setRepostCount((prev) => prev - 1);
      }

      queryClient.setQueryData(["repostPost", post.id], () => {
        return data;
      });
    },
  });

  return (
    <div className="flex justify-between py-2 items-center max-w-screen-2xl mx-auto">
      <div className="flex md:gap-20 gap-8 items-center">
        <TooltipWrap content={t("comment")}>
          <button className="flex items-center gap-1 font-semibold">
            <MessageCircle className=" h-5 w-5 " />
            <span>{post._count.comments}</span>
          </button>
        </TooltipWrap>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                "flex items-center gap-1  font-semibold",
                repostData?.reposted && "text-primary"
              )}
            >
              <Repeat2 className="h-5 w-5 " />

              <span>{repostCount}</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="min-w-40">
            {/* <DropdownMenuGroup> */}
            <DropdownMenuItem>
              <button
                onClick={() => {
                  repostMutation.mutate();
                }}
                disabled={repostMutation.isPending}
                className="flex items-center w-full gap-1 font-semibold"
              >
                {repostMutation.isPending ? (
                  <div className="flex items-center justify-center w-full">
                    <LoadingSpinner />
                  </div>
                ) : (
                  <span className="flex gap-1 items-center">
                    <Repeat2 />

                    {repostData?.reposted ? t("cancelRepost") : t("repost")}
                  </span>
                )}
              </button>
            </DropdownMenuItem>
            {/* </DropdownMenuGroup> */}
          </DropdownMenuContent>
        </DropdownMenu>

        <TooltipWrap content={t("like")}>
          <button
            onClick={() => {
              debouncedMutate();
              if (data?.isUserLiked) {
                setLikesCount((prev) => prev - 1);
              } else {
                setLikesCount((prev) => prev + 1);
              }
              queryClient.setQueryData(["likes", post.id], (oldData: Like) => {
                return {
                  ...oldData,
                  isUserLiked: !data?.isUserLiked,
                };
              });
            }}
            className={cn(
              "flex items-center gap-1 font-semibold",
              data?.isUserLiked && "text-red-500"
            )}
          >
            <Heart
              className={cn(data?.isUserLiked && "fill-red-500 ", " h-5 w-5")}
            />

            <span>{likesCount}</span>
          </button>
        </TooltipWrap>
      </div>
      <div className="flex items-center">
        <TooltipWrap content={t("share")}>
          <button
            onClick={() => {
              navigator.clipboard.writeText(
                `${process.env.NEXT_PUBLIC_URL}post/${post.id}`
              );
              toast("Link Copied");
            }}
            className="flex items-center gap-1 font-semibold"
          >
            <Share className="h-5 w-5 " />
          </button>
        </TooltipWrap>
      </div>
    </div>
  );
}
