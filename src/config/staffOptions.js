import { ROLES, normalizeRole } from './roles';

const ROLE_CARD_LABELS = {
  [ROLES.ADMIN]: 'Total Administrators',
  [ROLES.PASTOR]: 'Total Pastors',
  [ROLES.CA_LEADER]: 'Total Creative Arts Leaders',
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
