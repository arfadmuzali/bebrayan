import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

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

    const { id } = await params;

    const post = await prisma.post.findUnique({
      where: {
        id,
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

    const isRepostExisting = await prisma.post.findUnique({
      where: {
        userId_originalPostId: {
          userId: session.user.id,
          originalPostId: post.id,
        },
      },
      select: {
        id: true,
      },
    });

    let reposted: boolean = false;

    if (isRepostExisting) {
      await prisma.post.delete({
        where: {
          userId_originalPostId: {
            userId: session.user.id,
            originalPostId: post.id,
          },
        },
        select: {
          id: true,
        },
      });
    } else {
      await prisma.post.create({
        data: {
          originalPostId: post.id,
          userId: session.user.id,
        },
        select: {
          id: true,
        },
      });
      reposted = true;
    }

    return NextResponse.json({ reposted });
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

export async function GET(
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

    const repost = await prisma.post.findUnique({
      where: {
        userId_originalPostId: {
          userId: session.user.id,
          originalPostId: id,
        },
      },
      select: {
        id: true,
      },
    });

    return NextResponse.json({ reposted: !!repost });
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
