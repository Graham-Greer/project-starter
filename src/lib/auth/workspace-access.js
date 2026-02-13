import "server-only";

import { ForbiddenError } from "./errors";
import { hasAnyRole } from "./roles";

export async function getWorkspaceMembership({ workspacesRepository, workspaceId, userId }) {
  return workspacesRepository.getWorkspaceMember(workspaceId, userId);
}

export async function requireWorkspaceRole({
  workspacesRepository,
  workspaceId,
  userId,
  allowedRoles,
}) {
  const membership = await getWorkspaceMembership({
    workspacesRepository,
    workspaceId,
    userId,
  });

  const membershipInactive = !membership || membership.status !== "active";
  if (membershipInactive) {
    throw new ForbiddenError("Workspace membership is missing or inactive");
  }

  if (!hasAnyRole(membership.role, allowedRoles)) {
    throw new ForbiddenError(`Role "${membership.role}" is not permitted`);
  }

  return membership;
}
