import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    const { id } = await params;

    const posts = await prisma.post.findMany({
      orderBy: {
        createdAt: "desc",
      },
      where: {
        userId: id,
      },
      include: {
        user: {
          select: {
            image: true,
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
            reposts: true,
          },
        },
        originalPost: {
          include: {
            user: true,
            _count: {
              select: {
                comments: true,
                likes: true,
                reposts: true,
              },
            },
            likes: {
              where: {
                userId: session?.user?.id,
              },
              select: {
                id: true,
              },
            },
            reposts: {
              where: {
                userId: session?.user?.id,
              },
              select: {
                id: true,
              },
            },
          },
        },
        likes: {
          where: {
            userId: session?.user?.id,
          },
          select: {
            id: true,
          },
        },
        reposts: {
          where: {
            userId: session?.user?.id,
          },
          select: {
            id: true,
          },
        },
      },
    });

    return NextResponse.json(posts);
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
