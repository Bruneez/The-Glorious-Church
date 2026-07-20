import { getMemberFullName, normalizeOccupationForForm } from '@/config/memberOptions';
import {
  ACCEPTED_SCHOOL_BADGE_ACCEPT,
  ACCEPTED_SCHOOL_BADGE_TYPES,
  MAX_SCHOOL_BADGE_SIZE_BYTES,
  validateSchoolBadgeFile,
} from '@/config/schoolsBadgeValidation';

export const SCHOOL_TYPE = {
  PRIMARY: 'Primary School',
  HIGH: 'High School',
  UNIVERSITY: 'University',
  COLLEGE: 'College',
};

export const LEGACY_SCHOOL_TYPE = {
  COMBINED_HIGHER_ED: 'University / College',
  SLUG_PRIMARY: 'primary',
  SLUG_HIGH: 'high',
  SLUG_HIGHER_ED: 'higher-education',
};

export const LEARNER_OCCUPATIONS = {
  PRIMARY: 'Primary School',
  HIGH: 'High School',
  UNIVERSITY: 'University',
  COLLEGE: 'College',
  LEGACY_HIGHER_ED: 'University / College',
};

export const SCHOOL_TYPE_OPTIONS = [
  { value: SCHOOL_TYPE.PRIMARY, label: 'Primary School' },
  { value: SCHOOL_TYPE.HIGH, label: 'High School' },
  { value: SCHOOL_TYPE.UNIVERSITY, label: 'University' },
  { value: SCHOOL_TYPE.COLLEGE, label: 'College' },
];

export const SCHOOL_STATUS = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
};

export const SCHOOL_STATUS_OPTIONS = [
  { value: SCHOOL_STATUS.ACTIVE, label: 'Active' },
  { value: SCHOOL_STATUS.INACTIVE, label: 'Inactive' },
];

export {
  ACCEPTED_SCHOOL_BADGE_ACCEPT,
  ACCEPTED_SCHOOL_BADGE_TYPES,
  MAX_SCHOOL_BADGE_SIZE_BYTES,
  validateSchoolBadgeFile,
} from '@/config/schoolsBadgeValidation';

export {
  resolvePreviousSchoolBadgePath,
  shouldCleanupPreviousSchoolBadge,
} from '@/services/schoolsStorageLifecycle';

const LEGACY_SCHOOL_TYPE_MAP = {
  [LEGACY_SCHOOL_TYPE.SLUG_PRIMARY]: SCHOOL_TYPE.PRIMARY,
  [LEGACY_SCHOOL_TYPE.SLUG_HIGH]: SCHOOL_TYPE.HIGH,
  [LEGACY_SCHOOL_TYPE.SLUG_HIGHER_ED]: LEGACY_SCHOOL_TYPE.COMBINED_HIGHER_ED,
  [LEGACY_SCHOOL_TYPE.COMBINED_HIGHER_ED]: LEGACY_SCHOOL_TYPE.COMBINED_HIGHER_ED,
  [SCHOOL_TYPE.PRIMARY]: SCHOOL_TYPE.PRIMARY,
  [SCHOOL_TYPE.HIGH]: SCHOOL_TYPE.HIGH,
  [SCHOOL_TYPE.UNIVERSITY]: SCHOOL_TYPE.UNIVERSITY,
  [SCHOOL_TYPE.COLLEGE]: SCHOOL_TYPE.COLLEGE,
};

export function normalizeSchoolType(schoolType) {
  const value = String(schoolType || '').trim();
  return LEGACY_SCHOOL_TYPE_MAP[value] || value;
}

export function schoolBelongsToCategory(school, category) {
  const normalizedSchoolType = normalizeSchoolType(school?.schoolType);
  const normalizedCategory = normalizeSchoolType(category);

  if (normalizedCategory === SCHOOL_TYPE.UNIVERSITY) {
    return (
      normalizedSchoolType === SCHOOL_TYPE.UNIVERSITY ||
      normalizedSchoolType === LEGACY_SCHOOL_TYPE.COMBINED_HIGHER_ED
    );
  }

  if (normalizedCategory === SCHOOL_TYPE.COLLEGE) {
    return normalizedSchoolType === SCHOOL_TYPE.COLLEGE;
  }

  return normalizedSchoolType === normalizedCategory;
}

export function schoolMatchesTypeFilter(school, typeFilter) {
  if (!typeFilter) return true;

  if (typeFilter === LEGACY_SCHOOL_TYPE.SLUG_HIGHER_ED) {
    return normalizeSchoolType(school?.schoolType) === LEGACY_SCHOOL_TYPE.COMBINED_HIGHER_ED;
  }

  return schoolBelongsToCategory(school, typeFilter);
}

export function getSchoolBadge(school) {
  return school?.badgeUrl || school?.logo || school?.photo || '';
}

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

function buildSchoolBadgeFields(formData, initialData = null) {
  if (formData.removeBadge) {
    return {
      badgeUrl: '',
      badgePath: '',
      logo: '',
      photo: '',
    };
  }

  const badgeUrl =
    formData.badgeUrl ??
    formData.logo ??
    getSchoolBadge(initialData) ??
    '';
  const badgePath = formData.badgePath ?? initialData?.badgePath ?? '';

  return {
    badgeUrl,
    badgePath,
    logo: badgeUrl,
    photo: badgeUrl,
  };
}

export function buildSchoolPayload(formData, createdBy) {
  return {
    schoolName: formData.name.trim(),
    schoolType: normalizeSchoolType(formData.type),
    address: formData.address?.trim() || '',
    status: formData.status,
    ...buildSchoolBadgeFields(formData),
    createdBy,
    createdAt: new Date().toISOString(),
  };
}

export function buildSchoolUpdatePayload(formData, initialData = null) {
  return {
    schoolName: formData.name.trim(),
    schoolType: normalizeSchoolType(formData.type),
    address: formData.address?.trim() || '',
    status: formData.status,
    ...buildSchoolBadgeFields(formData, initialData),
  };
}

export function mapSchoolToFormData(school) {
  if (!school) {
    return {
      name: '',
      type: '',
      address: '',
      status: SCHOOL_STATUS.ACTIVE,
      badgeUrl: '',
      badgePath: '',
    };
  }

  return {
    name: school.schoolName || '',
    type: normalizeSchoolType(school.schoolType) || '',
    address: school.address || '',
    status: school.status || SCHOOL_STATUS.ACTIVE,
    badgeUrl: getSchoolBadge(school),
    badgePath: school.badgePath || '',
  };
}

export function getSchoolTypeLabel(schoolType) {
  const normalized = normalizeSchoolType(schoolType);

  if (normalized === LEGACY_SCHOOL_TYPE.COMBINED_HIGHER_ED) {
    return LEGACY_SCHOOL_TYPE.COMBINED_HIGHER_ED;
  }

  return SCHOOL_TYPE_OPTIONS.find((option) => option.value === normalized)?.label || normalized || '—';
}

export function getMemberSchoolReference(member) {
  const occupation = normalizeOccupationForForm(member?.occupation);

  if (
    occupation === LEARNER_OCCUPATIONS.UNIVERSITY ||
    occupation === LEARNER_OCCUPATIONS.COLLEGE ||
    occupation === LEARNER_OCCUPATIONS.LEGACY_HIGHER_ED
  ) {
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
  const normalizedSchoolType = normalizeSchoolType(school?.schoolType);

  if (normalizedSchoolType === SCHOOL_TYPE.PRIMARY) {
    return occupation === LEARNER_OCCUPATIONS.PRIMARY;
  }

  if (normalizedSchoolType === SCHOOL_TYPE.HIGH) {
    return occupation === LEARNER_OCCUPATIONS.HIGH;
  }

  if (normalizedSchoolType === SCHOOL_TYPE.UNIVERSITY) {
    return (
      occupation === LEARNER_OCCUPATIONS.UNIVERSITY ||
      occupation === LEARNER_OCCUPATIONS.LEGACY_HIGHER_ED
    );
  }

  if (normalizedSchoolType === SCHOOL_TYPE.COLLEGE) {
    return occupation === LEARNER_OCCUPATIONS.COLLEGE;
  }

  if (normalizedSchoolType === LEGACY_SCHOOL_TYPE.COMBINED_HIGHER_ED) {
    return [
      LEARNER_OCCUPATIONS.UNIVERSITY,
      LEARNER_OCCUPATIONS.COLLEGE,
      LEARNER_OCCUPATIONS.LEGACY_HIGHER_ED,
    ].includes(occupation);
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
      } else if (occupation === LEARNER_OCCUPATIONS.COLLEGE) {
        stats.college += 1;
      } else if (occupation === LEARNER_OCCUPATIONS.LEGACY_HIGHER_ED) {
        // Legacy combined occupation is counted under university until migrated.
        stats.university += 1;
      }

      return stats;
    },
    { primary: 0, high: 0, university: 0, college: 0 },
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

// Backward compatibility for legacy campus pages still passing slug values.
export const HIGHER_EDUCATION = LEGACY_SCHOOL_TYPE.SLUG_HIGHER_ED;
