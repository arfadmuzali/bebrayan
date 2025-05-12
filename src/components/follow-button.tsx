"use client";

import { useTranslations } from "next-intl";
import { Button, buttonVariants } from "./ui/button";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Link from "next/link";
import { LoadingSpinner } from "./ui/loading-spinner";
import { cn } from "@/lib/utils";
import { Send } from "lucide-react";
import TooltipWrap from "./ui/tooltip-wrap";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface FollowButton {
  isFollowed: boolean;
  self: boolean;
}

export default function FollowButton({ profileId }: { profileId: string }) {
  const t = useTranslations("Profile");
  const router = useRouter();

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["followButton", profileId],
    queryFn: async () => {
      const response = await axios.get<FollowButton>(
        `/api/follow/${profileId}`
      );

      return response.data;
    },
  });

  const mutateFollow = useMutation({
    mutationFn: async () => {
      const response = await axios.post<FollowButton>(
        `/api/follow/${profileId}`
      );
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(
        ["followButton", profileId],
        (oldData: FollowButton) => {
          return { ...oldData, isFollowed: data.isFollowed };
        }
      );
    },
  });

  if (isLoading) {
    return <></>;
  }

  return (
    <>
      {data?.self ? (
        <Link
          href={"/settings"}
          className={buttonVariants({ className: "text-xl font-semibold" })}
        >
          {t("edit")}
        </Link>
      ) : (
        <div className="flex items-center gap-2">
          <Button
            disabled={mutateFollow.isPending}
            onClick={() => {
              mutateFollow.mutate();
            }}
            className={cn(
              mutateFollow.isPending && "text-primary",
              "text-xl font-semibold relative"
            )}
          >
            {mutateFollow.isPending && (
              <LoadingSpinner className="stroke-muted w-12 h-12 absolute" />
            )}
            {data?.isFollowed ? t("unfollow") : t("follow")}
          </Button>
          <TooltipWrap content="Message">
            <Button
              onClick={async () => {
                try {
                  const response = await axios.post("/api/chat", {
                    id: profileId,
                  });
                  router.push(response.data.url);
                } catch {
                  toast.error("Rrror happen");
                }
              }}
            >
              <Send />
            </Button>
          </TooltipWrap>
        </div>
      )}
    </>
  );
}
