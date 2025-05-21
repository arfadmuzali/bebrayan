"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Upload } from "lucide-react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { ChangeEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { profileSchema, ProfileSchema } from "@/lib/schemas/profile-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { User } from "@prisma/client";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { authenticator } from "@/lib/upload-authenticator";
import { upload, UploadResponse } from "@imagekit/next";

const MAX_FILE_SIZE = 1 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function ProfileSettingPage() {
  const t = useTranslations("Setting");
  const { data: session } = useSession();

  const [file, setFile] = useState<null | File>(null);
  const [image, setImage] = useState<null | string>(null);

  const {
    data: user,
    isSuccess: isUserSuccess,
    refetch,
  } = useQuery({
    queryKey: ["ownProfile"],
    queryFn: async () => {
      const response = await axios.get<User>("/api/user/own");
      return response?.data;
    },
    staleTime: 300000,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileSchema>({
    resolver: zodResolver(profileSchema),
  });

  const profileMutation = useMutation({
    mutationFn: async (data: ProfileSchema) => {
      let uploadResponse: undefined | UploadResponse;
      if (file) {
        let authParams;
        try {
          authParams = await authenticator();
        } catch (authError) {
          console.error("Failed to authenticate for upload:", authError);
          toast.error("Authenticator failed, please try again");
          return;
        }

        const { signature, expire, token, publicKey } = authParams;
        uploadResponse = await upload({
          // Authentication parameters
          expire,
          token,
          signature,
          publicKey,
          file,
          fileName: file.name,
        });
      }

      const response = await axios.patch("/api/user", {
        image: uploadResponse?.url,
        bio: data.bio,
        username: data.username,
      });

      return response.data;
    },
    onSuccess: async () => {
      toast.success("Update Success");
      await refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const avatarOnChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];

    if (!f) {
      toast.error("File not found, please select file again.");
      return;
    }

    if (f.size > MAX_FILE_SIZE) {
      toast.error("Max file size is 1MB.");
      return;
    }

    const url = URL.createObjectURL(f);
    setFile(f);

    if (image) {
      URL.revokeObjectURL(image);
    }
    setImage(url);
  };

  useEffect(() => {
    if (isUserSuccess) {
      reset({
        bio: user.bio ?? "",
        username: user.name ?? "",
      });
    }
  }, [isUserSuccess, reset, user]);
  return (
    <div className="w-full rounded-md lg:p-4 md:p-4 p-2 space-y-2 border-primary border">
      <h1 className="text-2xl tracking-tight font-semibold leading-none">
        {t("profile")}
      </h1>
      <p className="text-sm text-muted-foreground">{t("profileDescription")}</p>
      <input
        className="hidden"
        type="file"
        accept={ACCEPTED_TYPES.join()}
        id="avatar"
        onChange={avatarOnChange}
      />
      <form
        onSubmit={handleSubmit((data) => {
          if (user?.bio == data.bio && user?.name == data.username && !file) {
            toast.warning("Please make a change");
            return;
          }
          profileMutation.mutate(data);
        })}
        className="flex flex-col gap-4"
      >
        <div className="flex gap-4 items-center">
          <label htmlFor="avatar">
            <div className="relative h-24 w-24 cursor-pointer">
              {
                <Image
                  src={
                    image ?? session?.user?.image ?? "/avatar-placeholder.svg"
                  }
                  alt="avatar"
                  fill
                  sizes="30vw"
                  className="rounded-full text-center"
                />
              }
            </div>
          </label>
          <div className="flex flex-col gap-2">
            <h4 className="text-muted-foreground text-sm">
              {t("avatarDescription")}
            </h4>
            <label
              className={cn(
                buttonVariants({
                  variant: "outline",
                  size: "sm",
                  className: "w-fit cursor-pointer",
                })
              )}
              htmlFor="avatar"
            >
              <Upload /> Upload
            </label>
          </div>
        </div>
        <div className="space-y-1">
          <Label className="font-semibold">Username</Label>
          <Input
            type="text"
            {...register("username")}
            placeholder="Insert username here..."
          />
          {!errors.username && (
            <p className="text-muted-foreground text-sm">
              {t("usernameDescription")}
            </p>
          )}
          {errors.username && (
            <p className="text-destructive text-sm">
              {errors.username.message}
            </p>
          )}
        </div>
        <div className="space-y-1">
          <Label className="font-semibold" htmlFor="email">
            Email
          </Label>
          <Input
            type="text"
            className="z-[2] relative"
            id="email"
            value={session?.user?.email ?? ""}
            onChange={() => {
              toast.warning("Can't change email");
            }}
            disabled
          />
          <p className="text-sm text-muted-foreground">
            {t("emailDescription")}
          </p>
        </div>
        <div className="space-y-1">
          <Label className="font-semibold">Bio</Label>
          <Textarea {...register("bio")} placeholder="Insert bio here..." />
          {errors.bio && (
            <p className="text-destructive text-sm">{errors.bio.message}</p>
          )}
        </div>
        <div className="flex items-center justify-end w-full">
          <Button
            disabled={profileMutation.isPending}
            type="submit"
            className={cn(
              profileMutation.isPending && "text-primary",
              "relative"
            )}
          >
            {profileMutation.isPending && (
              <LoadingSpinner className="stroke-muted w-12 h-12 absolute" />
            )}
            {t("save")}
          </Button>
        </div>
      </form>
    </div>
  );
}
