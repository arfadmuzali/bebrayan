"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ModeToggle } from "../ToggleThemeDev";
import { Toaster } from "../ui/sonner";

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider {...props}>
      {children} <ModeToggle /> <Toaster />
    </NextThemesProvider>
  );
}
