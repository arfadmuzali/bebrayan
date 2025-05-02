"use client";
import { Search, X } from "lucide-react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import Image from "next/image";
// import { DialogContent, DialogTitle } from "@radix-ui/react-dialog";

export default function SearchButton() {
  const t = useTranslations("Navbar");
  // const [search, setSearch] = useState("");
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Search /> {t("search")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] md:min-w-[600px] p-0 border-none md:w-full">
        <VisuallyHidden>
          <DialogTitle></DialogTitle>
          <DialogDescription></DialogDescription>
        </VisuallyHidden>
        <Command className="rounded-lg border shadow-md md:min-w-[450px]">
          <div className="border-b flex gap-2 items-center w-full">
            <CommandInput className="w-full" placeholder="Search user..." />
            <DialogClose className="px-2">
              <X />
            </DialogClose>
          </div>
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                onSelect={() => {
                  console.log("hehe");
                }}
              >
                <div className="relative">
                  <Image src={"/arfad.webp"} alt="hehe" fill />
                </div>
                <span>Calendar</span>
              </CommandItem>
              <CommandItem>
                <span>Search Emoji</span>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
