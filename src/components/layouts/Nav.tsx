import Image from "next/image";
import { Button, buttonVariants } from "../ui/button";
import { House, Search, Send } from "lucide-react";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import TooltipWrap from "../ui/tooltip-wrap";
import { auth } from "@/lib/auth";
import AvatarMenu from "./AvatarMenu";

export default async function Nav() {
  const t = await getTranslations("Navbar");
  const session = await auth();
  return (
    <nav className="w-full px-2 md:px-12 lg:px-16 mb-4 py-1 border-b">
      <div className=" mx-auto max-w-screen-2xl flex justify-between items-center">
        <Link href={"/"} className="gap-2 flex items-center">
          <div className="relative aspect-square w-14 ">
            <Image
              src={"/bebrayan.webp"}
              alt="Bebrayan"
              fill
              sizes="20vw"
              className="object-cover object-center"
            />
          </div>
          <h1 className="text-center hidden md:block font-black text-4xl text-primary">
            Bebrayan
          </h1>
        </Link>
        <Button className="flex gap-4 text-lg [&_svg]:size-6">
          <Search />
          {t("search")}
        </Button>
        <div className="flex gap-2 h-full">
          <TooltipWrap content={t("home")}>
            <Link
              href={"/"}
              className={buttonVariants({
                variant: "ghost",
                className: "[&_svg]:size-6 h-full hidden md:block",
              })}
            >
              <House />
            </Link>
          </TooltipWrap>
          <TooltipWrap content={t("messages")}>
            <Link
              href={"/"}
              className={buttonVariants({
                variant: "ghost",
                className: "[&_svg]:size-6 h-full",
              })}
            >
              <Send />
            </Link>
          </TooltipWrap>
          <div className="ml-2">
            <AvatarMenu session={session} />
          </div>
        </div>
      </div>
    </nav>
  );
}
