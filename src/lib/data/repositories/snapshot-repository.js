export function createSnapshotRepository({ adapter }) {
  return {
    async createPageVersion(siteId, versionId, payload) {
      return adapter.setDocument({ collection: `sites/${siteId}/pageVersions`, id: versionId, payload });
    },
    async getPageVersion(siteId, versionId) {
      return adapter.getDocument({ collection: `sites/${siteId}/pageVersions`, id: versionId });
    },
    async listPageVersions(siteId) {
      return adapter.listDocuments({ collection: `sites/${siteId}/pageVersions` });
    },
    async createSiteSnapshot(siteId, snapshotId, payload) {
      return adapter.setDocument({ collection: `sites/${siteId}/siteSnapshots`, id: snapshotId, payload });
    },
    async getSiteSnapshot(siteId, snapshotId) {
      return adapter.getDocument({ collection: `sites/${siteId}/siteSnapshots`, id: snapshotId });
    },
    async listSiteSnapshots(siteId) {
      return adapter.listDocuments({ collection: `sites/${siteId}/siteSnapshots` });
    },
  };
}
