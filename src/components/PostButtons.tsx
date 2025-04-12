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
  content: string;
  createdAt: Date;
  userId: string;
  originalPostId: string | null;
  user: User;
  _count: PostCount;
}

interface Like {
  likes: LikeElement[];
  isUserLiked: boolean;
}

interface LikeElement {
  id: string;
  userId: string;
  user: UserLike;
}

interface UserLike {
  id: string;
  image: string;
  name: string;
}

export default function PostButtons({ post }: { post: Post }) {
  const queryClient = useQueryClient();

  const t = useTranslations("Post");

  const [likesCount, setLikesCount] = useState(post._count.likes);
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

  return (
    <div className="flex justify-between py-2 items-center max-w-screen-2xl mx-auto">
      <div className="flex md:gap-20 gap-8 items-center">
        <TooltipWrap content={t("comment")}>
          <button className="flex items-center gap-1 font-semibold">
            <MessageCircle className=" h-5 w-5 " />
            <span>{post._count.comments}</span>
          </button>
        </TooltipWrap>

        <TooltipWrap content={t("repost")}>
          <button className="flex items-center gap-1 font-semibold">
            <Repeat2 className="h-5 w-5 " />

            <span>{post._count.reposts}</span>
          </button>
        </TooltipWrap>

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
