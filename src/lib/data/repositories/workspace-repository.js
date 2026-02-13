export function createWorkspaceRepository({ adapter }) {
  return {
    async getWorkspaceById(workspaceId) {
      return adapter.getDocument({ collection: "workspaces", id: workspaceId });
    },
    async createWorkspace(workspaceId, payload) {
      return adapter.setDocument({ collection: "workspaces", id: workspaceId, payload });
    },
    async updateWorkspace(workspaceId, payload) {
      return adapter.setDocument({ collection: "workspaces", id: workspaceId, payload, merge: true });
    },
    async getWorkspaceMember(workspaceId, userId) {
      return adapter.getDocument({ collection: `workspaces/${workspaceId}/members`, id: userId });
    },
    async upsertWorkspaceMember(workspaceId, userId, payload) {
      return adapter.setDocument({
        collection: `workspaces/${workspaceId}/members`,
        id: userId,
        payload,
        merge: true,
      });
    },
    async listWorkspaceMembers(workspaceId) {
      return adapter.listDocuments({ collection: `workspaces/${workspaceId}/members` });
    },
  };
}
