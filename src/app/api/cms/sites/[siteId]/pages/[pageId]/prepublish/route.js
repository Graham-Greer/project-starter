import { NextResponse } from "next/server";
import { ForbiddenError, UnauthorizedError } from "@/lib/auth";
import { createSecureCmsDataServices } from "@/lib/data";
import { runPrePublishChecks } from "@/lib/publish/run-prepublish-checks";

export async function GET(_request, { params }) {
  try {
    const { siteId, pageId } = await params;
    const cms = createSecureCmsDataServices();
    const result = await runPrePublishChecks({ cms, siteId, pageId });
    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error }, { status: result.statusCode || 400 });
    }
    return NextResponse.json({
      ok: true,
      valid: result.valid,
      checks: result.checks,
      checkedAt: new Date().toISOString(),
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 403 });
    }
    return NextResponse.json({ ok: false, error: "Failed to run pre-publish checks." }, { status: 500 });
  }
}
