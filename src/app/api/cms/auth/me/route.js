import { NextResponse } from "next/server";
import { getRequestUser, UnauthorizedError } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getRequestUser({ required: true });
    return NextResponse.json({ ok: true, user });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 401 });
    }

    return NextResponse.json({ ok: false, error: "Failed to resolve current user" }, { status: 500 });
  }
}
