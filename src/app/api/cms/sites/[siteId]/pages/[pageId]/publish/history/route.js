import { NextResponse } from "next/server";
import { ForbiddenError, UnauthorizedError } from "@/lib/auth";
import { createSecureCmsDataServices } from "@/lib/data";

export async function GET(_request, { params }) {
  try {
    const { siteId, pageId } = await params;
    const cms = createSecureCmsDataServices();
    const [page, versions] = await Promise.all([
      cms.pages.getPage(siteId, pageId),
      cms.snapshots.listPageVersions(siteId),
    ]);

    if (!page) {
      return NextResponse.json({ ok: false, error: `Page "${pageId}" not found.` }, { status: 404 });
    }

    const history = (Array.isArray(versions) ? versions : [])
      .filter((version) => version?.pageId === pageId)
      .sort((a, b) => Date.parse(b?.publishedAt || 0) - Date.parse(a?.publishedAt || 0))
      .slice(0, 25)
      .map((version) => ({
        id: version.id,
        version: version.version || 0,
        sourceDraftVersion: version.sourceDraftVersion || 0,
        publishedAt: version.publishedAt || null,
        publishedBy: version.publishedBy || null,
        title: version?.snapshot?.title || "",
        slug: version?.snapshot?.slug || "",
        path: version?.snapshot?.path || "",
        isCurrentPublishedVersion: version.id === page.publishedVersionId,
      }));

    return NextResponse.json({
      ok: true,
      page: {
        id: page.id,
        title: page.title || "",
        publishedVersionId: page.publishedVersionId || "",
      },
      versions: history,
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 403 });
    }
    return NextResponse.json({ ok: false, error: "Failed to load publish history." }, { status: 500 });
  }
}
