import { canPerformAction } from '../config/permissions.js';

export const VIEW_DENIED_MESSAGE =
  'You do not have permission to view travel destinations.';
export const MANAGE_DENIED_MESSAGE =
  'Only administrators can manage travel destinations.';

export function assertCanViewTravelling(role) {
  if (!canPerformAction(role, 'VIEW_TRAVELLING')) {
    throw new Error(VIEW_DENIED_MESSAGE);
  }
}

export function assertCanManageTravelling(role) {
  if (!canPerformAction(role, 'MANAGE_TRAVELLING')) {
    throw new Error(MANAGE_DENIED_MESSAGE);
  }
}
