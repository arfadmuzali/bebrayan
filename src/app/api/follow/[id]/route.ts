import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

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

    const profile = await prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!profile) {
      return NextResponse.json(
        {
          error: {
            message: "Profile not found",
          },
        },
        { status: 404 }
      );
    }

    const follows = await prisma.follows.findUnique({
      where: {
        followerId_followingId: {
          followerId: session.user.id,
          followingId: id,
        },
      },
    });

    const isFollowed = !!follows;

    return NextResponse.json({
      isFollowed,
      self: profile.id === session.user.id,
    });
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

    if (!id || id === session.user.id) {
      return NextResponse.json(
        {
          error: {
            message: "Bad request",
          },
        },
        { status: 400 }
      );
    }

    const existingFollow = await prisma.follows.findUnique({
      where: {
        followerId_followingId: {
          followerId: session.user.id,
          followingId: id,
        },
      },
    });

    if (existingFollow) {
      await prisma.follows.delete({
        where: {
          followerId_followingId: {
            followerId: session.user.id,
            followingId: id,
          },
        },
      });
    } else {
      await prisma.follows.create({
        data: {
          followerId: session.user.id,
          followingId: id,
        },
      });
    }

    return NextResponse.json({
      isFollowed: !existingFollow,
      self: false,
    });
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
