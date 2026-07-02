export const ROLES = {
  ADMIN: 'Admin',
  PASTOR: 'Pastor',
  CA_LEADER: 'Creative Arts Leader',
};

export function normalizeRole(role) {
  const value = String(role || '').trim();
  if (!value) return '';

  const lower = value.toLowerCase();
  if (lower === 'admin' || lower === 'administrator') return ROLES.ADMIN;
  if (lower === 'pastor') return ROLES.PASTOR;
  if (lower === 'ca leader' || lower === 'creative arts leader') return ROLES.CA_LEADER;
  return value;
}

export function isCALeader(role) {
  const normalized = normalizeRole(role);
  return normalized === ROLES.CA_LEADER;
}

export function isAdminOrPastor(role) {
  const normalized = normalizeRole(role);
  return normalized === ROLES.ADMIN || normalized === ROLES.PASTOR;
}
