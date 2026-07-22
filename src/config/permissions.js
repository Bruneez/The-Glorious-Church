import {
  ROLES,
  normalizeRole,
  isFullAccessRole,
  isPastorRole,
  isElderRole,
} from './roles.js';

const ALL_STAFF = [ROLES.ADMIN, ROLES.PASTOR, ROLES.LEADER];

/** Routes pastors must never access, even via direct URL. */
const PASTOR_RESTRICTED_ROUTES = ['/users', '/system-users', '/development-board'];

/** Routes elders must never access, even via direct URL. */
const ELDER_RESTRICTED_ROUTES = [
  '/users',
  '/system-users',
  '/members',
  '/map',
  '/offerings',
  '/development-board',
];

/** Routes elders may access (sidebar + direct URL). */
const ELDER_ALLOWED_ROUTES = [
  '/dashboard',
  '/blueprint',
  '/creative-arts',
  '/ministries',
  '/schools',
  '/schools/primary',
  '/schools/high',
  '/schools/higher-education',
  '/attendance',
  '/transport',
  '/travelling',
  '/calendar',
  '/service-program',
  '/tasks',
];

/** Task and user-management actions withheld from pastors. */
const PASTOR_DENIED_ACTIONS = new Set([
  'MANAGE_STAFF',
  'MANAGE_DEVELOPMENT_BOARD',
  'MANAGE_TASKS',
  'VIEW_ALL_TASKS',
]);

export const ROUTE_ACCESS = {
  '/dashboard': ALL_STAFF,
  '/blueprint': ALL_STAFF,
  '/users': [ROLES.ADMIN],
  '/system-users': [ROLES.ADMIN],
  '/members': ALL_STAFF,
  '/creative-arts': ALL_STAFF,
  '/ministries': ALL_STAFF,
  '/schools/primary': ALL_STAFF,
  '/schools/high': ALL_STAFF,
  '/schools/higher-education': ALL_STAFF,
  '/map': ALL_STAFF,
  '/attendance': ALL_STAFF,
  '/offerings': ALL_STAFF,
  '/transport': ALL_STAFF,
  '/calendar': ALL_STAFF,
  '/service-program': ALL_STAFF,
  '/development-board': [ROLES.ADMIN],
  '/tasks': ALL_STAFF,
  '/travelling': ALL_STAFF,
};

function canElderAccessRoute(pathname) {
  if (ELDER_RESTRICTED_ROUTES.includes(pathname)) return false;
  if (ELDER_ALLOWED_ROUTES.includes(pathname)) return true;
  if (pathname.startsWith('/schools/')) return true;
  if (pathname === '/profile') return true;
  return false;
}

export function canAccessRoute(role, pathname) {
  const normalizedRole = normalizeRole(role);
  if (isFullAccessRole(normalizedRole)) return true;

  if (isElderRole(normalizedRole)) {
    return canElderAccessRoute(pathname);
  }

  if (isPastorRole(normalizedRole) && PASTOR_RESTRICTED_ROUTES.includes(pathname)) {
    return false;
  }

  const allowedRoles = ROUTE_ACCESS[pathname];
  if (!allowedRoles) return true;
  return allowedRoles.includes(normalizedRole) || !normalizedRole;
}

export const ACTIONS = {
  MANAGE_STAFF: [ROLES.ADMIN],
  MANAGE_MEMBERS: [ROLES.ADMIN, ROLES.PASTOR],
  MANAGE_ATTENDANCE: [ROLES.ADMIN, ROLES.PASTOR],
  RECORD_DEPARTMENT_ATTENDANCE: [ROLES.LEADER],
  MANAGE_OFFERINGS: [ROLES.ADMIN, ROLES.PASTOR],
  MANAGE_EVENTS: [ROLES.ADMIN, ROLES.PASTOR],
  CREATE_CALENDAR_EVENTS: [ROLES.ELDER],
  MANAGE_OWN_CALENDAR_EVENTS: [ROLES.ELDER],
  MANAGE_CREATIVE_ARTS: [ROLES.ADMIN, ROLES.PASTOR],
  MANAGE_MINISTRIES: [ROLES.ADMIN, ROLES.PASTOR],
  MANAGE_TRANSPORT: [ROLES.ADMIN, ROLES.PASTOR],
  MANAGE_SCHOOLS: [ROLES.ADMIN, ROLES.PASTOR],
  EDIT_DELETE_SCHOOLS: [ROLES.ADMIN, ROLES.PASTOR],
  MANAGE_DEVELOPMENT_BOARD: [ROLES.ADMIN],
  MANAGE_TASKS: [ROLES.ADMIN],
  VIEW_ALL_TASKS: [ROLES.ADMIN],
  UPDATE_OWN_TASK_STATUS: [ROLES.PASTOR, ROLES.ELDER, ROLES.LEADER],
  MANAGE_SERVICE_PROGRAM: [ROLES.ADMIN, ROLES.PASTOR, ROLES.ELDER],
  VIEW_TRAVELLING: [...ALL_STAFF, ROLES.ELDER],
  MANAGE_TRAVELLING: [ROLES.ADMIN, ROLES.PASTOR],
};

export function canPerformAction(role, action) {
  const normalizedRole = normalizeRole(role);
  if (isFullAccessRole(normalizedRole)) return true;

  if (isPastorRole(normalizedRole) && PASTOR_DENIED_ACTIONS.has(action)) {
    return false;
  }

  const allowedRoles = ACTIONS[action];
  if (!allowedRoles) return false;
  return allowedRoles.includes(normalizedRole);
}

export function canCreateCalendarEvent(role) {
  if (canPerformAction(role, 'MANAGE_EVENTS')) return true;
  return canPerformAction(role, 'CREATE_CALENDAR_EVENTS');
}

export function canManageCalendarEvent(role, event, userId) {
  if (canPerformAction(role, 'MANAGE_EVENTS')) return true;
  if (!canPerformAction(role, 'MANAGE_OWN_CALENDAR_EVENTS')) return false;

  const ownerId = String(event?.createdBy || '').trim();
  const currentUserId = String(userId || '').trim();
  if (!ownerId || !currentUserId) return false;

  return ownerId === currentUserId;
}

export function assertCanManageCalendarEvent(
  role,
  event,
  userId,
  message = 'You can only edit or delete calendar events that you created.',
) {
  if (!canManageCalendarEvent(role, event, userId)) {
    throw new Error(message);
  }
}
