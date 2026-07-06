import { getMemberDepartment, getMemberFullName } from '@/config/memberOptions';
import { formatDate } from '@/utils/formatters';

export const ATTENDANCE_STATUS = {
  PRESENT: 'Present',
  ABSENT: 'Absent',
};

export const ATTENDANCE_STATUS_OPTIONS = [
  { value: ATTENDANCE_STATUS.PRESENT, label: 'Present' },
  { value: ATTENDANCE_STATUS.ABSENT, label: 'Absent' },
];

export const ATTENDANCE_RECORD_TYPE = {
  SERVICE: 'service',
  DEPARTMENT: 'department',
};

/** Legacy values written before the type field was standardized. */
const LEGACY_RECORD_TYPES = {
  SERVICE: 'service-summary',
  DEPARTMENT: 'department-rollcall',
};

export function getAttendanceDate(record) {
  return record?.attendanceDate || record?.serviceDate || record?.date || '';
}

export function getRecordMembers(record) {
  if (!record) return [];
  if (Array.isArray(record.members)) return record.members;
  if (Array.isArray(record.entries)) return record.entries;
  return [];
}

export function getRecordType(record) {
  return record?.type || record?.recordType || '';
}

export function isServiceAttendanceRecord(record) {
  if (!record) return false;

  const recordType = getRecordType(record);
  if (recordType === ATTENDANCE_RECORD_TYPE.SERVICE || recordType === LEGACY_RECORD_TYPES.SERVICE) {
    return true;
  }
  if (
    recordType === ATTENDANCE_RECORD_TYPE.DEPARTMENT ||
    recordType === LEGACY_RECORD_TYPES.DEPARTMENT
  ) {
    return false;
  }

  const members = getRecordMembers(record);
  const hasMembers = members.length > 0;
  return !hasMembers && (record.totalAttendance != null || record.visitors != null);
}

export function isDepartmentAttendanceRecord(record) {
  if (!record) return false;

  const recordType = getRecordType(record);
  if (
    recordType === ATTENDANCE_RECORD_TYPE.DEPARTMENT ||
    recordType === LEGACY_RECORD_TYPES.DEPARTMENT
  ) {
    return true;
  }
  if (recordType === ATTENDANCE_RECORD_TYPE.SERVICE || recordType === LEGACY_RECORD_TYPES.SERVICE) {
    return false;
  }

  return getRecordMembers(record).length > 0;
}

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

export function filterMembersForCALeader(members = [], staffProfile = null) {
  const departmentId = staffProfile?.departmentId || '';
  const departmentName =
    staffProfile?.departmentName ||
    staffProfile?.department ||
    staffProfile?.creativeArts ||
    '';

  if (!departmentId && !departmentName) {
    return [];
  }

  return members.filter((member) => {
    if (departmentId && member?.departmentId) {
      return member.departmentId === departmentId;
    }
    if (departmentName) {
      return getMemberDepartment(member) === departmentName;
    }
    return false;
  });
}

export function isServiceSummaryRecord(record) {
  return isServiceAttendanceRecord(record);
}

export function isDepartmentRollcallRecord(record) {
  return isDepartmentAttendanceRecord(record);
}

export function getRecordTotalAttendance(record) {
  if (isServiceAttendanceRecord(record)) {
    const value = record?.totalAttendance ?? record?.totalPresent ?? record?.present ?? 0;
    return Number(value) || 0;
  }
  return getRecordTotalPresent(record);
}

export function validateServiceSummaryForm(formData) {
  if (formData.totalAttendance === '' || formData.totalAttendance == null) {
    return 'Total Attendance is required.';
  }

  const total = parseInt(formData.totalAttendance, 10);
  if (Number.isNaN(total) || total < 0) {
    return 'Total Attendance must be a valid number.';
  }

  return '';
}

export function buildServiceSummaryPayload(session, formData, recordedBy, existingRecord = null) {
  const attendanceDate =
    session?.attendanceDate || session?.serviceDate || getAttendanceDate(existingRecord) || '';
  const totalAttendance = parseInt(formData.totalAttendance, 10);
  const visitors = parseInt(formData.visitors, 10) || 0;
  const firstTimeVisitors = parseInt(formData.firstTimeVisitors, 10) || 0;
  const salvations = parseInt(formData.salvations, 10) || 0;

  return {
    type: ATTENDANCE_RECORD_TYPE.SERVICE,
    attendanceDate,
    date: attendanceDate,
    totalAttendance,
    visitors,
    firstTimeVisitors,
    salvations,
    notes: formData.notes?.trim() || '',
    recordedBy: existingRecord?.recordedBy || recordedBy,
  };
}

export function mapServiceSummaryToFormData(record) {
  if (!record) {
    return {
      totalAttendance: '',
      visitors: '',
      firstTimeVisitors: '',
      salvations: '',
      notes: '',
    };
  }

  return {
    totalAttendance: record.totalAttendance ?? record.totalPresent ?? record.present ?? '',
    visitors: record.visitors ?? '',
    firstTimeVisitors: record.firstTimeVisitors ?? '',
    salvations: record.salvations ?? '',
    notes: record.notes || '',
  };
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

export function membersToMarkings(members = []) {
  const markings = {};

  members.forEach(({ memberId, status }) => {
    if (memberId && status) {
      markings[memberId] = status;
    }
  });

  return markings;
}

/** @deprecated Use membersToMarkings */
export const entriesToMarkings = membersToMarkings;

export function buildAttendanceRecordPayload(session, markings, recordedBy, existingRecord = null) {
  const members = Object.entries(markings)
    .filter(([, status]) => status === ATTENDANCE_STATUS.PRESENT || status === ATTENDANCE_STATUS.ABSENT)
    .map(([memberId, status]) => ({ memberId, status }));

  const totalPresent = members.filter((entry) => entry.status === ATTENDANCE_STATUS.PRESENT).length;
  const totalAbsent = members.filter((entry) => entry.status === ATTENDANCE_STATUS.ABSENT).length;
  const attendanceDate =
    session?.attendanceDate || session?.serviceDate || getAttendanceDate(existingRecord) || '';

  return {
    type: ATTENDANCE_RECORD_TYPE.DEPARTMENT,
    attendanceDate,
    date: attendanceDate,
    departmentId: session.departmentId || existingRecord?.departmentId || '',
    departmentName: session.departmentName || existingRecord?.departmentName || '',
    members,
    totalPresent,
    totalAbsent,
    recordedBy: existingRecord?.recordedBy || recordedBy,
  };
}

export function getRecordTotalPresent(record) {
  const value = record?.totalPresent ?? record?.present ?? record?.count ?? 0;
  return Number(value) || 0;
}

export function computeAttendanceStats(records = [], { summaryOnly = true } = {}) {
  const relevant = summaryOnly
    ? records.filter(isServiceAttendanceRecord)
    : records.filter(isDepartmentAttendanceRecord);

  if (!relevant.length) {
    return {
      highest: 0,
      average: 0,
      totalServices: 0,
      totalThisMonth: 0,
      visitorsThisMonth: 0,
      salvationsThisMonth: 0,
    };
  }

  const values = relevant.map(getRecordTotalAttendance);
  const highest = Math.max(...values);
  const average = Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const thisMonthRecords = relevant.filter((record) => {
    const dateValue = getAttendanceDate(record);
    if (!dateValue) return false;
    const date = new Date(dateValue);
    return !Number.isNaN(date.getTime()) && date >= monthStart;
  });

  const totalThisMonth = thisMonthRecords.reduce(
    (sum, record) => sum + getRecordTotalAttendance(record),
    0,
  );
  const visitorsThisMonth = thisMonthRecords.reduce(
    (sum, record) => sum + (Number(record.visitors) || 0),
    0,
  );
  const salvationsThisMonth = thisMonthRecords.reduce(
    (sum, record) => sum + (Number(record.salvations) || 0),
    0,
  );

  return {
    highest,
    average,
    totalServices: relevant.length,
    totalThisMonth,
    visitorsThisMonth,
    salvationsThisMonth,
  };
}

export function computeDepartmentAttendanceStats(records = []) {
  const rollcallRecords = records.filter(isDepartmentAttendanceRecord);

  if (!rollcallRecords.length) {
    return { highest: 0, average: 0 };
  }

  const values = rollcallRecords.map(getRecordTotalPresent);
  return {
    highest: Math.max(...values),
    average: Math.round(values.reduce((sum, value) => sum + value, 0) / values.length),
  };
}

export function filterAttendanceRecordsForSearch(mappedRecords = [], searchTerm = '') {
  const term = searchTerm.trim().toLowerCase();
  if (!term) return mappedRecords;

  return mappedRecords.filter((record) => {
    const haystack = [
      record.attendanceDate,
      record.attendanceDate ? formatDate(record.attendanceDate) : '',
      record.recordedBy,
      record.departmentName,
      String(record.present ?? ''),
      String(record.absent ?? ''),
      String(record.totalAttendance ?? ''),
      String(record.visitors ?? ''),
      String(record.salvations ?? ''),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return haystack.includes(term);
  });
}

export function filterAttendanceEntryMembers(entryMembers = [], searchTerm = '') {
  const term = searchTerm.trim().toLowerCase();
  if (!term) return entryMembers;

  return entryMembers.filter((entry) => {
    const haystack = [
      entry.fullName,
      entry.department,
      entry.status,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return haystack.includes(term);
  });
}

export function mapAttendanceRecordForTable(record, { viewMode = 'service' } = {}) {
  const base = {
    id: record.id,
    attendanceDate: getAttendanceDate(record),
    recordedBy: record.recordedBy || '-',
    createdAt: record.createdAt || record.updatedAt || '',
    type: getRecordType(record),
    raw: record,
  };

  if (viewMode === 'department' || isDepartmentAttendanceRecord(record)) {
    return {
      ...base,
      present: getRecordTotalPresent(record),
      absent: record.totalAbsent ?? record.absent ?? 0,
      departmentName: record.departmentName || '-',
    };
  }

  return {
    ...base,
    totalAttendance: getRecordTotalAttendance(record),
    visitors: record.visitors ?? 0,
    firstTimeVisitors: record.firstTimeVisitors ?? 0,
    salvations: record.salvations ?? 0,
  };
}

export function filterRecordsForRole(records = [], { isChurchWideUser, staffProfile }) {
  if (isChurchWideUser) {
    return records.filter(isServiceAttendanceRecord);
  }

  const departmentName =
    staffProfile?.departmentName ||
    staffProfile?.department ||
    staffProfile?.creativeArts ||
    '';
  const departmentId = staffProfile?.departmentId || '';

  return records.filter((record) => {
    if (!isDepartmentAttendanceRecord(record)) return false;
    if (departmentId && record.departmentId) {
      return record.departmentId === departmentId;
    }
    if (departmentName && record.departmentName) {
      return record.departmentName === departmentName;
    }
    return false;
  });
}

export function resolveAttendanceEntryMembers(members = [], memberDirectory = []) {
  const memberMap = new Map(memberDirectory.map((member) => [member.id, member]));

  return members.map((entry) => {
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
