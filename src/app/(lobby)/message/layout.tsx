"use client";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";

export default function MessageLayout({ children }: { children: ReactNode }) {
  return (
    <div className="max-w-screen-2xl mx-auto px-2 md:px-12 lg:px-16 h-[85vh]">
      <div className="border rounded-md border-primary flex h-full">
        {/* user list */}
        <div className="hidden md:flex min-w-96 max-w-[26rem] border-r-2 border-muted flex-col">
          <div className="border-b border-muted p-2">
            <Input placeholder="Search user..." />
          </div>
          <div className="overflow-y-auto w-full h-[75vh]">
            <User id="123" image="/arfad.webp" name="arfad" />
            <User id="123" image="/arfad.webp" name="Budiono siregar" />
            <User id="123" image="/arfad.webp" name="arfad" />
            <User id="123" image="/arfad.webp" name="arfad" />
            <User id="123" image="/arfad.webp" name="arfad" />
            <User id="123" image="/arfad.webp" name="arfad" />
            <User id="123" image="/arfad.webp" name="arfad" />
            <User id="123" image="/arfad.webp" name="arfad" />
            <User id="123" image="/arfad.webp" name="arfad" />
          </div>
        </div>

        {/* message */}
        <div className="w-full h-full">{children}</div>
      </div>
    </div>
  );
}

function User({
  image,
  name,
  id,
}: {
  image: string;
  name: string;
  id: string;
}) {
  return (
    <Link
      href={"/message/" + id}
      className="flex gap-2 p-2 items-center border-b border-muted hover:bg-muted"
    >
      <div className="relative h-12 w-12">
        <Image
          src={image}
          alt={name}
          fill
          sizes="3rem"
          className="rounded-full"
        />
      </div>
      <h3 className="text-lg">{name}</h3>
    </Link>
  );
}
