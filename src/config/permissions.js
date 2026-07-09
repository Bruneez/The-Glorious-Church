import { ROLES, normalizeRole } from './roles';

const ALL_STAFF = [ROLES.ADMIN, ROLES.PASTOR, ROLES.CA_LEADER];

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
};

export function canAccessRoute(role, pathname) {
  const normalizedRole = normalizeRole(role);
  const allowedRoles = ROUTE_ACCESS[pathname];
  if (!allowedRoles) return true;
  return allowedRoles.includes(normalizedRole) || !normalizedRole;
}

export const ACTIONS = {
  MANAGE_STAFF: [ROLES.ADMIN, ROLES.PASTOR],
  MANAGE_MEMBERS: [ROLES.ADMIN, ROLES.PASTOR],
  MANAGE_ATTENDANCE: [ROLES.ADMIN, ROLES.PASTOR],
  RECORD_DEPARTMENT_ATTENDANCE: [ROLES.CA_LEADER],
  MANAGE_OFFERINGS: [ROLES.ADMIN, ROLES.PASTOR],
  MANAGE_EVENTS: [ROLES.ADMIN, ROLES.PASTOR],
  MANAGE_CREATIVE_ARTS: [ROLES.ADMIN],
  MANAGE_MINISTRIES: [ROLES.ADMIN],
  MANAGE_TRANSPORT: [ROLES.ADMIN, ROLES.PASTOR],
  MANAGE_SCHOOLS: [ROLES.ADMIN, ROLES.PASTOR],
  EDIT_DELETE_SCHOOLS: [ROLES.ADMIN],
  MANAGE_DEVELOPMENT_BOARD: [ROLES.ADMIN],
  MANAGE_TASKS: [ROLES.ADMIN],
  VIEW_ALL_TASKS: [ROLES.ADMIN],
  UPDATE_OWN_TASK_STATUS: [ROLES.PASTOR, ROLES.CA_LEADER],
  MANAGE_SERVICE_PROGRAM: [ROLES.ADMIN, ROLES.PASTOR],
};

export function canPerformAction(role, action) {
  const normalizedRole = normalizeRole(role);
  const allowedRoles = ACTIONS[action];
  if (!allowedRoles) return false;
  return allowedRoles.includes(normalizedRole);
}
