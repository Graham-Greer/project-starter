export function createAssetRepository({ adapter }) {
  return {
    async getAssetById(assetId) {
      return adapter.getDocument({ collection: "assets", id: assetId });
    },
    async createAsset(assetId, payload) {
      return adapter.setDocument({ collection: "assets", id: assetId, payload });
    },
    async listSiteAssets(siteId) {
      return adapter.listDocuments({ collection: "assets", where: [["siteId", "==", siteId]] });
    },
  };
}
