export const DEPARTMENT_STATUS = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
};

export const DEPARTMENT_STATUS_OPTIONS = [
  { value: DEPARTMENT_STATUS.ACTIVE, label: 'Active' },
  { value: DEPARTMENT_STATUS.INACTIVE, label: 'Inactive' },
];

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
  return {
    name: formData.name.trim(),
    leader: formData.leader?.trim() || '',
    description: formData.description?.trim() || '',
    status: formData.status || DEPARTMENT_STATUS.ACTIVE,
    photo: formData.photo || '',
    members: initialData?.members ?? formData.members ?? [],
    ...(initialData?.subtitle ? { subtitle: initialData.subtitle } : {}),
    ...(initialData?.scripture ? { scripture: initialData.scripture } : {}),
  };
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
