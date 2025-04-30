"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
// import { Moon, Sun, SunMoon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { getUserLocale, setUserLocale } from "@/i18n/locale";
import { useEffect, useState } from "react";
import { Locale } from "@/i18n/config";

export default function AppearanceSettingPage() {
  const t = useTranslations("Setting");
  const [locale, setLocale] = useState<Locale>("en");
  const { setTheme, theme } = useTheme();

  console.log(theme);

  useEffect(() => {
    const lang = async () => {
      const result = await getUserLocale();
      console.log(result);
      setLocale(result);
    };

    lang();
  }, []);
  return (
    <div className="w-full rounded-md lg:p-4 md:p-4 p-2 space-y-2 border-primary border">
      <h1 className="text-2xl tracking-tight font-semibold leading-none">
        {t("appearance")}
      </h1>
      <p className="text-sm text-muted-foreground">
        {t("appearanceDescription")}
      </p>
      <div className="flex justify-between items-center">
        <div className="flex flex-col">
          <Label>{t("darkMode")}</Label>
          <span className="text-xs text-muted-foreground ">
            {t("themeDescription")}
          </span>
        </div>
        <div className="flex gap-2">
          <Button
            variant={theme == "light" ? "default" : "outline"}
            onClick={async () => {
              setTheme("light");
            }}
          >
            Light
          </Button>
          <Button
            variant={theme == "dark" ? "default" : "outline"}
            onClick={async () => {
              setTheme("dark");
            }}
          >
            Dark
          </Button>
          <Button
            variant={theme === "system" ? "default" : "outline"}
            onClick={async () => {
              setTheme("system");
            }}
          >
            System
          </Button>
        </div>
      </div>
      <div className="flex justify-between items-center">
        <div className="flex flex-col">
          <Label>{t("language")}</Label>
          <span className="text-xs text-muted-foreground ">
            {t("languageDescription")}
          </span>
        </div>
        <div className="flex gap-2">
          <Button
            variant={locale === "en" ? "default" : "outline"}
            onClick={async () => {
              await setUserLocale("en");
              setLocale("en");
            }}
          >
            English
          </Button>
          <Button
            variant={locale === "id" ? "default" : "outline"}
            onClick={async () => {
              await setUserLocale("id");
              setLocale("id");
            }}
          >
            Indonesia
          </Button>
        </div>
      </div>
    </div>
  );
}
