import { canAccessRoute } from './permissions.js';
import {
  APP_FIX_BROWSER_MODE,
  APP_FIX_CATEGORY,
  APP_FIX_DEVICE_TYPE,
  APP_FIX_PRIORITY,
  APP_FIX_STATUS,
} from './appFixesConstants.js';

export const APP_FIXES_ROUTE = '/app-fixes';

export const APP_FIX_AFFECTED_MODULE_OPTIONS = [
  { value: '/dashboard', label: 'Dashboard Overview' },
  { value: '/blueprint', label: 'Blueprint' },
  { value: '/shepherding-tools', label: 'Shepherding Tools' },
  { value: '/members', label: 'Members Directory' },
  { value: '/creative-arts', label: 'Creative Arts' },
  { value: '/ministries', label: 'Ministries' },
  { value: '/schools', label: 'Schools' },
  { value: '/map', label: 'Map' },
  { value: '/attendance', label: 'Attendance Tracker' },
  { value: '/offerings', label: 'Offerings Log' },
  { value: '/transport', label: 'Saturday Transport' },
  { value: '/travelling', label: 'Travelling' },
  { value: '/machaneh-movies', label: 'Machaneh Movies' },
  { value: '/merchandise', label: 'Merchandise' },
  { value: '/calendar', label: 'Calendar' },
  { value: '/service-program', label: 'Service Program' },
  { value: '/tasks', label: 'Tasks' },
  { value: '/development-board', label: 'Development Board' },
  { value: 'other', label: 'Other / General' },
];

export function getAppFixAffectedModuleOptions(role) {
  return APP_FIX_AFFECTED_MODULE_OPTIONS.filter((option) => {
    if (option.value === 'other') return true;
    return canAccessRoute(role, option.value);
  });
}

export function getAppFixAffectedModuleLabel(modulePath = '') {
  const normalized = String(modulePath || '').trim();
  if (!normalized) return '';
  return APP_FIX_AFFECTED_MODULE_OPTIONS.find((option) => option.value === normalized)?.label
    || normalized;
}

export function createEmptyAppFixReportFormData() {
  return {
    title: '',
    category: '',
    customCategory: '',
    affectedModule: '',
    priority: APP_FIX_PRIORITY.MEDIUM,
    description: '',
    stepsToReproduce: '',
    errorMessage: '',
    deviceType: '',
    browserMode: APP_FIX_BROWSER_MODE.OTHER,
    pageUrl: typeof window !== 'undefined' ? window.location.pathname : '',
  };
}

export function mapAppFixRequestToFormData(request = null) {
  if (!request) {
    return createEmptyAppFixReportFormData();
  }

  return {
    title: request.title || '',
    category: request.category || '',
    customCategory: request.customCategory || '',
    affectedModule: request.affectedModule || '',
    priority: request.priority || APP_FIX_PRIORITY.MEDIUM,
    description: request.description || '',
    stepsToReproduce: request.stepsToReproduce || '',
    errorMessage: request.errorMessage || '',
    deviceType: request.deviceType || '',
    browserMode: request.browserMode || APP_FIX_BROWSER_MODE.OTHER,
    pageUrl: request.pageUrl || '',
    status: request.status || APP_FIX_STATUS.OPEN,
  };
}

export function buildAppFixReferenceNumber(requestId = '') {
  const normalized = String(requestId || '').trim();
  if (!normalized) return '';
  return `AF-${normalized.slice(0, 8).toUpperCase()}`;
}
