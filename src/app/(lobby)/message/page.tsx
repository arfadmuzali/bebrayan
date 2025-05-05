"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Send } from "lucide-react";
import Image from "next/image";

export default function DefaultMessage() {
  return (
    <div className="w-full h-full relative ">
      <div className="p-2 border-b gap-2 border-muted flex items-center h-[57px]">
        <div className="relative h-10 w-10 flex items-center">
          <Image
            src={"/arfad.webp"}
            fill
            alt={"name"}
            sizes="3rem"
            className="rounded-full"
          />
        </div>
        <h3 className="font-semibold">{"Arfad Name"}</h3>
      </div>

      <div className="overflow-y-auto space-y-2 p-2 max-h-[75vh]">
        <div
          className={cn("w-full flex", true ? "justify-start" : "justify-end")}
        >
          <div
            className={cn(
              "p-2 text-sm border rounded-md w-min",
              true ? "rounded-ss-none" : "rounded-se-none"
            )}
          >
            Hello
          </div>
        </div>
        <div
          className={cn("w-full flex", false ? "justify-start" : "justify-end")}
        >
          <div
            className={cn(
              "p-2 text-sm border rounded-md w-min",
              false ? "rounded-ss-none" : "rounded-se-none"
            )}
          >
            Hello
          </div>
        </div>
        <div
          className={cn("w-full flex", true ? "justify-start" : "justify-end")}
        >
          <div
            className={cn(
              "p-2 text-sm border rounded-md w-min",
              true ? "rounded-ss-none" : "rounded-se-none"
            )}
          >
            Hello
          </div>
        </div>
        <div
          className={cn("w-full flex", true ? "justify-start" : "justify-end")}
        >
          <div
            className={cn(
              "p-2 text-sm border rounded-md w-min",
              true ? "rounded-ss-none" : "rounded-se-none"
            )}
          >
            Hello
          </div>
        </div>
        <div
          className={cn("w-full flex", true ? "justify-start" : "justify-end")}
        >
          <div
            className={cn(
              "p-2 text-sm border rounded-md w-min",
              true ? "rounded-ss-none" : "rounded-se-none"
            )}
          >
            Hello
          </div>
        </div>
        <div
          className={cn("w-full flex", true ? "justify-start" : "justify-end")}
        >
          <div
            className={cn(
              "p-2 text-sm border rounded-md w-min",
              true ? "rounded-ss-none" : "rounded-se-none"
            )}
          >
            Hello
          </div>
        </div>
        <div
          className={cn("w-full flex", true ? "justify-start" : "justify-end")}
        >
          <div
            className={cn(
              "p-2 text-sm border rounded-md w-min",
              true ? "rounded-ss-none" : "rounded-se-none"
            )}
          >
            Hello
          </div>
        </div>
        <div
          className={cn("w-full flex", true ? "justify-start" : "justify-end")}
        >
          <div
            className={cn(
              "p-2 text-sm border rounded-md w-min",
              true ? "rounded-ss-none" : "rounded-se-none"
            )}
          >
            Hello
          </div>
        </div>
        <div
          className={cn("w-full flex", true ? "justify-start" : "justify-end")}
        >
          <div
            className={cn(
              "p-2 text-sm border rounded-md w-min",
              true ? "rounded-ss-none" : "rounded-se-none"
            )}
          >
            Hello
          </div>
        </div>
        <div
          className={cn("w-full flex", true ? "justify-start" : "justify-end")}
        >
          <div
            className={cn(
              "p-2 text-sm border rounded-md w-min",
              true ? "rounded-ss-none" : "rounded-se-none"
            )}
          >
            Hello
          </div>
        </div>
        <div
          className={cn("w-full flex", true ? "justify-start" : "justify-end")}
        >
          <div
            className={cn(
              "p-2 text-sm border rounded-md w-min",
              true ? "rounded-ss-none" : "rounded-se-none"
            )}
          >
            Hello
          </div>
        </div>
        <div
          className={cn("w-full flex", true ? "justify-start" : "justify-end")}
        >
          <div
            className={cn(
              "p-2 text-sm border rounded-md w-min",
              true ? "rounded-ss-none" : "rounded-se-none"
            )}
          >
            Hello
          </div>
        </div>
        <div
          className={cn("w-full flex", true ? "justify-start" : "justify-end")}
        >
          <div
            className={cn(
              "p-2 text-sm border rounded-md w-min",
              true ? "rounded-ss-none" : "rounded-se-none"
            )}
          >
            Hello
          </div>
        </div>
      </div>

      <div className="absolute z-20 p-2 w-full flex gap-2 bottom-0">
        <Input placeholder="Message..." />{" "}
        <Button>
          <Send />
        </Button>
      </div>
    </div>
  );
}
