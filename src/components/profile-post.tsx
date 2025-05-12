"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { LoadingSpinner } from "./ui/loading-spinner";
// import Post from "./post";
import Post from "./post";

export interface Post {
  id: string;
  content: string;
  createdAt: Date;
  userId: string;
  originalPostId: string | null;
  user: User;
  _count: Count;
  originalPost: Post | null;
  likes: {
    id: string;
  }[];
  reposts: {
    id: string;
  }[];
}

export interface Count {
  comments: number;
  likes: number;
  reposts: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  bio: string;
  emailVerified: null;
  image: string;
  createdAt: Date;
  updatedAt: Date;
}

export default function ProfilePost({ id }: { id: string }) {
  const { data: posts, isLoading } = useQuery({
    queryKey: ["profilePost", id],
    queryFn: async () => {
      const response = await axios.get<Post[]>("/api/user/post/" + id);
      return response.data;
    },
  });

  return (
    <div className="flex flex-col ">
      {isLoading && (
        <div className="w-full grid place-items-center">
          <LoadingSpinner className="h-12 w-12" />
        </div>
      )}
      {posts?.map((post) => {
        return (
          <div key={post.id} className="border-b px-2 md:px-12 lg:px-16">
            {post.originalPost ? (
              <Post post={post.originalPost} repostedByUser={post.user} />
            ) : (
              <Post post={post} />
            )}
          </div>
        );
      })}
    </div>
  );
}
