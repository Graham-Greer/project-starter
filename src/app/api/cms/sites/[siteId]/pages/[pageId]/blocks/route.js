import { NextResponse } from "next/server";
import { ForbiddenError, UnauthorizedError, getRequestUser } from "@/lib/auth";
import { safeWriteCmsAuditLog } from "@/lib/cms/audit-log";
import { createSecureCmsDataServices } from "@/lib/data";
import { validateBlock } from "@/lib/validation";

export async function GET(_request, { params }) {
  try {
    const { siteId, pageId } = await params;
    const cms = createSecureCmsDataServices();
    const page = await cms.pages.getPage(siteId, pageId);

    if (!page) {
      return NextResponse.json({ ok: false, error: `Page "${pageId}" not found.` }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      siteId,
      pageId,
      blocks: Array.isArray(page.blocks) ? page.blocks : [],
      draftVersion: page.draftVersion || 1,
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 403 });
    }
    return NextResponse.json({ ok: false, error: "Failed to load page blocks" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { siteId, pageId } = await params;
    const payload = await request.json();
    const blocks = payload?.blocks;

    if (!Array.isArray(blocks)) {
      return NextResponse.json({ ok: false, error: "blocks must be an array" }, { status: 400 });
    }

    const validationErrors = [];
    blocks.forEach((block, index) => {
      const result = validateBlock(block);
      if (!result.valid) {
        validationErrors.push({
          index,
          errors: result.errors,
        });
      }
    });

    if (validationErrors.length > 0) {
      return NextResponse.json(
        {
          ok: false,
          error: "One or more blocks are invalid.",
          validationErrors,
        },
        { status: 400 }
      );
    }

    const cms = createSecureCmsDataServices();
    const existingPage = await cms.pages.getPage(siteId, pageId);
    if (!existingPage) {
      return NextResponse.json({ ok: false, error: `Page "${pageId}" not found.` }, { status: 404 });
    }

    const user = await getRequestUser({ required: true });
    const now = new Date().toISOString();

    await cms.pages.saveDraftPage(siteId, pageId, {
      ...existingPage,
      blocks,
      draftVersion: (existingPage.draftVersion || 1) + 1,
      updatedAt: now,
      updatedBy: user.uid,
    });
    await safeWriteCmsAuditLog({
      cms,
      workspaceId: existingPage.workspaceId,
      actorUserId: user.uid,
      action: "page.blocks.saved",
      entityType: "page",
      entityId: pageId,
      siteId,
      pageId,
      summary: `Saved blocks for page "${existingPage.title || pageId}"`,
      metadata: {
        blockCount: blocks.length,
        draftVersion: (existingPage.draftVersion || 1) + 1,
      },
      createdAt: now,
    });

    return NextResponse.json({
      ok: true,
      siteId,
      pageId,
      blocks,
      draftVersion: (existingPage.draftVersion || 1) + 1,
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 403 });
    }
    return NextResponse.json({ ok: false, error: "Failed to save page blocks" }, { status: 500 });
  }
}
