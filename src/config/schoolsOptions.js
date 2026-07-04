import { getMemberFullName, normalizeOccupationForForm } from '@/config/memberOptions';

export const SCHOOL_TYPE = {
  PRIMARY: 'primary',
  HIGH: 'high',
  HIGHER_EDUCATION: 'higher-education',
};

export const LEARNER_OCCUPATIONS = {
  PRIMARY: 'Primary School',
  HIGH: 'High School',
  UNIVERSITY: 'University / College',
};

export const SCHOOL_TYPE_OPTIONS = [
  { value: SCHOOL_TYPE.PRIMARY, label: 'Primary School' },
  { value: SCHOOL_TYPE.HIGH, label: 'High School' },
  { value: SCHOOL_TYPE.HIGHER_EDUCATION, label: 'University / College' },
];

export const SCHOOL_STATUS = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
};

export const SCHOOL_STATUS_OPTIONS = [
  { value: SCHOOL_STATUS.ACTIVE, label: 'Active' },
  { value: SCHOOL_STATUS.INACTIVE, label: 'Inactive' },
];

export function validateSchoolForm(formData) {
  if (!formData.name?.trim()) {
    return 'School Name is required.';
  }

  if (!formData.type) {
    return 'School Type is required.';
  }

  if (!formData.status) {
    return 'Status is required.';
  }

  return '';
}

export function buildSchoolPayload(formData, createdBy) {
  return {
    schoolName: formData.name.trim(),
    schoolType: formData.type,
    address: formData.address?.trim() || '',
    status: formData.status,
    createdBy,
    createdAt: new Date().toISOString(),
  };
}

export function buildSchoolUpdatePayload(formData) {
  return {
    schoolName: formData.name.trim(),
    schoolType: formData.type,
    address: formData.address?.trim() || '',
    status: formData.status,
  };
}

export function mapSchoolToFormData(school) {
  if (!school) {
    return {
      name: '',
      type: '',
      address: '',
      status: SCHOOL_STATUS.ACTIVE,
    };
  }

  return {
    name: school.schoolName || '',
    type: school.schoolType || '',
    address: school.address || '',
    status: school.status || SCHOOL_STATUS.ACTIVE,
  };
}

export function getSchoolTypeLabel(schoolType) {
  return SCHOOL_TYPE_OPTIONS.find((option) => option.value === schoolType)?.label || schoolType || '—';
}

export function getMemberSchoolReference(member) {
  const occupation = normalizeOccupationForForm(member?.occupation);

  if (occupation === LEARNER_OCCUPATIONS.UNIVERSITY) {
    return {
      schoolId: member?.schoolId || '',
      schoolName: member?.institution || member?.schoolName || member?.school || '',
    };
  }

  return {
    schoolId: member?.schoolId || '',
    schoolName: member?.school || member?.schoolName || '',
  };
}

export function occupationMatchesSchoolType(member, school) {
  const occupation = normalizeOccupationForForm(member?.occupation);

  if (school?.schoolType === SCHOOL_TYPE.PRIMARY) {
    return occupation === LEARNER_OCCUPATIONS.PRIMARY;
  }

  if (school?.schoolType === SCHOOL_TYPE.HIGH) {
    return occupation === LEARNER_OCCUPATIONS.HIGH;
  }

  if (school?.schoolType === SCHOOL_TYPE.HIGHER_EDUCATION) {
    return occupation === LEARNER_OCCUPATIONS.UNIVERSITY;
  }

  return false;
}

export function memberMatchesSchool(member, school) {
  if (!member || !school) return false;

  if (!occupationMatchesSchoolType(member, school)) {
    return false;
  }

  const memberReference = getMemberSchoolReference(member);
  const memberSchoolId = memberReference.schoolId?.trim();
  const memberSchoolName = memberReference.schoolName?.trim().toLowerCase();
  const schoolName = school.schoolName?.trim().toLowerCase();

  if (memberSchoolId && school.id && memberSchoolId === school.id) {
    return true;
  }

  if (!memberSchoolName || !schoolName) {
    return false;
  }

  return memberSchoolName === schoolName;
}

export function getMembersLinkedToSchool(members = [], school) {
  if (!school) return [];
  return members.filter((member) => memberMatchesSchool(member, school));
}

export function computeMemberCountsForSchools(members = [], schools = []) {
  return schools.reduce((counts, school) => {
    counts[school.id] = getMembersLinkedToSchool(members, school).length;
    return counts;
  }, {});
}

export function computeMemberCountsBySchool(members = [], schools = []) {
  if (schools.length > 0) {
    return computeMemberCountsForSchools(members, schools);
  }

  return members.reduce((counts, member) => {
    const { schoolName } = getMemberSchoolReference(member);
    const key = schoolName?.trim().toLowerCase();
    if (!key) return counts;
    counts[key] = (counts[key] || 0) + 1;
    return counts;
  }, {});
}

export function computeLearnerStatsByOccupation(members = []) {
  return members.reduce(
    (stats, member) => {
      const occupation = normalizeOccupationForForm(member.occupation);

      if (occupation === LEARNER_OCCUPATIONS.PRIMARY) {
        stats.primary += 1;
      } else if (occupation === LEARNER_OCCUPATIONS.HIGH) {
        stats.high += 1;
      } else if (occupation === LEARNER_OCCUPATIONS.UNIVERSITY) {
        stats.university += 1;
      }

      return stats;
    },
    { primary: 0, high: 0, university: 0 },
  );
}

export function mapSchoolForTable(school, memberCounts = {}) {
  return {
    id: school.id,
    schoolName: school.schoolName || '—',
    schoolType: getSchoolTypeLabel(school.schoolType),
    totalMembers: memberCounts[school.id] ?? 0,
    status: school.status || '—',
    raw: school,
  };
}

function displayValue(value) {
  if (value === null || value === undefined || value === '') return '—';
  return value;
}

export function mapLinkedMemberForDisplay(member) {
  return {
    id: member.id,
    fullName: getMemberFullName(member) || '—',
    occupation: normalizeOccupationForForm(member.occupation) || '—',
    grade: displayValue(member.grade),
    course: displayValue(member.course),
    status: member.status || '—',
    raw: member,
  };
}
