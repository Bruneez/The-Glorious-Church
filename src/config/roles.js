export const ROLES = {
  ADMIN: 'Admin',
  PASTOR: 'Pastor',
  CA_LEADER: 'Creative Arts Leader',
};

const ROLE_LABELS = {
  [ROLES.ADMIN]: 'Admin',
  [ROLES.PASTOR]: 'Pastor',
  [ROLES.CA_LEADER]: 'Leader',
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

export function getRoleLabel(role) {
  const normalized = normalizeRole(role);
  if (!normalized) return role || 'Unknown';
  return ROLE_LABELS[normalized] || normalized;
}

export function isCALeader(role) {
  const normalized = normalizeRole(role);
  return normalized === ROLES.CA_LEADER;
}

export function isAdminOrPastor(role) {
  const normalized = normalizeRole(role);
  return normalized === ROLES.ADMIN || normalized === ROLES.PASTOR;
}
