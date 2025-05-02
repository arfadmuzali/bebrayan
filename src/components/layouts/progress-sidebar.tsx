"use client";
import { AppProgressBar as ProgressBar } from "next-nprogress-bar";
import { ReactNode } from "react";

export default function ProgressBarProvider({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      {children}
      <ProgressBar
        height="4px"
        color="#25ad86"
        options={{ showSpinner: false }}
        shallowRouting
      />
    </>
  );
}
