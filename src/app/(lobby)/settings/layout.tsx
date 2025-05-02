"use client";

import { cn } from "@/lib/utils";
import { Palette, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

export default function SettingsLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="mx-auto grid grid-cols-1 w-full md:grid-cols-1 lg:grid-cols-4 max-w-screen-2xl gap-5 px-0 md:px-12 lg:px-16">
      <div className="lg:col-span-1 flex lg:flex-col flex-row gap-2 w-full p-2 md:p-0">
        <Link
          href={"/settings/profile"}
          className={cn(
            "flex items-center w-full justify-start px-4 py-2 text-sm font-medium rounded-md transition-colors",
            pathname.includes("profile")
              ? "bg-primary text-primary-foreground"
              : "bg-muted hover:bg-muted/80 text-foreground"
          )}
        >
          <User className="mr-2 h-4 w-4" />
          Profile
        </Link>
        <Link
          href={"/settings/appearance"}
          className={cn(
            "flex items-center w-full justify-start px-4 py-2 text-sm font-medium rounded-md transition-colors",
            pathname.includes("appearance")
              ? "bg-primary text-primary-foreground"
              : "bg-muted hover:bg-muted/80 text-foreground"
          )}
        >
          <Palette className="mr-2 h-4 w-4" />
          Appearance
        </Link>
      </div>
      <div className="lg:col-span-3">{children}</div>
    </div>
  );
}
