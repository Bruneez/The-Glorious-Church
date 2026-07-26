import { ROLES, normalizeRole } from './roles.js';
import { SORT_DIRECTION, SORT_TYPES, sortData } from '../utils/tableSort.js';

/** Ascending role order for staff table column sorting. */
export const STAFF_TABLE_ROLE_SORT_ORDER = [
  ROLES.ADMIN,
  ROLES.ELDER,
  ROLES.LEADER,
  ROLES.LEAD_PASTOR,
  ROLES.PASTOR,
];

export const DEFAULT_STAFF_TABLE_SORT = {
  column: 'name',
  direction: SORT_DIRECTION.ASC,
};

export function filterStaffMembers(staff = [], searchTerm = '', filterRole = 'all') {
  let filtered = [...staff];

  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    filtered = filtered.filter(
      (member) =>
        member.name?.toLowerCase().includes(term) ||
        member.fullName?.toLowerCase().includes(term) ||
        member.email?.toLowerCase().includes(term),
    );
  }

  if (filterRole !== 'all') {
    filtered = filtered.filter((member) => normalizeRole(member.role) === filterRole);
  }

  return filtered;
}

export function sortStaffMembers(staff = [], sortColumn, sortDirection) {
  switch (sortColumn) {
    case 'name':
      return sortData(staff, 'name', sortDirection, {
        type: SORT_TYPES.STRING,
        getValue: (row) => row.fullName || row.name || '',
      });
    case 'email':
      return sortData(staff, 'email', sortDirection, { type: SORT_TYPES.STRING });
    case 'role':
      return sortData(staff, 'role', sortDirection, {
        type: SORT_TYPES.ORDERED,
        order: STAFF_TABLE_ROLE_SORT_ORDER,
        getValue: (row) => normalizeRole(row.role) || '',
      });
    case 'lastSeenAt':
      return sortData(staff, 'lastSeenAt', sortDirection, { type: SORT_TYPES.ACTIVITY });
    default:
      return [...staff];
  }
}

export function resolveStaffTableSort(sortColumn = null, sortDirection = null) {
  return {
    column: sortColumn ?? DEFAULT_STAFF_TABLE_SORT.column,
    direction: sortDirection ?? DEFAULT_STAFF_TABLE_SORT.direction,
  };
}

/**
 * Applies staff table filters first, then sorting.
 * Default name A-Z is used until the user selects a column sort.
 */
export function prepareStaffTableRows(
  staff = [],
  { searchTerm = '', filterRole = 'all', sortColumn = null, sortDirection = null } = {},
) {
  const filtered = filterStaffMembers(staff, searchTerm, filterRole);
  const { column, direction } = resolveStaffTableSort(sortColumn, sortDirection);
  return sortStaffMembers(filtered, column, direction);
}

const ROLE_CARD_LABELS = {
  [ROLES.LEAD_PASTOR]: 'Total Lead Pastors',
  [ROLES.PASTOR]: 'Total Pastors',
  [ROLES.ELDER]: 'Total Elders',
  [ROLES.LEADER]: 'Total Leaders',
  [ROLES.ADMIN]: 'Total Administrators',
};

export function getStaffSummaryCards(staff = []) {
  const roleCounts = {};

  Object.values(ROLES).forEach((role) => {
    roleCounts[role] = 0;
  });

  staff.forEach((member) => {
    const role = normalizeRole(member.role) || 'Unassigned';
    roleCounts[role] = (roleCounts[role] || 0) + 1;
  });

  const cards = Object.values(ROLES).map((role) => ({
    key: role,
    label: ROLE_CARD_LABELS[role] || `Total ${role}`,
    value: roleCounts[role] || 0,
  }));

  Object.entries(roleCounts).forEach(([role, count]) => {
    if (!Object.values(ROLES).includes(role) && role !== 'Unassigned' && count > 0) {
      cards.push({
        key: role,
        label: `Total ${role}`,
        value: count,
      });
    }
  });

  cards.push({
    key: 'total',
    label: 'Total System Users',
    value: staff.length,
    highlight: true,
  });

  return cards;
}
