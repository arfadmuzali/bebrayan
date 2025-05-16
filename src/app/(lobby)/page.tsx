"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { User } from "@prisma/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import CreatePost from "@/components/create-post";
import { useTranslations } from "next-intl";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Github,
  Instagram,
  Linkedin,
  Mail,
} from "lucide-react";
import Image from "next/image";
import Post from "@/components/post";
export interface Feed {
  data: Post[];
  hasNextPage: boolean;
  nextCursor: string;
}

export interface Post {
  id: string;
  content: string | null;
  createdAt: Date;
  userId: string;
  originalPostId: string | null;
  user: UserPost;
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

export interface UserPost {
  id: string;
  name: string;
  image: string;
}

export default function HomePage() {
  const [isCollapsibleOpen, setIsCollapsibleOpen] = useState(false);

  const t = useTranslations("Info");
  const { data: user, isLoading: userIsLoading } = useQuery({
    queryKey: ["ownProfile"],
    queryFn: async () => {
      const response = await axios.get<User>("/api/user/own");
      return response?.data;
    },
    staleTime: 300000,
  });

  const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: ["posts"],
    queryFn: async ({ pageParam }) => {
      const response = await axios.get<Feed>(
        `/api/post?take=10&cursor=${pageParam}`
      );
      return response.data;
    },

    initialPageParam: "",
    getNextPageParam: (lastPage) => {
      return lastPage.nextCursor;
    },
  });
  return (
    <div className="mx-auto grid grid-cols-1 lg:grid-cols-4 max-w-screen-2xl gap-5 px-0 md:px-12 lg:px-16">
      {/* profile */}
      <div className="space-y-4 md:sticky top-4 h-fit">
        <div className="rounded-md p-2 md:px-4 border h-min  md:min-h-52 ">
          {userIsLoading ? (
            <div className="w-full flex items-center justify-center h-full">
              <LoadingSpinner className="h-12 w-12" />
            </div>
          ) : (
            <Link href={"/profile/" + user?.id} className="space-y-2">
              <Avatar className="h-24 w-24 ">
                <AvatarImage
                  src={user?.image ?? "/avatar-placeholder.svg"}
                  alt="Av"
                />
                <AvatarFallback>AV</AvatarFallback>
              </Avatar>
              <h1 className="font-semibold text-2xl">{user?.name}</h1>
              <p className="text-muted-foreground">
                {user?.bio ?? "Your bio is emty..."}
              </p>
            </Link>
          )}
        </div>
        <div>
          <Collapsible
            open={isCollapsibleOpen}
            onOpenChange={(value) => {
              setIsCollapsibleOpen(value);
            }}
          >
            <CollapsibleTrigger asChild className="cursor-pointer">
              <h3 className="text-sm text-center flex gap-1 items-center justify-center">
                <span>{t("moreInformation")}</span>
                {isCollapsibleOpen ? (
                  <ChevronUp className="size-4" />
                ) : (
                  <ChevronDown className="size-4" />
                )}
              </h3>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="space-y-4">
                <p className="text-sm text-center">{t("websitePurpose")}</p>
                <div className="flex gap-4 text-xs items-center justify-center">
                  <Link
                    className="text-muted-foreground hover:text-foreground"
                    href={"/profile/cmano386g0000jr043ytfa1ec"}
                  >
                    <div className="relative h-5 w-5 rounded-full">
                      <Image
                        src={"/arfad.webp"}
                        alt="arfad"
                        fill
                        className={"rounded full"}
                        sizes="1.5rem"
                      />
                    </div>
                  </Link>

                  <Link
                    className="text-muted-foreground hover:text-foreground  flex gap-1 items-center justify-center"
                    href={"https://www.linkedin.com/in/arfad-muzali-91a16a2a7/"}
                  >
                    <Linkedin className="size-4" />
                  </Link>

                  <Link
                    className="text-muted-foreground hover:text-foreground  flex gap-1 items-center justify-center"
                    href={"https://www.linkedin.com/in/arfad-muzali-91a16a2a7/"}
                  >
                    <Github className="size-4" />
                  </Link>
                  <Link
                    className="text-muted-foreground hover:text-foreground  flex gap-1 items-center justify-center"
                    href={"https://www.linkedin.com/in/arfad-muzali-91a16a2a7/"}
                  >
                    <Instagram className="size-4" />
                  </Link>
                  <Link
                    className="text-muted-foreground hover:text-foreground  flex gap-1 items-center justify-center"
                    href={"https://www.linkedin.com/in/arfad-muzali-91a16a2a7/"}
                  >
                    <Mail className="size-4" />
                  </Link>
                </div>
                <div className="flex items-center justify-center text-sm">
                  {t("madeWithLove")}
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>

      {/* main feed */}
      <div className="lg:col-span-3 space-y-4 rounded-md">
        <CreatePost />
        <div className="flex flex-col w-full border rounded-md">
          {data?.pages?.map((group, i) => {
            return (
              <div className="w-full" key={i}>
                {group.data.map((post) => {
                  return (
                    <div key={post.id} className="border-b px-4">
                      {post.originalPost ? (
                        <Post
                          post={post.originalPost}
                          repostedByUser={post.user}
                        />
                      ) : (
                        <Post post={post} />
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-center w-full">
          {hasNextPage && (
            <button
              className="p-4"
              onClick={() => {
                fetchNextPage();
              }}
            >
              {t("fetchMorePost")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
