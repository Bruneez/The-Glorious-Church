export const DEPARTMENT_STATUS = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
};

export const DEPARTMENT_STATUS_OPTIONS = [
  { value: DEPARTMENT_STATUS.ACTIVE, label: 'Active' },
  { value: DEPARTMENT_STATUS.INACTIVE, label: 'Inactive' },
];

export {
  ACCEPTED_CREATIVE_ARTS_LOGO_ACCEPT as ACCEPTED_DEPARTMENT_LOGO_ACCEPT,
  validateCreativeArtsLogoFile as validateDepartmentLogoFile,
} from './creativeArtsLogoValidation.js';

export function getDepartmentLogo(department) {
  const logoUrl = String(department?.logoUrl || '').trim();
  if (logoUrl && !logoUrl.startsWith('blob:') && !logoUrl.startsWith('data:')) {
    return logoUrl;
  }

  const photo = String(department?.photo || '').trim();
  if (photo && !photo.startsWith('blob:') && !photo.startsWith('data:')) {
    return photo;
  }

  return '';
}

export const DEFAULT_DEPARTMENTS = [
  {
    name: 'Worshippers',
    leader: '',
    description: 'Lead worship and praise ministry across the congregation.',
    status: DEPARTMENT_STATUS.ACTIVE,
    members: [],
  },
  {
    name: 'Dancing Stars',
    leader: '',
    description: 'Express worship through dance and creative movement.',
    status: DEPARTMENT_STATUS.ACTIVE,
    members: [],
  },
  {
    name: 'Choir',
    leader: '',
    description: 'Unite voices in harmony for the glory of God.',
    status: DEPARTMENT_STATUS.ACTIVE,
    members: [],
  },
];

export function buildDepartmentPayload(formData, initialData = null) {
  const base = {
    name: formData.name.trim(),
    leader: formData.leader?.trim() || '',
    description: formData.description?.trim() || '',
    status: formData.status || DEPARTMENT_STATUS.ACTIVE,
    members: initialData?.members ?? formData.members ?? [],
    ...(initialData?.subtitle ? { subtitle: initialData.subtitle } : {}),
    ...(initialData?.scripture ? { scripture: initialData.scripture } : {}),
  };

  if (formData.removeLogo) {
    return {
      ...base,
      logoUrl: '',
      logoPath: '',
      photo: '',
    };
  }

  const logoUrl = sanitizeDepartmentLogoUrl(
    formData.logoUrl ?? formData.photo ?? getDepartmentLogo(initialData) ?? '',
  );
  const logoPath = String(formData.logoPath ?? initialData?.logoPath ?? '').trim();

  return {
    ...base,
    logoUrl,
    logoPath,
    photo: logoUrl,
  };
}

function sanitizeDepartmentLogoUrl(value) {
  const url = String(value || '').trim();
  if (!url || url.startsWith('blob:') || url.startsWith('data:')) {
    return '';
  }

  return url;
}

export function filterDepartments(departments, searchTerm) {
  if (!searchTerm) return departments;

  const term = searchTerm.toLowerCase();
  return departments.filter(
    (department) =>
      department.name?.toLowerCase().includes(term) ||
      department.leader?.toLowerCase().includes(term) ||
      department.description?.toLowerCase().includes(term),
  );
}

export function getMemberCount(department) {
  return department?.members?.length || 0;
}

export function memberMatchesCreativeArtsDepartment(member, department) {
  if (!member || !department) return false;

  const memberTeamId = String(member.creativeArtsId || member.departmentId || '').trim();
  if (memberTeamId && department.id && memberTeamId === department.id) {
    return true;
  }

  const memberDepartmentName = String(member.department || member.creativeArts || member.creativeArtsName || '')
    .trim()
    .toLowerCase();
  const departmentName = String(department.name || '').trim().toLowerCase();

  if (memberDepartmentName && departmentName && memberDepartmentName === departmentName) {
    return true;
  }

  return Array.isArray(department.members) && department.members.includes(member.id);
}

export function getMembersLinkedToCreativeArtsDepartment(members = [], department) {
  if (!department) return [];
  return members.filter((member) => memberMatchesCreativeArtsDepartment(member, department));
}

export function computeCreativeArtsStats(departments = []) {
  return departments.reduce(
    (stats, department) => {
      const status = department.status || DEPARTMENT_STATUS.ACTIVE;

      return {
        totalDepartments: stats.totalDepartments + 1,
        totalMembers: stats.totalMembers + getMemberCount(department),
        activeDepartments:
          stats.activeDepartments + (status === DEPARTMENT_STATUS.ACTIVE ? 1 : 0),
      };
    },
    { totalDepartments: 0, totalMembers: 0, activeDepartments: 0 },
  );
}
