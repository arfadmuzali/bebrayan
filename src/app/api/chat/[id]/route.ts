import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import Pusher from "pusher";

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

    const chat = await prisma.chat.findUnique({
      where: {
        id,
      },
      include: {
        user1: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        user2: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        messages: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (!chat) {
      return NextResponse.json(
        {
          error: {
            message: "Chat not found",
          },
        },
        { status: 404 }
      );
    }

    if (
      session.user.id !== chat?.user1Id &&
      session.user.id !== chat?.user2Id
    ) {
      return NextResponse.json(
        {
          error: {
            message: "Forbidden",
          },
        },
        { status: 403 }
      );
    }

    //updating isRead
    await prisma.message.updateMany({
      where: {
        chatId: chat.id,
        userId: chat.user1Id === session.user.id ? chat.user2Id : chat.user1Id,
      },
      data: {
        isRead: true,
      },
    });

    return NextResponse.json(chat);
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

const messageSchema = z.object({ content: z.string() });
const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
});

// create message
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
    const body = await req.json();

    const { data: request, error } = await messageSchema.safeParseAsync(body);

    if (error || !body) {
      return NextResponse.json(
        {
          error: {
            message: "Bad request",
          },
        },
        { status: 400 }
      );
    }

    const message = await prisma.message.create({
      data: {
        content: request.content,
        chatId: id,
        userId: session.user.id,
      },
      include: {
        chat: {
          select: {
            user1Id: true,
            user2Id: true,
          },
        },
      },
    });

    pusher.trigger(
      [message.chat.user1Id, message.chat.user2Id],
      "chat",
      message
    );

    return NextResponse.json(message);
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
