"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { User } from "@prisma/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function HomePage() {
  const { data: user, isLoading: userIsLoading } = useQuery({
    queryKey: ["ownProfile"],
    queryFn: async () => {
      const response = await axios.get<User>("/api/user/own");
      return response?.data;
    },
    staleTime: 300000,
  });

  return (
    <div className="mx-auto grid grid-cols-1 lg:grid-cols-4 max-w-screen-2xl gap-5  px-0 md:px-12 lg:px-16">
      {/* profile */}
      <div className="rounded-md px-6 border md:h-96 h-full py-6 ">
        {userIsLoading ? (
          <div className="w-full flex items-center justify-center h-full">
            <LoadingSpinner className="h-12 w-12" />
          </div>
        ) : (
          <Link href={"/profile/" + user?.id} className="space-y-2">
            <Avatar className="h-24 w-24 ">
              <AvatarImage
                src={user?.image ?? "/avatar-placeholder.svg"}
                alt="Av"
              />
              <AvatarFallback>AV</AvatarFallback>
            </Avatar>
            <h1 className="font-semibold text-2xl">{user?.name}</h1>
            <p className="text-muted-foreground">
              {user?.bio ?? "Your bio is emty..."}
            </p>
          </Link>
        )}
      </div>
      {/* main feed */}
      <div className="lg:col-span-2 rounded-md px-4 border h-96">content</div>

      <div className="rounded-md px-4 border h-96">content</div>
    </div>
  );
}
