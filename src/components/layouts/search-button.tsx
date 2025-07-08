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
import { useEffect, useState } from "react";
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
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import debounce from "lodash.debounce";
import { CommandLoading } from "cmdk";
import { useRouter } from "next/navigation";

export interface User {
  id: string;
  image: string;
  name: string;
}

export default function SearchButton() {
  const router = useRouter();
  const t = useTranslations("Navbar");
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: users, isLoading: isSearchLoading } = useQuery({
    queryKey: ["search", search],
    queryFn: async () => {
      const response = await axios.get<User[]>(
        `/api/user?name=${search}&take=10`
      );
      return response.data;
    },
    enabled: dialogOpen,
  });

  const handleSearch = debounce((value: string) => {
    setSearch(value);
  }, 400);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && e.ctrlKey && !dialogOpen) {
        e.preventDefault();
        setDialogOpen(true);
      }
    };
    window.addEventListener("keydown", onKeyDown);


    return () => window.removeEventListener("keydown", onKeyDown);
  }, [dialogOpen]);

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
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
        <Command
          shouldFilter={false}
          className="rounded-lg border shadow-md md:min-w-[450px]"
        >
          <div className="border-b flex gap-2 items-center w-full">
            <CommandInput
              className="w-full"
              onValueChange={(e) => {
                handleSearch(e);
              }}
              placeholder="Search user..."
            />
            <DialogClose className="px-2">
              <X />
            </DialogClose>
          </div>
          <CommandList className="min-h-[300px]">
            {isSearchLoading && (
              <CommandLoading className="text-sm p-4 text-center">
                Hang on...
              </CommandLoading>
            )}
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
