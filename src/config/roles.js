export const ROLES = {
  LEAD_PASTOR: 'Lead Pastor',
  PASTOR: 'Pastor',
  ELDER: 'Elder',
  LEADER: 'Leader',
  ADMIN: 'Admin',
};

/** @deprecated Use ROLES.LEADER */
export const CA_LEADER = ROLES.LEADER;

/** Roles with unrestricted application access. */
export const FULL_ACCESS_ROLES = [ROLES.LEAD_PASTOR];

/** Pastor and Admin share the same operational permissions for now. */
export const OPERATIONAL_STAFF_ROLES = [ROLES.PASTOR, ROLES.ADMIN];

export const ROLE_LIST = [
  ROLES.LEAD_PASTOR,
  ROLES.PASTOR,
  ROLES.ELDER,
  ROLES.LEADER,
  ROLES.ADMIN,
];

const ROLE_LABELS = {
  [ROLES.LEAD_PASTOR]: 'Lead Pastor',
  [ROLES.PASTOR]: 'Pastor',
  [ROLES.ELDER]: 'Elder',
  [ROLES.LEADER]: 'Leader',
  [ROLES.ADMIN]: 'Admin',
};

const ROLE_BY_LOWER = {
  'lead pastor': ROLES.LEAD_PASTOR,
  pastor: ROLES.PASTOR,
  elder: ROLES.ELDER,
  leader: ROLES.LEADER,
  'ca leader': ROLES.LEADER,
  'creative arts leader': ROLES.LEADER,
  admin: ROLES.ADMIN,
  administrator: ROLES.ADMIN,
};

export function normalizeRole(role) {
  const value = String(role || '').trim();
  if (!value) return '';

  if (Object.values(ROLES).includes(value)) {
    return value;
  }

  return ROLE_BY_LOWER[value.toLowerCase()] || value;
}

export function getRoleLabel(role) {
  const normalized = normalizeRole(role);
  if (!normalized) return role || 'Unknown';
  return ROLE_LABELS[normalized] || normalized;
}

export function getRoleBadgeClassName(role) {
  const normalized = normalizeRole(role);

  switch (normalized) {
    case ROLES.LEAD_PASTOR:
      return 'bg-yellow-950/60 text-yellow-400 border border-yellow-500/20';
    case ROLES.PASTOR:
      return 'bg-orange-950/60 text-orange-400 border border-orange-500/20';
    case ROLES.ELDER:
      return 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/20';
    case ROLES.LEADER:
      return 'bg-blue-950/60 text-blue-400 border border-blue-500/20';
    case ROLES.ADMIN:
      return 'bg-rose-950/60 text-rose-400 border border-rose-500/20';
    default:
      return 'bg-slate-800 text-slate-400 border border-slate-600/40';
  }
}

export const ROLE_SELECT_OPTIONS = ROLE_LIST.map((role) => ({
  value: role,
  label: getRoleLabel(role),
}));

export function isFullAccessRole(role) {
  return FULL_ACCESS_ROLES.includes(normalizeRole(role));
}

export function assertFullAccessRole(
  role,
  message = 'Only administrators can perform this action.',
) {
  if (!isFullAccessRole(role)) {
    throw new Error(message);
  }
}

/** Church-wide staff visibility (Lead Pastor, Pastor, and Admin). */
export function isChurchWideStaff(role) {
  const normalized = normalizeRole(role);
  return isFullAccessRole(normalized) || isOperationalStaffRole(normalized);
}

export function isOperationalStaffRole(role) {
  return OPERATIONAL_STAFF_ROLES.includes(normalizeRole(role));
}

export function isPastorRole(role) {
  return normalizeRole(role) === ROLES.PASTOR;
}

export function isElderRole(role) {
  return normalizeRole(role) === ROLES.ELDER;
}

export function isLeader(role) {
  return normalizeRole(role) === ROLES.LEADER;
}

export function isCALeader(role) {
  return isLeader(role);
}

export function isAdminOrPastor(role) {
  return isOperationalStaffRole(role);
}
