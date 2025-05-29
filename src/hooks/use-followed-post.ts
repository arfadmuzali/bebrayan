"use client";

import { useEffect, useState } from "react";

export type FollowedPost = "newest" | "following";

export default function useFollowedPost() {
  const [isFollowedPost, setIsFollowedPost] = useState<"newest" | "following">(
    (localStorage.getItem("followedPost") as FollowedPost) ?? "newest"
  );

  useEffect(() => {
    localStorage.setItem("followedPost", isFollowedPost);
  }, [isFollowedPost]);

  return { isFollowedPost, setIsFollowedPost };
}
