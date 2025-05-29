import { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Appearance Setting - Bebrayan",
};

export default function ProfileSettingLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <>{children}</>;
}
