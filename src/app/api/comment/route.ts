import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const commentSchema = z.object({
  postId: z.string(),
  content: z.string().nonempty().max(280),
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

    const { data: request, error } = await commentSchema.safeParseAsync(body);

    if (error) {
      return NextResponse.json(
        {
          error: {
            message: "Bad request",
          },
        },
        { status: 404 }
      );
    }

    const post = await prisma.post.findUnique({
      where: {
        id: request.postId,
      },
    });

    if (!post) {
      return NextResponse.json(
        {
          error: {
            message: "Post not found",
          },
        },
        { status: 404 }
      );
    }

    const comment = await prisma.comment.create({
      data: {
        postId: post.id,
        userId: session.user.id,
        content: request.content,
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

    return NextResponse.json(comment);
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
