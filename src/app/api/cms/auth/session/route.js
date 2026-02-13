import { NextResponse } from "next/server";
import { CMS_SESSION_COOKIE_NAME } from "@/lib/auth";
import { getFirebaseEnvironment } from "@/lib/config";
import { getFirebaseAdminAuth } from "@/lib/firebase";

function getCookieOptions(maxAge = 60 * 60 * 24 * 5) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge,
  };
}

export async function POST(request) {
  try {
    const body = await request.json();
    const idToken = body?.idToken;
    if (!idToken || typeof idToken !== "string") {
      return NextResponse.json({ ok: false, error: "idToken is required" }, { status: 400 });
    }

    const environment = getFirebaseEnvironment();
    await getFirebaseAdminAuth(environment).verifyIdToken(idToken, true);

    const response = NextResponse.json({ ok: true });
    response.cookies.set(CMS_SESSION_COOKIE_NAME, idToken, getCookieOptions());
    return response;
  } catch (_error) {
    return NextResponse.json({ ok: false, error: "Invalid Firebase ID token" }, { status: 401 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(CMS_SESSION_COOKIE_NAME, "", getCookieOptions(0));
  return response;
}
