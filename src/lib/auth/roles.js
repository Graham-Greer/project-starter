export const CMS_ROLES = ["owner", "admin", "editor", "viewer"];

export function isValidCmsRole(role) {
  return CMS_ROLES.includes(role);
}

export function hasAnyRole(role, allowedRoles = []) {
  return Boolean(role) && allowedRoles.includes(role);
}
