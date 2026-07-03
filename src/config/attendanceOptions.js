import { getMemberDepartment, getMemberFullName } from '@/config/memberOptions';

export const ATTENDANCE_STATUS = {
  PRESENT: 'Present',
  ABSENT: 'Absent',
};

export const ATTENDANCE_STATUS_OPTIONS = [
  { value: ATTENDANCE_STATUS.PRESENT, label: 'Present' },
  { value: ATTENDANCE_STATUS.ABSENT, label: 'Absent' },
];

export const DEPARTMENT_FILTER_ALL = 'all';

export function getDepartmentFilterOptions(members = []) {
  const departments = new Set();

  members.forEach((member) => {
    const department = getMemberDepartment(member);
    if (department) {
      departments.add(department);
    }
  });

  return [
    { value: DEPARTMENT_FILTER_ALL, label: 'All Departments' },
    ...Array.from(departments)
      .sort((a, b) => a.localeCompare(b))
      .map((department) => ({ value: department, label: department })),
  ];
}

export function filterMembersByDepartment(members, department) {
  if (!department || department === DEPARTMENT_FILTER_ALL) {
    return members;
  }

  return members.filter((member) => getMemberDepartment(member) === department);
}

export function filterMembersForAttendance(members, searchTerm, department) {
  const term = searchTerm.trim().toLowerCase();

  return filterMembersByDepartment(members, department).filter((member) => {
    if (!term) return true;

    const fullName = getMemberFullName(member).toLowerCase();
    const dept = getMemberDepartment(member).toLowerCase();

    return fullName.includes(term) || dept.includes(term);
  });
}

export function entriesToMarkings(entries = []) {
  const markings = {};

  entries.forEach(({ memberId, status }) => {
    if (memberId && status) {
      markings[memberId] = status;
    }
  });

  return markings;
}

export function buildAttendanceRecordPayload(session, markings, recordedBy, existingRecord = null) {
  const entries = Object.entries(markings)
    .filter(([, status]) => status === ATTENDANCE_STATUS.PRESENT || status === ATTENDANCE_STATUS.ABSENT)
    .map(([memberId, status]) => ({ memberId, status }));

  const present = entries.filter((entry) => entry.status === ATTENDANCE_STATUS.PRESENT).length;
  const absent = entries.filter((entry) => entry.status === ATTENDANCE_STATUS.ABSENT).length;

  return {
    serviceDate: session.serviceDate,
    date: session.serviceDate,
    present,
    totalPresent: present,
    absent,
    totalAbsent: absent,
    recordedBy: existingRecord?.recordedBy || recordedBy,
    entries,
  };
}

export function getRecordTotalPresent(record) {
  const value = record?.totalPresent ?? record?.present ?? record?.count ?? 0;
  return Number(value) || 0;
}

export function computeAttendanceStats(records = []) {
  if (!records.length) {
    return { highest: 0, average: 0 };
  }

  const values = records.map(getRecordTotalPresent);
  const highest = Math.max(...values);
  const average = Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);

  return { highest, average };
}

export function mapAttendanceRecordForTable(record) {
  return {
    id: record.id,
    attendanceDate: record.serviceDate || record.date || '',
    present: getRecordTotalPresent(record),
    absent: record.totalAbsent ?? record.absent ?? 0,
    recordedBy: record.recordedBy || '-',
    createdAt: record.createdAt || record.updatedAt || '',
  };
}

export function resolveAttendanceEntryMembers(entries = [], members = []) {
  const memberMap = new Map(members.map((member) => [member.id, member]));

  return entries.map((entry) => {
    const member = memberMap.get(entry.memberId);

    return {
      memberId: entry.memberId,
      status: entry.status,
      member,
      fullName: getMemberFullName(member) || 'Unknown Member',
      department: getMemberDepartment(member) || 'Unassigned',
    };
  });
}
