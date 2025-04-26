import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const post = await prisma.post.findUnique({
      where: {
        id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
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

    return NextResponse.json(post);
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

export async function DELETE(
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

    const { id } = await params;

    const post = await prisma.post.findUnique({
      where: {
        id,
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

    if (post.userId !== session.user.id) {
      return NextResponse.json(
        {
          error: {
            message: "Forbidden",
          },
        },
        { status: 403 }
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.post.deleteMany({
        where: {
          originalPostId: post.id,
        },
      });
      await tx.post.delete({
        where: {
          id: post.id,
        },
      });
    });

    return NextResponse.json({ post: true });
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
