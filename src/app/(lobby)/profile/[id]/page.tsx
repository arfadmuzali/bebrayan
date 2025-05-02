import FollowButton from "@/components/follow-button";
import ProfilePost from "@/components/profile-post";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import prisma from "@/lib/db";
import { UserX } from "lucide-react";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import Link from "next/link";

async function getProfile(id: string) {
  try {
    const profile = await prisma.user.findUnique({
      where: {
        id,
      },
      include: {
        _count: {
          select: {
            followings: true,
            followers: true,
            posts: true,
          },
        },
      },
    });

    return profile;
  } catch {
    return null;
  }
}

export default async function Profile({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const t = await getTranslations("Profile");
  // const session = await auth();

  const id = (await params).id;
  const profile = await getProfile(id);

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="flex flex-col items-center gap-2">
            <div className="rounded-full bg-muted p-4 w-16 h-16 flex items-center justify-center">
              <UserX className="h-8 w-8 text-muted-foreground" />
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
      <div className="mx-auto max-w-screen-2xl px-2 md:px-12 lg:px-16">
        <div className="flex justify-between">
          <div className="flex md:gap-16 gap-4 items-center">
            <div className="relative md:h-40 md:w-40 h-20 w-20 rounded-full border">
              <Image
                src={profile.image ?? "/avatar-placeholder.svg"}
                alt={profile.name + "image"}
                fill
                sizes="30vw"
                className="rounded-full"
              />
            </div>
            <div className="py-4 md:space-y-4 max-w-[55vw]">
              <h2 className="md:text-2xl text-xl font-semibold">
                {profile.name}
              </h2>

              <p className="text-muted-foreground">
                {profile.bio ?? "The bio is empty..."}
              </p>
            </div>
          </div>
          <div className="flex justify-end items-end h-full">
            <FollowButton profileId={profile.id} />
          </div>
        </div>
        <div className="flex items-center justify-center md:justify-start mt-6 md:gap-10 gap-6 md:text-xl ">
          <div>
            {profile._count.followings} {t("followers")}
          </div>
          <div>
            {profile._count.followers} {t("following")}
          </div>
          <div>
            {profile._count.posts} {t("posts")}
          </div>
        </div>
      </div>
      <div className="border-b w-full mt-10" />

      <div className="">
        <ProfilePost id={id} />
      </div>
    </div>
  );
}
