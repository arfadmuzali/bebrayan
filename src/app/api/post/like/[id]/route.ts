import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const likeSchema = z.object({
  like: z.boolean(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { data: request, error } = likeSchema.safeParse(body);
    const { id: postId } = await params;

    if (!postId || error) {
      return NextResponse.json(
        {
          error: {
            message: "Bad Request",
            errors: error,
          },
        },
        { status: 404 }
      );
    }

    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
      select: { id: true },
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

    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId: session.user?.id,
          postId,
        },
      },
      select: {
        id: true,
      },
    });

    if (existingLike) {
      await prisma.like.delete({
        where: { userId_postId: { userId: session.user.id, postId } },
        select: {
          id: true,
        },
      });
    } else {
      await prisma.like.create({
        data: { userId: session.user.id, postId },
        select: {
          id: true,
        },
      });
    }

    return NextResponse.json(request);
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

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ isUserLiked: false });
    }

    const { id: postId } = await params;

    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
      select: {
        id: true,
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

    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          postId: post.id,
          userId: session?.user?.id,
        },
      },
      select: {
        id: true,
      },
    });

    return NextResponse.json({ isUserLiked: !!existingLike });
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
