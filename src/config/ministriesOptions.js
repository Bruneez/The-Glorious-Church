export const MINISTRY_STATUS = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
};

export const MINISTRY_STATUSES = [MINISTRY_STATUS.ACTIVE, MINISTRY_STATUS.INACTIVE];

export const MINISTRY_STATUS_OPTIONS = MINISTRY_STATUSES.map((status) => ({
  value: status,
  label: status,
}));

export {
  ACCEPTED_MINISTRY_AVATAR_ACCEPT,
  validateMinistryAvatarFile,
} from './ministriesAvatarValidation.js';

export const MINISTRY_FUTURE_SECTIONS = [
  'Ministry Members',
  'Attendance',
  'Serving Schedules',
  'Documents',
  'Announcements',
  'Reports',
  'Leadership Information',
  'Statistics',
];

export function getMinistryAvatar(ministry) {
  const avatarUrl = String(ministry?.avatarUrl || '').trim();
  if (avatarUrl && !avatarUrl.startsWith('blob:') && !avatarUrl.startsWith('data:')) {
    return avatarUrl;
  }

  return '';
}

export function computeMinistryStats(ministries = []) {
  return ministries.reduce(
    (stats, ministry) => {
      const status = ministry.status || MINISTRY_STATUS.ACTIVE;
      const isActive = status === MINISTRY_STATUS.ACTIVE;

      return {
        total: stats.total + 1,
        active: stats.active + (isActive ? 1 : 0),
        inactive: stats.inactive + (isActive ? 0 : 1),
      };
    },
    { total: 0, active: 0, inactive: 0 },
  );
}

export function getMinistrySummaryCards(ministries = []) {
  const stats = computeMinistryStats(ministries);

  return [
    { key: 'total', label: 'Total Ministries', value: stats.total },
    { key: 'active', label: 'Active Ministries', value: stats.active },
    { key: 'inactive', label: 'Inactive Ministries', value: stats.inactive },
  ];
}

export function getMinistryMemberCount(ministry) {
  const count = Number(ministry?.totalMembers);
  return Number.isFinite(count) && count >= 0 ? count : 0;
}

function sanitizeAvatarUrl(value) {
  const url = String(value || '').trim();
  if (!url || url.startsWith('blob:') || url.startsWith('data:')) {
    return '';
  }

  return url;
}

export function buildMinistryPayload(formData, { createdBy = '', initialData = null } = {}) {
  if (formData.removeAvatar) {
    return {
      ministryName: String(formData.ministryName || '').trim(),
      ministryLeader: String(formData.ministryLeader || '').trim(),
      description: String(formData.description || '').trim(),
      status: formData.status || MINISTRY_STATUS.ACTIVE,
      totalMembers: initialData?.totalMembers ?? 0,
      avatarUrl: '',
      avatarPath: '',
    };
  }

  const avatarUrl = sanitizeAvatarUrl(
    formData.avatarUrl ?? getMinistryAvatar(initialData) ?? '',
  );
  const avatarPath = String(formData.avatarPath ?? initialData?.avatarPath ?? '').trim();

  return {
    ministryName: String(formData.ministryName || '').trim(),
    ministryLeader: String(formData.ministryLeader || '').trim(),
    description: String(formData.description || '').trim(),
    status: formData.status || MINISTRY_STATUS.ACTIVE,
    totalMembers: initialData?.totalMembers ?? 0,
    avatarUrl,
    avatarPath,
  };
}

export function mapMinistryToFormData(ministry) {
  if (!ministry) {
    return {
      ministryName: '',
      ministryLeader: '',
      description: '',
      status: MINISTRY_STATUS.ACTIVE,
      avatarUrl: '',
      avatarPath: '',
    };
  }

  return {
    ministryName: ministry.ministryName || '',
    ministryLeader: ministry.ministryLeader || '',
    description: ministry.description || '',
    status: ministry.status || MINISTRY_STATUS.ACTIVE,
    avatarUrl: getMinistryAvatar(ministry),
    avatarPath: ministry.avatarPath || '',
  };
}

export function filterMinistries(ministries = [], searchTerm = '') {
  if (!searchTerm.trim()) return ministries;

  const term = searchTerm.trim().toLowerCase();

  return ministries.filter((ministry) => {
    const ministryName = ministry.ministryName?.toLowerCase() || '';
    const ministryLeader = ministry.ministryLeader?.toLowerCase() || '';
    const description = ministry.description?.toLowerCase() || '';
    const status = ministry.status?.toLowerCase() || '';

    return (
      ministryName.includes(term) ||
      ministryLeader.includes(term) ||
      description.includes(term) ||
      status.includes(term)
    );
  });
}
