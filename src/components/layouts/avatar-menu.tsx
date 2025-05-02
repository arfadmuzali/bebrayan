"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LayoutDashboard, LogOut, SquareUser } from "lucide-react";
import { Session } from "next-auth";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { useTranslations } from "next-intl";

export default function AvatarMenu({ session }: { session?: Session | null }) {
  const router = useRouter();
  const t = useTranslations("Navbar");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="cursor-pointer">
          <AvatarFallback>
            {session?.user?.name?.charAt(0) ?? "AV"}
          </AvatarFallback>
          <AvatarImage alt="image" src={session?.user?.image ?? ""} />
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-52" side="bottom" align="end">
        <DropdownMenuLabel>{session?.user?.name ?? ""}</DropdownMenuLabel>
        <DropdownMenuLabel className="py-0 text-xs">
          {session?.user?.email ?? ""}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={() => {
              router.push("/settings");
            }}
          >
            <LayoutDashboard />
            <span>{t("setting")}</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              router.push("/settings");
            }}
          >
            <SquareUser />
            <span>{t("profile")}</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={async () => {
              signOut();
            }}
          >
            <LogOut />
            <span>{t("logout")}</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
