"use client";

import * as React from "react";
import { Moon, Sun, SunMoon } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { getUserLocale, setUserLocale } from "@/i18n/locale";

export function ModeToggle() {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null; // Hindari rendering sebelum mounting

  return (
    <Button
      className="fixed bottom-5 py-6 rounded-full right-5"
      onClick={async () => {
        setTheme(
          theme === "light" ? "dark" : theme === "dark" ? "system" : "light"
        );

        const locale = await getUserLocale();

        await setUserLocale(locale === "en" ? "id" : "en");
      }}
    >
      {theme === "light" && <Sun />}
      {theme === "dark" && <Moon />}
      {theme === "system" && <SunMoon />}
    </Button>
  );
}
