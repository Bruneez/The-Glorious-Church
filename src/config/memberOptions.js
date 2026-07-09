import {
  buildMemberHomeLocationFields,
  buildMemberWorkLocationFields,
  normalizeMemberCoordinate,
} from '@/utils/memberLocations';

export const GENDER_OPTIONS = [
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
];

export const LANGUAGE_OPTIONS = [
  { value: 'Afrikaans', label: 'Afrikaans' },
  { value: 'English', label: 'English' },
  { value: 'isiNdebele', label: 'isiNdebele' },
  { value: 'isiXhosa', label: 'isiXhosa' },
  { value: 'isiZulu', label: 'isiZulu' },
  { value: 'Sepedi', label: 'Sepedi' },
  { value: 'Sesotho', label: 'Sesotho' },
  { value: 'Setswana', label: 'Setswana' },
  { value: 'siSwati', label: 'siSwati' },
  { value: 'Tshivenda', label: 'Tshivenda' },
  { value: 'Xitsonga', label: 'Xitsonga' },
];

export const ETHNICITY_OPTIONS = [
  { value: 'Coloured', label: 'Coloured' },
  { value: 'White', label: 'White' },
  { value: 'Zulu', label: 'Zulu' },
  { value: 'Xhosa', label: 'Xhosa' },
  { value: 'Pedi', label: 'Pedi' },
  { value: 'Sotho', label: 'Sotho' },
  { value: 'Tswana', label: 'Tswana' },
  { value: 'Tsonga', label: 'Tsonga' },
  { value: 'Swati', label: 'Swati' },
  { value: 'Venda', label: 'Venda' },
  { value: 'Ndebele', label: 'Ndebele' },
  { value: 'Indian', label: 'Indian' },
];

export const BRANCH_OPTIONS = [
  { value: 'Korle-Bu', label: 'Korle-Bu' },
  { value: 'Delft North', label: 'Delft North' },
  { value: 'Symphony', label: 'Symphony' },
  { value: 'Leiden', label: 'Leiden' },
  { value: 'Delft South', label: 'Delft South' },
  { value: 'Belhar East', label: 'Belhar East' },
  { value: 'Eersteriver', label: 'Eersteriver' },
  { value: 'Outskirts', label: 'Outskirts' },
  { value: 'Kuilsriver', label: 'Kuilsriver' },
  { value: 'University', label: 'University' },
];

export const MEMBER_FORM_OCCUPATION_OPTIONS = [
  { value: 'Primary School', label: 'Primary School' },
  { value: 'High School', label: 'High School' },
  { value: 'College', label: 'College' },
  { value: 'University', label: 'University' },
  { value: 'Working', label: 'Working' },
  { value: 'Unemployed', label: 'Unemployed' },
];

export const OCCUPATION_OPTIONS = [
  ...MEMBER_FORM_OCCUPATION_OPTIONS,
  { value: 'University / College', label: 'University / College (Legacy)' },
];

const WORLD_COUNTRIES = [
  'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antigua and Barbuda', 'Argentina',
  'Armenia', 'Australia', 'Austria', 'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados',
  'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan', 'Bolivia', 'Bosnia and Herzegovina', 'Botswana',
  'Brazil', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Cabo Verde', 'Cambodia', 'Cameroon',
  'Canada', 'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia', 'Comoros', 'Congo',
  'Costa Rica', 'Croatia', 'Cuba', 'Cyprus', 'Czech Republic', 'Democratic Republic of the Congo',
  'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic', 'Ecuador', 'Egypt', 'El Salvador',
  'Equatorial Guinea', 'Eritrea', 'Estonia', 'Eswatini', 'Ethiopia', 'Fiji', 'Finland', 'France',
  'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala', 'Guinea',
  'Guinea-Bissau', 'Guyana', 'Haiti', 'Honduras', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran',
  'Iraq', 'Ireland', 'Israel', 'Italy', 'Ivory Coast', 'Jamaica', 'Japan', 'Jordan', 'Kazakhstan',
  'Kenya', 'Kiribati', 'Kuwait', 'Kyrgyzstan', 'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia',
  'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Madagascar', 'Malawi', 'Malaysia', 'Maldives',
  'Mali', 'Malta', 'Marshall Islands', 'Mauritania', 'Mauritius', 'Mexico', 'Micronesia', 'Moldova',
  'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar', 'Namibia', 'Nauru', 'Nepal',
  'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'North Korea', 'North Macedonia',
  'Norway', 'Oman', 'Pakistan', 'Palau', 'Palestine', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru',
  'Philippines', 'Poland', 'Portugal', 'Qatar', 'Romania', 'Russia', 'Rwanda', 'Saint Kitts and Nevis',
  'Saint Lucia', 'Saint Vincent and the Grenadines', 'Samoa', 'San Marino', 'Sao Tome and Principe',
  'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia',
  'Solomon Islands', 'Somalia', 'South Korea', 'South Sudan', 'Spain', 'Sri Lanka', 'Sudan', 'Suriname',
  'Sweden', 'Switzerland', 'Syria', 'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Timor-Leste', 'Togo',
  'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 'Tuvalu', 'Uganda', 'Ukraine',
  'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan', 'Vanuatu',
  'Vatican City', 'Venezuela', 'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe',
];

export const COUNTRY_OPTIONS = [
  { value: 'South Africa', label: 'South Africa' },
  ...WORLD_COUNTRIES.map((country) => ({ value: country, label: country })),
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

export const MEMBER_GRADE_OPTIONS = Array.from({ length: 12 }, (_, index) => {
  const grade = `Grade ${index + 1}`;
  return { value: grade, label: grade };
});

export const QUALIFICATION_OPTIONS = [
  { value: 'Undergraduate', label: 'Undergraduate' },
  { value: 'Postgraduate', label: 'Postgraduate' },
];

export const STUDY_YEAR_OPTIONS = Array.from({ length: 10 }, (_, index) => {
  const year = String(index + 1);
  return { value: year, label: year };
});

export const YEARS_AT_COMPANY_OPTIONS = Array.from({ length: 50 }, (_, index) => {
  const years = String(index + 1);
  return { value: years, label: years };
});

export const WORKING_HIGHEST_EDUCATION_OPTIONS = [
  { value: 'Matric', label: 'Matric' },
  { value: 'College Degree', label: 'College Degree' },
  { value: 'University Degree', label: 'University Degree' },
  { value: 'Special Training Course', label: 'Special Training Course' },
  { value: 'None', label: 'None' },
];

export const UNEMPLOYED_EDUCATION_LEVEL_OPTIONS = [
  { value: 'Grade 9-11', label: 'Grade 9-11' },
  { value: 'Matric', label: 'Matric' },
  { value: 'College Degree', label: 'College Degree' },
  { value: 'University Degree', label: 'University Degree' },
  { value: 'Specialised Training', label: 'Specialised Training' },
  { value: 'None', label: 'None' },
];

export const MAX_MEMBER_SUBJECTS = 7;

export const ACCEPTED_REPORT_CARD_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
];

export const ACCEPTED_REPORT_CARD_ACCEPT =
  '.jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf';

export function isSeniorSchoolGrade(grade) {
  return ['Grade 10', 'Grade 11', 'Grade 12'].includes(grade);
}

export function normalizeMemberSubjects(subjects = []) {
  if (!Array.isArray(subjects)) return [];

  return subjects
    .map((subject) => String(subject || '').trim())
    .filter(Boolean)
    .slice(0, MAX_MEMBER_SUBJECTS);
}

export function createEmptyMemberSubjects(count = 1) {
  return Array.from({ length: Math.min(count, MAX_MEMBER_SUBJECTS) }, () => '');
}

export function getEmptyOccupationDetailFields() {
  return {
    schoolId: '',
    schoolName: '',
    schoolType: '',
    school: '',
    grade: '',
    className: '',
    schoolClass: '',
    subjects: [],
    reportCardUrl: '',
    reportCardPath: '',
    universityName: '',
    collegeName: '',
    institution: '',
    course: '',
    degree: '',
    qualification: '',
    year: '',
    studyYear: '',
    campus: '',
    companyName: '',
    position: '',
    workAddress: '',
    workLocation: null,
    workLatitude: null,
    workLongitude: null,
    yearsAtCompany: '',
    highestEducationLevel: '',
    educationLevel: '',
  };
}

export function getOccupationFieldReset() {
  return getEmptyOccupationDetailFields();
}

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
  if (member?.fullName) return String(member.fullName).trim();
  const firstName = member?.firstName || member?.name || '';
  const lastName = member?.lastName || member?.surname || '';
  return `${firstName} ${lastName}`.trim();
}

export function getMemberFirstName(member) {
  return member?.firstName || member?.name || '';
}

export function getMemberLastName(member) {
  return member?.lastName || member?.surname || '';
}

export function getMemberProfileImageUrl(member) {
  return member?.profileImageUrl || member?.photo || '';
}

export function getMemberDateOfBirthValue(member) {
  return member?.dateOfBirth || member?.dob || '';
}

function resolveMemberSchoolName(member, occupation) {
  if (occupation === 'University') {
    return member?.universityName || member?.schoolName || member?.institution || member?.school || '';
  }

  if (occupation === 'College') {
    return member?.collegeName || member?.schoolName || member?.institution || member?.school || '';
  }

  return member?.schoolName || member?.school || member?.institution || '';
}

function buildMemberCorePayload(formData, existingStatus) {
  const firstName = formData.name?.trim() || formData.firstName?.trim() || '';
  const lastName = formData.surname?.trim() || formData.lastName?.trim() || '';
  const dateOfBirth = formData.dob || formData.dateOfBirth || '';
  const homeLocationFields = buildMemberHomeLocationFields(formData);
  const profileImageUrl = formData.photo || formData.profileImageUrl || '';

  return {
    firstName,
    lastName,
    fullName: `${firstName} ${lastName}`.trim(),
    name: firstName,
    surname: lastName,
    gender: formData.gender || '',
    phone: formData.phone?.trim() || '',
    dateOfBirth,
    dob: dateOfBirth,
    ...homeLocationFields,
    language: formData.language || '',
    countryOfOrigin: formData.countryOfOrigin || '',
    ethnicity: formData.ethnicity || '',
    dateOfSalvation: formData.dateOfSalvation || '',
    branch: formData.branch || '',
    zoneSupervisor: formData.zoneSupervisor?.trim() || '',
    cellLeader: formData.cellLeader?.trim() || '',
    occupation: formData.occupation || '',
    status: formData.status || existingStatus || MEMBER_STATUS.ACTIVE,
    profileImageUrl,
    profileImagePath: formData.profileImagePath || '',
    photo: profileImageUrl,
    department: formData.department || '',
  };
}

export function toSchoolSelectOptions(schools) {
  return schools.map((school) => ({
    value: school.id,
    label: school.schoolName || school.name || 'Unnamed School',
  }));
}

export function getOccupationSchoolType(occupation) {
  if (occupation === 'Primary School') return 'Primary School';
  if (occupation === 'High School') return 'High School';
  if (occupation === 'University') return 'University';
  if (occupation === 'College') return 'College';
  if (occupation === 'University / College') return 'University / College';
  return '';
}

export function getOccupationDisplay(member) {
  const occupation = member?.occupation || '';

  if (occupation === 'Primary School' || occupation === 'High School') {
    const details = [member?.schoolName || member?.school, member?.grade].filter(Boolean).join(' • ');
    return { primary: occupation, secondary: details };
  }

  if (occupation === 'University' || occupation === 'University / College') {
    const details = [
      member?.universityName || member?.schoolName || member?.institution,
      member?.degree,
    ].filter(Boolean).join(' • ');
    return { primary: occupation, secondary: details };
  }

  if (occupation === 'College') {
    const details = [
      member?.collegeName || member?.schoolName || member?.institution,
      member?.course,
    ].filter(Boolean).join(' • ');
    return { primary: occupation, secondary: details };
  }

  if (occupation === 'Working') {
    const details = [member?.companyName, member?.position].filter(Boolean).join(' • ');
    return { primary: occupation, secondary: details };
  }

  if (occupation === 'Unemployed') {
    return { primary: occupation, secondary: member?.educationLevel || '' };
  }

  return { primary: occupation, secondary: '' };
}

export function normalizeOccupationForForm(occupation) {
  const value = String(occupation || '').trim();
  const legacyMap = {
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
      language: '',
      countryOfOrigin: '',
      ethnicity: '',
      branch: '',
      zoneSupervisor: '',
      cellLeader: '',
      occupation: '',
      status: MEMBER_STATUS.ACTIVE,
      dob: '',
      dateOfSalvation: '',
      address: '',
      fullAddress: '',
      latitude: null,
      longitude: null,
      photo: '',
      profileImagePath: '',
      schoolId: '',
      schoolName: '',
      schoolType: '',
      school: '',
      grade: '',
      schoolClass: '',
      subjects: [],
      reportCardUrl: '',
      reportCardPath: '',
      universityName: '',
      collegeName: '',
      institution: '',
      course: '',
      degree: '',
      qualification: '',
      studyYear: '',
      campus: '',
      companyName: '',
      position: '',
      workAddress: '',
      workLatitude: null,
      workLongitude: null,
      yearsAtCompany: '',
      highestEducationLevel: '',
      educationLevel: '',
    };
  }

  const occupation = normalizeOccupationForForm(member.occupation);
  const schoolName = resolveMemberSchoolName(member, occupation);
  const homeAddress = (
    member.homeAddress
    || member.homeLocation?.fullAddress
    || member.fullAddress
    || member.address
    || ''
  );
  const dateOfBirth = getMemberDateOfBirthValue(member);
  const studyYear = member.year || member.studyYear || '';
  const schoolClass = member.className || member.schoolClass || member.class || '';
  const workAddress = member.workLocation?.fullAddress || member.workAddress || '';

  return {
    name: getMemberFirstName(member),
    surname: getMemberLastName(member),
    phone: member.phone || '',
    gender: member.gender || '',
    language: member.language || '',
    countryOfOrigin: member.countryOfOrigin || member.country || '',
    ethnicity: member.ethnicity || '',
    branch: member.branch || '',
    zoneSupervisor: member.zoneSupervisor || '',
    cellLeader: member.cellLeader || '',
    occupation,
    status: member.status || MEMBER_STATUS.ACTIVE,
    dob: dateOfBirth,
    dateOfSalvation: member.dateOfSalvation || '',
    address: homeAddress,
    fullAddress: homeAddress,
    latitude: normalizeMemberCoordinate(
      member.homeLocation?.latitude ?? member.latitude ?? member.lat,
    ),
    longitude: normalizeMemberCoordinate(
      member.homeLocation?.longitude ?? member.longitude ?? member.lng,
    ),
    photo: getMemberProfileImageUrl(member),
    profileImagePath: member.profileImagePath || '',
    schoolId: member.schoolId || '',
    schoolName,
    schoolType: member.schoolType || '',
    school: member.school || schoolName,
    grade: member.grade || '',
    schoolClass,
    subjects: normalizeMemberSubjects(member.subjects).length
      ? normalizeMemberSubjects(member.subjects)
      : isSeniorSchoolGrade(member.grade)
        ? createEmptyMemberSubjects(1)
        : [],
    reportCardUrl: member.reportCardUrl || '',
    reportCardPath: member.reportCardPath || '',
    universityName: member.universityName || (occupation === 'University' ? schoolName : ''),
    collegeName: member.collegeName || (occupation === 'College' ? schoolName : ''),
    institution: member.institution || schoolName,
    course: member.course || '',
    degree: member.degree || '',
    qualification: member.qualification || '',
    studyYear: studyYear ? String(studyYear) : '',
    campus: member.campus || '',
    companyName: member.companyName || member.company || member.employer || '',
    position: member.position || member.jobTitle || '',
    workAddress,
    workLatitude: normalizeMemberCoordinate(
      member.workLocation?.latitude ?? member.workLatitude,
    ),
    workLongitude: normalizeMemberCoordinate(
      member.workLocation?.longitude ?? member.workLongitude,
    ),
    yearsAtCompany: member.yearsAtCompany ? String(member.yearsAtCompany) : '',
    highestEducationLevel: member.highestEducationLevel || '',
    educationLevel: member.educationLevel || '',
  };
}

export function buildMemberPayload(formData, existingStatus) {
  const base = buildMemberCorePayload(formData, existingStatus);
  const occupation = formData.occupation;

  if (occupation === 'Primary School' || occupation === 'High School') {
    const schoolName = formData.schoolName?.trim() || formData.school?.trim() || '';
    const className = formData.schoolClass?.trim() || '';
    const subjects = isSeniorSchoolGrade(formData.grade)
      ? normalizeMemberSubjects(formData.subjects)
      : [];

    return {
      ...base,
      ...getEmptyOccupationDetailFields(),
      schoolId: formData.schoolId || '',
      schoolName,
      schoolType: formData.schoolType || getOccupationSchoolType(occupation),
      school: schoolName,
      grade: formData.grade || '',
      className,
      schoolClass: className,
      subjects,
      reportCardUrl: formData.reportCardUrl || '',
      reportCardPath: formData.reportCardPath || '',
    };
  }

  if (occupation === 'University') {
    const universityName = (
      formData.schoolName?.trim()
      || formData.universityName?.trim()
      || formData.institution?.trim()
      || ''
    );
    const year = formData.studyYear || '';

    return {
      ...base,
      ...getEmptyOccupationDetailFields(),
      schoolId: formData.schoolId || '',
      schoolName: universityName,
      universityName,
      schoolType: formData.schoolType || getOccupationSchoolType(occupation),
      institution: universityName,
      degree: formData.degree?.trim() || '',
      qualification: formData.qualification || '',
      year,
      studyYear: year,
    };
  }

  if (occupation === 'College') {
    const collegeName = (
      formData.schoolName?.trim()
      || formData.collegeName?.trim()
      || formData.institution?.trim()
      || ''
    );
    const year = formData.studyYear || '';

    return {
      ...base,
      ...getEmptyOccupationDetailFields(),
      schoolId: formData.schoolId || '',
      schoolName: collegeName,
      collegeName,
      schoolType: formData.schoolType || getOccupationSchoolType(occupation),
      institution: collegeName,
      course: formData.course?.trim() || '',
      year,
      studyYear: year,
      campus: formData.campus?.trim() || '',
    };
  }

  if (occupation === 'University / College') {
    const schoolName = formData.schoolName?.trim() || formData.institution?.trim() || '';
    const year = formData.studyYear || '';

    return {
      ...base,
      ...getEmptyOccupationDetailFields(),
      schoolId: formData.schoolId || '',
      schoolName,
      schoolType: formData.schoolType || getOccupationSchoolType(occupation),
      institution: schoolName,
      course: formData.course?.trim() || '',
      degree: formData.degree?.trim() || '',
      qualification: formData.qualification || '',
      year,
      studyYear: year,
      campus: formData.campus?.trim() || '',
    };
  }

  if (occupation === 'Working') {
    const workLocationFields = buildMemberWorkLocationFields(formData);

    return {
      ...base,
      ...getEmptyOccupationDetailFields(),
      companyName: formData.companyName?.trim() || '',
      position: formData.position?.trim() || '',
      ...workLocationFields,
      yearsAtCompany: formData.yearsAtCompany || '',
      highestEducationLevel: formData.highestEducationLevel || '',
    };
  }

  if (occupation === 'Unemployed') {
    return {
      ...base,
      ...getEmptyOccupationDetailFields(),
      educationLevel: formData.educationLevel || '',
    };
  }

  return {
    ...base,
    ...getEmptyOccupationDetailFields(),
  };
}

export function memberBelongsToDepartment(member, department) {
  if (!department) return true;
  return getMemberDepartment(member) === department;
}
