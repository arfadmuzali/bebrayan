"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { format } from "date-fns";
import CommentSkeleton from "./skeleton/comment-skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Ellipsis } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
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

export interface Comment {
  id: string;
  content: string;
  createdAt: Date;
  userId: string;
  postId: string;
  user: User;
}

export default function CommentList({ post }: { post: Post }) {
  const { data, isLoading } = useQuery({
    queryKey: ["commentList", post.id],
    queryFn: async () => {
      const response = await axios.get<Comment[]>(
        `/api/post/comment/${post.id}`
      );

      return response.data;
    },
  });
  return (
    <div className="flex flex-col">
      <div className="px-2 md:px-12 w-full lg:px-16 mx-auto max-w-screen-2xl">
        {isLoading && (
          <div className="w-full flex flex-col gap-2">
            <CommentSkeleton />
            <CommentSkeleton />
            <CommentSkeleton />
          </div>
        )}
      </div>
      {data?.map((comment) => {
        return <Comment key={comment.id} comment={comment} />;
      })}
    </div>
  );
}

function Comment({ comment }: { comment: Comment }) {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const t = useTranslations("Post");

  const deleteComment = useMutation({
    mutationFn: async () => {
      const response = await axios.delete("/api/comment/" + comment.id);
      return response.data;
    },
    onSuccess: async () => {
      queryClient.setQueryData(
        ["commentList", comment.postId],
        (oldData: Comment[]) => {
          return oldData.filter((oldComment) => oldComment.id !== comment.id);
        }
      );
    },
  });

  return (
    <div className="px-2 md:px-12 lg:px-16">
      <div className="flex flex-col gap-2 py-4 mx-auto max-w-screen-2xl ">
        <div className="flex gap-4">
          <Link href={"/profile/" + comment.user?.id}>
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={comment.user?.image ?? "/avatar-placeholder.svg"}
                alt="Av"
              />
              <AvatarFallback>AV</AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex flex-col gap-1 w-full">
            <div className="flex items-center justify-between w-full">
              <div className="flex gap-4 items-center">
                <Link href={"/profile/" + comment.user?.id}>
                  <h2 className="font-semibold">{comment.user.name}</h2>
                </Link>
                <div className="grid place-items-center">
                  <div className="bg-muted-foreground h-1 w-1 rounded-full" />
                </div>
                <p className="text-muted-foreground">
                  {format(new Date(comment.createdAt), "MMMM dd")}
                </p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className={cn("flex items-center gap-1  font-semibold")}
                  >
                    <Ellipsis className="h-5 w-5 " />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuGroup>
                    {comment.userId === session?.user?.id && (
                      <DropdownMenuItem
                        disabled={deleteComment.isPending}
                        onClick={() => {
                          deleteComment.mutate();
                        }}
                      >
                        {deleteComment.isPending ? (
                          <div className="w-full flex justify-center ">
                            <LoadingSpinner />
                          </div>
                        ) : (
                          t("deleteComment")
                        )}
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem>
                      <Link href={"/profile/" + comment.user.id}>
                        {t("visitProfile")}
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="z-10">
              <p className="">{comment.content}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
