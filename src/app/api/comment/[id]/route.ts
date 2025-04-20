import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

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

    const comment = await prisma.comment.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        userId: true,
      },
    });

    if (!comment) {
      return NextResponse.json(
        {
          error: {
            message: "Comment not found",
          },
        },
        { status: 404 }
      );
    }

    if (comment.userId !== session.user.id) {
      return NextResponse.json(
        {
          error: {
            message: "Forbidden",
          },
        },
        { status: 403 }
      );
    }

    const deleteComment = await prisma.comment.delete({
      where: {
        id,
      },
      select: {
        id: true,
      },
    });
    return NextResponse.json(deleteComment);
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
