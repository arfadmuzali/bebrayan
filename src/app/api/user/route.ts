import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { profileSchema } from "@/lib/schemas/profileSchema";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json(
        {
          error: {
            message: "Unauthorized",
          },
        },
        { status: 401 }
      );
    }

    const user = await prisma.user.findMany();

    return NextResponse.json(user);
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

export async function PATCH(req: NextRequest) {
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

    const { error, data: request } = await profileSchema.safeParseAsync(body);

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

    const updateUser = await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        image: request.image ?? undefined,
        bio: request.bio ?? undefined,
        name: request.username,
      },
    });

    return NextResponse.json(updateUser);
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
