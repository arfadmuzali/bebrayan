"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { format } from "date-fns";
import CommentSkeleton from "./skeleton/CommentSkeleton";

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
          <div className="flex flex-col gap-1">
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

            <div className="z-10">
              <p className="">{comment.content}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
