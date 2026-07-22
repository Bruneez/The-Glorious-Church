import {
  ROLES,
  normalizeRole,
  isFullAccessRole,
  isOperationalStaffRole,
  isPastorRole,
  isElderRole,
  isLeader,
} from './roles.js';

const ALL_STAFF = [ROLES.ADMIN, ROLES.PASTOR, ROLES.LEADER];

/** Pastor and Admin share the same operational permission set for now. */
const OPERATIONAL_STAFF = [ROLES.PASTOR, ROLES.ADMIN];

/** Lead Pastor and Admin share Development Board access. */
const DEVELOPMENT_BOARD_STAFF = [ROLES.LEAD_PASTOR, ROLES.ADMIN];

/** Routes operational staff must never access, even via direct URL. */
const OPERATIONAL_RESTRICTED_ROUTES = ['/users', '/system-users'];

/** Actions withheld from operational staff (Pastor and Admin). */
const OPERATIONAL_DENIED_ACTIONS = new Set([
  'MANAGE_STAFF',
  'MANAGE_TASKS',
  'VIEW_ALL_TASKS',
]);

/** Actions withheld from Pastor only (Admin retains Development Board access). */
const PASTOR_ONLY_DENIED_ACTIONS = new Set(['MANAGE_DEVELOPMENT_BOARD']);

/** Routes Elder and Leader must never access, even via direct URL. */
const MINISTRY_PARTICIPANT_RESTRICTED_ROUTES = [
  '/users',
  '/system-users',
  '/members',
  '/map',
  '/offerings',
  '/development-board',
];

/** Routes Elder and Leader may access (sidebar + direct URL). */
const MINISTRY_PARTICIPANT_ALLOWED_ROUTES = [
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
  '/machaneh-movies',
  '/merchandise',
  '/calendar',
  '/service-program',
  '/tasks',
];

/** Roles that can open Creative Arts department details (Leaders see tile summaries only). */
const CREATIVE_ARTS_DETAIL_ROLES = [...OPERATIONAL_STAFF, ROLES.ELDER];

/** Roles that can open individual school records (Leaders see tile summaries only). */
const SCHOOL_DETAIL_ROLES = [...OPERATIONAL_STAFF, ROLES.ELDER];

function canMinistryParticipantAccessRoute(pathname) {
  if (MINISTRY_PARTICIPANT_RESTRICTED_ROUTES.includes(pathname)) return false;
  if (MINISTRY_PARTICIPANT_ALLOWED_ROUTES.includes(pathname)) return true;
  if (pathname.startsWith('/schools/')) return true;
  if (pathname === '/profile') return true;
  return false;
}

export const ROUTE_ACCESS = {
  '/dashboard': ALL_STAFF,
  '/blueprint': ALL_STAFF,
  '/users': [ROLES.LEAD_PASTOR],
  '/system-users': [ROLES.LEAD_PASTOR],
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
  '/development-board': DEVELOPMENT_BOARD_STAFF,
  '/tasks': ALL_STAFF,
  '/travelling': ALL_STAFF,
  '/machaneh-movies': ALL_STAFF,
  '/merchandise': ALL_STAFF,
};

export function canAccessRoute(role, pathname) {
  const normalizedRole = normalizeRole(role);
  if (isFullAccessRole(normalizedRole)) return true;

  if (isElderRole(normalizedRole) || isLeader(normalizedRole)) {
    return canMinistryParticipantAccessRoute(pathname);
  }

  if (
    isOperationalStaffRole(normalizedRole) &&
    OPERATIONAL_RESTRICTED_ROUTES.includes(pathname)
  ) {
    return false;
  }

  if (isPastorRole(normalizedRole) && pathname === '/development-board') {
    return false;
  }

  const allowedRoles = ROUTE_ACCESS[pathname];
  if (!allowedRoles) return true;
  return allowedRoles.includes(normalizedRole) || !normalizedRole;
}

export const ACTIONS = {
  MANAGE_STAFF: [ROLES.LEAD_PASTOR],
  MANAGE_MEMBERS: OPERATIONAL_STAFF,
  MANAGE_ATTENDANCE: OPERATIONAL_STAFF,
  RECORD_DEPARTMENT_ATTENDANCE: [],
  MANAGE_OFFERINGS: OPERATIONAL_STAFF,
  MANAGE_EVENTS: OPERATIONAL_STAFF,
  CREATE_CALENDAR_EVENTS: [ROLES.ELDER, ROLES.LEADER],
  MANAGE_OWN_CALENDAR_EVENTS: [ROLES.ELDER, ROLES.LEADER],
  OPEN_CREATIVE_ARTS_DEPARTMENT: CREATIVE_ARTS_DETAIL_ROLES,
  OPEN_SCHOOL_RECORD: SCHOOL_DETAIL_ROLES,
  MANAGE_CREATIVE_ARTS: OPERATIONAL_STAFF,
  MANAGE_MINISTRIES: OPERATIONAL_STAFF,
  MANAGE_TRANSPORT: OPERATIONAL_STAFF,
  MANAGE_SCHOOLS: OPERATIONAL_STAFF,
  EDIT_DELETE_SCHOOLS: OPERATIONAL_STAFF,
  MANAGE_DEVELOPMENT_BOARD: DEVELOPMENT_BOARD_STAFF,
  MANAGE_TASKS: [ROLES.LEAD_PASTOR],
  VIEW_ALL_TASKS: [ROLES.LEAD_PASTOR],
  UPDATE_OWN_TASK_STATUS: [...OPERATIONAL_STAFF, ROLES.ELDER, ROLES.LEADER],
  MANAGE_SERVICE_PROGRAM: [...OPERATIONAL_STAFF, ROLES.ELDER],
  VIEW_TRAVELLING: [...ALL_STAFF, ROLES.ELDER],
  MANAGE_TRAVELLING: OPERATIONAL_STAFF,
  VIEW_MACHANEH_MOVIES: [...ALL_STAFF, ROLES.ELDER],
  MANAGE_MACHANEH_MOVIES: OPERATIONAL_STAFF,
  VIEW_MERCHANDISE: [...ALL_STAFF, ROLES.ELDER],
  MANAGE_MERCHANDISE: OPERATIONAL_STAFF,
};

export function canPerformAction(role, action) {
  const normalizedRole = normalizeRole(role);
  if (isFullAccessRole(normalizedRole)) return true;

  if (isOperationalStaffRole(normalizedRole) && OPERATIONAL_DENIED_ACTIONS.has(action)) {
    return false;
  }

  if (isPastorRole(normalizedRole) && PASTOR_ONLY_DENIED_ACTIONS.has(action)) {
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
