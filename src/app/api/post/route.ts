import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const postSchema = z.object({
  content: z
    .string()
    .max(320)
    .nonempty()
    .refine((val) => val.trim().length > 0),
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

    const { data: request, error } = await postSchema.safeParseAsync(body);

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

    const post = await prisma.post.create({
      data: {
        content: request.content,
        userId: session.user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(post);
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

const paramsPostSchema = z.object({
  cursor: z.string().optional(),
  take: z
    .string()
    .optional()
    .default("10")
    .transform((val) => parseInt(val))
    .refine((val) => !isNaN(val), {
      message: "limit must be a valid number",
    }),
  follow: z
    .string()
    .optional()
    .transform((val) => val?.toLowerCase() === "true"),
});

export async function GET(req: NextRequest) {
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

    const params = req.nextUrl.searchParams;

    const { data: requestParams, error } = paramsPostSchema.safeParse(
      Object.fromEntries(params)
    );

    if (error) {
      return NextResponse.json(
        {
          error: {
            message: "Bad request",
          },
          errors: error,
        },
        { status: 400 }
      );
    }
    const posts = await prisma.post.findMany({
      take: requestParams.take + 1,
      orderBy: {
        createdAt: "desc",
      },
      ...(requestParams.cursor && {
        cursor: {
          id: requestParams.cursor,
        },
        skip: 1,
      }),

      where: {
        ...(requestParams.follow && {
          user: {
            followings: {
              some: {
                // followerId: session.user.id,
                followerId: session.user.id,
              },
            },
          },
        }),
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

    const hasNextPage = posts.length > requestParams.take;
    const data = hasNextPage ? posts.slice(0, requestParams.take) : posts;

    const nextCursor = hasNextPage ? data[data.length - 1]?.id : null;
    return NextResponse.json({
      data,
      hasNextPage,
      nextCursor,
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
