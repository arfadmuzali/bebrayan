"use client";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { format } from "date-fns";
import { Heart, MessageCircle, Repeat2, Share } from "lucide-react";
import debounce from "lodash.debounce";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { cn } from "@/lib/utils";
import TooltipWrap from "./ui/tooltip-wrap";
import { useTranslations } from "next-intl";
import PostSkeleton from "./skeleton/PostSkeleton";
import { toast } from "sonner";

interface Post {
  id: string;
  content: string;
  createdAt: Date;
  userId: string;
  originalPostId: null;
  user: User;
  _count: Count;
}

interface Count {
  comments: number;
  likes: number;
  reposts: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  bio: null;
  emailVerified: null;
  image: string;
  createdAt: Date;
  updatedAt: Date;
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

export default function Post({ post }: { post: Post }) {
  const queryClient = useQueryClient();

  const t = useTranslations("Post");

  const [likesCount, setLikesCount] = useState(post._count.likes);
  const { data, isLoading } = useQuery({
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
    () => debounce(mutation.mutate, 500),
    [mutation.mutate]
  );

  if (isLoading) {
    return <PostSkeleton />;
  }

  return (
    <div className="flex flex-col gap-2 py-4 mx-auto max-w-screen-2xl">
      <div className="flex gap-4">
        <Link href={"/profile/" + post.user?.id}>
          <Avatar className="h-12 w-12">
            <AvatarImage
              src={post.user?.image ?? "/avatar-placeholder.svg"}
              alt="Av"
            />
            <AvatarFallback>AV</AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex gap-4 items-center">
          <Link href={"/profile/" + post.user?.id}>
            <h2 className="font-semibold text-lg">{post.user.name}</h2>
          </Link>
          <div className="grid place-items-center">
            <div className="bg-muted-foreground h-1 w-1 rounded-full" />
          </div>
          <p className="text-muted-foreground">
            {format(new Date(post.createdAt), "MMMM dd")}
          </p>
        </div>
      </div>
      <div className="z-10">
        <Link href={`/post/${post.id}`}>
          <p className="text-lg leading-relaxed tracking-wide">
            {post.content}
          </p>
        </Link>

        <div className="flex justify-between py-2 mt-6 items-center">
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
                  queryClient.setQueryData(
                    ["likes", post.id],
                    (oldData: Like) => {
                      return {
                        ...oldData,
                        isUserLiked: !data?.isUserLiked,
                      };
                    }
                  );
                }}
                className={cn(
                  "flex items-center gap-1 font-semibold",
                  data?.isUserLiked && "text-red-500"
                )}
              >
                <Heart
                  className={cn(
                    data?.isUserLiked && "fill-red-500 ",
                    " h-5 w-5"
                  )}
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
      </div>
    </div>
  );
}
