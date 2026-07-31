import { SORT_DIRECTION, SORT_TYPES, sortData } from '../utils/tableSort.js';
import { MEMBERSHIP_NA } from './memberFormValidation.js';

export const DEFAULT_MEMBER_TABLE_SORT = {
  column: 'fullName',
  direction: SORT_DIRECTION.ASC,
};

function getMemberFullName(member) {
  if (member?.fullName) return String(member.fullName).trim();
  const firstName = member?.firstName || member?.name || '';
  const lastName = member?.lastName || member?.surname || '';
  return `${firstName} ${lastName}`.trim();
}

function getMemberCreativeArtsName(member, departments = []) {
  if (member?.creativeArtsName) return member.creativeArtsName;
  if (member?.department) return member.department;

  const teamId = String(member?.creativeArtsId || member?.departmentId || '').trim();
  if (!teamId) return '';

  const matched = departments.find((department) => department.id === teamId);
  return matched?.name || '';
}

function getMemberMinistryName(member, ministries = []) {
  if (member?.ministryName) return member.ministryName;

  const ministryId = String(member?.ministryId || '').trim();
  if (!ministryId) return '';

  const matched = ministries.find((ministry) => ministry.id === ministryId);
  return matched?.ministryName || '';
}

function getOccupationPrimary(member) {
  return member?.occupation || '';
}

export function getMemberTableCreativeArtsLabel(member, departments = []) {
  return getMemberCreativeArtsName(member, departments) || MEMBERSHIP_NA;
}

export function getMemberTableMinistryLabel(member, ministries = []) {
  return getMemberMinistryName(member, ministries) || MEMBERSHIP_NA;
}

export function resolveMemberTableSort(sortColumn = null, sortDirection = null) {
  return {
    column: sortColumn ?? DEFAULT_MEMBER_TABLE_SORT.column,
    direction: sortDirection ?? DEFAULT_MEMBER_TABLE_SORT.direction,
  };
}

export function sortMembersTable(
  members = [],
  sortColumn,
  sortDirection,
  { creativeArtsTeams = [], ministries = [] } = {},
) {
  switch (sortColumn) {
    case 'fullName':
      return sortData(members, 'fullName', sortDirection, {
        type: SORT_TYPES.STRING,
        getValue: (row) => getMemberFullName(row),
      });
    case 'phone':
      return sortData(members, 'phone', sortDirection, { type: SORT_TYPES.STRING });
    case 'occupation':
      return sortData(members, 'occupation', sortDirection, {
        type: SORT_TYPES.STRING,
        getValue: (row) => getOccupationPrimary(row),
      });
    case 'creativeArts':
      return sortData(members, 'creativeArts', sortDirection, {
        type: SORT_TYPES.STRING,
        getValue: (row) => getMemberTableCreativeArtsLabel(row, creativeArtsTeams),
      });
    case 'ministries':
      return sortData(members, 'ministries', sortDirection, {
        type: SORT_TYPES.STRING,
        getValue: (row) => getMemberTableMinistryLabel(row, ministries),
      });
    default:
      return [...members];
  }
}
