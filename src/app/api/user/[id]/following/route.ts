import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const followings = await prisma.user.findMany({
      where: {
        followings: {
          some: {
            followerId: id,
          },
        },
      },
      select: {
        id: true,
        image: true,
        name: true,
        bio: true,
      },
    });
    return NextResponse.json(followings);
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
