import { ROLES } from './roles';

const ALL_STAFF = [ROLES.ADMIN, ROLES.PASTOR, ROLES.CA_LEADER];

export const ROUTE_ACCESS = {
  '/dashboard': ALL_STAFF,
  '/users': [ROLES.ADMIN, ROLES.PASTOR],
  '/members': ALL_STAFF,
  '/creative-arts': ALL_STAFF,
  '/schools/primary': ALL_STAFF,
  '/schools/high': ALL_STAFF,
  '/schools/higher-education': ALL_STAFF,
  '/maps/members': ALL_STAFF,
  '/maps/schools': ALL_STAFF,
  '/attendance': ALL_STAFF,
  '/offerings': ALL_STAFF,
  '/transport': [ROLES.ADMIN, ROLES.PASTOR],
  '/calendar': ALL_STAFF,
};

export function canAccessRoute(role, pathname) {
  const allowedRoles = ROUTE_ACCESS[pathname];
  if (!allowedRoles) return true;
  return allowedRoles.includes(role);
}

export const ACTIONS = {
  MANAGE_STAFF: [ROLES.ADMIN, ROLES.PASTOR],
  MANAGE_MEMBERS: [ROLES.ADMIN, ROLES.PASTOR],
  MANAGE_ATTENDANCE: [ROLES.ADMIN, ROLES.PASTOR],
  MANAGE_OFFERINGS: [ROLES.ADMIN, ROLES.PASTOR],
  MANAGE_EVENTS: [ROLES.ADMIN, ROLES.PASTOR],
  MANAGE_TRANSPORT: [ROLES.ADMIN, ROLES.PASTOR],
  MANAGE_SCHOOLS: [ROLES.ADMIN, ROLES.PASTOR],
};

export function canPerformAction(role, action) {
  const allowedRoles = ACTIONS[action];
  if (!allowedRoles) return false;
  return allowedRoles.includes(role);
}
