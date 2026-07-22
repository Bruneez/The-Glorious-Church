import { canPerformAction } from '../config/permissions.js';

export const VIEW_DENIED_MESSAGE =
  'You do not have permission to view Merchandise.';
export const MANAGE_DENIED_MESSAGE =
  'Only authorised church leadership can manage Merchandise.';

export function assertCanViewMerchandise(role) {
  if (!canPerformAction(role, 'VIEW_MERCHANDISE')) {
    throw new Error(VIEW_DENIED_MESSAGE);
  }
}

export function assertCanManageMerchandise(role) {
  if (!canPerformAction(role, 'MANAGE_MERCHANDISE')) {
    throw new Error(MANAGE_DENIED_MESSAGE);
  }
}
