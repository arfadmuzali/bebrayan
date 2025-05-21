"use client";

import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { X } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "./ui/command";
import Image from "next/image";
import { ReactNode, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export interface User {
  id: string;
  image: string;
  name: string;
  bio: null | string;
}

export default function FollowerButton({
  children,
  id,
}: {
  children: ReactNode;
  id: string;
}) {
  const t = useTranslations("Profile");
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: users } = useQuery({
    queryKey: ["followings", id],
    queryFn: async () => {
      const response = await axios.get<User[]>(`/api/user/${id}/follower`);
      return response.data;
    },
    staleTime: 36000,
    enabled: dialogOpen,
  });
  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild className="cursor-pointer">
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] md:min-w-[600px] p-0 border-none md:w-full">
        <VisuallyHidden>
          <DialogTitle></DialogTitle>
          <DialogDescription></DialogDescription>
        </VisuallyHidden>
        <Command
          shouldFilter={false}
          className="rounded-lg border shadow-md md:min-w-[450px]"
        >
          <DialogClose className="px-2 py-1 flex w-full items-center justify-between">
            <h3>{t("followers")}</h3>
            <X />
          </DialogClose>
          <CommandList className="min-h-[300px]">
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {users?.map((user) => {
                return (
                  <CommandItem
                    key={user.id}
                    onSelect={() => {
                      router.push("/profile/" + user.id);
                      setDialogOpen(false);
                    }}
                  >
                    <div className="relative h-8 w-8 rounded-full">
                      <Image
                        src={user.image ?? "/avatar-placeholder.svg"}
                        alt={user.name}
                        fill
                        sizes="2rem"
                        className="rounded-full"
                      />
                    </div>
                    <span>{user.name}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
