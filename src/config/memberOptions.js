export const GENDER_OPTIONS = [
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
];

export const OCCUPATION_OPTIONS = [
  { value: 'Primary School', label: 'Primary School' },
  { value: 'High School', label: 'High School' },
  { value: 'University / College', label: 'University / College' },
  { value: 'Working', label: 'Working' },
  { value: 'Unemployed', label: 'Unemployed' },
];

export const PRIMARY_GRADE_OPTIONS = [
  { value: 'Grade R', label: 'Grade R' },
  { value: 'Grade 1', label: 'Grade 1' },
  { value: 'Grade 2', label: 'Grade 2' },
  { value: 'Grade 3', label: 'Grade 3' },
  { value: 'Grade 4', label: 'Grade 4' },
  { value: 'Grade 5', label: 'Grade 5' },
  { value: 'Grade 6', label: 'Grade 6' },
  { value: 'Grade 7', label: 'Grade 7' },
];

export const HIGH_GRADE_OPTIONS = [
  { value: 'Grade 8', label: 'Grade 8' },
  { value: 'Grade 9', label: 'Grade 9' },
  { value: 'Grade 10', label: 'Grade 10' },
  { value: 'Grade 11', label: 'Grade 11' },
  { value: 'Grade 12', label: 'Grade 12' },
];

export const MEMBER_STATUS = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
};

export const MEMBER_FORM_STATUS_OPTIONS = [
  { value: MEMBER_STATUS.ACTIVE, label: 'Active' },
  { value: MEMBER_STATUS.INACTIVE, label: 'Inactive' },
];

export const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: MEMBER_STATUS.ACTIVE, label: 'Active Only' },
  { value: MEMBER_STATUS.INACTIVE, label: 'Inactive Only' },
];

export function getMemberDepartment(member) {
  return member?.department || member?.creativeArts || '';
}

export function getStaffDepartment(staffProfile) {
  return staffProfile?.department || staffProfile?.creativeArts || '';
}

export function getMemberFullName(member) {
  return `${member?.name || ''} ${member?.surname || ''}`.trim();
}

export function toSchoolSelectOptions(schools) {
  return schools.map((school) => ({
    value: school.name,
    label: school.name,
  }));
}

export function getOccupationDisplay(member) {
  const occupation = member?.occupation || '';

  if (occupation === 'Primary School' || occupation === 'High School') {
    const details = [member?.school, member?.grade].filter(Boolean).join(' • ');
    return { primary: occupation, secondary: details };
  }

  if (occupation === 'University / College') {
    const details = [member?.institution, member?.course].filter(Boolean).join(' • ');
    return { primary: occupation, secondary: details };
  }

  return { primary: occupation, secondary: '' };
}

export function normalizeOccupationForForm(occupation) {
  const value = String(occupation || '').trim();
  const legacyMap = {
    University: 'University / College',
    College: 'University / College',
    Work: 'Working',
    'Employed / Workplace': 'Working',
  };
  return legacyMap[value] || value;
}

export function mapMemberToFormData(member) {
  if (!member) {
    return {
      name: '',
      surname: '',
      phone: '',
      gender: '',
      occupation: '',
      status: MEMBER_STATUS.ACTIVE,
      dob: '',
      dateOfSalvation: '',
      address: '',
      photo: '',
      school: '',
      grade: '',
      institution: '',
      course: '',
    };
  }

  return {
    name: member.name || '',
    surname: member.surname || '',
    phone: member.phone || '',
    gender: member.gender || '',
    occupation: normalizeOccupationForForm(member.occupation),
    status: member.status || MEMBER_STATUS.ACTIVE,
    dob: member.dob || '',
    dateOfSalvation: member.dateOfSalvation || '',
    address: member.address || '',
    photo: member.photo || '',
    school: member.school || '',
    grade: member.grade || '',
    institution: member.institution || '',
    course: member.course || '',
  };
}

export function buildMemberPayload(formData, existingStatus) {
  const base = {
    name: formData.name.trim(),
    surname: formData.surname.trim(),
    phone: formData.phone?.trim() || '',
    gender: formData.gender || '',
    occupation: formData.occupation || '',
    dob: formData.dob || '',
    dateOfSalvation: formData.dateOfSalvation || '',
    address: formData.address?.trim() || '',
    photo: formData.photo || '',
    department: formData.department || '',
    status: formData.status || existingStatus || MEMBER_STATUS.ACTIVE,
  };

  const occupation = formData.occupation;

  if (occupation === 'Primary School' || occupation === 'High School') {
    return {
      ...base,
      school: formData.school?.trim() || '',
      grade: formData.grade || '',
      institution: '',
      course: '',
    };
  }

  if (occupation === 'University / College') {
    return {
      ...base,
      school: '',
      grade: '',
      institution: formData.institution?.trim() || '',
      course: formData.course?.trim() || '',
    };
  }

  return {
    ...base,
    school: '',
    grade: '',
    institution: '',
    course: '',
  };
}

export function memberBelongsToDepartment(member, department) {
  if (!department) return true;
  return getMemberDepartment(member) === department;
}
