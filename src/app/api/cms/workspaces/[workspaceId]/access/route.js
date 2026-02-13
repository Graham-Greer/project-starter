import { NextResponse } from "next/server";
import { createDataServices } from "@/lib/data";
import { ForbiddenError, getRequestUser, requireWorkspaceRole, UnauthorizedError } from "@/lib/auth";

export async function GET(_request, { params }) {
  try {
    const { workspaceId } = await params;
    const user = await getRequestUser({ required: true });
    const data = createDataServices();

    const membership = await requireWorkspaceRole({
      workspacesRepository: data.workspaces,
      workspaceId,
      userId: user.uid,
      allowedRoles: ["owner", "admin", "editor", "viewer"],
    });

    return NextResponse.json({
      ok: true,
      workspaceId,
      user: { uid: user.uid, email: user.email },
      membership,
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 403 });
    }

    return NextResponse.json({ ok: false, error: "Failed to check workspace access" }, { status: 500 });
  }
}
