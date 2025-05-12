"use client";

import { useTranslations } from "next-intl";

export default function DefaultMessage() {
  const t = useTranslations("Message");

  return (
    <div className="w-full h-full  ">
      <div className="flex items-center  justify-center space-y-2 p-2 h-full max-h-[75vh]">
        <h4 className="text-xl tracking-wide">{t("defaultDescription")}</h4>
      </div>
    </div>
  );
}
