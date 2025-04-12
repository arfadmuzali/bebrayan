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
    });

    if (existingLike) {
      await prisma.like.delete({
        where: { userId_postId: { userId: session.user.id, postId } },
      });
    } else {
      await prisma.like.create({
        data: { userId: session.user.id, postId },
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

    const postLikes = await prisma.like.findMany({
      where: {
        postId: {
          equals: postId,
        },
      },
      select: {
        id: true,
        userId: true,
        user: {
          select: {
            id: true,
            image: true,
            name: true,
          },
        },
      },
    });

    const isUserLiked = !!postLikes.find(
      (like) => like.userId === session?.user?.id
    );

    return NextResponse.json({ likes: postLikes, isUserLiked });
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
