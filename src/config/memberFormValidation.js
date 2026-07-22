export const CHURCH_CAPE_TOWN = 'Cape Town';

export const CHURCH_OPTIONS = [
  { value: CHURCH_CAPE_TOWN, label: CHURCH_CAPE_TOWN },
  { value: 'Upington', label: 'Upington' },
  { value: 'Midrand', label: 'Midrand' },
];

export const MEMBERSHIP_NA = 'N/A';

export const CHURCH_FILTER_OPTIONS = [
  { value: 'all', label: 'All Churches' },
  ...CHURCH_OPTIONS,
];

export function isCapeTownChurch(church) {
  return String(church || '').trim() === CHURCH_CAPE_TOWN;
}

export function isMembershipSelection(value) {
  const normalized = String(value || '').trim();
  return Boolean(normalized) && normalized !== MEMBERSHIP_NA;
}

export function inferMemberChurch(member) {
  const church = String(member?.church || '').trim();
  if (church) return church;

  if (member?.branch || member?.zoneSupervisor) {
    return CHURCH_CAPE_TOWN;
  }

  return '';
}

export function buildCreativeArtsSelectOptions(departments = []) {
  const activeDepartments = departments.filter(
    (department) => (department.status || 'Active') === 'Active',
  );

  return [
    { value: MEMBERSHIP_NA, label: MEMBERSHIP_NA },
    ...activeDepartments.map((department) => ({
      value: department.id,
      label: department.name || 'Unnamed Department',
    })),
  ];
}

export function buildMinistrySelectOptions(ministries = []) {
  const activeMinistries = ministries.filter(
    (ministry) => (ministry.status || 'Active') === 'Active',
  );

  return [
    { value: MEMBERSHIP_NA, label: MEMBERSHIP_NA },
    ...activeMinistries.map((ministry) => ({
      value: ministry.id,
      label: ministry.ministryName || 'Unnamed Ministry',
    })),
  ];
}

export function occupationRequiresSchool(occupation) {
  return [
    'Primary School',
    'High School',
    'University',
    'College',
    'University / College',
  ].includes(occupation);
}

export function validateMemberFormData(formData, {
  activeCreativeArtsTeams = [],
  activeMinistries = [],
  activeSchools = [],
} = {}) {
  if (!String(formData.church || '').trim()) {
    return 'Church is required.';
  }

  const creativeArtsSelection = String(formData.creativeArtsId || MEMBERSHIP_NA).trim();
  if (!creativeArtsSelection) {
    return 'Creative Arts selection is required.';
  }

  if (isMembershipSelection(creativeArtsSelection)) {
    const team = activeCreativeArtsTeams.find((department) => department.id === creativeArtsSelection);
    if (!team || (team.status || 'Active') !== 'Active') {
      return 'Select a valid active Creative Arts group or N/A.';
    }
  }

  const ministrySelection = String(formData.ministryId || MEMBERSHIP_NA).trim();
  if (!ministrySelection) {
    return 'Ministry selection is required.';
  }

  if (isMembershipSelection(ministrySelection)) {
    const ministry = activeMinistries.find((item) => item.id === ministrySelection);
    if (!ministry || (ministry.status || 'Active') !== 'Active') {
      return 'Select a valid active ministry or N/A.';
    }
  }

  const occupation = formData.occupation || '';
  if (occupationRequiresSchool(occupation)) {
    const schoolId = String(formData.schoolId || '').trim();
    if (!schoolId) {
      return 'A school or institution is required for the selected occupation.';
    }

    const school = activeSchools.find((item) => item.id === schoolId);
    if (!school || (school.status || 'Active') !== 'Active') {
      return 'Select a valid active school or institution.';
    }
  }

  return '';
}

export function applyChurchLocationFields(formData = {}) {
  const church = String(formData.church || '').trim();

  return {
    church,
    branch: isCapeTownChurch(church) ? (formData.branch || '') : '',
    zoneSupervisor: isCapeTownChurch(church) ? (formData.zoneSupervisor?.trim() || '') : '',
  };
}
