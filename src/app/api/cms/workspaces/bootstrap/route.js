import { NextResponse } from "next/server";
import { createSecureCmsDataServices } from "@/lib/data";
import { ForbiddenError, UnauthorizedError } from "@/lib/auth";

function validatePayload(payload) {
  if (!payload || typeof payload !== "object") return "Invalid JSON payload";
  if (!payload.workspaceId || typeof payload.workspaceId !== "string") return "workspaceId is required";
  if (!payload.name || typeof payload.name !== "string") return "name is required";
  return null;
}

export async function POST(request) {
  try {
    const payload = await request.json();
    const error = validatePayload(payload);
    if (error) {
      return NextResponse.json({ ok: false, error }, { status: 400 });
    }

    const cms = createSecureCmsDataServices();
    const workspace = await cms.workspaces.createWorkspace(payload.workspaceId, {
      name: payload.name,
    });

    return NextResponse.json({ ok: true, workspace }, { status: 201 });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 403 });
    }

    return NextResponse.json({ ok: false, error: "Failed to bootstrap workspace" }, { status: 500 });
  }
}
