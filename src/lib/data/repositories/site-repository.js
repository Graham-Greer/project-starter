export function createSiteRepository({ adapter }) {
  return {
    async getSiteById(siteId) {
      return adapter.getDocument({ collection: "sites", id: siteId });
    },
    async createSite(siteId, payload) {
      return adapter.setDocument({ collection: "sites", id: siteId, payload });
    },
    async updateSite(siteId, payload) {
      return adapter.setDocument({ collection: "sites", id: siteId, payload, merge: true });
    },
    async listWorkspaceSites(workspaceId) {
      return adapter.listDocuments({ collection: "sites", where: [["workspaceId", "==", workspaceId]] });
    },
  };
}
