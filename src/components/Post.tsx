"use client";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { format } from "date-fns";
import { Ellipsis, Heart, MessageCircle, Repeat2, Share } from "lucide-react";
import debounce from "lodash.debounce";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { cn } from "@/lib/utils";
import TooltipWrap from "./ui/tooltip-wrap";
import { useTranslations } from "next-intl";
import PostSkeleton from "./skeleton/post-skeleton";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { LoadingSpinner } from "./ui/loading-spinner";
import { useSession } from "next-auth/react";

interface Post {
  id: string;
  content: string;
  createdAt: Date;
  userId: string;
  originalPostId: null | string;
  user: User;
  _count: Count;
  originalPost?: Post | null;
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
  isUserLiked: boolean;
}

interface Repost {
  reposted: boolean;
}

export default function Post({
  post,
  repostedByUser = null,
}: {
  post: Post;
  repostedByUser?: User | null;
}) {
  const queryClient = useQueryClient();

  const t = useTranslations("Post");

  const { data: session } = useSession();

  const [likesCount, setLikesCount] = useState(post._count.likes);
  const [repostCount, setRepostCount] = useState(post._count.reposts);

  const { data, isLoading } = useQuery({
    queryKey: ["likes", post.id],
    queryFn: async () => {
      const response = await axios.get<Like>("/api/post/like/" + post.id);
      return response.data;
    },
  });
  const likeMutation = useMutation({
    mutationFn: async () => {
      await axios.post(`/api/post/like/${post.id}`, {
        like: data?.isUserLiked,
      });
    },
  });

  const debounceLikeMutate = useMemo(
    () => debounce(likeMutation.mutate, 500),
    [likeMutation.mutate]
  );

  const { data: repostData, isLoading: repostIsLoading } = useQuery({
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

      queryClient.setQueryData(
        ["profilePost", session?.user?.id],
        (oldData: Post[]) => {
          const repost = oldData.find(
            (oldDataPost) => post.id == oldDataPost.originalPostId
          );
          if (repost) {
            return oldData.filter((post) => post.id !== repost.id);
          } else {
            const newRepost: Post = {
              ...post,
              id: "hehe jangan di intip dong idnya " + post.id,
              originalPost: post,
              originalPostId: post.id,
            };
            return [newRepost, ...oldData];
          }
        }
      );
      queryClient.setQueryData(["repostPost", post.id], () => {
        return data;
      });
    },
  });

  const deletePost = useMutation({
    mutationFn: async () => {
      const response = await axios.delete(`/api/post/${post.id}`);
      return response.data;
    },
    onSuccess: async () => {
      queryClient.setQueryData(
        ["profilePost", session?.user?.id],
        (oldData: Post[]) => {
          return oldData.filter((oldPost) => oldPost.id !== post.id);
        }
      );
    },
  });

  if (isLoading || repostIsLoading) {
    return <PostSkeleton />;
  }

  return (
    <div className="flex flex-col gap-2 py-4  mx-auto max-w-screen-2xl">
      {repostedByUser && (
        <Link
          href={"/profile/" + repostedByUser?.id}
          className="text-sm flex gap-1"
        >
          <Repeat2 className="h-5 w-5" />{" "}
          <p>
            <span className="text-primary">{repostedByUser.name}</span>{" "}
            {t("reposted")}
          </p>
        </Link>
      )}

      <div className="flex  justify-between items-center">
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className={cn("flex items-center gap-1  font-semibold")}>
              <Ellipsis className="h-5 w-5 " />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuGroup>
              {post.userId === session?.user?.id && (
                <DropdownMenuItem
                  disabled={deletePost.isPending}
                  onClick={() => {
                    deletePost.mutate();
                  }}
                >
                  {deletePost.isPending ? (
                    <div className="w-full flex justify-center ">
                      <LoadingSpinner />
                    </div>
                  ) : (
                    t("deletePost")
                  )}
                </DropdownMenuItem>
              )}
              <DropdownMenuItem>
                <Link href={"/profile/" + post.user.id}>
                  {t("visitProfile")}
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="z-10">
        <Link href={`/post/${post.id}`}>
          <p className="text-lg whitespace-pre-line leading-relaxed tracking-wide">
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
                  debounceLikeMutate();
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
