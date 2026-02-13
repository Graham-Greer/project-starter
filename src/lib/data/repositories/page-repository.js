export function createPageRepository({ adapter }) {
  function sanitizePagePayload(payload) {
    if (!payload || typeof payload !== "object") return {};
    const { id: _id, ...rest } = payload;
    return rest;
  }

  return {
    async getPage(siteId, pageId) {
      return adapter.getDocument({ collection: `sites/${siteId}/pages`, id: pageId });
    },
    async saveDraftPage(siteId, pageId, payload) {
      return adapter.setDocument({
        collection: `sites/${siteId}/pages`,
        id: pageId,
        payload: { ...sanitizePagePayload(payload), hasUnpublishedChanges: true },
        merge: true,
      });
    },
    async savePage(siteId, pageId, payload) {
      return adapter.setDocument({
        collection: `sites/${siteId}/pages`,
        id: pageId,
        payload: sanitizePagePayload(payload),
        merge: true,
      });
    },
    async listSitePages(siteId) {
      return adapter.listDocuments({ collection: `sites/${siteId}/pages` });
    },
    async deletePage(siteId, pageId) {
      return adapter.deleteDocument({ collection: `sites/${siteId}/pages`, id: pageId });
    },
  };
}
