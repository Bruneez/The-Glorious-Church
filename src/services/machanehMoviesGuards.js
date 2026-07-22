import { canPerformAction } from '../config/permissions.js';

export const VIEW_DENIED_MESSAGE =
  'You do not have permission to view Machaneh Movies.';
export const MANAGE_DENIED_MESSAGE =
  'Only authorised church leadership can manage Machaneh Movies.';

export function assertCanViewMachanehMovies(role) {
  if (!canPerformAction(role, 'VIEW_MACHANEH_MOVIES')) {
    throw new Error(VIEW_DENIED_MESSAGE);
  }
}

export function assertCanManageMachanehMovies(role) {
  if (!canPerformAction(role, 'MANAGE_MACHANEH_MOVIES')) {
    throw new Error(MANAGE_DENIED_MESSAGE);
  }
}
