export function createAssetRepository({ adapter }) {
  return {
    async getAssetById(assetId) {
      return adapter.getDocument({ collection: "assets", id: assetId });
    },
    async createAsset(assetId, payload) {
      return adapter.setDocument({ collection: "assets", id: assetId, payload });
    },
    async updateAsset(assetId, payload) {
      return adapter.setDocument({ collection: "assets", id: assetId, payload, merge: true });
    },
    async deleteAsset(assetId) {
      return adapter.deleteDocument({ collection: "assets", id: assetId });
    },
    async listSiteAssets(siteId) {
      return adapter.listDocuments({ collection: "assets", where: [["siteId", "==", siteId]] });
    },
    async listWorkspaceAssets(workspaceId) {
      return adapter.listDocuments({ collection: "assets", where: [["workspaceId", "==", workspaceId]] });
    },
  };
}
