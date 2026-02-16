export function createAuditLogRepository({ adapter }) {
  return {
    async createWorkspaceAuditLog(workspaceId, logId, payload) {
      return adapter.setDocument({
        collection: `workspaces/${workspaceId}/auditLogs`,
        id: logId,
        payload,
      });
    },
    async listWorkspaceAuditLogs(workspaceId) {
      return adapter.listDocuments({ collection: `workspaces/${workspaceId}/auditLogs` });
    },
  };
}
