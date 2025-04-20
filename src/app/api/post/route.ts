import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const postSchema = z.object({
  content: z
    .string()
    .max(320)
    .nonempty()
    .refine((val) => val.trim().length > 0),
});

export async function POST(req: NextRequest) {
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

    const { data: request, error } = await postSchema.safeParseAsync(body);

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

    const post = await prisma.post.create({
      data: {
        content: request.content,
        userId: session.user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(post);
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
