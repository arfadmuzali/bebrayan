"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
// import { ModeToggle } from "../toggle-theme-dev";
import { Toaster } from "../ui/sonner";

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider {...props}>
      {children} <Toaster />
    </NextThemesProvider>
  );
}
