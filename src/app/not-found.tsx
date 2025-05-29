import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getTranslations } from "next-intl/server";
import Link from "next/link";

export default async function NotFound() {
  const t = await getTranslations("Info");
  return (
    <div className="h-screen flex flex-col gap-4 items-center justify-center">
      <div className="text-2xl">404 - {t("notFound")}</div>
      <Link href={"/"} className={cn(buttonVariants())}>
        {t("backToHome")}
      </Link>
    </div>
  );
}
