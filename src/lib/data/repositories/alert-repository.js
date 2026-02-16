export function createAlertRepository({ adapter }) {
  return {
    async createWorkspaceAlert(workspaceId, alertId, payload) {
      return adapter.setDocument({
        collection: `workspaces/${workspaceId}/alerts`,
        id: alertId,
        payload,
      });
    },
    async updateWorkspaceAlert(workspaceId, alertId, payload) {
      return adapter.setDocument({
        collection: `workspaces/${workspaceId}/alerts`,
        id: alertId,
        payload,
        merge: true,
      });
    },
    async getWorkspaceAlert(workspaceId, alertId) {
      return adapter.getDocument({
        collection: `workspaces/${workspaceId}/alerts`,
        id: alertId,
      });
    },
    async listWorkspaceAlerts(workspaceId) {
      return adapter.listDocuments({ collection: `workspaces/${workspaceId}/alerts` });
    },
  };
}
