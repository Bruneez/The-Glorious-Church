export const ROLES = {
  ADMIN: 'Admin',
  PASTOR: 'Pastor',
  CA_LEADER: 'Creative Arts Leader',
};

export function normalizeRole(role) {
  if (role === 'CA Leader') return ROLES.CA_LEADER;
  return role || '';
}

export function isCALeader(role) {
  const normalized = normalizeRole(role);
  return normalized === ROLES.CA_LEADER;
}

export function isAdminOrPastor(role) {
  const normalized = normalizeRole(role);
  return normalized === ROLES.ADMIN || normalized === ROLES.PASTOR;
}
