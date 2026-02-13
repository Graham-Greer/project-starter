import "server-only";

import { cookies, headers } from "next/headers";
import { getFirebaseEnvironment } from "@/lib/config";
import { getFirebaseAdminAuth } from "@/lib/firebase";
import { CMS_SESSION_COOKIE_NAME } from "./constants";
import { UnauthorizedError } from "./errors";

function readBearerToken(authorizationHeader = "") {
  if (!authorizationHeader) return "";
  const [scheme, token] = authorizationHeader.split(" ");
  if (scheme?.toLowerCase() !== "bearer") return "";
  return token || "";
}

export async function getRequestUser({ required = true, environment } = {}) {
  const requestHeaders = await headers();
  const requestCookies = await cookies();
  const authHeader = requestHeaders.get("authorization");
  const tokenFromHeader = readBearerToken(authHeader || "");
  const tokenFromCustomHeader = requestHeaders.get("x-firebase-id-token") || "";
  const tokenFromCookie = requestCookies.get(CMS_SESSION_COOKIE_NAME)?.value || "";
  const idToken = tokenFromHeader || tokenFromCustomHeader || tokenFromCookie;

  if (!idToken) {
    if (!required) return null;
    throw new UnauthorizedError("Missing Firebase ID token");
  }

  const resolvedEnvironment = environment || getFirebaseEnvironment();
  const decoded = await getFirebaseAdminAuth(resolvedEnvironment).verifyIdToken(idToken, true);

  return {
    uid: decoded.uid,
    email: decoded.email || null,
    name: decoded.name || null,
    picture: decoded.picture || null,
    claims: decoded,
  };
}
