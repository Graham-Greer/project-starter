import { NextResponse } from "next/server";
import { createFirebaseAdapter } from "@/lib/data/adapters/firebase-adapter";

export async function GET() {
  const adapter = createFirebaseAdapter();

  return NextResponse.json({
    ok: true,
    environment: adapter.environment,
    configHealth: adapter.configHealth,
  });
}
