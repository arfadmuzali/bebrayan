import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export async function GET() {
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

    const chats = await prisma.chat.findMany({
      where: {
        OR: [
          {
            user1Id: "cma7vmu3l0000fdlngvmbfwvt",
          },
          {
            user2Id: "cma7vmu3l0000fdlngvmbfwvt",
          },
        ],
      },
      include: {
        user1: {
          select: {
            image: true,
            name: true,
            id: true,
          },
        },
        user2: {
          select: {
            image: true,
            name: true,
            id: true,
          },
        },
      },
    });

    return NextResponse.json(chats);
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

const createChatSchema = z.object({
  id: z.string(),
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
    const { data: request, error } = await createChatSchema.safeParseAsync(
      body
    );

    if (error) {
      return NextResponse.json(
        {
          error: {
            message: "Bad request",
          },
        },
        { status: 400 }
      );
    }

    if (session.user.id == request.id) {
      return NextResponse.json(
        {
          error: {
            message: "You cant chat with yourself",
          },
        },
        { status: 403 }
      );
    }

    const existingChat = await prisma.chat.findFirst({
      where: {
        OR: [
          {
            user1Id: session.user.id,
            user2Id: request.id,
          },
          {
            user1Id: request.id,
            user2Id: session.user.id,
          },
        ],
      },
      select: {
        id: true,
      },
    });

    if (existingChat) {
      return NextResponse.json({
        url: "/message/" + existingChat.id,
      });
    }

    const chat = await prisma.chat.create({
      data: {
        user1Id: session.user.id,
        user2Id: request.id,
      },
      select: {
        id: true,
      },
    });

    return NextResponse.json({
      url: "/message/" + chat.id,
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
