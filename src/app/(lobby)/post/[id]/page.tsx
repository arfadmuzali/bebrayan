import PostButtons from "@/components/PostButtons";
import Comment from "@/components/Comment";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import prisma from "@/lib/db";
import { format } from "date-fns";
import { ArchiveX } from "lucide-react";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import Link from "next/link";
import CommentList from "@/components/CommentList";

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

async function getPost(id: string) {
  try {
    const post = await prisma.post.findUnique({
      where: {
        id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
            reposts: true,
          },
        },
      },
    });

    return post;
  } catch {
    return null;
  }
}

export default async function Post({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const t = await getTranslations("Post");

  const { id } = await params;
  const post = await getPost(id);

  if (!post) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="flex flex-col items-center gap-2">
            <div className="rounded-full bg-muted p-4 w-16 h-16 flex items-center justify-center">
              <ArchiveX className="h-8 w-8 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-center">{t("notFound")}</h1>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">
              {t("notFoundDescription")}
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button asChild>
              <Link href="/">{t("returnHome")}</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="">
      <div className="px-2 md:px-12 lg:px-16 border-b pb-4">
        <div className="mx-auto max-w-screen-2xl flex items-center justify-between">
          <div className="flex items-center gap-4 md:gap-6">
            {/* profile picture */}
            <Link
              href={`/profile/${post.user.id}`}
              className="relative h-14 w-14"
            >
              <Image
                src={post?.user.image ?? "/avatar-placeholder.svg"}
                alt={post?.user.name + "Profile picture"}
                fill
                sizes="20vw"
                className="rounded-full"
              />
            </Link>

            <Link href={`/profile/${post.user.id}`}>
              <h2 className="text-xl font-semibold">{post?.user.name}</h2>
            </Link>
          </div>
          <div>
            <h5 className="text-muted-foreground">
              {format(new Date(post.createdAt), "yyy MMMM dd")}
            </h5>
          </div>
        </div>
        <p className="leading-relaxed whitespace-pre-line max-w-screen-2xl mx-auto tracking-wide md:text-xl text-lg py-4">
          {post.content}
        </p>
        <PostButtons post={post} />
      </div>
      <Comment post={post} />
      <CommentList post={post} />
    </div>
  );
}
