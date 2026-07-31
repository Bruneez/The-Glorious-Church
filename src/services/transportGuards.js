import { canPerformAction } from '../config/permissions.js';

export const MANAGE_DENIED_MESSAGE =
  'You do not have permission to manage Saturday Transport.';

export function assertCanManageTransport(role) {
  if (!canPerformAction(role, 'MANAGE_TRANSPORT')) {
    throw new Error(MANAGE_DENIED_MESSAGE);
  }
}
