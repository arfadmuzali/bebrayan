import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { profileSchema } from "@/lib/schemas/profile-schema";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const userParamsSchema = z.object({
  take: z
    .string()
    .optional()
    .default("10")
    .transform((val) => parseInt(val))
    .refine((val) => !isNaN(val), {
      message: "limit must be a valid number",
    }),
  name: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json(
        {
          error: {
            message: "Unauthorized",
          },
        },
        { status: 401 }
      );
    }

    const query = Object.fromEntries(req.nextUrl.searchParams);

    const { data: requestParams, error } = userParamsSchema.safeParse(query);

    if (error) {
      return NextResponse.json(
        {
          error: {
            message: "Bad request",
            errors: error,
          },
        },
        { status: 400 }
      );
    }
    const users = await prisma.user.findMany({
      take: requestParams.take,
      where: {
        name: {
          contains: requestParams.name,
          mode: "insensitive",
        },
      },
      select: {
        id: true,
        image: true,
        name: true,
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        error: {
          message: "Internal Server Error",
        },
      },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          error: {
            message: "Unauthorized",
          },
        },
        { status: 401 }
      );
    }
    const body = await req.json();

    const { error, data: request } = await profileSchema.safeParseAsync(body);

    if (error) {
      return NextResponse.json(
        {
          error: {
            message: "Bad request",
            errors: error,
          },
        },
        { status: 400 }
      );
    }

    const updateUser = await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        image: request.image ?? undefined,
        bio: request.bio ?? undefined,
        name: request.username,
      },
    });

    return NextResponse.json(updateUser);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        error: {
          message: "Internal server error",
        },
      },
      { status: 500 }
    );
  }
}
