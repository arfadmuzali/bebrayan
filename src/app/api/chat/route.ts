import { NextResponse } from "next/server";

export async function POST() {
  try {
    return NextResponse.json({});
  } catch (error) {
    console.log(error);

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
