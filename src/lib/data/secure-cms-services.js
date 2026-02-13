import "server-only";

import { getRequestUser, isValidCmsRole, requireWorkspaceRole } from "@/lib/auth";
import { createFirebaseAdapter } from "./adapters/firebase-adapter";
import {
  createAssetRepository,
  createPageRepository,
  createSiteRepository,
  createSnapshotRepository,
  createWorkspaceRepository,
} from "./repositories";

const WORKSPACE_READ_ROLES = ["owner", "admin", "editor", "viewer"];
const WORKSPACE_WRITE_ROLES = ["owner", "admin", "editor"];

export function createSecureCmsDataServices({ adapter, resolveUser = getRequestUser } = {}) {
  const resolvedAdapter = adapter || createFirebaseAdapter();
  const data = {
    workspaces: createWorkspaceRepository({ adapter: resolvedAdapter }),
    sites: createSiteRepository({ adapter: resolvedAdapter }),
    pages: createPageRepository({ adapter: resolvedAdapter }),
    snapshots: createSnapshotRepository({ adapter: resolvedAdapter }),
    assets: createAssetRepository({ adapter: resolvedAdapter }),
  };

  async function getCurrentUser() {
    return resolveUser({ required: true });
  }

  async function assertWorkspaceRole(workspaceId, allowedRoles) {
    const user = await getCurrentUser();
    await requireWorkspaceRole({
      workspacesRepository: data.workspaces,
      workspaceId,
      userId: user.uid,
      allowedRoles,
    });
    return user;
  }

  async function getSiteOrThrow(siteId) {
    const site = await data.sites.getSiteById(siteId);
    if (!site) throw new Error(`Site "${siteId}" not found`);
    return site;
  }

  return {
    workspaces: {
      async createWorkspace(workspaceId, payload) {
        const user = await getCurrentUser();
        const now = new Date().toISOString();

        await data.workspaces.createWorkspace(workspaceId, {
          ...payload,
          ownerUserId: user.uid,
          createdAt: payload?.createdAt || now,
          updatedAt: payload?.updatedAt || now,
        });

        await data.workspaces.upsertWorkspaceMember(workspaceId, user.uid, {
          role: "owner",
          status: "active",
          createdAt: now,
        });

        return data.workspaces.getWorkspaceById(workspaceId);
      },
      async getWorkspaceById(workspaceId) {
        await assertWorkspaceRole(workspaceId, WORKSPACE_READ_ROLES);
        return data.workspaces.getWorkspaceById(workspaceId);
      },
      async listWorkspaceMembers(workspaceId) {
        await assertWorkspaceRole(workspaceId, ["owner", "admin"]);
        return data.workspaces.listWorkspaceMembers(workspaceId);
      },
      async upsertWorkspaceMember(workspaceId, userId, payload) {
        if (payload?.role && !isValidCmsRole(payload.role)) {
          throw new Error(`Invalid CMS role "${payload.role}"`);
        }
        await assertWorkspaceRole(workspaceId, ["owner"]);
        return data.workspaces.upsertWorkspaceMember(workspaceId, userId, payload);
      },
    },
    sites: {
      async listWorkspaceSites(workspaceId) {
        await assertWorkspaceRole(workspaceId, WORKSPACE_READ_ROLES);
        return data.sites.listWorkspaceSites(workspaceId);
      },
      async createSite(siteId, payload) {
        await assertWorkspaceRole(payload.workspaceId, WORKSPACE_WRITE_ROLES);
        return data.sites.createSite(siteId, payload);
      },
      async updateSite(siteId, payload) {
        const site = await getSiteOrThrow(siteId);
        await assertWorkspaceRole(site.workspaceId, WORKSPACE_WRITE_ROLES);
        return data.sites.updateSite(siteId, payload);
      },
      async getSiteById(siteId) {
        const site = await getSiteOrThrow(siteId);
        await assertWorkspaceRole(site.workspaceId, WORKSPACE_READ_ROLES);
        return site;
      },
    },
    pages: {
      async getPage(siteId, pageId) {
        const site = await getSiteOrThrow(siteId);
        await assertWorkspaceRole(site.workspaceId, WORKSPACE_READ_ROLES);
        return data.pages.getPage(siteId, pageId);
      },
      async saveDraftPage(siteId, pageId, payload) {
        const site = await getSiteOrThrow(siteId);
        await assertWorkspaceRole(site.workspaceId, WORKSPACE_WRITE_ROLES);
        return data.pages.saveDraftPage(siteId, pageId, payload);
      },
      async savePage(siteId, pageId, payload) {
        const site = await getSiteOrThrow(siteId);
        await assertWorkspaceRole(site.workspaceId, WORKSPACE_WRITE_ROLES);
        return data.pages.savePage(siteId, pageId, payload);
      },
      async listSitePages(siteId) {
        const site = await getSiteOrThrow(siteId);
        await assertWorkspaceRole(site.workspaceId, WORKSPACE_READ_ROLES);
        return data.pages.listSitePages(siteId);
      },
      async deletePage(siteId, pageId) {
        const site = await getSiteOrThrow(siteId);
        await assertWorkspaceRole(site.workspaceId, WORKSPACE_WRITE_ROLES);
        return data.pages.deletePage(siteId, pageId);
      },
    },
    snapshots: {
      async createPageVersion(siteId, versionId, payload) {
        const site = await getSiteOrThrow(siteId);
        await assertWorkspaceRole(site.workspaceId, ["owner", "admin", "editor"]);
        return data.snapshots.createPageVersion(siteId, versionId, payload);
      },
      async getPageVersion(siteId, versionId) {
        const site = await getSiteOrThrow(siteId);
        await assertWorkspaceRole(site.workspaceId, WORKSPACE_READ_ROLES);
        return data.snapshots.getPageVersion(siteId, versionId);
      },
      async listPageVersions(siteId) {
        const site = await getSiteOrThrow(siteId);
        await assertWorkspaceRole(site.workspaceId, WORKSPACE_READ_ROLES);
        return data.snapshots.listPageVersions(siteId);
      },
      async createSiteSnapshot(siteId, snapshotId, payload) {
        const site = await getSiteOrThrow(siteId);
        await assertWorkspaceRole(site.workspaceId, ["owner", "admin", "editor"]);
        return data.snapshots.createSiteSnapshot(siteId, snapshotId, payload);
      },
      async getSiteSnapshot(siteId, snapshotId) {
        const site = await getSiteOrThrow(siteId);
        await assertWorkspaceRole(site.workspaceId, WORKSPACE_READ_ROLES);
        return data.snapshots.getSiteSnapshot(siteId, snapshotId);
      },
      async listSiteSnapshots(siteId) {
        const site = await getSiteOrThrow(siteId);
        await assertWorkspaceRole(site.workspaceId, WORKSPACE_READ_ROLES);
        return data.snapshots.listSiteSnapshots(siteId);
      },
    },
    assets: {
      async getAssetById(assetId) {
        const asset = await data.assets.getAssetById(assetId);
        if (!asset) return null;
        await assertWorkspaceRole(asset.workspaceId, WORKSPACE_READ_ROLES);
        return asset;
      },
      async createAsset(assetId, payload) {
        await assertWorkspaceRole(payload.workspaceId, WORKSPACE_WRITE_ROLES);
        return data.assets.createAsset(assetId, payload);
      },
      async listSiteAssets(siteId) {
        const site = await getSiteOrThrow(siteId);
        await assertWorkspaceRole(site.workspaceId, WORKSPACE_READ_ROLES);
        return data.assets.listSiteAssets(siteId);
      },
    },
  };
}
