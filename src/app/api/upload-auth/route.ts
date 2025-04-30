import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { getUploadAuthParams } from "@imagekit/next/server";

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

    const uploadParams = getUploadAuthParams({
      privateKey: process.env.UPLOAD_PRIVATE_KEY!,
      publicKey: process.env.NEXT_PUBLIC_UPLOAD_PUBLIC_KEY!,
    });

    return NextResponse.json({
      ...uploadParams,
      publicKey: process.env.NEXT_PUBLIC_UPLOAD_PUBLIC_KEY!,
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
